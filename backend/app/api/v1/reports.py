from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.session_service import get_session_by_id
from app.services.event_service import get_events

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{session_id}")
async def get_session_report(session_id: str, db: AsyncSession = Depends(get_db)):
    session = await get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    events = await get_events(db, session_id=session_id)

    confirmed_count = sum(1 for e in events if e.get("reviewStatus") == "CONFIRMED")
    cleared_count = sum(1 for e in events if e.get("reviewStatus") == "CLEARED")
    pending_count = sum(1 for e in events if e.get("reviewStatus") == "PENDING")

    return {
        "sessionId": session.id,
        "examTitle": session.exam.title if session.exam else "Exam",
        "examCode": session.exam.code if session.exam else "",
        "studentName": session.student.full_name if session.student else "Student",
        "studentEmail": session.student.email if session.student else "",
        "studentId": session.student.student_id if session.student else "",
        "startTime": session.start_time.isoformat() if session.start_time else None,
        "endTime": session.end_time.isoformat() if session.end_time else None,
        "status": session.status,
        "integrityScore": session.integrity_score,
        "score": session.score,
        "eventMetrics": {
            "total": len(events),
            "confirmed": confirmed_count,
            "cleared": cleared_count,
            "pending": pending_count,
        },
        "events": events,
    }
