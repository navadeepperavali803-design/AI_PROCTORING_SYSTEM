from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.exam import ExamResponse
from app.schemas.auth import UserResponse

class SessionCreate(BaseModel):
    exam_id: str
    student_id: Optional[str] = None # If omitted, defaults to authenticated user

class SessionSubmitRequest(BaseModel):
    answers: Dict[str, int] # question_id -> selected_option_index

class SessionResponse(BaseModel):
    id: str
    exam_id: str
    student_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    integrity_score: float
    score: Optional[float] = None
    created_at: datetime

    # Additional computed properties
    exam_title: Optional[str] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_avatar: Optional[str] = None
    total_events: Optional[int] = 0
    pending_events: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class SessionDetailResponse(SessionResponse):
    exam: Optional[ExamResponse] = None
    student: Optional[UserResponse] = None
    events: List[dict] = []

    model_config = ConfigDict(from_attributes=True)
