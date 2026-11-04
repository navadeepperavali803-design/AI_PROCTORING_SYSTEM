import time
from typing import Dict, Any, Optional, List, Tuple

class IncidentState:
    def __init__(self, required_seconds: float, cooldown_seconds: float = 6.0):
        self.required_seconds = required_seconds
        self.cooldown_seconds = cooldown_seconds
        self.start_time: Optional[float] = None
        self.last_triggered_time: float = 0.0

    def update(self, condition_active: bool, now: float) -> Tuple[bool, float]:
        """
        Updates the temporal accumulator.
        Returns:
            (is_confirmed_incident: bool, duration_seconds: float)
        """
        if not condition_active:
            self.start_time = None
            return False, 0.0

        if self.start_time is None:
            self.start_time = now

        duration = now - self.start_time

        # Check if duration meets required threshold and cooldown expired
        if duration >= self.required_seconds:
            if (now - self.last_triggered_time) >= self.cooldown_seconds:
                self.last_triggered_time = now
                return True, round(duration, 1)

        return False, round(duration, 1)

class TemporalAnalyzer:
    """
    Temporal Hysteresis & Anti-Spam Smoothing Filter.
    Buffers model detections across a continuous sliding time window.
    Only confirms an infraction when an anomalous condition persists beyond threshold.
    """
    def __init__(
        self,
        look_away_threshold: float = 3.0,
        absence_threshold: float = 3.0,
        multiple_person_threshold: float = 1.5,
        phone_threshold: float = 1.0,
        cooldown: float = 6.0
    ):
        self.states = {
            "LOOKING_AWAY": IncidentState(look_away_threshold, cooldown),
            "ABSENCE": IncidentState(absence_threshold, cooldown),
            "MULTIPLE_PERSONS": IncidentState(multiple_person_threshold, cooldown),
            "PHONE_DETECTED": IncidentState(phone_threshold, cooldown),
        }

    def process(
        self,
        is_looking_away: bool,
        is_absent: bool,
        is_multiple_persons: bool,
        has_cell_phone: bool,
        timestamp: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Processes instantaneous detection flags and returns confirmed incidents that exceeded thresholds.
        """
        now = timestamp if timestamp is not None else time.time()
        confirmed_events = []

        conditions = {
            "LOOKING_AWAY": is_looking_away,
            "ABSENCE": is_absent,
            "MULTIPLE_PERSONS": is_multiple_persons,
            "PHONE_DETECTED": has_cell_phone,
        }

        for event_type, is_active in conditions.items():
            is_confirmed, duration = self.states[event_type].update(is_active, now)
            if is_confirmed:
                confirmed_events.append({
                    "event_type": event_type,
                    "duration_seconds": duration,
                    "timestamp": now,
                })

        return confirmed_events
