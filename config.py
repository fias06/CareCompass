from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Google Places (direct) – optional if you want to skip Gumloop for POI search
    google_maps_api_key: str | None = None

    # ElevenLabs
    eleven_api_key: str | None = None
    eleven_voice_id: str | None = None
    eleven_base_url: str = "https://api.elevenlabs.io"

    # App
    cache_ttl_seconds: int = 60
    max_candidates: int = 20


settings = Settings()
