import { EVENT_TYPES, REVIEW_STATUS, SESSION_STATUS } from '../types';

export const MOCK_USERS = {
  student: {
    id: 'usr-student-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    studentId: 'STD-2024-8921',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & AI',
  },
  admin: {
    id: 'usr-admin-001',
    name: 'Dr. Arthur Vance',
    email: 'a.vance@university.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Chief Proctor & Academic Registrar',
  },
};

export const MOCK_EXAMS = [
  {
    id: 'exam-cs-401',
    code: 'CS-401',
    title: 'Computer Vision & Deep Learning',
    course: 'Department of Advanced Computing',
    description: 'Comprehensive evaluation covering convolution operations, 3D coordinate transformation, object detection architectures (YOLO, Faster R-CNN), and facial landmark geometry.',
    durationMinutes: 45,
    totalQuestions: 10,
    totalMarks: 100,
    passingMarks: 60,
    isActive: true,
    scheduledAt: '2026-11-04T10:00:00Z',
    rules: [
      'Active webcam connection is mandatory throughout the entire assessment duration.',
      'Head orientation must remain oriented towards the primary monitor.',
      'Only one student is permitted within the physical examination space.',
      'Mobile phones, secondary tablets, books, and unauthorized earphones are strictly prohibited.',
      'Brief natural glancing is permitted; persistent look-away events (>3s) are logged for proctor audit.',
      'All flagged events are reviewed by a human academic proctor before grading finalization.',
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        question: 'Which OpenCV function is conventionally utilized to solve the Perspective-n-Point problem for estimating 3D head pose from 2D facial landmarks?',
        options: [
          'cv2.findHomography()',
          'cv2.solvePnP()',
          'cv2.estimateAffine3D()',
          'cv2.getPerspectiveTransform()'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'cv2.solvePnP computes an object’s 3D rotation and translation vectors given matching 3D world model points and 2D image coordinates.'
      },
      {
        id: 'q2',
        number: 2,
        question: 'In MediaPipe Face Mesh, how many 3D facial landmark coordinates are extracted in real time on mobile/CPU architectures?',
        options: [
          '68 landmarks (classic Dlib model)',
          '128 landmarks',
          '468 landmarks (or 478 with refined irises)',
          '1024 landmarks'
        ],
        correctIndex: 2,
        points: 10,
        explanation: 'MediaPipe Face Mesh predicts 468 3D landmarks in normalized coordinate space, with 10 additional iris landmarks available in extended pipeline.'
      },
      {
        id: 'q3',
        number: 3,
        question: 'What is the principal purpose of implementing a temporal hysteresis filter in an AI proctoring vision engine?',
        options: [
          'To boost video compression bitrate over WebSockets',
          'To prevent false alarms caused by natural eye blinks and brief micro-gestures',
          'To encrypt student webcam frames for GDPR compliance',
          'To increase GPU inference batch sizes during exam peak hours'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'Hysteresis requires a candidate violation condition to persist continuously across a sliding time window before confirming an incident.'
      },
      {
        id: 'q4',
        number: 4,
        question: 'Which Euler angle describes the horizontal side-to-side turning rotation of the student’s head (looking left or right)?',
        options: [
          'Roll',
          'Pitch',
          'Yaw',
          'Azimuthal elevation'
        ],
        correctIndex: 2,
        points: 10,
        explanation: 'Yaw represents horizontal panning rotation around the vertical Y/Z axis.'
      },
      {
        id: 'q5',
        number: 5,
        question: 'When designing an ethical automated proctoring platform, what should happen when a high-confidence violation is detected?',
        options: [
          'The exam should instantly terminate and automatically fail the candidate.',
          'The incident is logged with timestamp, duration, and thumbnail for human proctor review.',
          'The student webcam stream is streamed publicly to the student class roster.',
          'The candidate’s computer hard drive is wiped immediately.'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'Responsible AI ethics dictate human-in-the-loop decisions: AI detects and flags evidence, while human proctors adjudicate misconduct.'
      },
      {
        id: 'q6',
        number: 6,
        question: 'In the YOLO (You Only Look Once) architecture family, what distinguishes YOLOv8 from earlier anchor-based predecessors?',
        options: [
          'It is completely anchor-free with decoupled head architecture',
          'It requires 4 separate cameras to infer depth',
          'It cannot detect mobile devices or electronic screens',
          'It only runs on quantum compute clusters'
        ],
        correctIndex: 0,
        points: 10,
        explanation: 'YOLOv8 features an anchor-free design with independent decoupled prediction heads for classification and bounding box regression.'
      },
      {
        id: 'q7',
        number: 7,
        question: 'What is the standard data minimization approach recommended for student video retention under privacy regulations like FERPA and GDPR?',
        options: [
          'Permanently store all raw 1080p webcam video in unencrypted public cloud storage',
          'Delete full continuous video streams and retain only episodic incident snapshots for audited sessions',
          'Never use camera hardware under any circumstance',
          'Stream video directly to third-party ad networks'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'Storing only discrete evidentiary snapshots of verified incidents drastically minimizes data footprint and mitigates student privacy risks.'
      },
      {
        id: 'q8',
        number: 8,
        question: 'Which loss function is predominantly applied in modern face verification and deep face embeddings to maximize inter-class distance?',
        options: [
          'Binary Cross Entropy',
          'ArcFace (Additive Angular Margin Loss)',
          'Mean Squared Error',
          'Poisson Regression Loss'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'ArcFace incorporates an additive angular margin penalty directly on the target angle, enforcing compact intra-class clustering.'
      },
      {
        id: 'q9',
        number: 9,
        question: 'Why are WebSockets preferred over HTTP polling for proctoring telemetry in an online exam platform?',
        options: [
          'WebSockets consume more server memory for every query',
          'WebSockets provide full-duplex, low-latency, bidirectional streaming without per-request HTTP header overhead',
          'WebSockets eliminate the need for computer vision models entirely',
          'WebSockets operate without requiring internet connectivity'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'Persistent WebSocket connections allow the client to stream sample frames while the server pushes instant violation alerts with sub-50ms latency.'
      },
      {
        id: 'q10',
        number: 10,
        question: 'If a student looks down at their scratch paper for 2 seconds to write an equation, how should a well-calibrated proctoring engine behave?',
        options: [
          'Trigger an immediate high-priority cheating alert and revoke the student’s session',
          'Track the movement internally but refrain from triggering a violation because duration is below the 3.0-second threshold',
          'Crash the browser window',
          'Re-initialize the student’s examination timer back to zero'
        ],
        correctIndex: 1,
        points: 10,
        explanation: 'Brief scratch-paper glancing is common test-taking behaviour; the temporal accumulator suppresses alerts for durations under threshold.'
      }
    ]
  },
  {
    id: 'exam-db-302',
    code: 'DB-302',
    title: 'Distributed Database Systems & ACID Transactions',
    course: 'Department of Computer Engineering',
    description: 'Relational query optimization, Raft consensus protocol, multi-version concurrency control (MVCC), and distributed transaction isolation levels.',
    durationMinutes: 60,
    totalQuestions: 15,
    totalMarks: 100,
    passingMarks: 50,
    isActive: true,
    scheduledAt: '2026-11-04T14:30:00Z',
    rules: [
      'Webcam and microphone must remain unobstructed for the session duration.',
      'No secondary monitors or dual-screen displays allowed.',
      'Workspace must be free of mobile phones, smartwatches, and study notes.',
    ],
    questions: []
  }
];

export const MOCK_SESSIONS = [
  {
    id: 'ses-101',
    examId: 'exam-cs-401',
    examTitle: 'Computer Vision & Deep Learning',
    studentId: 'usr-student-001',
    studentName: 'Sarah Chen',
    studentEmail: 'sarah.chen@university.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-04T10:02:15Z',
    endTime: null,
    status: SESSION_STATUS.IN_PROGRESS,
    integrityScore: 88.5,
    totalEvents: 2,
    pendingEvents: 1,
    cameraConnected: true,
    fps: 5.2,
    headPose: { yaw: 8.4, pitch: -4.2, roll: 1.1 },
    currentStatus: 'COMPLIANT',
  },
  {
    id: 'ses-102',
    examId: 'exam-cs-401',
    examTitle: 'Computer Vision & Deep Learning',
    studentId: 'usr-student-002',
    studentName: 'Marcus Reynolds',
    studentEmail: 'm.reynolds@university.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-04T10:00:44Z',
    endTime: null,
    status: SESSION_STATUS.IN_PROGRESS,
    integrityScore: 64.0,
    totalEvents: 5,
    pendingEvents: 3,
    cameraConnected: true,
    fps: 5.0,
    headPose: { yaw: 34.2, pitch: 12.0, roll: -3.5 },
    currentStatus: 'SUSPICIOUS',
  },
  {
    id: 'ses-103',
    examId: 'exam-cs-401',
    examTitle: 'Computer Vision & Deep Learning',
    studentId: 'usr-student-003',
    studentName: 'Elena Rostova',
    studentEmail: 'elena.rostova@university.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-04T10:01:10Z',
    endTime: null,
    status: SESSION_STATUS.IN_PROGRESS,
    integrityScore: 98.0,
    totalEvents: 0,
    pendingEvents: 0,
    cameraConnected: true,
    fps: 5.1,
    headPose: { yaw: -2.1, pitch: 1.4, roll: 0.2 },
    currentStatus: 'COMPLIANT',
  },
  {
    id: 'ses-104',
    examId: 'exam-cs-401',
    examTitle: 'Computer Vision & Deep Learning',
    studentId: 'usr-student-004',
    studentName: 'Devon Bradley',
    studentEmail: 'd.bradley@university.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-04T09:00:00Z',
    endTime: '2026-11-04T09:44:20Z',
    status: SESSION_STATUS.SUBMITTED,
    integrityScore: 92.0,
    totalEvents: 1,
    pendingEvents: 0,
    cameraConnected: false,
    score: 85,
    currentStatus: 'SUBMITTED',
  },
  {
    id: 'ses-105',
    examId: 'exam-cs-401',
    examTitle: 'Computer Vision & Deep Learning',
    studentId: 'usr-student-005',
    studentName: 'Aisha Al-Mansoor',
    studentEmail: 'aisha.m@university.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    startTime: '2026-11-04T08:30:00Z',
    endTime: '2026-11-04T09:15:00Z',
    status: SESSION_STATUS.SUBMITTED,
    integrityScore: 48.0,
    totalEvents: 6,
    pendingEvents: 2,
    cameraConnected: false,
    score: 72,
    currentStatus: 'FLAGGED',
  }
];

export const MOCK_EVENTS = [
  {
    id: 'evt-001',
    sessionId: 'ses-102',
    studentName: 'Marcus Reynolds',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.PHONE_DETECTED,
    confidence: 0.91,
    durationSeconds: 4.8,
    timestamp: '2026-11-04T10:14:22Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.PENDING,
    adminNotes: '',
    metadata: {
      detector: 'YOLOv8n-COCO',
      bbox: [142, 210, 260, 390],
      classLabel: 'cell phone',
      score: 0.914
    }
  },
  {
    id: 'evt-002',
    sessionId: 'ses-102',
    studentName: 'Marcus Reynolds',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.LOOKING_AWAY,
    confidence: 0.87,
    durationSeconds: 5.2,
    timestamp: '2026-11-04T10:11:05Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.PENDING,
    adminNotes: '',
    metadata: {
      yaw: 38.4,
      pitch: 14.1,
      threshold: 25.0
    }
  },
  {
    id: 'evt-003',
    sessionId: 'ses-101',
    studentName: 'Sarah Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.LOOKING_AWAY,
    confidence: 0.79,
    durationSeconds: 3.4,
    timestamp: '2026-11-04T10:08:45Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.PENDING,
    adminNotes: '',
    metadata: {
      yaw: -28.2,
      pitch: -3.1,
      threshold: 25.0
    }
  },
  {
    id: 'evt-004',
    sessionId: 'ses-102',
    studentName: 'Marcus Reynolds',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.MULTIPLE_PERSONS,
    confidence: 0.84,
    durationSeconds: 3.8,
    timestamp: '2026-11-04T10:05:12Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.CONFIRMED,
    adminNotes: 'Second person entered background behind the candidate chair.',
    metadata: {
      faceCount: 2,
      detector: 'MediaPipe-BlazeFace'
    }
  },
  {
    id: 'evt-005',
    sessionId: 'ses-105',
    studentName: 'Aisha Al-Mansoor',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.ABSENCE,
    confidence: 0.98,
    durationSeconds: 14.5,
    timestamp: '2026-11-04T08:52:10Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.CONFIRMED,
    adminNotes: 'Student vacated seat for 14.5 seconds during examination without authorized break.',
    metadata: {
      faceCount: 0,
      absenceDuration: 14.5
    }
  },
  {
    id: 'evt-006',
    sessionId: 'ses-104',
    studentName: 'Devon Bradley',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    examTitle: 'Computer Vision & Deep Learning',
    eventType: EVENT_TYPES.LOOKING_AWAY,
    confidence: 0.72,
    durationSeconds: 3.1,
    timestamp: '2026-11-04T09:12:30Z',
    snapshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    reviewStatus: REVIEW_STATUS.CLEARED,
    adminNotes: 'Brief glance at scratch paper for math calculation. Verified compliant.',
    metadata: {
      yaw: 12.0,
      pitch: -24.1,
      threshold: 20.0
    }
  }
];

export const MOCK_CHART_TIMELINE = [
  { time: '10:00', totalLookAway: 1, totalAbsence: 0, totalPhones: 0, totalMultiPerson: 0 },
  { time: '10:05', totalLookAway: 3, totalAbsence: 1, totalPhones: 0, totalMultiPerson: 1 },
  { time: '10:10', totalLookAway: 6, totalAbsence: 0, totalPhones: 1, totalMultiPerson: 0 },
  { time: '10:15', totalLookAway: 4, totalAbsence: 2, totalPhones: 1, totalMultiPerson: 0 },
  { time: '10:20', totalLookAway: 2, totalAbsence: 0, totalPhones: 0, totalMultiPerson: 0 },
  { time: '10:25', totalLookAway: 5, totalAbsence: 1, totalPhones: 0, totalMultiPerson: 0 },
];

export const MOCK_CHART_DISTRIBUTION = [
  { name: 'Looking Away', value: 21, color: '#F59E0B' },
  { name: 'Absence', value: 6, color: '#EF4444' },
  { name: 'Phone Detected', value: 3, color: '#DC2626' },
  { name: 'Multiple Persons', value: 4, color: '#EC4899' },
  { name: 'Secondary Audio', value: 5, color: '#3B82F6' },
];

export const MOCK_CHART_INTEGRITY = [
  { range: '90-100%', count: 18, fill: '#10B981' },
  { range: '80-89%', count: 12, fill: '#3B82F6' },
  { range: '70-79%', count: 7, fill: '#F59E0B' },
  { range: '60-69%', count: 3, fill: '#FB923C' },
  { range: '<60%', count: 2, fill: '#EF4444' },
];
