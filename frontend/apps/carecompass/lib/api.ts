// Shared types matching backend contract
export type Severity = 1 | 2 | 3 | 4 | 5;

export type RecommendationResponse = {
  requestId: string;
  triage: {
    severity: Severity;
    severityLabel: "Low" | "Moderate" | "High" | "Critical";
    recommendedCare: "self_care" | "primary_care" | "urgent_care" | "emergency_room";
    redFlags: string[];
    summary: string;
  };
  userContext: {
    locationLabel: string;
    lat: number;
    lng: number;
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
  };
  scoring: {
    weights: { eta: number; wait: number; match: number; quality: number };
    formula: string;
    notes: string[];
  };
  facilities: Array<{
    rank: number;
    facilityId: string;
    name: string;
    type: "ER" | "UrgentCare" | "Clinic";
    address: string;
    location: { lat: number; lng: number };
    etaMinutes: number;
    waitMinutes: number;
    rating: number;
    matchScore: number; // 0-100
    isBestMatch: boolean;
    explain: {
      topReasons: string[];
      factorBreakdown: { eta: number; wait: number; match: number; quality: number };
    };
    actions: { phone?: string; website?: string; mapsUrl?: string };
  }>;
};

// Mock data constant
export const mockRecommendationResponse: RecommendationResponse = {
  requestId: "req_9f12c",
  triage: {
    severity: 4,
    severityLabel: "High",
    recommendedCare: "emergency_room",
    redFlags: ["difficulty breathing", "high fever"],
    summary:
      "Your symptoms suggest a potentially serious condition. Emergency care is recommended for timely evaluation.",
  },
  userContext: {
    locationLabel: "Downtown",
    lat: 43.4643,
    lng: -80.5204,
    timeOfDay: "afternoon",
  },
  scoring: {
    weights: { eta: 0.4, wait: 0.3, match: 0.2, quality: 0.1 },
    formula: "score = (ETA * 0.4) + (Wait * 0.3) + (Match * 0.2) + (Quality * 0.1)",
    notes: [
      "Wait time is estimated based on staff reports and heuristics.",
      "Recommendations provide guidance only and are not medical advice.",
    ],
  },
  facilities: [
    {
      rank: 1,
      facilityId: "fac_city_general_er",
      name: "City General Hospital ER",
      type: "ER",
      address: "123 Medical Center Dr",
      location: { lat: 43.4681, lng: -80.5168 },
      etaMinutes: 8,
      waitMinutes: 45,
      rating: 4.3,
      matchScore: 62,
      isBestMatch: true,
      explain: {
        topReasons: [
          "Fastest route with real-time traffic",
          "ER capability matches severity level",
          "Moderate estimated wait time",
        ],
        factorBreakdown: { eta: 32, wait: 18, match: 9, quality: 3 },
      },
      actions: {
        phone: "+1 (555) 555-0199",
        website: "https://example.com",
        mapsUrl: "https://maps.google.com/?q=City+General+Hospital+ER",
      },
    },
    {
      rank: 2,
      facilityId: "fac_downtown_medical",
      name: "Downtown Medical Center",
      type: "ER",
      address: "789 Emergency Blvd",
      location: { lat: 43.4619, lng: -80.5252 },
      etaMinutes: 12,
      waitMinutes: 55,
      rating: 4.1,
      matchScore: 56,
      isBestMatch: false,
      explain: {
        topReasons: [
          "Slightly longer travel time",
          "ER capability matches severity level",
          "Higher estimated wait time",
        ],
        factorBreakdown: { eta: 28, wait: 15, match: 10, quality: 3 },
      },
      actions: {
        phone: "+1 (555) 555-0142",
        mapsUrl: "https://maps.google.com/?q=Downtown+Medical+Center",
      },
    },
  ],
};

// Mock API function with delay to simulate real request
export async function getMockRecommendations(): Promise<RecommendationResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockRecommendationResponse;
}

// Backend API types for TTS-enabled recommendation endpoint
export type RecommendRequest = {
  lat: number;
  lng: number;
  severity: "low" | "moderate" | "high" | "critical";
  mode: "driving" | "walking";
  radius_m: number;
  include_tts?: boolean;
};

export type TTSRecommendResponse = {
  recommended: { facility: { name: string; address: string } };
  spoken_text?: string;
  tts_audio_base64?: string;
};

/**
 * Call backend API to get recommendation with optional TTS audio
 */
export async function recommendWithOptionalTTS(
  payload: RecommendRequest
): Promise<TTSRecommendResponse> {
  const response = await fetch("http://localhost:8000/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Request failed with status ${response.status}: ${errorText}`
    );
  }

  return response.json();
}
