import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import RecommendRequest, RecommendResponse, FacilityScore
from app.cache import TTLCache
from app.config import settings
from app.elevenlabs_client import ElevenLabsClient
from app.facility_provider import FacilityProvider
from app.scoring import predict_wait_seconds, explain

app = FastAPI(title="Montreal Care Router")

# Allow frontend (React) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = TTLCache(settings.cache_ttl_seconds)
tts = ElevenLabsClient()
facility_provider = FacilityProvider()


def _cache_key(req: RecommendRequest) -> str:
    lat = round(req.lat, 4)
    lng = round(req.lng, 4)
    return f"{lat}:{lng}:{req.severity}:{req.mode}:{req.radius_m}"


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    key = _cache_key(req)
    cached = cache.get(key)
    if cached and not req.include_tts:
        return cached

    # 1) Find facilities in parallel
    hospitals_task = facility_provider.nearby(
        req.lat, req.lng, req.radius_m, "hospital"
    )

    clinics_task = (
        facility_provider.nearby(req.lat, req.lng, req.radius_m, "clinic")
        if req.severity == "low"
        else asyncio.sleep(0, result=[])
    )

    hospitals, clinics = await asyncio.gather(hospitals_task, clinics_task)

    # Limit candidates for speed
    candidates = (hospitals + clinics)[:8]
    if not candidates:
        raise HTTPException(404, "No facilities found in radius")

    # 2) Travel times
    durations = await facility_provider.travel_times(
        req.lat, req.lng, candidates, req.mode
    )

    if not isinstance(durations, list) or len(durations) != len(candidates):
        raise HTTPException(500, "Travel time result mismatch")

    # 3) Score = travel + wait
    scored: list[FacilityScore] = []
    for f, travel_s in zip(candidates, durations):
        travel_s = int(travel_s)
        wait_s = int(predict_wait_seconds(f, req.severity))
        total = travel_s + wait_s
        scored.append(
            FacilityScore(
                facility=f,
                travel_seconds=travel_s,
                predicted_wait_seconds=wait_s,
                total_seconds=total,
                explanation=explain(f, travel_s, wait_s),
            )
        )

    scored.sort(key=lambda x: x.total_seconds)
    best = scored[0]
    alts = scored[1:6]

    mins = max(1, round(best.travel_seconds / 60))
    spoken = f"Closest facility is {mins} minutes at {best.facility.name}, {best.facility.address}."

    audio_b64 = None
    if req.include_tts:
        audio_b64 = await tts.tts_base64(spoken)

    resp = RecommendResponse(
        recommended=best,
        alternatives=alts,
        spoken_text=spoken,
        tts_audio_base64=audio_b64,
    )

    if not req.include_tts:
        cache.set(key, resp)

    return resp
