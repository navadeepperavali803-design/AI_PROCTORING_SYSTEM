import axios from 'axios';
import { MOCK_EXAMS, MOCK_SESSIONS, MOCK_EVENTS, MOCK_USERS } from './mockData';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('proctor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Storage helper for persistence across reloads
const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage set failed', err);
  }
};

export const api = {
  // Authentication
  async login(email, password, role = 'student') {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch {
      // Offline fallback: select mock user based on role
      const user = role === 'admin' ? MOCK_USERS.admin : MOCK_USERS.student;
      const fakeToken = `mock-token-${user.role}-${Date.now()}`;
      localStorage.setItem('proctor_token', fakeToken);
      localStorage.setItem('proctor_user', JSON.stringify(user));
      return { user, access_token: fakeToken };
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      return getStored('proctor_user', MOCK_USERS.student);
    }
  },

  // Exams
  async getExams() {
    try {
      const res = await apiClient.get('/exams');
      return res.data;
    } catch {
      return getStored('proctor_exams', MOCK_EXAMS);
    }
  },

  async getExamById(examId) {
    try {
      const res = await apiClient.get(`/exams/${examId}`);
      return res.data;
    } catch {
      const exams = getStored('proctor_exams', MOCK_EXAMS);
      return exams.find((e) => e.id === examId) || exams[0];
    }
  },

  // Sessions
  async getSessions() {
    try {
      const res = await apiClient.get('/sessions');
      return res.data;
    } catch {
      return getStored('proctor_sessions', MOCK_SESSIONS);
    }
  },

  async createSession(examId, studentId) {
    try {
      const res = await apiClient.post('/sessions', { exam_id: examId, student_id: studentId });
      return res.data;
    } catch {
      const sessions = getStored('proctor_sessions', MOCK_SESSIONS);
      const exam = MOCK_EXAMS.find((e) => e.id === examId) || MOCK_EXAMS[0];
      const newSession = {
        id: `ses-${Date.now()}`,
        examId,
        examTitle: exam.title,
        studentId,
        studentName: 'Sarah Chen',
        studentEmail: 'sarah.chen@university.edu',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        startTime: new Date().toISOString(),
        endTime: null,
        status: 'IN_PROGRESS',
        integrityScore: 100.0,
        totalEvents: 0,
        pendingEvents: 0,
        cameraConnected: true,
        fps: 5.0,
        headPose: { yaw: 0, pitch: 0, roll: 0 },
        currentStatus: 'COMPLIANT',
      };
      sessions.unshift(newSession);
      setStored('proctor_sessions', sessions);
      return newSession;
    }
  },

  async submitExamSession(sessionId, answers) {
    try {
      const res = await apiClient.post(`/sessions/${sessionId}/submit`, { answers });
      return res.data;
    } catch {
      const sessions = getStored('proctor_sessions', MOCK_SESSIONS);
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        session.status = 'SUBMITTED';
        session.endTime = new Date().toISOString();
        setStored('proctor_sessions', sessions);
      }
      return { success: true, sessionId, status: 'SUBMITTED' };
    }
  },

  // Events & Flagging
  async getEvents(sessionId = null) {
    try {
      const url = sessionId ? `/events?session_id=${sessionId}` : '/events';
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      const events = getStored('proctor_events', MOCK_EVENTS);
      if (sessionId) {
        return events.filter((e) => e.sessionId === sessionId);
      }
      return events;
    }
  },

  async updateEventStatus(eventId, reviewStatus, adminNotes = '') {
    try {
      const res = await apiClient.patch(`/events/${eventId}`, {
        review_status: reviewStatus,
        admin_notes: adminNotes,
      });
      return res.data;
    } catch {
      const events = getStored('proctor_events', MOCK_EVENTS);
      const event = events.find((e) => e.id === eventId);
      if (event) {
        event.reviewStatus = reviewStatus;
        if (adminNotes) event.adminNotes = adminNotes;
        setStored('proctor_events', events);
      }
      return event;
    }
  },

  async logEvent(eventData) {
    try {
      const res = await apiClient.post('/events', eventData);
      return res.data;
    } catch {
      const events = getStored('proctor_events', MOCK_EVENTS);
      const newEvent = {
        id: `evt-${Date.now()}`,
        ...eventData,
        timestamp: new Date().toISOString(),
        reviewStatus: 'PENDING',
      };
      events.unshift(newEvent);
      setStored('proctor_events', events);
      return newEvent;
    }
  },
};
