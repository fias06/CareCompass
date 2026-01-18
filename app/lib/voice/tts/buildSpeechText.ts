import type {
  SpeechPayload,
  Locale,
  RecommendationTopData,
  RecommendationReasonData,
  SeveritySummaryData,
  NavigationStepData,
  CaregiverSummaryData,
} from "../types";
import {
  validateRecommendationTopData,
  validateRecommendationReasonData,
  validateSeveritySummaryData,
  validateNavigationStepData,
  validateCaregiverSummaryData,
} from "../types";

const MAX_TEXT_LENGTH = 800;

const DISCLAIMER_EN =
  "This is informational guidance, not a medical diagnosis. If symptoms worsen, seek emergency services immediately.";
const DISCLAIMER_FR =
  "Ceci est une orientation informative, pas un diagnostic médical. Si les symptômes s'aggravent, consultez immédiatement les services d'urgence.";

function normalizeNumber(value: number | undefined, decimals: number = 0): number | undefined {
  if (value === undefined || isNaN(value)) return undefined;
  return decimals === 0 ? Math.round(value) : Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

function getDisclaimer(locale: Locale = "en"): string {
  return locale === "fr" ? DISCLAIMER_FR : DISCLAIMER_EN;
}

function buildRecommendationTopText(data: RecommendationTopData, locale: Locale = "en"): string {
  const validated = validateRecommendationTopData(data);
  const parts: string[] = [];

  const facilityTypeText = validated.facilityType.replace("_", " ");
  const facilityName = validated.facilityName;

  if (locale === "en") {
    parts.push(`The recommended ${facilityTypeText} facility is ${facilityName}.`);
    if (validated.distanceKm !== undefined) {
      const distance = normalizeNumber(validated.distanceKm, 1);
      parts.push(`It is ${distance} kilometers away`);
    }
    if (validated.etaMin !== undefined) {
      const eta = normalizeNumber(validated.etaMin);
      parts.push(`about ${eta} minutes travel time`);
    }
    if (validated.waitMin !== undefined) {
      const wait = normalizeNumber(validated.waitMin);
      parts.push(`with an estimated wait of ${wait} minutes`);
    }
  } else {
    parts.push(`L'établissement ${facilityTypeText} recommandé est ${facilityName}.`);
    if (validated.distanceKm !== undefined) {
      const distance = normalizeNumber(validated.distanceKm, 1);
      parts.push(`Il est à ${distance} kilomètres`);
    }
    if (validated.etaMin !== undefined) {
      const eta = normalizeNumber(validated.etaMin);
      parts.push(`environ ${eta} minutes de trajet`);
    }
    if (validated.waitMin !== undefined) {
      const wait = normalizeNumber(validated.waitMin);
      parts.push(`avec un temps d'attente estimé de ${wait} minutes`);
    }
  }

  return parts.filter(Boolean).join(", ");
}

function buildRecommendationReasonText(data: RecommendationReasonData, locale: Locale = "en"): string {
  const validated = validateRecommendationReasonData(data);
  const topReasons = validated.reasons.slice(0, 3);
  if (locale === "en") {
    return `This was recommended because: ${topReasons.join("; ")}.`;
  }
  return `Ceci a été recommandé parce que: ${topReasons.join("; ")}.`;
}

function buildSeveritySummaryText(data: SeveritySummaryData, locale: Locale = "en"): string {
  const validated = validateSeveritySummaryData(data);
  if (locale === "en") {
    let text = `Your symptoms indicate a ${validated.severity} level of urgency.`;
    if (validated.note) {
      text += ` ${validated.note}`;
    }
    return text;
  }
  const severityText = validated.severity === "low" ? "faible" : validated.severity === "moderate" ? "modéré" : "élevé";
  let text = `Vos symptômes indiquent un niveau d'urgence ${severityText}.`;
  if (validated.note) {
    text += ` ${validated.note}`;
  }
  return text;
}

function buildNavigationStepText(data: NavigationStepData, locale: Locale = "en"): string {
  const validated = validateNavigationStepData(data);
  if (locale === "en") {
    let text = validated.instruction;
    if (validated.distanceMeters !== undefined) {
      const distance = normalizeNumber(validated.distanceMeters);
      text += ` Distance: ${distance} meters.`;
    }
    return text;
  }
  let text = validated.instruction;
  if (validated.distanceMeters !== undefined) {
    const distance = normalizeNumber(validated.distanceMeters);
    text += ` Distance: ${distance} mètres.`;
  }
  return text;
}

function buildCaregiverSummaryText(data: CaregiverSummaryData, locale: Locale = "en"): string {
  const validated = validateCaregiverSummaryData(data);
  const parts: string[] = [];
  if (locale === "en") {
    parts.push(`Urgency level is ${validated.severity}.`);
    if (validated.facilityName) {
      parts.push(`Recommended facility: ${validated.facilityName}.`);
    }
    if (validated.etaMin !== undefined) {
      const eta = normalizeNumber(validated.etaMin);
      parts.push(`Estimated arrival: ${eta} minutes.`);
    }
  } else {
    const severityText = validated.severity === "low" ? "faible" : validated.severity === "moderate" ? "modéré" : "élevé";
    parts.push(`Niveau d'urgence: ${severityText}.`);
    if (validated.facilityName) {
      parts.push(`Établissement recommandé: ${validated.facilityName}.`);
    }
    if (validated.etaMin !== undefined) {
      const eta = normalizeNumber(validated.etaMin);
      parts.push(`Arrivée estimée: ${eta} minutes.`);
    }
  }
  return parts.filter(Boolean).join(" ");
}

export function buildSpeechText(payload: SpeechPayload): { text: string; cacheKeyParts: string[] } {
  const { type, locale = "en", voice = "calm", data } = payload;
  const effectiveLocale = locale;

  let mainText = "";

  switch (type) {
    case "recommendation_top":
      mainText = buildRecommendationTopText(data as RecommendationTopData, effectiveLocale);
      break;
    case "recommendation_reason":
      mainText = buildRecommendationReasonText(data as RecommendationReasonData, effectiveLocale);
      break;
    case "severity_summary":
      mainText = buildSeveritySummaryText(data as SeveritySummaryData, effectiveLocale);
      break;
    case "navigation_step":
      mainText = buildNavigationStepText(data as NavigationStepData, effectiveLocale);
      break;
    case "caregiver_summary":
      mainText = buildCaregiverSummaryText(data as CaregiverSummaryData, effectiveLocale);
      break;
    case "disclaimer_only":
      mainText = getDisclaimer(effectiveLocale);
      break;
    default:
      mainText = "";
  }

  // Prepend disclaimer unless it's disclaimer_only (which is already just the disclaimer)
  let finalText = mainText;
  if (type !== "disclaimer_only") {
    finalText = `${getDisclaimer(effectiveLocale)} ${mainText}`;
  }

  // Truncate if needed
  finalText = truncateText(finalText, MAX_TEXT_LENGTH);

  // Build cache key parts
  const cacheKeyParts = [
    type,
    effectiveLocale,
    voice,
    JSON.stringify(data), // Stable JSON string of validated data
  ];

  return { text: finalText, cacheKeyParts };
}
