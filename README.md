# Health Care

## Microphone in Development

The microphone feature requires a **secure context** (HTTPS) to work in browsers. This affects development access via LAN IP addresses (e.g., `http://10.217.93.167:3000`).

### Solutions for Development:

1. **Use localhost (recommended for same-machine testing):**
   - Access the app at `http://localhost:3000`
   - This works as a secure context in modern browsers

2. **Enable HTTPS locally (for LAN testing):**
   - Install [mkcert](https://github.com/FiloSottile/mkcert)
   - Generate certificates: `mkcert -install` and `mkcert localhost 10.217.93.167`
   - Configure Next.js to use HTTPS (see Next.js docs for HTTPS setup)

3. **Browser error messages:**
   - If you see "Microphone not available" when using a LAN IP, the browser is blocking `getUserMedia()` due to insecure context
   - The app will show a helpful error message with these suggestions

### Production:
- Production should use HTTPS, which automatically provides a secure context

## Text-to-Speech (ElevenLabs)

The app uses ElevenLabs for Text-to-Speech (TTS) to provide audio playback of facility recommendations and other medical guidance.

### Environment Variables

Add the following to your `.env.local` file:

```env
# Required: ElevenLabs API key for TTS
ELEVENLABS_API_KEY=your_api_key_here

# Optional: Voice IDs (leave empty to use default fallbacks)
ELEVENLABS_VOICE_ID_EN_CALM=your_voice_id_here
ELEVENLABS_VOICE_ID_EN_NEUTRAL=your_voice_id_here
ELEVENLABS_VOICE_ID_FR_CALM=your_voice_id_here
ELEVENLABS_VOICE_ID_FR_NEUTRAL=your_voice_id_here
```

**Note:** Voice IDs are ElevenLabs voice identifiers. If not provided, the system will use fallback values. The minimum required configuration is `ELEVENLABS_API_KEY` for TTS to work.

### Payload Architecture

TTS uses a structured `SpeechPayload` system:

- **Type**: Determines the speech template (e.g., `recommendation_top`, `severity_summary`)
- **Locale**: Language (`en` or `fr`)
- **Voice**: Preset (`calm` or `neutral`)
- **Data**: Type-specific data (facility names, distances, urgency levels, etc.)

All speech output includes a disclaimer by default (unless type is `disclaimer_only`), ensuring safety messaging is always present.

### Features

- In-memory caching (15-minute TTL, 100-entry limit) to avoid regenerating identical audio
- Rate limiting (30 requests per 5 minutes per IP)
- Automatic disclaimer prepending for safety
- Support for multiple languages and voice presets
