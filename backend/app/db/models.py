import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    student_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="student", nullable=False) # student, proctor, admin
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    sessions: Mapped[List["ExamSession"]] = relationship("ExamSession", back_populates="student")

class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    course: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    total_marks: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    passing_marks: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rules: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    sessions: Mapped[List["ExamSession"]] = relationship("ExamSession", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    correct_option: Mapped[int] = mapped_column(Integer, nullable=False) # 0, 1, 2, 3
    points: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    exam: Mapped["Exam"] = relationship("Exam", back_populates="questions")

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="IN_PROGRESS", nullable=False) # SCHEDULED, IN_PROGRESS, SUBMITTED, TERMINATED
    integrity_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    exam: Mapped["Exam"] = relationship("Exam", back_populates="sessions")
    student: Mapped["User"] = relationship("User", back_populates="sessions")
    events: Mapped[List["ProctoringEvent"]] = relationship("ProctoringEvent", back_populates="session", cascade="all, delete-orphan")
    submissions: Mapped[List["StudentSubmission"]] = relationship("StudentSubmission", back_populates="session", cascade="all, delete-orphan")

class ProctoringEvent(Base):
    __tablename__ = "proctoring_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False) # LOOKING_AWAY, ABSENCE, MULTIPLE_PERSONS, PHONE_DETECTED
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    snapshot_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    review_status: Mapped[str] = mapped_column(String(32), default="PENDING", nullable=False) # PENDING, CONFIRMED, CLEARED
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    event_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    session: Mapped["ExamSession"] = relationship("ExamSession", back_populates="events")

class StudentSubmission(Base):
    __tablename__ = "student_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_sessions.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[str] = mapped_column(String(36), ForeignKey("questions.id"), nullable=False)
    selected_option: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    answered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    session: Mapped["ExamSession"] = relationship("ExamSession", back_populates="submissions")
