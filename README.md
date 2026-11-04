# 🎓 AI-Powered Online Examination Proctoring & Suspicious Behaviour Detection System

An enterprise-grade EdTech examination proctoring platform powered by Computer Vision and Deep Learning. The platform continuously monitors examination sessions through the student's webcam, evaluates multi-modal behavioural cues (3D head pose, face presence/absence, multiple individuals, and prohibited objects like cell phones), applies temporal anti-spam hysteresis smoothing, and provides administrators with a real-time monitoring and event review dashboard.

---

## 🌟 Key Features

### 1. Student Examination Interface
- **Secure Authentication & Onboarding**: Institutional student/admin authentication with one-click demo login buttons.
- **Hardware & Device Check**: Real-time webcam alignment and permission check (`navigator.mediaDevices.getUserMedia`).
- **Ethical Privacy & Monitoring Consent**: Explicit consent disclosure ensuring candidates understand client-side analysis and the zero continuous video storage policy.
- **Distraction-Free Exam Interface**: MCQ question interface with "Mark for Review", timer countdown, and navigation palette.
- **Real-Time Proctor Feed (`WebcamMonitor`)**: Displays live camera preview, real-time Yaw/Pitch/Roll 3D head pose angles, FPS ingestion rate, and proctoring status overlay.

### 2. Decoupled Computer Vision Engine (`cv_engine`)
- **Face Presence & Absence Detection**: Flags candidates leaving the camera frame using OpenCV cascade/DNN models.
- **Multiple Person Detection**: Detects unauthorized secondary individuals entering the physical examination space.
- **3D Head Pose Estimation**: Estimates continuous **Yaw** (horizontal), **Pitch** (vertical), and **Roll** Euler angles via 3D facial geometry and OpenCV Perspective-n-Point (`solvePnP`).
- **Looking-Away Event Detection**: Flags sustained lateral or vertical gaze deviations exceeding calibrated angular thresholds ($|\text{Yaw}| > 25^\circ$, $|\text{Pitch}| > 20^\circ$).
- **Restricted Object Detection**: Real-time identification of prohibited items (`cell phone`, `laptop`, `book`) using **Ultralytics YOLOv8**.
- **Temporal Anti-Spam State Machine**: Sliding-window hysteresis filter requiring anomalous conditions to persist $\ge 3.0$ seconds before confirming an incident, preventing false alarms from brief blinks or natural glances.

### 3. Suspicious Event & Evidence Management
- **Structured Violation Logging**: Categorized events (`LOOKING_AWAY`, `ABSENCE`, `MULTIPLE_PERSONS`, `PHONE_DETECTED`) with timestamps, durations, and confidence scores.
- **Episodic Evidence Snapshots**: High-resolution annotated evidence thumbnails captured exclusively on confirmed violations.
- **Human-in-the-Loop Review**: Academic proctors review snapshots and mark status as `CONFIRMED MISCONDUCT` or `CLEARED (FALSE ALARM)`.
- **Integrity Score Index**: Dynamic compliance index dynamically adjusted upon confirmed infractions.

### 4. Administrator Operations Dashboard
- **Key Metrics Overview**: Total exam sessions, active live examinations, flagged infractions, pending reviews, and average integrity score index.
- **Live Proctor Surveillance Grid**: Real-time multi-camera cards showing live student video, head pose telemetry, and compliance tags.
- **Analytics Visualizations**: Interactive Recharts charts (AreaChart incident frequency timeline, PieChart violation category distribution).
- **Incident Review Modal**: Evidence snapshot inspection with detector bounding boxes, confidence score, and proctor audit notes input.
- **Official Audit Reports**: Printable, formal examination session transcript with candidate details, session duration, event breakdown, and official proctor signature block.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, WebSockets, Pydantic v2 |
| **Database & ORM** | PostgreSQL (Production) / SQLite + aiosqlite (Local Dev), SQLAlchemy 2.0, Alembic |
| **Computer Vision** | OpenCV 4.11, Ultralytics YOLOv8, NumPy, solvePnP 3D Euler angles |
| **Security & Auth**| Direct Bcrypt (`bcrypt.hashpw`), JWT (JSON Web Tokens), OAuth2 Bearer |
| **Testing** | Pytest, pytest-asyncio, HTTPX, Vite build compiler |

---

## 📂 Project Architecture & Directory Layout

```
AI_Proctoring_System/
├── backend/
│   ├── alembic/                # Database migration scripts & version tracking
│   │   ├── versions/           # Schema migration revisions
│   │   └── env.py              # Async migration runner
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/             # REST endpoints (auth, exams, sessions, events, reports, ws)
│   │   │       ├── auth.py
│   │   │       ├── exams.py
│   │   │       ├── sessions.py
│   │   │       ├── events.py
│   │   │       ├── reports.py
│   │   │       └── proctoring.py # WebSocket telemetry & alert broker
│   │   ├── core/               # Configuration, security & JWT token lifecycle
│   │   ├── db/                 # Database engine & SQLAlchemy 2.0 declarative models
│   │   ├── schemas/            # Pydantic v2 schemas for validation & serialization
│   │   ├── services/           # Encapsulated business logic layer
│   │   └── main.py             # FastAPI entrypoint & router assembly
│   ├── cv_engine/              # Decoupled Computer Vision Engine
│   │   ├── detectors/          # Modular detector components
│   │   │   ├── face_detector.py      # Face presence & absence detector
│   │   │   ├── head_pose.py          # 3D Head pose estimator (solvePnP Euler angles)
│   │   │   ├── object_detector.py    # YOLOv8 cell phone & prohibited device detector
│   │   │   └── temporal_analyzer.py  # Hysteresis anti-spam temporal state machine
│   │   ├── models/             # Weights directory (YOLOv8n.pt)
│   │   ├── utils/              # Visualization & annotation utilities
│   │   └── pipeline.py         # Unified CV proctoring pipeline orchestrator
│   ├── storage/
│   │   ├── snapshots/          # Evidence thumbnails for confirmed incidents
│   │   └── reports/            # Generated session audit PDF files
│   ├── tests/                  # Automated pytest test suite
│   │   ├── conftest.py         # Database fixtures & HTTPX test client
│   │   ├── test_api.py         # API, Auth, Sessions, Events & WebSocket tests
│   │   └── test_cv_engine.py   # Computer Vision unit & integration tests
│   ├── requirements.txt        # Backend dependencies
│   ├── alembic.ini             # Alembic configuration
│   ├── pytest.ini              # Pytest configuration
│   ├── .env.example            # Environment variable template
│   └── .env                    # Active local environment configuration
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Brand and icon assets
│   │   ├── components/
│   │   │   ├── common/         # Badge, StatCard, Navbar, Sidebar, Modal
│   │   │   ├── exam/           # WebcamMonitor, ExamTimer, QuestionCard, PrivacyBanner
│   │   │   └── dashboard/      # MetricsOverview, LiveProctorGrid, AnalyticsCharts, EventTimeline
│   │   ├── context/            # AuthContext, ExamContext, AdminContext
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage with 1-click student/admin demo
│   │   │   ├── student/        # StudentPortal, ExamInstructions, ExamRoom, ExamResult
│   │   │   └── admin/          # AdminDashboard, LiveMonitorPage, SessionReview
│   │   ├── services/           # Axios API client & WebSocket connections
│   │   ├── types/              # Enums and event configurations
│   │   ├── App.jsx             # Route definitions & layout wrapping
│   │   ├── index.css           # Tailwind CSS directives & dark scrollbars
│   │   └── main.jsx            # React root mount
│   ├── package.json            # Frontend dependencies & scripts
│   ├── tailwind.config.js      # Custom dark navy theme configuration
│   └── vite.config.js          # Vite build & reverse-proxy settings
├── docs/
│   ├── architecture.md         # Full system architectural specification & diagrams
│   └── cv_pipeline_specification.md # CV algorithms, 3D math & temporal state machine
├── README.md                   # Complete documentation
└── .gitignore                  # Git exclusions for models, weights, logs & secrets
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- **Python**: 3.10 or 3.12 (`py --version`)
- **Node.js**: v20+ and npm v10+ (`node -v`, `npm -v`)
- **Webcam**: Standard USB or integrated laptop webcam

---

### 2. Backend Setup & Startup

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# 3. (Optional) Run database migrations if modifying schema
alembic upgrade head

# 4. Start the FastAPI ASGI server with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

### 3. Frontend Setup & Startup

```powershell
# 1. In a separate terminal, navigate to frontend directory
cd frontend

# 2. Start the Vite development server
npm run dev
```
- Frontend Application URL: `http://localhost:5173`

---

### 4. Running Automated Tests

To run the complete backend, API, WebSocket, and Computer Vision test suite:
```powershell
cd backend
.\venv\Scripts\pytest.exe -v
```
All **11 tests** across authentication, session lifecycle, WebSocket telemetry, head pose estimation, absence detection, and temporal filtering will execute:
```
tests/test_api.py::test_root_and_health PASSED
tests/test_api.py::test_auth_login_and_me PASSED
tests/test_api.py::test_auth_registration PASSED
tests/test_api.py::test_list_exams PASSED
tests/test_api.py::test_get_exam_questions PASSED
tests/test_api.py::test_session_lifecycle_and_grading PASSED
tests/test_api.py::test_websocket_proctoring_telemetry PASSED
tests/test_cv_engine.py::test_face_detector_absence PASSED
tests/test_cv_engine.py::test_head_pose_estimator PASSED
tests/test_cv_engine.py::test_temporal_analyzer PASSED
tests/test_cv_engine.py::test_proctoring_pipeline_end_to_end PASSED
```

To run the frontend production build test:
```powershell
cd frontend
npm run build
```

---

## 🧪 Testing the Complete Examination Flow

1. Open **`http://localhost:5173`** in your browser.
2. Click **"Student Demo"** on the login page (or enter `sarah.chen@university.edu` / `password123`).
3. On the Candidate Workspace, review the system readiness checklist and click **"Begin Verification"** on the `CS-401` examination.
4. On the Instructions page, verify your camera preview, check the **Academic Integrity & Ethical Monitoring Consent** agreement box, and click **"Enter Examination Room"**.
5. Inside the live exam room:
   - Your webcam streams real-time frames over WebSockets.
   - The Computer Vision engine extracts 3D Euler angles (`Yaw`, `Pitch`, `Roll`) and scans for cell phones.
   - If you turn your head sideways for $>3.0$ seconds, the temporal filter flags a verified incident.
   - Select answers, navigate questions using the palette, and click **"Submit Exam"**.
6. Switch role to **Admin** via the top navigation bar to open the **Proctoring Operations Dashboard**:
   - Inspect active live camera feeds in the **Live Proctor Grid**.
   - Review incoming incidents in the **Suspicious Event Log**.
   - Click **"Audit Incident"** to view the snapshot evidence, write notes, and click **"Confirm Misconduct"** or **"Clear as False Alarm"**.
   - Click **"View Official Report"** to inspect and print the official examination integrity audit transcript.

---

## 🔒 Security, Privacy & Ethics Standards
1. **Explicit Camera Consent**: Students must provide affirmative consent before camera activation.
2. **Data Minimization (GDPR/FERPA Compliant)**: Full-length continuous video streams are **never stored** on disk. Only episodic evidence thumbnails associated with verified infractions ($\ge 3.0$s) are saved.
3. **Anti-Spam Temporal Hysteresis**: Prevents false alarms from natural eye blinks, reading scratch paper, or sensor noise.
4. **Human-in-the-Loop Adjudication**: Model predictions never auto-fail or disqualify candidates. All flagged events are queued as `PENDING` for human review.
#   A I _ P R O C T O R I N G _ S Y S T E M  
 