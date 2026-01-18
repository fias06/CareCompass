"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toUrgencyScore } from "../lib/utils/urgency";

const STORAGE_KEY = "carecompass:triageDraft";

type TriageDraft = {
  selectedChips: string[];
  symptomsText: string;
  createdAt: string;
};

export default function Results() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    const processTriage = async () => {
      try {
        // Read from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          console.warn("No triage draft found in localStorage");
          router.push("/ai-triage");
          return;
        }

        const draft: TriageDraft = JSON.parse(stored);
        
        // Combine selected chips and text
        const chipsText = draft.selectedChips.join(", ");
        const combinedSymptoms = draft.symptomsText
          ? `${draft.symptomsText}${chipsText ? `, ${chipsText}` : ""}`
          : chipsText;

        if (!combinedSymptoms.trim()) {
          console.warn("No symptoms provided in draft");
          router.push("/ai-triage");
          return;
        }

        // Call triage API
        const response = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms: combinedSymptoms.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Triage API failed");
        }

        const data = await response.json();
        const triageResult = data.data;
        const rawScore = triageResult.severity;

        // TEMP LOG: Raw API response
        console.log("INPUT_URGENCY_RAW", rawScore, typeof rawScore);

        // SAFEGUARD: Use strict urgency helper - never default to 5, always defaults to 1
        const score = toUrgencyScore(rawScore, 1);

        // TEMP LOG: After validation
        console.log("COMPUTED_URGENCY", score, typeof score);

        console.log("Triage completed, score:", score);

        // Navigate to triage-results with score
        router.push(`/triage-results?score=${score}`);
        setStatus("done");
      } catch (error) {
        console.error("Error processing triage:", error);
        setStatus("error");
        // Still navigate to triage page on error
        setTimeout(() => router.push("/ai-triage"), 2000);
      }
    };

    processTriage();
  }, [router]);

  // Show minimal loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Processing your symptoms...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-600">Error processing request. Redirecting...</p>
      </div>
    );
  }

  return null;
}
