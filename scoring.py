from app.models import Facility


def predict_wait_seconds(f: Facility, severity: str) -> int:
    """
    Placeholder wait-time model.
    Replace with:
      - hospital-specific feeds / Quebec datasets
      - ML model
      - historical averages by hour/day
    """
    # Heuristic: hospitals longer waits than clinics for low severity
    if f.kind == "clinic":
        base = 20 * 60
    else:
        base = 60 * 60

    if severity == "high":
        # triage tends to prioritize, but still time-consuming
        return max(15 * 60, base // 2)
    if severity == "low":
        return base
    return int(base * 0.75)


def explain(f: Facility, travel_s: int, wait_s: int) -> str:
    mins = lambda s: max(1, round(s / 60))
    return f"Travel ~{mins(travel_s)} min + estimated wait ~{mins(wait_s)} min."
