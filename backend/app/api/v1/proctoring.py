import json
import base64
import time
import logging
import cv2
import numpy as np
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.db.models import ProctoringEvent, ExamSession
from app.services.event_service import create_event
from app.schemas.event import EventCreate
from cv_engine.pipeline import ProctoringPipeline

logger = logging.getLogger("proctoring_ws")

router = APIRouter(tags=["Proctoring Real-time Stream"])

# Global WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # session_id -> Set[WebSocket] (student stream)
        self.active_students: Dict[str, WebSocket] = {}
        # Set of admin websockets listening for global alerts
        self.admin_listeners: Set[WebSocket] = set()

    async def connect_student(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_students[session_id] = websocket
        logger.info(f"Student WebSocket connected for session: {session_id}")

    def disconnect_student(self, session_id: str):
        if session_id in self.active_students:
            del self.active_students[session_id]
            logger.info(f"Student WebSocket disconnected: {session_id}")

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_listeners.add(websocket)
        logger.info("Admin listener connected to real-time alerts.")

    def disconnect_admin(self, websocket: WebSocket):
        self.admin_listeners.discard(websocket)

    async def broadcast_alert(self, alert_payload: dict):
        """Pushes real-time alerts to all active proctors and admins."""
        dead_sockets = set()
        for ws in self.admin_listeners:
            try:
                await ws.send_text(json.dumps(alert_payload))
            except Exception:
                dead_sockets.add(ws)
        self.admin_listeners.difference_update(dead_sockets)

manager = ConnectionManager()

# Pipeline singleton for inference
pipeline = ProctoringPipeline()

@router.websocket("/ws/proctor/{session_id}")
async def websocket_student_proctor(websocket: WebSocket, session_id: str):
    await manager.connect_student(session_id, websocket)

    last_fps_time = time.time()
    frame_count = 0

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
            except Exception:
                continue

            msg_type = msg.get("type", "frame")

            if msg_type == "frame":
                base64_image = msg.get("image", "")
                if not base64_image:
                    continue

                # Strip data URL prefix if present
                if "," in base64_image:
                    base64_image = base64_image.split(",")[1]

                # Decode frame
                img_bytes = base64.b64decode(base64_image)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # Run Computer Vision inference
                result = pipeline.process_frame(frame, session_id=session_id)

                # If confirmed incidents were triggered, persist to DB and push to Admins
                if result.get("confirmed_incidents"):
                    async with AsyncSessionLocal() as db:
                        for inc in result["confirmed_incidents"]:
                            try:
                                evt_in = EventCreate(
                                    session_id=session_id,
                                    event_type=inc["event_type"],
                                    confidence=inc["confidence"],
                                    duration_seconds=inc["duration_seconds"],
                                    snapshot_path=inc["snapshot_path"],
                                    event_metadata=inc.get("event_metadata"),
                                )
                                saved_evt = await create_event(db, evt_in)

                                # Broadcast alert to admin monitoring dashboard
                                alert_message = {
                                    "type": "INCIDENT_ALERT",
                                    "sessionId": session_id,
                                    "eventId": saved_evt.id,
                                    "eventType": inc["event_type"],
                                    "confidence": inc["confidence"],
                                    "duration": inc["duration_seconds"],
                                    "snapshotUrl": inc["snapshot_path"],
                                    "timestamp": datetime.now(timezone.utc).isoformat(),
                                }
                                await manager.broadcast_alert(alert_message)
                            except Exception as e:
                                logger.error(f"Error persisting incident: {e}")

                # Send real-time telemetry back to student
                frame_count += 1
                now = time.time()
                fps = round(frame_count / max(0.1, now - last_fps_time), 1)
                if now - last_fps_time >= 5.0:
                    last_fps_time = now
                    frame_count = 0

                telemetry = {
                    "type": "telemetry",
                    "status": result["status"],
                    "face_count": result["face_count"],
                    "head_pose": result["head_pose"],
                    "detected_objects": result["detected_objects"],
                    "new_incidents": len(result.get("confirmed_incidents", [])),
                    "fps": fps,
                }
                await websocket.send_text(json.dumps(telemetry))

            elif msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "time": time.time()}))

    except WebSocketDisconnect:
        manager.disconnect_student(session_id)
    except Exception as e:
        logger.error(f"WebSocket error on session {session_id}: {e}")
        manager.disconnect_student(session_id)

@router.websocket("/ws/admin/alerts")
async def websocket_admin_alerts(websocket: WebSocket):
    await manager.connect_admin(websocket)
    try:
        while True:
            # Keep alive
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
    except Exception:
        manager.disconnect_admin(websocket)
