import cv2
import numpy as np
import pytest
from cv_engine.detectors.face_detector import FaceDetector
from cv_engine.detectors.head_pose import HeadPoseEstimator
from cv_engine.detectors.object_detector import ObjectDetector
from cv_engine.detectors.temporal_analyzer import TemporalAnalyzer
from cv_engine.pipeline import ProctoringPipeline

def test_face_detector_absence():
    detector = FaceDetector()
    blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    res = detector.detect(blank_frame)
    assert res["status"] == "ABSENT"
    assert res["face_count"] == 0

def test_head_pose_estimator():
    estimator = HeadPoseEstimator()
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    # Simulate face box at center
    res = estimator.estimate(frame, (200, 150, 240, 240))
    assert "yaw" in res
    assert "pitch" in res
    assert "roll" in res
    assert isinstance(res["yaw"], float)

def test_temporal_analyzer():
    analyzer = TemporalAnalyzer(look_away_threshold=1.0, cooldown=2.0)
    # Transient glance: 0.4s -> should NOT trigger
    res1 = analyzer.process(is_looking_away=True, is_absent=False, is_multiple_persons=False, has_cell_phone=False, timestamp=100.0)
    res2 = analyzer.process(is_looking_away=True, is_absent=False, is_multiple_persons=False, has_cell_phone=False, timestamp=100.4)
    res3 = analyzer.process(is_looking_away=False, is_absent=False, is_multiple_persons=False, has_cell_phone=False, timestamp=100.5)
    assert len(res1) == 0
    assert len(res2) == 0
    assert len(res3) == 0

    # Sustained looking away for 1.2s -> SHOULD trigger
    _ = analyzer.process(is_looking_away=True, is_absent=False, is_multiple_persons=False, has_cell_phone=False, timestamp=200.0)
    confirmed = analyzer.process(is_looking_away=True, is_absent=False, is_multiple_persons=False, has_cell_phone=False, timestamp=201.2)
    assert len(confirmed) == 1
    assert confirmed[0]["event_type"] == "LOOKING_AWAY"

def test_proctoring_pipeline_end_to_end(tmp_path):
    pipeline = ProctoringPipeline(
        snapshot_dir=str(tmp_path),
        temporal_absence=0.5
    )
    frame = np.zeros((480, 640, 3), dtype=np.uint8)

    # Frame 1: start absence
    out1 = pipeline.process_frame(frame, session_id="test_session", timestamp=10.0)
    assert out1["status"] in ("WARNING", "COMPLIANT")
    assert out1["face_count"] == 0

    # Frame 2: sustained absence after 0.6s -> trigger confirmed incident
    out2 = pipeline.process_frame(frame, session_id="test_session", timestamp=10.6)
    assert len(out2["confirmed_incidents"]) >= 1
    incident = out2["confirmed_incidents"][0]
    assert incident["event_type"] == "ABSENCE"
