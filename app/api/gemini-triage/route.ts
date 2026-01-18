import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface TriageResponse {
  score: number;
  reason: string;
  facility: 'emergency' | 'urgent_care' | 'clinic';
  redFlags: string[];
  shouldCall911: boolean;
}

const TRIAGE_PROMPT = `You are a medical triage assistant. Analyze the following symptoms and provide a triage assessment.

IMPORTANT RULES:
1. Score from 1-5 where:
   - 1 = Non-urgent (routine check-up, minor issues)
   - 2 = Low urgency (minor symptoms, can wait)
   - 3 = Moderate (needs attention within 24 hours)
   - 4 = High urgency (needs emergency room, but stable)
   - 5 = CRITICAL (life-threatening, call 911 immediately)

2. Be conservative - when in doubt, score higher for safety
3. Look for red flags: chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke symptoms (FAST), severe allergic reactions
4. Consider symptom combinations that indicate serious conditions

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "score": <number 1-5>,
  "reason": "<brief explanation>",
  "facility": "<emergency|urgent_care|clinic>",
  "redFlags": ["<list of any red flags detected>"],
  "shouldCall911": <true|false>
}

Patient symptoms: `;

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || symptoms.trim().length === 0) {
      return NextResponse.json(
        { error: 'No symptoms provided' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'Triage service not configured' },
        { status: 500 }
      );
    }

    console.log('Gemini triage - analyzing symptoms:', symptoms);

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(TRIAGE_PROMPT + symptoms);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini raw response:', text);

    // Parse the JSON response
    let triageResult: TriageResponse;
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      triageResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text, parseError);
      return NextResponse.json(
        { error: 'Failed to parse triage response' },
        { status: 500 }
      );
    }

    // Validate and sanitize the response
    const score = Math.min(5, Math.max(1, Math.round(triageResult.score || 1)));
    const facility = ['emergency', 'urgent_care', 'clinic'].includes(triageResult.facility) 
      ? triageResult.facility 
      : score >= 4 ? 'emergency' : score === 3 ? 'urgent_care' : 'clinic';

    const sanitizedResult = {
      score,
      reason: triageResult.reason || 'Assessment based on symptoms provided.',
      facility,
      redFlags: Array.isArray(triageResult.redFlags) ? triageResult.redFlags : [],
      shouldCall911: triageResult.shouldCall911 === true || score === 5,
    };

    console.log('Gemini triage result:', sanitizedResult);

    return NextResponse.json(sanitizedResult);
  } catch (error) {
    console.error('Gemini triage error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
