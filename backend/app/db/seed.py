import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import User, Exam, Question, ExamSession, ProctoringEvent
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

async def seed_database(db: AsyncSession) -> None:
    # Check if data already exists
    user_check = await db.execute(select(User).limit(1))
    if user_check.scalar_one_or_none():
        logger.info("Database already seeded. Skipping initial seed.")
        return

    logger.info("Seeding database with default users, exams, and questions...")

    # 1. Seed Users
    student = User(
        id="usr-student-001",
        email="sarah.chen@university.edu",
        full_name="Sarah Chen",
        student_id="STD-2024-8921",
        role="student",
        department="Computer Science & AI",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        hashed_password=get_password_hash("password123"),
    )
    db.add(student)

    admin = User(
        id="usr-admin-001",
        email="a.vance@university.edu",
        full_name="Dr. Arthur Vance",
        student_id=None,
        role="admin",
        department="Chief Proctor & Academic Registrar",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        hashed_password=get_password_hash("password123"),
    )
    db.add(admin)

    student2 = User(
        id="usr-student-002",
        email="m.reynolds@university.edu",
        full_name="Marcus Reynolds",
        student_id="STD-2024-5102",
        role="student",
        department="Computer Science & AI",
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        hashed_password=get_password_hash("password123"),
    )
    db.add(student2)

    await db.flush()

    # 2. Seed Exam
    exam = Exam(
        id="exam-cs-401",
        code="CS-401",
        title="Computer Vision & Deep Learning",
        course="Department of Advanced Computing",
        description="Comprehensive evaluation covering convolution operations, 3D coordinate transformation, object detection architectures (YOLO, Faster R-CNN), and facial landmark geometry.",
        duration_minutes=45,
        total_marks=100,
        passing_marks=60,
        is_active=True,
        rules=[
            "Active webcam connection is mandatory throughout the entire assessment duration.",
            "Head orientation must remain oriented towards the primary monitor.",
            "Only one student is permitted within the physical examination space.",
            "Mobile phones, secondary tablets, books, and unauthorized earphones are strictly prohibited.",
            "Brief natural glancing is permitted; persistent look-away events (>3s) are logged for proctor audit.",
            "All flagged events are reviewed by a human academic proctor before grading finalization.",
        ],
    )
    db.add(exam)
    await db.flush()

    # 3. Seed 10 Questions
    questions_data = [
        {
            "num": 1,
            "text": "Which OpenCV function is conventionally utilized to solve the Perspective-n-Point problem for estimating 3D head pose from 2D facial landmarks?",
            "options": ["cv2.findHomography()", "cv2.solvePnP()", "cv2.estimateAffine3D()", "cv2.getPerspectiveTransform()"],
            "correct": 1,
            "exp": "cv2.solvePnP computes an object's 3D rotation and translation vectors given matching 3D world model points and 2D image coordinates."
        },
        {
            "num": 2,
            "text": "In MediaPipe Face Mesh, how many 3D facial landmark coordinates are extracted in real time on mobile/CPU architectures?",
            "options": ["68 landmarks (classic Dlib model)", "128 landmarks", "468 landmarks (or 478 with refined irises)", "1024 landmarks"],
            "correct": 2,
            "exp": "MediaPipe Face Mesh predicts 468 3D landmarks in normalized coordinate space."
        },
        {
            "num": 3,
            "text": "What is the principal purpose of implementing a temporal hysteresis filter in an AI proctoring vision engine?",
            "options": ["To boost video compression bitrate over WebSockets", "To prevent false alarms caused by natural eye blinks and brief micro-gestures", "To encrypt student webcam frames for GDPR compliance", "To increase GPU inference batch sizes during exam peak hours"],
            "correct": 1,
            "exp": "Hysteresis requires a candidate violation condition to persist continuously across a sliding time window before confirming an incident."
        },
        {
            "num": 4,
            "text": "Which Euler angle describes the horizontal side-to-side turning rotation of the student's head (looking left or right)?",
            "options": ["Roll", "Pitch", "Yaw", "Azimuthal elevation"],
            "correct": 2,
            "exp": "Yaw represents horizontal panning rotation around the vertical Y/Z axis."
        },
        {
            "num": 5,
            "text": "When designing an ethical automated proctoring platform, what should happen when a high-confidence violation is detected?",
            "options": ["The exam should instantly terminate and automatically fail the candidate.", "The incident is logged with timestamp, duration, and thumbnail for human proctor review.", "The student webcam stream is streamed publicly to the student class roster.", "The candidate's computer hard drive is wiped immediately."],
            "correct": 1,
            "exp": "Responsible AI ethics dictate human-in-the-loop decisions: AI detects and flags evidence, while human proctors adjudicate misconduct."
        },
        {
            "num": 6,
            "text": "In the YOLO (You Only Look Once) architecture family, what distinguishes YOLOv8 from earlier anchor-based predecessors?",
            "options": ["It is completely anchor-free with decoupled head architecture", "It requires 4 separate cameras to infer depth", "It cannot detect mobile devices or electronic screens", "It only runs on quantum compute clusters"],
            "correct": 0,
            "exp": "YOLOv8 features an anchor-free design with independent decoupled prediction heads."
        },
        {
            "num": 7,
            "text": "What is the standard data minimization approach recommended for student video retention under privacy regulations like FERPA and GDPR?",
            "options": ["Permanently store all raw 1080p webcam video in unencrypted public cloud storage", "Delete full continuous video streams and retain only episodic incident snapshots for audited sessions", "Never use camera hardware under any circumstance", "Stream video directly to third-party ad networks"],
            "correct": 1,
            "exp": "Storing only discrete evidentiary snapshots of verified incidents drastically minimizes data footprint."
        },
        {
            "num": 8,
            "text": "Which loss function is predominantly applied in modern face verification and deep face embeddings to maximize inter-class distance?",
            "options": ["Binary Cross Entropy", "ArcFace (Additive Angular Margin Loss)", "Mean Squared Error", "Poisson Regression Loss"],
            "correct": 1,
            "exp": "ArcFace incorporates an additive angular margin penalty directly on the target angle."
        },
        {
            "num": 9,
            "text": "Why are WebSockets preferred over HTTP polling for proctoring telemetry in an online exam platform?",
            "options": ["WebSockets consume more server memory for every query", "WebSockets provide full-duplex, low-latency, bidirectional streaming without per-request HTTP header overhead", "WebSockets eliminate the need for computer vision models entirely", "WebSockets operate without requiring internet connectivity"],
            "correct": 1,
            "exp": "Persistent WebSocket connections allow bidirectional streaming with sub-50ms latency."
        },
        {
            "num": 10,
            "text": "If a student looks down at their scratch paper for 2 seconds to write an equation, how should a well-calibrated proctoring engine behave?",
            "options": ["Trigger an immediate high-priority cheating alert and revoke the student's session", "Track the movement internally but refrain from triggering a violation because duration is below the 3.0-second threshold", "Crash the browser window", "Re-initialize the student's examination timer back to zero"],
            "correct": 1,
            "exp": "Brief scratch-paper glancing is common test-taking behaviour; the temporal accumulator suppresses alerts under threshold."
        }
    ]

    for q in questions_data:
        question = Question(
            exam_id=exam.id,
            number=q["num"],
            question_text=q["text"],
            options=q["options"],
            correct_option=q["correct"],
            points=10,
            explanation=q["exp"],
        )
        db.add(question)

    await db.flush()

    # 4. Seed Sessions
    session1 = ExamSession(
        id="ses-101",
        exam_id=exam.id,
        student_id=student.id,
        start_time=datetime.now(timezone.utc) - timedelta(minutes=15),
        status="IN_PROGRESS",
        integrity_score=92.0,
    )
    db.add(session1)

    session2 = ExamSession(
        id="ses-102",
        exam_id=exam.id,
        student_id=student2.id,
        start_time=datetime.now(timezone.utc) - timedelta(minutes=25),
        status="IN_PROGRESS",
        integrity_score=68.0,
    )
    db.add(session2)

    await db.flush()

    # 5. Seed Events
    evt1 = ProctoringEvent(
        id="evt-001",
        session_id=session2.id,
        event_type="PHONE_DETECTED",
        confidence=0.91,
        duration_seconds=4.8,
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=8),
        snapshot_path="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
        review_status="PENDING",
        admin_notes="",
        event_metadata={"detector": "YOLOv8n", "class": "cell phone", "confidence": 0.914},
    )
    db.add(evt1)

    evt2 = ProctoringEvent(
        id="evt-002",
        session_id=session2.id,
        event_type="LOOKING_AWAY",
        confidence=0.87,
        duration_seconds=5.2,
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=14),
        snapshot_path="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        review_status="PENDING",
        admin_notes="",
        event_metadata={"yaw": 38.4, "pitch": 14.1, "threshold": 25.0},
    )
    db.add(evt2)

    evt3 = ProctoringEvent(
        id="evt-003",
        session_id=session1.id,
        event_type="LOOKING_AWAY",
        confidence=0.79,
        duration_seconds=3.4,
        timestamp=datetime.now(timezone.utc) - timedelta(minutes=5),
        snapshot_path="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        review_status="CLEARED",
        admin_notes="Reviewed: brief glance at desk notes. Verified compliant.",
        event_metadata={"yaw": -28.2, "pitch": -3.1, "threshold": 25.0},
    )
    db.add(evt3)

    await db.commit()
    logger.info("Database seeding complete!")
