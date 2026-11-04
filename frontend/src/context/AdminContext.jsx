import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { REVIEW_STATUS } from '../types';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  const wsRef = useRef(null);

  // Load initial data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [fetchedSessions, fetchedEvents] = await Promise.all([
        api.getSessions(),
        api.getEvents(),
      ]);
      setSessions(fetchedSessions);
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Connect to real-time administrative alert WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/ws/admin/alerts`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (msgEvent) => {
        try {
          const alert = JSON.parse(msgEvent.data);
          if (alert.type === 'INCIDENT_ALERT') {
            const newEvt = {
              id: alert.eventId || `evt-${Date.now()}`,
              sessionId: alert.sessionId,
              studentName: 'Candidate In Progress',
              studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              examTitle: 'Computer Vision & Deep Learning',
              eventType: alert.eventType,
              confidence: alert.confidence,
              durationSeconds: alert.duration,
              timestamp: alert.timestamp,
              snapshotUrl: alert.snapshotUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
              reviewStatus: REVIEW_STATUS.PENDING,
              adminNotes: '',
              metadata: {},
            };
            setEvents((prev) => [newEvt, ...prev]);
            setLiveAlerts((prev) => [alert, ...prev.slice(0, 4)]);
          }
        } catch (e) {
          console.warn('Admin alert parse error', e);
        }
      };

      ws.onclose = () => {
        // Will retry on next mount
      };
    } catch (err) {
      console.warn('Admin WebSocket connection error', err);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Update review status of an incident
  const updateEventStatus = async (eventId, reviewStatus, adminNotes = '') => {
    try {
      await api.updateEventStatus(eventId, reviewStatus, adminNotes);
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === eventId
            ? { ...evt, reviewStatus, adminNotes: adminNotes || evt.adminNotes }
            : evt
        )
      );
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  // Metrics computation
  const activeSessions = sessions.filter((s) => s.status === 'IN_PROGRESS');
  const pendingEvents = events.filter((e) => e.reviewStatus === REVIEW_STATUS.PENDING);
  const confirmedEvents = events.filter((e) => e.reviewStatus === REVIEW_STATUS.CONFIRMED);
  const clearedEvents = events.filter((e) => e.reviewStatus === REVIEW_STATUS.CLEARED);
  const avgIntegrity = sessions.length
    ? (
        sessions.reduce((acc, curr) => acc + (curr.integrityScore || 100), 0) / sessions.length
      ).toFixed(1)
    : '100.0';

  // Filtered events
  const filteredEvents = events.filter((evt) => {
    if (statusFilter !== 'ALL' && evt.reviewStatus !== statusFilter) return false;
    if (eventTypeFilter !== 'ALL' && evt.eventType !== eventTypeFilter) return false;
    return true;
  });

  return (
    <AdminContext.Provider
      value={{
        sessions,
        events,
        filteredEvents,
        loading,
        selectedSession,
        setSelectedSession,
        activeSessions,
        pendingEvents,
        confirmedEvents,
        clearedEvents,
        avgIntegrity,
        statusFilter,
        setStatusFilter,
        eventTypeFilter,
        setEventTypeFilter,
        updateEventStatus,
        refreshData,
        liveAlerts,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
