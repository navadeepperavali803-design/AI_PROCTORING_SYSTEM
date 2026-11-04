from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.session import SessionCreate, SessionSubmitRequest
from app.services.session_service import (
    create_session,
    get_sessions,
    get_session_by_id,
    submit_session,
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/sessions", tags=["Exam Sessions"])

@router.get("")
async def list_sessions(
    student_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    sessions = await get_sessions(db, student_id=student_id, status_filter=status)
    return sessions

@router.post("", status_code=status.HTTP_201_CREATED)
async def start_session(
    session_in: SessionCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    student_id = session_in.student_id or user.id
    session = await create_session(db, session_in.exam_id, student_id)
    return {
        "id": session.id,
        "examId": session.exam_id,
        "studentId": session.student_id,
        "startTime": session.start_time.isoformat(),
        "status": session.status,
        "integrityScore": session.integrity_score,
    }

@router.get("/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": session.id,
        "examId": session.exam_id,
        "examTitle": session.exam.title if session.exam else "Exam",
        "studentId": session.student_id,
        "studentName": session.student.full_name if session.student else "Student",
        "startTime": session.start_time.isoformat(),
        "endTime": session.end_time.isoformat() if session.end_time else None,
        "status": session.status,
        "integrityScore": session.integrity_score,
        "score": session.score,
        "eventsCount": len(session.events),
    }

@router.post("/{session_id}/submit")
async def submit_exam_session(
    session_id: str,
    submission_data: SessionSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await submit_session(db, session_id, submission_data.answers)
    return result
