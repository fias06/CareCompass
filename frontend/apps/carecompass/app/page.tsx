"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "carecompass:triageDraft";

type TriageDraft = {
  selectedChips: string[];
  symptomsText: string;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [symptomsText, setSymptomsText] = useState("");

  const symptomChips = [
    "Chest pain",
    "Difficulty breathing",
    "Severe headache",
    "High fever",
    "Abdominal pain",
    "Injury/trauma",
    "Allergic reaction",
    "Dizziness",
  ];

  // Prefill from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: TriageDraft = JSON.parse(stored);
        setSelectedChips(draft.selectedChips || []);
        setSymptomsText(draft.symptomsText || "");
      }
    } catch (error) {
      // Ignore parse errors
      console.error("Failed to load triage draft:", error);
    }
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedChips((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleGetRecommendations = () => {
    const draft: TriageDraft = {
      selectedChips,
      symptomsText,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save triage draft:", error);
    }

    router.push("/results");
  };

  const isButtonDisabled =
    symptomsText.trim().length === 0 && selectedChips.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top-left brand header */}
      <header className="fixed top-0 left-0 p-6 z-10">
        <div className="flex items-center gap-3">
          {/* Icon placeholder - heart/medical style */}
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

      {/* Centered main content */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20 md:py-24">
        <div className="w-full max-w-2xl space-y-8">
          {/* CareCompass */}
          <div className="flex justify-center">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              AI-Powered Triage
            </span>
          </div>

          {/* Main heading */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              What symptoms are you experiencing?
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Describe your symptoms and their severity. This helps us route you to
              the most appropriate care facility.
            </p>
          </div>

          {/* Symptom chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {symptomChips.map((symptom) => {
              const isSelected = selectedChips.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border border-primary"
                      : "bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>

          {/* Textarea input */}
          <div className="relative">
            <textarea
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="I've had a sharp pain in my lower right abdomen for the past 6 hours…"
              className="w-full min-h-[160px] px-4 py-3 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
            {/* Mic button icon placeholder */}
            <button
              type="button"
              className="absolute bottom-3 right-3 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Voice input"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>

          {/* Primary CTA button */}
          <button
            onClick={handleGetRecommendations}
            disabled={isButtonDisabled}
            className="w-full md:w-auto md:mx-auto md:block px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Recommendations
          </button>

          {/* Disclaimer text */}
          <p className="text-xs text-muted-foreground text-center max-w-xl mx-auto">
            This tool provides guidance only and does not replace professional medical
            advice. If you're experiencing a life-threatening emergency, call 911.
          </p>
        </div>
      </main>
    </div>
  );
}
