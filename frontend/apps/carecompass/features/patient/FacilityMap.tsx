import type { RecommendationResponse } from "@/lib/api";

type Props = {
  facilities: RecommendationResponse["facilities"];
  center: { lat: number; lng: number };
};

export function FacilityMap({ facilities, center }: Props) {
  return (
    <div className="lg:sticky lg:top-24 h-fit">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="h-[600px] bg-muted/50 flex items-center justify-center relative">
          {/* Map placeholder background */}
          <div className="absolute inset-0">
            {/* Softer grid pattern to simulate map */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-primary/30 rounded-full" />
          </div>

          {/* Facility markers */}
          {facilities.map((facility, idx) => {
            // Position markers in a pattern (not real coordinates, just visual)
            const positions = [
              { top: "25%", left: "65%" },
              { top: "55%", left: "35%" },
            ];
            const position = positions[idx] || { top: "40%", left: "50%" };

            return (
              <div
                key={facility.facilityId}
                className="absolute"
                style={position}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-semibold text-xs ${
                    facility.isBestMatch
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground text-background"
                  }`}
                >
                  {facility.rank}
                </div>
                {/* Facility label */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="px-2 py-1 bg-card border border-border rounded text-xs shadow-md">
                    {facility.name.split(" ")[0]}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Legend (bottom-left) - better styling */}
          <div className="absolute bottom-4 left-4 bg-card/98 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
            <p className="text-xs font-semibold text-foreground mb-3">
              Facility Types
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
                <span className="text-xs text-muted-foreground">ER</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-xs text-muted-foreground">Urgent Care</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                <span className="text-xs text-muted-foreground">Clinic</span>
              </div>
            </div>
          </div>

          {/* Control buttons (top-right) */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              className="p-2 bg-card/98 backdrop-blur-sm border border-border rounded-lg shadow-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
              aria-label="Locate me"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="p-2 bg-card/98 backdrop-blur-sm border border-border rounded-lg shadow-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
              aria-label="Map settings"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Placeholder text (centered) */}
          <div className="text-center p-8 relative z-10">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-sm text-muted-foreground">Map view placeholder</p>
            <p className="text-xs text-muted-foreground mt-1">
              Facility locations will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
