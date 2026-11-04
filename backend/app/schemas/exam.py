from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class QuestionBase(BaseModel):
    number: int
    question_text: str
    options: List[str]
    points: int = 10
    explanation: Optional[str] = None

class QuestionCreate(QuestionBase):
    correct_option: int

class QuestionResponse(QuestionBase):
    id: str
    exam_id: str
    # During exam student should not see correct option; for admin or review we can include it
    correct_option: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ExamBase(BaseModel):
    code: str
    title: str
    course: str
    description: str
    duration_minutes: int = 45
    total_marks: int = 100
    passing_marks: int = 60
    is_active: bool = True
    rules: Optional[List[str]] = None

class ExamCreate(ExamBase):
    questions: Optional[List[QuestionCreate]] = None

class ExamResponse(ExamBase):
    id: str
    created_at: datetime
    total_questions: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class ExamDetailResponse(ExamResponse):
    questions: List[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)
