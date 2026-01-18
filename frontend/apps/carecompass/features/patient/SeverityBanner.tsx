import type { RecommendationResponse } from "@/lib/api";

type Props = {
  triage: RecommendationResponse["triage"];
};

function getCareRecommendationText(
  recommendedCare: RecommendationResponse["triage"]["recommendedCare"]
): string {
  switch (recommendedCare) {
    case "emergency_room":
      return "Emergency room recommended";
    case "urgent_care":
      return "Urgent care recommended";
    case "primary_care":
      return "Primary care recommended";
    case "self_care":
      return "Self-care recommended";
    default:
      return "Care facility recommended";
  }
}

export function SeverityBanner({ triage }: Props) {
  const careText = getCareRecommendationText(triage.recommendedCare);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Severity Level {triage.severity}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              triage.severity >= 4
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : triage.severity === 3
                  ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            }`}
          >
            {triage.severityLabel}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{careText}</p>
      {/* Segmented progress bar (5 segments) */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-all ${
              level <= triage.severity
                ? "bg-destructive"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
