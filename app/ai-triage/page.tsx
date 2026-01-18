"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MicButton } from "../components/MicButton";

const STORAGE_KEY = "carecompass:triageDraft";

type TriageDraft = {
  selectedChips: string[];
  symptomsText: string;
  createdAt: string;
};

const QUICK_SYMPTOMS = [
  { label: "Fever", value: "fever" },
  { label: "Nausea", value: "nausea" },
  { label: "Headache", value: "headache" },
  { label: "Cough", value: "cough" },
  { label: "Chest Pain", value: "chest pain" },
  { label: "Dizziness", value: "dizziness" },
  { label: "Sore Throat", value: "sore throat" },
  { label: "Fatigue", value: "fatigue" },
  { label: "Stomach Ache", value: "stomach ache" },
  { label: "Shortness of Breath", value: "shortness of breath" },
  { label: "Wound / Bleeding", value: "bleeding" },
  { label: "High Fever (>103°F)", value: "high fever" },
];

export default function Home() {
  const router = useRouter();
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [symptomsText, setSymptomsText] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const draft: TriageDraft = JSON.parse(stored);
        setSelectedChips(Array.isArray(draft.selectedChips) ? draft.selectedChips : []);
        setSymptomsText(typeof draft.symptomsText === "string" ? draft.symptomsText : "");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSymptom = (value: string) => {
    setSelectedChips((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleQuickSelect = (value: string) => {
    toggleSymptom(value);

    // Append to textarea (nice comma-separated)
    setSymptomsText((prev) => {
      const trimmed = prev.trim();
      const lower = trimmed.toLowerCase();
      if (lower.includes(value.toLowerCase())) return prev;

      if (!trimmed) return value;
      return trimmed.endsWith(",") ? `${trimmed} ${value}` : `${trimmed}, ${value}`;
    });
  };

  const handleGetRecommendations = () => {
    const draft: TriageDraft = {
      selectedChips,
      symptomsText,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }

    router.push("/results");
  };

  const handleTranscript = (text: string) => {
    setSymptomsText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return text;
      }
      // Append with comma + space if textarea already has content
      return trimmed + ", " + text;
    });
  };

  const isButtonDisabled =
    symptomsText.trim().length === 0 && selectedChips.length === 0;

  return (
    // HARD-FORCE light UI (no theme tokens)
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* If you have any global overlay somewhere, this ensures our UI sits above it */}
      <div className="relative z-10">
        {/* Top-left brand header */}
        <header className="absolute top-0 left-0 p-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <svg
                className="w-5 h-5 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <h1 className="text-xl font-semibold">CareCompass</h1>
              <p className="text-sm text-gray-500">Smart Emergency Routing</p>
            </div>
          </div>
        </header>

        {/* Centered main content */}
        <main className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          <div className="w-full max-w-3xl flex flex-col items-center gap-8">
            {/* Badge */}
            <div className="flex justify-center">
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-900 border border-gray-200">
                AI-Powered Triage
              </span>
            </div>

            {/* Title + subtitle */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
                What symptoms are you experiencing?
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Describe your symptoms and their severity. This helps us route you
                to the most appropriate care facility.
              </p>
            </div>

            {/* Chips (your symptoms, no emojis) */}
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_SYMPTOMS.map((s) => {
                const isSelected = selectedChips.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleQuickSelect(s.value)}
                    className={[
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      "select-none",
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Textarea */}
            <div className="w-full max-w-2xl relative">
              <textarea
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="I've had a sharp pain in my lower right abdomen for the past 6 hours..."
                className="w-full min-h-[220px] px-4 py-4 pr-12 rounded-2xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 resize-none"
              />
              <div className="absolute bottom-4 right-4">
                <MicButton
                  onTranscript={handleTranscript}
                  languageCode="eng"
                />
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleGetRecommendations}
              disabled={isButtonDisabled}
              className="px-10 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Recommendations
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center max-w-xl">
              This tool provides guidance only and does not replace professional medical
              advice. If you're experiencing a life-threatening emergency, call 911.
            </p>

            {/* Tiny debug so you can verify clicks are working */}
            <p className="text-xs text-gray-400 text-center">
              Selected: {selectedChips.length ? selectedChips.join(", ") : "none"}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
