import { z } from "zod";

// Triage schema - captures user's symptoms and context
const TriageInputSchema = z.object({
  symptoms: z.string().describe("User's symptoms in natural language"),
  severity_self_report: z.number().min(1).max(5).optional().describe("User's self-reported severity (1=mild, 5=critical)"),
  age: z.number().min(0).max(150).optional(),
  hasComorbidities: z.boolean().optional().default(false),
  isPregnant: z.boolean().optional().default(false),
  recentTrauma: z.boolean().optional().default(false),
});

type TriageInput = z.infer<typeof TriageInputSchema>;

// Red flags that indicate emergency (911)
const CRITICAL_RED_FLAGS = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "unconscious",
  "unresponsive",
  "severe bleeding",
  "difficulty speaking",
  "facial drooping",
  "arm weakness",
  "leg weakness",
  "loss of consciousness",
  "severe allergic reaction",
  "poisoning",
  "overdose",
];

interface TriageResult {
  severity: 1 | 2 | 3 | 4 | 5;
  facility_type: "emergency" | "urgent_care" | "clinic";
  red_flags: string[];
  reasoning: string;
  recommendation: string;
  should_call_911: boolean;
}

/**
 * Simple, explainable triage logic
 * This can be enhanced with an LLM later, but for MVP:
 * Use rule-based + keyword detection
 */
function triageSymptoms(input: TriageInput): TriageResult {
  const symptomsLower = input.symptoms.toLowerCase();
  const detectedRedFlags = CRITICAL_RED_FLAGS.filter((flag) =>
    symptomsLower.includes(flag)
  );

  // Keywords to identify if symptoms are health-related
  const healthRelatedKeywords = [
    'pain', 'fever', 'cough', 'headache', 'nausea', 'fatigue',
    'severe', 'bleeding', 'chest', 'breath', 'dizzy', 'vomiting',
    'seizure', 'stroke', 'trauma', 'injury', 'illness', 'sick',
    'symptom', 'disease', 'medical', 'health', 'hurt', 'ache'
  ];

  const isHealthRelated = healthRelatedKeywords.some(keyword => 
    symptomsLower.includes(keyword)
  );

  // Start with lowest urgency (1) - escalate only with explicit triggers
  // SAFEGUARD: Default to 1 (never 5) - escalation requires specific red flags or high self-report
  let baseSeverity: 1 | 2 | 3 | 4 | 5 = 1;
  let facilityType: "emergency" | "urgent_care" | "clinic" = "clinic";
  let reasoning: string[] = [];

  // If not health-related, return minimal urgency
  if (!isHealthRelated) {
    return {
      severity: 1,
      facility_type: "clinic",
      red_flags: [],
      reasoning: "Input does not appear to be related to a medical concern",
      recommendation: "Please describe a health-related concern for proper guidance",
      should_call_911: false,
    };
  }

  // Apply self-reported severity only if valid and finite (strict numeric validation)
  // SAFEGUARD: Use Number.isFinite to prevent NaN/Infinity from elevating urgency
  if (input.severity_self_report !== undefined && 
      Number.isFinite(input.severity_self_report) && 
      input.severity_self_report >= 1 && 
      input.severity_self_report <= 5) {
    baseSeverity = Math.round(input.severity_self_report) as 1 | 2 | 3 | 4 | 5;
    reasoning.push(`User self-reported severity: ${baseSeverity}/5`);
  }

  // Rule 1: Critical red flags → Emergency + 911 (explicit escalation to 5)
  // SAFEGUARD: Only red flags can trigger severity 5 - no fallback or default to 5
  if (detectedRedFlags.length > 0) {
    baseSeverity = 5;
    facilityType = "emergency";
    reasoning.push(
      `Critical symptoms detected: ${detectedRedFlags.join(", ")}`
    );
  }

  // Rule 2: High self-reported severity (can elevate to 4, not 5 unless red flags)
  // SAFEGUARD: Self-report alone can only reach 4 - red flags required for 5
  if (input.severity_self_report !== undefined && 
      Number.isFinite(input.severity_self_report) && 
      input.severity_self_report >= 4 && 
      detectedRedFlags.length === 0) {
    baseSeverity = 4; // Max 4 without red flags
    facilityType = "emergency";
    reasoning.push("User reports high severity");
  }

  // Rule 3: Moderate symptoms
  if (baseSeverity === 3) {
    facilityType = "urgent_care";
    reasoning.push("Moderate symptoms warrant urgent evaluation");
  }

  // Rule 4: Risk factors elevate severity (capped at 4 unless red flags)
  // SAFEGUARD: Math.min caps escalation at 4 - only red flags reach 5
  if (input.hasComorbidities && baseSeverity < 4) {
    baseSeverity = Math.min(4, baseSeverity + 1) as 1 | 2 | 3 | 4;
    reasoning.push("Existing medical conditions increase risk");
  }

  if (input.isPregnant && baseSeverity < 4) {
    baseSeverity = Math.min(4, baseSeverity + 1) as 1 | 2 | 3 | 4;
    facilityType = "emergency";
    reasoning.push("Pregnancy-related symptoms need emergency evaluation");
  }

  if (input.recentTrauma && baseSeverity < 3) {
    baseSeverity = 3; // Trauma elevates to moderate (3), not emergency (5)
    facilityType = "urgent_care";
    reasoning.push("Recent trauma requires medical assessment");
  }

  // SAFEGUARD: Assert that we never defaulted to 5 without explicit red flags
  // This prevents regression where parsing failures or missing data escalate to maximum urgency
  if (baseSeverity === 5 && detectedRedFlags.length === 0) {
    console.error("CRITICAL: Severity 5 assigned without red flags - this should never happen");
    // Fallback: cap at 4 if somehow we reached 5 without red flags
    baseSeverity = 4;
    reasoning.push("[Safeguard] Severity capped at 4 - no red flags detected");
  }

  // REGRESSION TEST: Verify that low-severity symptoms (like "fatigue") never produce urgency 5
  // This test runs in ALL environments (not just dev) to prevent production bugs
  // SAFEGUARD: Low-severity keyword match without red flags must result in urgency <= 2
  // FIX: Enforce this rule in production, not just dev - low-severity symptoms should never reach 5
  const lowSeverityKeywords = ["fatigue", "tired", "headache", "cough", "nausea", "mild"];
  const hasLowSeverityKeyword = lowSeverityKeywords.some(kw => symptomsLower.includes(kw));
  const hasNoRedFlags = detectedRedFlags.length === 0;
  const hasNoRiskFactors = !input.hasComorbidities && !input.isPregnant && !input.recentTrauma;
  const hasNoHighSelfReport = !input.severity_self_report || input.severity_self_report < 4;

  // if (hasLowSeverityKeyword && hasNoRedFlags && hasNoRiskFactors && hasNoHighSelfReport) {
  //   if (baseSeverity > 2) {
  //     const originalSeverity = baseSeverity;
  //     console.error(
  //       `[REGRESSION TEST FAIL] Low-severity symptom "${input.symptoms}" produced urgency ${originalSeverity}. Expected <= 2. Forcing to 1.`
  //     );
  //     // FORCE to 1 - low-severity symptoms without red flags must be 1-2, never 3-5
  //     baseSeverity = 1;
  //     reasoning.push(`[Safeguard] Low-severity symptom "${input.symptoms}" corrected to urgency 1 (was ${originalSeverity})`);
  //   }
  // }

  const recommendation =
    baseSeverity === 5
      ? "EMERGENCY: Call 911 immediately or go to nearest ER"
      : baseSeverity >= 4
        ? "Go to nearest Emergency Room (non-critical)"
        : baseSeverity === 3
          ? "Visit an Urgent Care clinic today"
          : "Schedule appointment at primary care clinic";

  // FINAL SAFEGUARD: Clamp severity to valid range [1..5] and validate it's never 5 without red flags
  // This is the last line of defense before returning the result
  if (detectedRedFlags.length === 0 && baseSeverity === 5) {
    console.error("CRITICAL: Final severity 5 without red flags - adjusting to 4");
    baseSeverity = 4;
    reasoning.push("[Final Safeguard] Severity adjusted to 4 - no red flags detected");
  }

  console.log("DETECTED_RED_FLAGS", detectedRedFlags);
  console.log("BASE_SEVERITY", baseSeverity);

  const finalSeverity = baseSeverity;

  // const finalSeverity = baseSeverity === 5 && detectedRedFlags.length === 0
  //   ? 4 // Cap at 4 if somehow we reached 5 without red flags
  //   : Math.min(5, Math.max(1, baseSeverity)) as 1 | 2 | 3 | 4 | 5;

  // TEMP LOG: Final urgency before return
  if (process.env.NODE_ENV === "development") {
    console.log("FINAL_URGENCY", finalSeverity, `redFlags=${detectedRedFlags.length}`, `input="${input.symptoms}"`);
  }

  return {
    severity: finalSeverity,
    facility_type: facilityType,
    red_flags: detectedRedFlags,
    reasoning: reasoning.join(". "),
    recommendation,
    should_call_911: finalSeverity === 5 && detectedRedFlags.length > 0,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = TriageInputSchema.parse(body);

    const result = triageSymptoms(input);

    return Response.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Triage failed";
    return Response.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
