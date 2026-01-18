"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toUrgencyScore } from "../lib/utils/urgency";

export default function Results() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error" | "done">("loading");

  useEffect(() => {
    const processScore = async () => {
      try {
        // Get score from query parameter
        const scoreParam = searchParams.get("score");
        
        if (!scoreParam) {
          console.warn("No score provided in URL");
          router.push("/ai-triage");
          return;
        }

        // TEMP LOG: Raw query param
        console.log("INPUT_URGENCY_RAW", scoreParam, typeof scoreParam);

        // SAFEGUARD: Use strict urgency helper - never default to 5, always defaults to 1
        const score = toUrgencyScore(scoreParam, 1);

        // TEMP LOG: After validation
        console.log("COMPUTED_URGENCY", score, typeof score);

        console.log("Score received and validated:", score);

        // Navigate to triage-results with score
        router.push(`/triage-results?score=${score}`);
        setStatus("done");
      } catch (error) {
        console.error("Error processing score:", error);
        setStatus("error");
        // Still navigate to triage page on error
        setTimeout(() => router.push("/ai-triage"), 2000);
      }
    };

    processScore();
  }, [router, searchParams]);

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
