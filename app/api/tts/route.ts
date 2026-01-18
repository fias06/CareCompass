import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { validatePayload } from "../../lib/voice/types";
import { buildSpeechText } from "../../lib/voice/tts/buildSpeechText";
import { getVoiceId, validateVoiceConfig } from "../../lib/voice/tts/voiceConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";
const MAX_PAYLOAD_SIZE = 8 * 1024; // 8KB
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const CACHE_MAX_SIZE = 100;

interface CacheEntry {
  audio: Buffer;
  contentType: string;
  createdAt: number;
}

// In-memory cache (module-level)
const cache = new Map<string, CacheEntry>();

// Simple rate limiting (per-IP, in-memory)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function evictOldestCacheEntry(): void {
  if (cache.size < CACHE_MAX_SIZE) return;

  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, entry] of cache.entries()) {
    if (entry.createdAt < oldestTime) {
      oldestTime = entry.createdAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
  }
}

function getCacheKey(cacheKeyParts: string[]): string {
  const joined = cacheKeyParts.join("|");
  return createHash("sha256").update(joined).digest("hex");
}

function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.createdAt > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    // Clean expired cache entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to clean on each request
      cleanExpiredCache();
    }

    // Read and validate payload size
    const bodyText = await request.text();
    if (bodyText.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: `Payload too large. Maximum ${MAX_PAYLOAD_SIZE} bytes.` }, { status: 400 });
    }

    // Parse JSON
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Validate payload structure
    if (!payload || typeof payload !== "object" || !payload.type || !payload.data) {
      return NextResponse.json({ error: "Invalid payload: must include type and data fields" }, { status: 400 });
    }

    // Validate using type validators
    try {
      validatePayload(payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid payload";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validate voice configuration
    try {
      validateVoiceConfig();
    } catch (err) {
      console.error("Voice config validation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Voice configuration error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Build speech text
    const { text, cacheKeyParts } = buildSpeechText(payload);

    // Check cache
    const cacheKey = getCacheKey(cacheKeyParts);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_TTL) {
      return new NextResponse(cached.audio, {
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=900", // 15 minutes
        },
      });
    }

    // Get API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY not configured");
      return NextResponse.json({ error: "TTS service not configured" }, { status: 500 });
    }

    // Get voice ID
    let voiceId: string;
    try {
      voiceId = getVoiceId(payload.locale || "en", payload.voice || "calm");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Voice ID configuration error";
      console.error("Voice ID error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Validate voice ID format (should be a non-empty string, ideally an ID-like format)
    if (!voiceId || typeof voiceId !== "string" || voiceId.trim() === "") {
      const errorMessage = "Invalid voice ID: must be a non-empty string from environment variables";
      console.error("Voice ID validation failed:", voiceId);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Call ElevenLabs TTS API
    const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let errorMessage = `ElevenLabs API error: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail?.message || errorJson.message || errorMessage;
      } catch {
        // Use default error message
      }
      // Truncate error message
      if (errorMessage.length > 300) {
        errorMessage = errorMessage.slice(0, 297) + "...";
      }
      console.error("ElevenLabs TTS error:", response.status, errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    // Store in cache
    evictOldestCacheEntry();
    cache.set(cacheKey, {
      audio: audioBuffer,
      contentType,
      createdAt: Date.now(),
    });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=900", // 15 minutes
      },
    });
  } catch (error) {
    console.error("TTS route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
