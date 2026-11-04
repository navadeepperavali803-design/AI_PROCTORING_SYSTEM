import os
import cv2
import time
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from app.core.config import settings
from cv_engine.detectors.face_detector import FaceDetector
from cv_engine.detectors.head_pose import HeadPoseEstimator
from cv_engine.detectors.object_detector import ObjectDetector
from cv_engine.detectors.temporal_analyzer import TemporalAnalyzer

class ProctoringPipeline:
    """
    Unified Computer Vision Orchestration Pipeline.
    Processes live examination webcam frames through decoupled detector modules.
    """
    def __init__(
        self,
        snapshot_dir: Optional[str] = None,
        yaw_threshold: float = 25.0,
        pitch_threshold: float = 20.0,
        temporal_look_away: float = 3.0,
        temporal_absence: float = 3.0
    ):
        self.snapshot_dir = snapshot_dir or settings.SNAPSHOTS_DIR
        os.makedirs(self.snapshot_dir, exist_ok=True)

        # Initialize modular detectors
        self.face_detector = FaceDetector()
        self.head_pose_estimator = HeadPoseEstimator(
            yaw_threshold=yaw_threshold,
            pitch_threshold=pitch_threshold
        )
        self.object_detector = ObjectDetector()
        self.temporal_analyzer = TemporalAnalyzer(
            look_away_threshold=temporal_look_away,
            absence_threshold=temporal_absence,
        )

    def process_frame(
        self,
        frame: np.ndarray,
        session_id: str = "default",
        timestamp: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multi-modal inference on a single webcam frame.
        """
        now = timestamp if timestamp is not None else time.time()
        img_h, img_w = frame.shape[:2]

        # 1. Face Detection
        face_result = self.face_detector.detect(frame)
        face_count = face_result["face_count"]
        faces = face_result["faces"]
        is_absent = (face_count == 0)
        is_multiple = (face_count > 1)

        # 2. Head Pose Estimation
        primary_face = faces[0] if face_count >= 1 else None
        pose_result = self.head_pose_estimator.estimate(frame, primary_face)
        is_looking_away = pose_result["is_looking_away"] if not is_absent else False

        # 3. Object Detection (YOLOv8)
        obj_result = self.object_detector.detect(frame)
        has_cell_phone = obj_result["has_cell_phone"]
        has_prohibited = obj_result["has_prohibited_item"]
        detected_objects = obj_result["detected_objects"]

        # If YOLO detects secondary person with higher confidence
        if obj_result["person_count"] > 1 and not is_multiple:
            is_multiple = True

        # 4. Temporal Filtering & Hysteresis
        confirmed_incidents = self.temporal_analyzer.process(
            is_looking_away=is_looking_away,
            is_absent=is_absent,
            is_multiple_persons=is_multiple,
            has_cell_phone=has_cell_phone,
            timestamp=now
        )

        # 5. Snapshot Capture for Confirmed Incidents
        incident_records = []
        for incident in confirmed_incidents:
            event_type = incident["event_type"]
            duration = incident["duration_seconds"]

            # Choose confidence
            if event_type == "PHONE_DETECTED":
                conf = 0.92
            elif event_type == "ABSENCE":
                conf = 0.95
            elif event_type == "MULTIPLE_PERSONS":
                conf = 0.88
            else:
                conf = pose_result["confidence"]

            # Annotate evidence frame
            annotated_frame = frame.copy()
            self._annotate_evidence(annotated_frame, event_type, conf, pose_result, primary_face, detected_objects)

            # Save snapshot
            snap_filename = f"{session_id}_{event_type}_{int(now)}.jpg"
            snap_path = os.path.join(self.snapshot_dir, snap_filename)
            cv2.imwrite(snap_path, annotated_frame)

            snapshot_url = f"/storage/snapshots/{snap_filename}"

            incident_records.append({
                "session_id": session_id,
                "event_type": event_type,
                "confidence": round(float(conf), 2),
                "duration_seconds": duration,
                "snapshot_path": snapshot_url,
                "event_metadata": {
                    "yaw": pose_result["yaw"],
                    "pitch": pose_result["pitch"],
                    "gaze_direction": pose_result["gaze_direction"],
                    "face_count": face_count,
                    "objects": [o["label"] for o in detected_objects],
                }
            })

        # Overall frame status summary
        if has_cell_phone or is_multiple:
            overall_status = "VIOLATION"
        elif is_looking_away or is_absent:
            overall_status = "WARNING"
        else:
            overall_status = "COMPLIANT"

        return {
            "status": overall_status,
            "face_count": face_count,
            "primary_face_bbox": primary_face,
            "head_pose": {
                "yaw": pose_result["yaw"],
                "pitch": pose_result["pitch"],
                "roll": pose_result["roll"],
                "direction": pose_result["gaze_direction"],
                "is_looking_away": is_looking_away,
            },
            "detected_objects": detected_objects,
            "confirmed_incidents": incident_records,
            "timestamp": now,
        }

    def _annotate_evidence(
        self,
        frame: np.ndarray,
        event_type: str,
        confidence: float,
        pose: dict,
        face_bbox: Optional[list],
        objects: list
    ):
        """Draws visual audit markings directly on the evidence thumbnail."""
        h, w = frame.shape[:2]

        # Draw red/amber border
        color = (0, 0, 220) if event_type in ("PHONE_DETECTED", "MULTIPLE_PERSONS", "ABSENCE") else (0, 165, 255)
        cv2.rectangle(frame, (0, 0), (w-1, h-1), color, 4)

        # Draw banner at top
        cv2.rectangle(frame, (0, 0), (w, 40), (15, 23, 42), -1)
        banner_text = f"ProctorAI Alert: {event_type} | Conf: {int(confidence*100)}% | Yaw: {pose.get('yaw', 0)} deg"
        cv2.putText(frame, banner_text, (15, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Draw face bbox if present
        if face_bbox:
            fx, fy, fw, fh = face_bbox
            cv2.rectangle(frame, (fx, fy), (fx+fw, fy+fh), (0, 255, 0), 2)
            cv2.putText(frame, "Candidate", (fx, fy - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

        # Draw object bounding boxes
        for obj in objects:
            bx1, by1, bx2, by2 = obj["bbox"]
            cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 0, 255), 2)
            cv2.putText(frame, f"{obj['label']}: {int(obj['confidence']*100)}%", (bx1, by1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
