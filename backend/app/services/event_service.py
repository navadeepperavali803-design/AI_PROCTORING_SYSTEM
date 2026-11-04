from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.db.models import ProctoringEvent, ExamSession
from app.schemas.event import EventCreate, EventUpdate, EventResponse

async def create_event(db: AsyncSession, event_in: EventCreate) -> ProctoringEvent:
    # Verify session
    session_stmt = select(ExamSession).where(ExamSession.id == event_in.session_id)
    session_res = await db.execute(session_stmt)
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found")

    event = ProctoringEvent(
        session_id=event_in.session_id,
        event_type=event_in.event_type,
        confidence=event_in.confidence,
        duration_seconds=event_in.duration_seconds,
        timestamp=datetime.now(timezone.utc),
        snapshot_path=event_in.snapshot_path,
        review_status="PENDING",
        event_metadata=event_in.event_metadata,
    )
    db.add(event)

    # Adjust session integrity score based on violation weight
    penalty = 4.0 if event_in.event_type == "LOOKING_AWAY" else 8.0
    session.integrity_score = max(10.0, round(session.integrity_score - penalty, 1))

    await db.commit()
    await db.refresh(event)
    return event

async def get_events(
    db: AsyncSession,
    session_id: Optional[str] = None,
    review_status: Optional[str] = None,
    event_type: Optional[str] = None
) -> List[dict]:
    stmt = (
        select(ProctoringEvent)
        .options(
            selectinload(ProctoringEvent.session).selectinload(ExamSession.student),
            selectinload(ProctoringEvent.session).selectinload(ExamSession.exam),
        )
        .order_by(ProctoringEvent.timestamp.desc())
    )

    if session_id:
        stmt = stmt.where(ProctoringEvent.session_id == session_id)
    if review_status and review_status != "ALL":
        stmt = stmt.where(ProctoringEvent.review_status == review_status)
    if event_type and event_type != "ALL":
        stmt = stmt.where(ProctoringEvent.event_type == event_type)

    result = await db.execute(stmt)
    events = result.scalars().all()

    output = []
    for e in events:
        s = e.session
        student = s.student if s else None
        exam = s.exam if s else None

        output.append({
            "id": e.id,
            "sessionId": e.session_id,
            "studentName": student.full_name if student else "Student",
            "studentAvatar": student.avatar_url if student and student.avatar_url else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "examTitle": exam.title if exam else "Online Exam",
            "eventType": e.event_type,
            "confidence": e.confidence,
            "durationSeconds": e.duration_seconds,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "snapshotUrl": e.snapshot_path or "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
            "reviewStatus": e.review_status,
            "adminNotes": e.admin_notes or "",
            "metadata": e.event_metadata or {},
        })
    return output

async def update_event_status(
    db: AsyncSession,
    event_id: str,
    event_update: EventUpdate
) -> ProctoringEvent:
    stmt = select(ProctoringEvent).where(ProctoringEvent.id == event_id)
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Proctoring event not found")

    event.review_status = event_update.review_status
    if event_update.admin_notes is not None:
        event.admin_notes = event_update.admin_notes

    await db.commit()
    await db.refresh(event)
    return event
