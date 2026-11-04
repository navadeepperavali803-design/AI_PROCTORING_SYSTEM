# AI-Powered Online Examination Proctoring System - Architecture Specification

## 1. System Overview

The **AI-Powered Online Exam Proctoring & Suspicious Behaviour Detection System** is an enterprise-grade EdTech solution engineered to uphold academic integrity during remote online assessments. The platform monitors examinees in real time via their webcam, executes non-intrusive computer vision inference to detect anomalous behavior, and aggregates flagged events with temporal context and confidence scores onto an administrative review dashboard.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph ClientLayer["Frontend Client (React + Vite + Tailwind CSS)"]
        UI_Auth["Authentication & Role Guard"]
        UI_Instructions["Exam Policy & Permissions (Webcam Consent)"]
        UI_Exam["Live Exam Interface & Question Flow"]
        UI_Webcam["Webcam Capture & Telemetry Streamer"]
        UI_Admin["Admin Dashboard & Live Monitor"]
        UI_Review["Event Reviewer & Report Exporter"]
    end

    subgraph Network["Transport Layer"]
        HTTP_REST["REST API (HTTP/JSON)"]
        WS_STREAM["WebSockets (Real-time Video Frames & Telemetry)"]
    end

    subgraph BackendLayer["Backend Server (FastAPI + Async Python)"]
        API_Auth["Auth & JWT Service"]
        API_Exams["Exam & Session Manager"]
        API_Events["Event Ingestion & Flagging Service"]
        API_Reports["PDF & Analytics Report Generator"]
        WS_Handler["WebSocket Connection Broker"]
    end

    subgraph CVLayer["Decoupled Computer Vision Engine (cv_engine)"]
        CV_Pipeline["Proctoring Orchestration Pipeline"]
        DET_Face["Face & Landmark Detector (MediaPipe)"]
        DET_Pose["Head Pose 3D Estimator (SolvePnP)"]
        DET_Obj["Object Detector (YOLOv8 - Phones/Books)"]
        DET_Temporal["Temporal State Machine & Anti-Spam Smoother"]
    end

    subgraph DataLayer["Storage & Persistence"]
        DB[(PostgreSQL / SQLite via SQLAlchemy 2.0)]
        FS_Snapshots["Storage: Violation Snapshots (JPEG)"]
        FS_Reports["Storage: Audit Reports (PDF)"]
    end

    %% Client to Network
    UI_Auth --> HTTP_REST
    UI_Exam --> HTTP_REST
    UI_Admin --> HTTP_REST
    UI_Webcam --> WS_STREAM

    %% Network to Backend
    HTTP_REST --> BackendLayer
    WS_STREAM --> WS_Handler

    %% Backend to CV Engine
    WS_Handler --> CV_Pipeline
    CV_Pipeline --> DET_Face
    CV_Pipeline --> DET_Pose
    CV_Pipeline --> DET_Obj
    CV_Pipeline --> DET_Temporal

    %% CV Engine to Backend/Storage
    DET_Temporal --"Flagged Incident"--> API_Events
    API_Events --> DB
    API_Events --> FS_Snapshots
    BackendLayer --> DB
    API_Reports --> FS_Reports
    API_Events --"Live Alert Push"--> WS_Handler
    WS_Handler --"Real-time Alerts"--> UI_Admin
```

---

## 3. Module Responsibilities & Directory Layout

### 3.1 Backend (`/backend/app`)
- **`app/core/`**: Central application settings (`config.py`), password hashing (`bcrypt`), and token lifecycle (`security.py`).
- **`app/db/`**: Database engine setup, declarative models, and schema migrations (`database.py`, `models.py`).
- **`app/schemas/`**: Strict Pydantic v2 schemas for request validation, response serialization, and type safety (`auth.py`, `exam.py`, `session.py`, `event.py`).
- **`app/api/v1/`**: Modular REST routes:
  - `auth.py`: Registration, login, JWT token issuance, user profile.
  - `exams.py`: CRUD operations for exams and question banks.
  - `sessions.py`: Student session initialization, status tracking, timekeeping, and completion.
  - `events.py`: Incident query APIs, review status transitions (`PENDING` -> `CONFIRMED` / `CLEARED`), notes.
  - `reports.py`: Comprehensive audit reports with session metrics and PDF exports.
  - `proctoring.py`: WebSocket endpoint for incoming video frame ingestion and outbound real-time alerts.
- **`app/services/`**: Encapsulated business logic separating route handlers from database and CV interactions.

### 3.2 Decoupled Computer Vision Engine (`/backend/cv_engine`)
The CV engine is completely decoupled from FastAPI to permit standalone unit testing, benchmark evaluation, or extraction into a Celery/Redis microservice.
- **`detectors/face_detector.py`**:
  - Detects examinee presence.
  - Flags **Person Absence** when face landmarks are missing.
  - Flags **Multiple Persons** when $N > 1$ faces appear in frame.
- **`detectors/head_pose.py`**:
  - Uses 468 MediaPipe 3D face mesh landmarks with OpenCV `solvePnP`.
  - Calculates continuous Euler angles: **Yaw** (horizontal), **Pitch** (vertical), **Roll** (tilt).
- **`detectors/object_detector.py`**:
  - Runs Ultralytics YOLOv8 nano/small on candidate frames.
  - Targets restricted items: `cell phone`, `laptop`, `book`.
- **`detectors/temporal_analyzer.py`**:
  - Implements **Hysteresis Thresholding & Sliding Window Counters**.
  - Prevents spurious alerts from brief eye blinks or single-frame model jitter.
  - An event is only committed if an anomaly persists across a defined duration window (e.g., $t \ge 3.0$ seconds).
- **`pipeline.py`**:
  - Receives raw frames, calls detectors, compiles telemetry metrics, and conditionally writes thumbnail snapshots when thresholds are exceeded.

### 3.3 Frontend Client (`/frontend/src`)
- **`components/common/`**: Reusable UI components (Navbar, Sidebar, Modal, Badge, StatCard, Button, Notification).
- **`components/exam/`**:
  - `WebcamMonitor`: Captures camera stream, renders status overlay, encodes frames for transmission.
  - `ExamTimer`: Synchronized countdown timer with warning alerts.
  - `QuestionCard`: Clean, distraction-free MCQ and open-question layout.
- **`components/dashboard/`**:
  - `MetricsOverview`: KPI cards (active sessions, violations, review queue).
  - `LiveProctorGrid`: Multi-student live video monitoring feeds.
  - `EventTimeline`: Chronological breakdown of infractions with confidence tags.
  - `IncidentDetailModal`: Reviewer workflow to inspect snapshot evidence and record verdict.
- **`pages/student/`**:
  - `StudentDashboard.jsx`: Enrolled exams, scheduled sessions, past scores.
  - `ExamInstructions.jsx`: Hardware checks (camera/mic test), explicit consent agreement.
  - `ExamRoom.jsx`: Full-screen secure test-taking environment.
- **`pages/admin/`**:
  - `AdminDashboard.jsx`: Global analytics, active exams, incident heatmaps.
  - `SessionReview.jsx`: Granular post-exam inspection and report download.
- **`context/`**: Global state for Auth, Live WebSocket Alerts, and Active Exam Session.

---

## 4. Database Schema (Entity-Relationship Model)

```mermaid
erDiagram
    USERS ||--o{ EXAM_SESSIONS : "undertakes"
    USERS ||--o{ EXAMS : "creates (admin)"
    EXAMS ||--o{ QUESTIONS : "contains"
    EXAMS ||--o{ EXAM_SESSIONS : "scheduled for"
    EXAM_SESSIONS ||--o{ PROCTORING_EVENTS : "records"
    EXAM_SESSIONS ||--o{ STUDENT_SUBMISSIONS : "submits"
    QUESTIONS ||--o{ STUDENT_SUBMISSIONS : "answers"

    USERS {
        uuid id PK
        string email UK
        string full_name
        string hashed_password
        string role "student | proctor | admin"
        datetime created_at
    }

    EXAMS {
        uuid id PK
        string title
        string description
        string code UK
        int duration_minutes
        int total_marks
        int passing_marks
        boolean is_active
        datetime created_at
    }

    QUESTIONS {
        uuid id PK
        uuid exam_id FK
        text question_text
        jsonb options
        int correct_option
        int points
    }

    EXAM_SESSIONS {
        uuid id PK
        uuid exam_id FK
        uuid student_id FK
        datetime start_time
        datetime end_time
        string status "SCHEDULED | IN_PROGRESS | SUBMITTED | TERMINATED"
        float integrity_score "100.0 - weighted penalties"
        datetime created_at
    }

    PROCTORING_EVENTS {
        uuid id PK
        uuid session_id FK
        string event_type "ABSENCE | MULTIPLE_PERSONS | LOOKING_AWAY | PHONE_DETECTED"
        float confidence "0.00 to 1.00"
        float duration_seconds
        string snapshot_path
        string review_status "PENDING | CONFIRMED | CLEARED"
        text admin_notes
        datetime timestamp
    }

    STUDENT_SUBMISSIONS {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        int selected_option
        boolean is_correct
        datetime answered_at
    }
```

---

## 5. Event Lifecycle & Temporal Filtering Flow

To eliminate false positives, the system implements a temporal filter:

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant WC as Frontend Webcam
    participant WS as WebSocket Endpoint
    participant CV as CV Pipeline
    participant TA as Temporal Analyzer
    participant DB as Database
    participant AD as Admin Dashboard

    S->>WC: Grant Camera Consent & Begin Exam
    loop Every 200ms (5 FPS)
        WC->>WS: Send Base64/Binary Video Frame
        WS->>CV: Forward Frame to Pipeline
        CV->>CV: Run MediaPipe Face + HeadPose + YOLO
        CV->>TA: Emit Raw Detection State (e.g. Yaw > 25°)
        alt Condition persists for < 3.0s (Normal glancing)
            TA->>TA: Increment Window Counter, No Alert
        else Condition persists >= 3.0s (Sustained Anomaly)
            TA->>CV: Trigger Verified Incident
            CV->>DB: Persist Event & Evidence Snapshot (JPEG)
            CV->>WS: Broadcast Live Alert Payload
            WS->>AD: Push Alert to Active Monitors
            AD->>AD: Update Real-time Incident Feed & Sound Badge
        end
    end
```

---

## 6. Privacy, Ethics & Security Principles

1. **Explicit Consent & Transparency**:
   - Students are prompted with a clear disclosure outlining what metrics are evaluated before camera activation.
   - Live visual indicator notifies the student that proctoring is active.

2. **Zero Continuous Video Archival (Data Minimization)**:
   - Full-length exam video streams are **not** saved on disk.
   - Only low-resolution episodic snapshot thumbnails associated with verified infractions ($t \ge 3.0$s) are retained for audit purposes.

3. **Human-in-the-Loop Verdicts**:
   - The AI engine does **not** auto-fail or terminate an examination.
   - Incidents are classified with status `PENDING` until a human proctor or academic administrator reviews the snapshot and either `CONFIRMS` or `CLEARS` the event.

4. **Defensible Confidence Scoring**:
   - Each infraction logs detector confidence (e.g., YOLO confidence 0.88, Head Yaw 38°), timestamp, and duration for objective review.
