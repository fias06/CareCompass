export type Locale = "en" | "fr";
export type VoicePreset = "calm" | "neutral";

export type SpeechType =
  | "recommendation_top"
  | "recommendation_reason"
  | "severity_summary"
  | "navigation_step"
  | "caregiver_summary"
  | "disclaimer_only";

export interface SpeechPayload {
  type: SpeechType;
  locale?: Locale; // default "en"
  voice?: VoicePreset; // default "calm"
  data: Record<string, unknown>;
}

// Data interfaces per type
export interface RecommendationTopData {
  facilityName: string;
  facilityType: "emergency" | "urgent_care" | "clinic";
  distanceKm?: number;
  etaMin?: number;
  waitMin?: number;
  address?: string;
}

export interface RecommendationReasonData {
  reasons: string[];
}

export interface SeveritySummaryData {
  severity: "low" | "moderate" | "high";
  note?: string;
}

export interface NavigationStepData {
  instruction: string;
  distanceMeters?: number;
  etaMin?: number;
}

export interface CaregiverSummaryData {
  severity: "low" | "moderate" | "high";
  facilityName?: string;
  facilityType?: string;
  etaMin?: number;
  address?: string;
}

export interface DisclaimerOnlyData {}

// Type guards and validators
export function validateRecommendationTopData(data: Record<string, unknown>): RecommendationTopData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: must be an object");
  }
  if (typeof data.facilityName !== "string" || !data.facilityName.trim()) {
    throw new Error("Invalid data: facilityName must be a non-empty string");
  }
  const validTypes = ["emergency", "urgent_care", "clinic"];
  if (!validTypes.includes(data.facilityType as string)) {
    throw new Error(`Invalid data: facilityType must be one of ${validTypes.join(", ")}`);
  }
  return {
    facilityName: data.facilityName as string,
    facilityType: data.facilityType as "emergency" | "urgent_care" | "clinic",
    distanceKm: typeof data.distanceKm === "number" ? data.distanceKm : undefined,
    etaMin: typeof data.etaMin === "number" ? data.etaMin : undefined,
    waitMin: typeof data.waitMin === "number" ? data.waitMin : undefined,
    address: typeof data.address === "string" ? data.address : undefined,
  };
}

export function validateRecommendationReasonData(data: Record<string, unknown>): RecommendationReasonData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: must be an object");
  }
  if (!Array.isArray(data.reasons) || !data.reasons.every((r: unknown) => typeof r === "string")) {
    throw new Error("Invalid data: reasons must be an array of strings");
  }
  return {
    reasons: data.reasons as string[],
  };
}

export function validateSeveritySummaryData(data: Record<string, unknown>): SeveritySummaryData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: must be an object");
  }
  const validSeverities = ["low", "moderate", "high"];
  if (!validSeverities.includes(data.severity as string)) {
    throw new Error(`Invalid data: severity must be one of ${validSeverities.join(", ")}`);
  }
  return {
    severity: data.severity as "low" | "moderate" | "high",
    note: typeof data.note === "string" ? data.note : undefined,
  };
}

export function validateNavigationStepData(data: Record<string, unknown>): NavigationStepData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: must be an object");
  }
  if (typeof data.instruction !== "string" || !data.instruction.trim()) {
    throw new Error("Invalid data: instruction must be a non-empty string");
  }
  return {
    instruction: data.instruction as string,
    distanceMeters: typeof data.distanceMeters === "number" ? data.distanceMeters : undefined,
    etaMin: typeof data.etaMin === "number" ? data.etaMin : undefined,
  };
}

export function validateCaregiverSummaryData(data: Record<string, unknown>): CaregiverSummaryData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data: must be an object");
  }
  const validSeverities = ["low", "moderate", "high"];
  if (!validSeverities.includes(data.severity as string)) {
    throw new Error(`Invalid data: severity must be one of ${validSeverities.join(", ")}`);
  }
  return {
    severity: data.severity as "low" | "moderate" | "high",
    facilityName: typeof data.facilityName === "string" ? data.facilityName : undefined,
    facilityType: typeof data.facilityType === "string" ? data.facilityType : undefined,
    etaMin: typeof data.etaMin === "number" ? data.etaMin : undefined,
    address: typeof data.address === "string" ? data.address : undefined,
  };
}

export function validateDisclaimerOnlyData(data: Record<string, unknown>): DisclaimerOnlyData {
  return {};
}

// Main validator
export function validatePayload(payload: SpeechPayload): void {
  const { type, data } = payload;
  switch (type) {
    case "recommendation_top":
      validateRecommendationTopData(data);
      break;
    case "recommendation_reason":
      validateRecommendationReasonData(data);
      break;
    case "severity_summary":
      validateSeveritySummaryData(data);
      break;
    case "navigation_step":
      validateNavigationStepData(data);
      break;
    case "caregiver_summary":
      validateCaregiverSummaryData(data);
      break;
    case "disclaimer_only":
      validateDisclaimerOnlyData(data);
      break;
    default:
      throw new Error(`Unknown speech type: ${type}`);
  }
}
