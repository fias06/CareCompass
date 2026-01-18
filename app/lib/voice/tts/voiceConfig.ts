import type { Locale, VoicePreset } from "../types";

type VoiceKey = `${Locale}_${VoicePreset}`;

function getEnvVarName(locale: Locale, voicePreset: VoicePreset): string {
  return `ELEVENLABS_VOICE_ID_${locale.toUpperCase()}_${voicePreset.toUpperCase()}`;
}

export function getVoiceId(locale: Locale = "en", voicePreset: VoicePreset = "calm"): string {
  const envVarName = getEnvVarName(locale, voicePreset);
  const voiceId = process.env[envVarName];

  if (!voiceId || voiceId.trim() === "") {
    throw new Error(
      `Missing ${envVarName} environment variable. Voice IDs must be provided via environment variables.`
    );
  }

  return voiceId.trim();
}

export function validateVoiceConfig(): void {
  const required: Array<{ locale: Locale; voicePreset: VoicePreset }> = [
    { locale: "en", voicePreset: "calm" },
  ];

  for (const { locale, voicePreset } of required) {
    const envVarName = getEnvVarName(locale, voicePreset);
    const voiceId = process.env[envVarName];

    if (!voiceId || voiceId.trim() === "") {
      throw new Error(`Missing ${envVarName} environment variable. Voice IDs must be provided via environment variables.`);
    }
  }
}
