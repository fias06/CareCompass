// Rule-based triage system - no API calls needed
function analyzeSymptomsByRules(symptoms: string): { score: number; reason: string; facility: string } {
  const text = symptoms.toLowerCase().trim();
  
  // Emergency indicators (score 5) - MOST SEVERE
  const emergencyPatterns = [
    /chest pain/,
    /heart attack/,
    /stroke/,
    /seizure/,
    /unconscious/,
    /unresponsive/,
    /severe bleeding|bleeding heavily/,
    /loss of consciousness/,
    /can't breathe|cannot breathe/,
    /choking/,
    /poisoning/,
    /gunshot|stab|stabbing|gunshot wound/,
    /anaphylaxis|anaphylactic/
  ];
  
  for (let pattern of emergencyPatterns) {
    if (pattern.test(text)) {
      console.log("Matched emergency pattern:", pattern);
      return {
        score: 5,
        reason: "Life-threatening symptoms. Immediate 911 call recommended.",
        facility: "emergency"
      };
    }
  }
  
  // High urgency indicators (score 4)
  const highUrgencyPatterns = [
    /^severe (pain|headache)/,
    /severe headache/,
    /high fever|fever (10[3-9]|1[0-9]{2})/,
    /difficulty breathing|shortness of breath/,
    /acute abdominal pain/,
    /vomiting blood|blood in vomit/,
    /sudden weakness/,
    /sudden vision loss/,
    /severe allergic/
  ];
  
  for (let pattern of highUrgencyPatterns) {
    if (pattern.test(text)) {
      console.log("Matched high urgency pattern:", pattern);
      return {
        score: 4,
        reason: "Serious symptoms requiring emergency room evaluation.",
        facility: "emergency"
      };
    }
  }
  
  // Moderate urgency (score 3)
  const moderatePatterns = [
    /moderate pain/,
    /moderate headache/,
    /fever|elevated temperature|high temperature|101|102/,
    /persistent vomiting|vomiting/,
    /severe nausea|severe diarrhea/,
    /blood in stool|diarrhea/,
    /sprained|twisted ankle/,
    /moderate burn|significant cut|deep cut/,
    /joint pain|joint injury/,
    /unable to move arm|unable to move leg/
  ];
  
  for (let pattern of moderatePatterns) {
    if (pattern.test(text)) {
      console.log("Matched moderate pattern:", pattern);
      return {
        score: 3,
        reason: "Moderate symptoms. Urgent care visit recommended.",
        facility: "urgent_care"
      };
    }
  }
  
  // Low urgency indicators (score 2)
  const lowPatterns = [
    /mild pain|slight pain|little pain/,
    /mild headache|headache/,
    /cold|common cold/,
    /cough|sore throat/,
    /runny nose|stuffy nose/,
    /minor cut|minor wound|small cut/,
    /bruise|minor bruise/,
    /rash|itching|itch/,
    /mild nausea/,
    /sneezing|sniffle/
  ];
  
  for (let pattern of lowPatterns) {
    if (pattern.test(text)) {
      console.log("Matched low urgency pattern:", pattern);
      return {
        score: 2,
        reason: "Minor symptoms. Routine clinic visit recommended.",
        facility: "clinic"
      };
    }
  }
  
  // Very low urgency (score 1)
  const veryLowPatterns = [
    /no symptoms|feeling fine|just checking|preventive/,
    /wellness check|routine checkup|general checkup/,
    /vaccine|immunization|flu shot/,
    /prescription refill|medication refill/,
    /health screening|physical exam/
  ];
  
  for (let pattern of veryLowPatterns) {
    if (pattern.test(text)) {
      console.log("Matched very low urgency pattern:", pattern);
      return {
        score: 1,
        reason: "No urgent symptoms. Routine care appropriate.",
        facility: "clinic"
      };
    }
  }
  
  // If no patterns match, use symptom count
  console.log("No patterns matched. Using symptom count...");
  const symptomCount = (symptoms.match(/,/g) || []).length + 1;
  
  if (symptomCount >= 5) {
    return {
      score: 3,
      reason: "Multiple symptoms present. Urgent care evaluation recommended.",
      facility: "urgent_care"
    };
  }
  
  if (symptomCount >= 3) {
    return {
      score: 2,
      reason: "Several symptoms present. Clinic visit recommended.",
      facility: "clinic"
    };
  }
  
  // Default to score 2 for unknown symptoms
  return {
    score: 2,
    reason: "Assessment based on symptoms provided.",
    facility: "clinic"
  };
}

export async function POST(request: Request) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || symptoms.trim().length === 0) {
      return Response.json(
        { error: "No symptoms provided" },
        { status: 400 }
      );
    }

    console.log("Analyzing symptoms:", symptoms);

    // Use rule-based system (no API quota issues)
    const analysis = analyzeSymptomsByRules(symptoms);
    console.log("Analysis result:", analysis);

    return Response.json({
      score: analysis.score,
      reason: analysis.reason,
      recommendedFacility: analysis.facility,
      riskFactors: [],
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Failed to analyze symptoms", details: String(error) },
      { status: 500 }
    );
  }
}
