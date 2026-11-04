from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import create_event, get_events, update_event_status
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/events", tags=["Proctoring Events"])

@router.get("")
async def list_events(
    session_id: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    events = await get_events(
        db,
        session_id=session_id,
        review_status=review_status,
        event_type=event_type,
    )
    return events

@router.post("", status_code=status.HTTP_201_CREATED)
async def log_incident_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
):
    event = await create_event(db, event_in)
    return {
        "id": event.id,
        "sessionId": event.session_id,
        "eventType": event.event_type,
        "confidence": event.confidence,
        "durationSeconds": event.duration_seconds,
        "timestamp": event.timestamp.isoformat(),
        "reviewStatus": event.review_status,
    }

@router.patch("/{event_id}")
async def update_event_review(
    event_id: str,
    event_update: EventUpdate,
    db: AsyncSession = Depends(get_db),
):
    event = await update_event_status(db, event_id, event_update)
    return {
        "id": event.id,
        "reviewStatus": event.review_status,
        "adminNotes": event.admin_notes,
    }
