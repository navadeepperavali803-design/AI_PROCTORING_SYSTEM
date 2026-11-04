from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class EventBase(BaseModel):
    session_id: str
    event_type: str
    confidence: float
    duration_seconds: float = 0.0
    snapshot_path: Optional[str] = None
    event_metadata: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    review_status: str # PENDING, CONFIRMED, CLEARED
    admin_notes: Optional[str] = None

class EventResponse(EventBase):
    id: str
    timestamp: datetime
    review_status: str
    admin_notes: Optional[str] = None
    student_name: Optional[str] = None
    student_avatar: Optional[str] = None
    exam_title: Optional[str] = None
    snapshot_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
