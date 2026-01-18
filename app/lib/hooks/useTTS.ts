"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SpeechPayload } from "../voice/types";

interface UseTTSReturn {
  speak: (payload: SpeechPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  isPaused: boolean;
}

// In-memory cache for blob URLs (client-side)
const blobUrlCache = new Map<string, string>();

function getCacheKey(payload: SpeechPayload): string {
  // Approximate cache key using JSON.stringify
  return JSON.stringify({
    type: payload.type,
    locale: payload.locale || "en",
    voice: payload.voice || "calm",
    data: payload.data,
  });
}

export function useTTS(): UseTTSReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(async () => {
    if (audioRef.current && isPaused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch (err) {
        console.error("Resume error:", err);
        setError("Failed to resume audio");
        setIsPaused(false);
      }
    }
  }, [isPaused]);

  const speak = useCallback(async (payload: SpeechPayload) => {
    try {
      setError(null);
      setIsLoading(true);

      // Stop any currently playing audio
      stop();

      // Check cache
      const cacheKey = getCacheKey(payload);
      let audioUrl = blobUrlCache.get(cacheKey);

      if (!audioUrl) {
        // Fetch audio from API
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to fetch audio" }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        blobUrlCache.set(cacheKey, audioUrl);
      }

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          resolve();
        };
        audio.onerror = (e) => {
          setIsPlaying(false);
          setIsPaused(false);
          reject(new Error("Audio playback failed"));
        };
        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };
        audio.onpause = () => {
          // Only set isPaused if we're not at the beginning (i.e., user paused, not stopped)
          if (audio.currentTime > 0) {
            setIsPaused(true);
          }
          setIsPlaying(false);
        };

        audio.play().catch(reject);
      });
    } catch (err) {
      console.error("TTS error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to speak text";
      setError(errorMessage);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      // Revoke old blob URLs (keep recent ones for reuse)
      // Simple cleanup: keep last 10 URLs
      if (blobUrlCache.size > 10) {
        const entries = Array.from(blobUrlCache.entries());
        const toKeep = entries.slice(-10);
        const toRemove = entries.slice(0, -10);

        blobUrlCache.clear();
        for (const [key, url] of toKeep) {
          blobUrlCache.set(key, url);
        }

        for (const [, url] of toRemove) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, [stop]);

  return {
    speak,
    isLoading,
    error,
    stop,
    pause,
    resume,
    isPlaying,
    isPaused,
  };
}
