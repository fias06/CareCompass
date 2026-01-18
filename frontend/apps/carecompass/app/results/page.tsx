"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMockRecommendations,
  type RecommendationResponse,
  recommendWithOptionalTTS,
  type RecommendRequest,
} from "@/lib/api";
import { playBase64Mp3 } from "@/lib/voice/audio";
import { SeverityBanner } from "@/features/patient/SeverityBanner";
import { FacilityList } from "@/features/patient/FacilityList";
import { FacilityMap } from "@/features/patient/FacilityMap";
import { WhyPanel } from "@/features/patient/WhyPanel";

const STORAGE_KEY = "carecompass:triageDraft";

type TriageDraft = {
  selectedChips: string[];
  symptomsText: string;
  createdAt: string;
};

export default function ResultsPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState<TriageDraft | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [spokenText, setSpokenText] = useState<string | null>(null);

  // Map severity number (1-5) to backend severity string
  const mapSeverityToBackend = (severity: 1 | 2 | 3 | 4 | 5): "low" | "moderate" | "high" | "critical" => {
    if (severity <= 1) return "low";
    if (severity === 2) return "moderate";
    if (severity === 3 || severity === 4) return "high";
    return "critical";
  };

  const handleSpeakResult = async () => {
    if (!data) return;

    setTtsLoading(true);
    setTtsError(null);
    setSpokenText(null);

    try {
      const payload: RecommendRequest = {
        lat: data.userContext.lat,
        lng: data.userContext.lng,
        severity: mapSeverityToBackend(data.triage.severity),
        mode: "driving",
        radius_m: 5000,
        include_tts: true,
      };

      const response = await recommendWithOptionalTTS(payload);

      if (response.spoken_text) {
        setSpokenText(response.spoken_text);
      }

      if (response.tts_audio_base64) {
        await playBase64Mp3(response.tts_audio_base64);
      } else {
        setTtsError("No audio data received from server");
      }
    } catch (error) {
      console.error("Failed to get TTS recommendation:", error);
      setTtsError(
        error instanceof Error
          ? error.message
          : "Failed to load audio. Please try again."
      );
    } finally {
      setTtsLoading(false);
    }
  };

  useEffect(() => {
    // Load user input from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: TriageDraft = JSON.parse(stored);
        setUserInput(draft);
      }
    } catch (error) {
      console.error("Failed to load triage draft:", error);
    }

    // Fetch recommendations
    async function fetchData() {
      try {
        const result = await getMockRecommendations();
        setData(result);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Loading skeleton
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="fixed top-0 left-0 p-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">CareCompass</h1>
              <p className="text-sm text-muted-foreground">Smart Emergency Routing</p>
            </div>
          </div>
        </header>
        <main className="pt-20 px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-2 bg-muted rounded" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl h-[600px] animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top-left brand header */}
      <header className="fixed top-0 left-0 p-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">CareCompass</h1>
            <p className="text-sm text-muted-foreground">Smart Emergency Routing</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-3 inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          New Assessment
        </Link>
      </header>

      {/* Main content */}
      <main className="pt-20 px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left column */}
          <div className="space-y-6">
            {/* Speak Result button */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <button
                onClick={handleSpeakResult}
                disabled={ttsLoading || !data}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ttsLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading audio...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    <span>🔊 Speak Result</span>
                  </>
                )}
              </button>
              {spokenText && (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {spokenText}
                </p>
              )}
              {ttsError && (
                <p className="mt-2 text-xs text-destructive">{ttsError}</p>
              )}
            </div>
            <SeverityBanner triage={data.triage} />
            <FacilityList facilities={data.facilities} />
            <WhyPanel
              triage={data.triage}
              scoring={data.scoring}
              userInput={
                userInput
                  ? {
                      selectedChips: userInput.selectedChips,
                      symptomsText: userInput.symptomsText,
                    }
                  : undefined
              }
            />
          </div>

          {/* Right column - Map */}
          <FacilityMap
            facilities={data.facilities}
            center={{ lat: data.userContext.lat, lng: data.userContext.lng }}
          />
        </div>
      </main>
    </div>
  );
}
