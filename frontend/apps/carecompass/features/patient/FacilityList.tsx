import type { RecommendationResponse } from "@/lib/api";

type Props = {
  facilities: RecommendationResponse["facilities"];
};

export function FacilityList({ facilities }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recommended Facilities
      </h3>
      <div className="space-y-4">
        {facilities.map((facility) => (
          <div
            key={facility.facilityId}
            className={`bg-card border rounded-xl p-5 shadow-sm transition-all ${
              facility.isBestMatch
                ? "border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-teal-500/20"
                : "border-border opacity-90"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  #{facility.rank}
                </span>
                {facility.isBestMatch && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-300/50 dark:border-teal-700/50">
                    Best Match
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-base font-semibold text-foreground mb-1">
              {facility.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {facility.address}
            </p>

            {/* 3 metrics row - compact tiles */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">ETA</p>
                <p className="text-sm font-semibold text-foreground">
                  {facility.etaMinutes} min
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Wait</p>
                <p className="text-sm font-semibold text-foreground">
                  {facility.waitMinutes} min
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Rating</p>
                <p className="text-sm font-semibold text-foreground">
                  {facility.rating}/5
                </p>
              </div>
            </div>

            {/* Match Score with mini progress bar - soft colored with rounded ends */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Match Score</span>
                <span className="text-xs font-medium text-foreground">
                  {facility.matchScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-700 transition-all rounded-full"
                  style={{ width: `${facility.matchScore}%` }}
                />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex gap-2">
              {facility.actions.mapsUrl ? (
                <a
                  href={facility.actions.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center"
                >
                  Navigate
                </a>
              ) : (
                <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Navigate
                </button>
              )}
              {facility.actions.website && (
                <a
                  href={facility.actions.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                  aria-label="Open website"
                >
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
              {facility.actions.phone && (
                <a
                  href={`tel:${facility.actions.phone}`}
                  className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                  aria-label="Call facility"
                >
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
