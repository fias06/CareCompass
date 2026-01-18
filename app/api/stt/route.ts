import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const languageCode = (formData.get('language_code') as string) || 'eng';

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'Missing file field' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type (audio files)
    const allowedTypes = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a'];
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
      // More lenient check - if no type, we'll still try to send it
      if (file.type && !file.type.startsWith('audio/')) {
        return NextResponse.json(
          { error: 'Invalid file type. Expected audio file.' },
          { status: 400 }
        );
      }
    }

    // Get API key from environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return NextResponse.json(
        { error: 'Speech-to-text service not configured' },
        { status: 500 }
      );
    }

    // Prepare form data for ElevenLabs
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('file', file);
    elevenLabsFormData.append('model_id', 'scribe_v2');
    if (languageCode) {
      elevenLabsFormData.append('language_code', languageCode);
    }

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch(`${ELEVENLABS_API_BASE}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `ElevenLabs API error: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail?.message || errorJson.message || errorMessage;
      } catch {
        // Use default error message
      }
      
      console.error('ElevenLabs STT error:', response.status, errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Extract text from response (format may vary, but typically { text: string })
    const text = result.text || result.transcription || '';
    
    if (!text) {
      return NextResponse.json(
        { error: 'No transcription returned from API' },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('STT route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
