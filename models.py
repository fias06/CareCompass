from typing import List, Optional
from pydantic import BaseModel


class Facility(BaseModel):
    name: str
    address: str
    lat: float
    lng: float
    kind: str  # "hospital" or "clinic"
    phone: Optional[str] = None


class FacilityScore(BaseModel):
    facility: Facility
    travel_seconds: int
    predicted_wait_seconds: int
    total_seconds: int
    explanation: str


class RecommendRequest(BaseModel):
    lat: float
    lng: float
    severity: str  # "low", "medium", "high"
    mode: str      # "driving", "walking", "transit"
    radius_m: int
    include_tts: bool = False


class RecommendResponse(BaseModel):
    recommended: FacilityScore
    alternatives: List[FacilityScore]
    spoken_text: str
    tts_audio_base64: Optional[str] = None
