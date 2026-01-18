import type { RecommendationResponse } from "@/lib/api";

type Props = {
  triage: RecommendationResponse["triage"];
  scoring: RecommendationResponse["scoring"];
  userInput?: {
    selectedChips: string[];
    symptomsText: string;
  };
};

export function WhyPanel({ triage, scoring, userInput }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Why This Recommendation?
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Understanding our scoring logic
      </p>

      {/* User Input Section */}
      {userInput && (userInput.selectedChips.length > 0 || userInput.symptomsText.trim().length > 0) && (
        <div className="mb-6 pb-6 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Your Symptoms
          </h4>
          {userInput.selectedChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {userInput.selectedChips.map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          {userInput.symptomsText.trim().length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {userInput.symptomsText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Triage Assessment */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Triage Assessment
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {triage.summary}
        </p>
      </div>

      {/* Scoring Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Scoring Factors
        </h4>
        <ul className="space-y-2">
          <li className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Travel Time</span>
            <span className="font-medium text-foreground">
              {(scoring.weights.eta * 100).toFixed(0)}%
            </span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Wait Time</span>
            <span className="font-medium text-foreground">
              {(scoring.weights.wait * 100).toFixed(0)}%
            </span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Facility Match</span>
            <span className="font-medium text-foreground">
              {(scoring.weights.match * 100).toFixed(0)}%
            </span>
          </li>
          <li className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <span className="font-medium text-foreground">
              {(scoring.weights.quality * 100).toFixed(0)}%
            </span>
          </li>
        </ul>
      </div>

      {/* Formula code block */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-2">Formula</h4>
        <div className="bg-muted rounded-lg p-3 border border-border">
          <code className="text-xs text-foreground font-mono">
            {scoring.formula}
          </code>
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Recommendations are based on available data and estimates. Wait times and
        availability may change. This tool provides guidance only and does not
        replace professional medical advice. If you're experiencing a
        life-threatening emergency, call 911.
      </p>
    </div>
  );
}
