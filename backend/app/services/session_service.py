from datetime import datetime, timezone
from typing import List, Optional, Dict
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.db.models import ExamSession, Exam, User, Question, StudentSubmission, ProctoringEvent
from app.schemas.session import SessionResponse, SessionDetailResponse

async def create_session(db: AsyncSession, exam_id: str, student_id: str) -> ExamSession:
    # Check exam existence
    exam_stmt = select(Exam).where(Exam.id == exam_id)
    exam_res = await db.execute(exam_stmt)
    exam = exam_res.scalar_one_or_none()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    session = ExamSession(
        exam_id=exam_id,
        student_id=student_id,
        start_time=datetime.now(timezone.utc),
        status="IN_PROGRESS",
        integrity_score=100.0,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

async def get_sessions(
    db: AsyncSession,
    student_id: Optional[str] = None,
    status_filter: Optional[str] = None
) -> List[dict]:
    stmt = (
        select(ExamSession)
        .options(
            selectinload(ExamSession.exam),
            selectinload(ExamSession.student),
            selectinload(ExamSession.events),
        )
        .order_by(ExamSession.start_time.desc())
    )
    if student_id:
        stmt = stmt.where(ExamSession.student_id == student_id)
    if status_filter and status_filter != "ALL":
        stmt = stmt.where(ExamSession.status == status_filter)

    result = await db.execute(stmt)
    sessions = result.scalars().all()

    output = []
    for s in sessions:
        pending_count = sum(1 for e in s.events if e.review_status == "PENDING")
        output.append({
            "id": s.id,
            "examId": s.exam_id,
            "examTitle": s.exam.title if s.exam else "Unknown Exam",
            "studentId": s.student_id,
            "studentName": s.student.full_name if s.student else "Student",
            "studentEmail": s.student.email if s.student else "",
            "studentAvatar": s.student.avatar_url if s.student and s.student.avatar_url else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "startTime": s.start_time.isoformat() if s.start_time else None,
            "endTime": s.end_time.isoformat() if s.end_time else None,
            "status": s.status,
            "integrityScore": s.integrity_score,
            "score": s.score,
            "totalEvents": len(s.events),
            "pendingEvents": pending_count,
            "cameraConnected": s.status == "IN_PROGRESS",
            "fps": 5.0 if s.status == "IN_PROGRESS" else 0.0,
            "currentStatus": "COMPLIANT" if s.integrity_score >= 80 else "SUSPICIOUS",
        })
    return output

async def get_session_by_id(db: AsyncSession, session_id: str) -> Optional[ExamSession]:
    stmt = (
        select(ExamSession)
        .where(ExamSession.id == session_id)
        .options(
            selectinload(ExamSession.exam),
            selectinload(ExamSession.student),
            selectinload(ExamSession.events),
            selectinload(ExamSession.submissions),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def submit_session(
    db: AsyncSession,
    session_id: str,
    answers: Dict[str, int]
) -> dict:
    session = await get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = "SUBMITTED"
    session.end_time = datetime.now(timezone.utc)

    # Score questions
    questions_stmt = select(Question).where(Question.exam_id == session.exam_id)
    q_result = await db.execute(questions_stmt)
    questions = q_result.scalars().all()

    total_points_earned = 0
    total_possible_points = sum(q.points for q in questions) if questions else 100

    for q in questions:
        selected = answers.get(q.id)
        is_correct = selected == q.correct_option if selected is not None else False
        if is_correct:
            total_points_earned += q.points

        sub = StudentSubmission(
            session_id=session.id,
            question_id=q.id,
            selected_option=selected,
            is_correct=is_correct,
            answered_at=datetime.now(timezone.utc),
        )
        db.add(sub)

    final_score = round((total_points_earned / max(1, total_possible_points)) * 100, 1)
    session.score = final_score
    await db.commit()
    await db.refresh(session)

    return {
        "success": True,
        "sessionId": session.id,
        "status": session.status,
        "score": session.score,
        "integrityScore": session.integrity_score,
        "submittedAt": session.end_time.isoformat(),
    }
