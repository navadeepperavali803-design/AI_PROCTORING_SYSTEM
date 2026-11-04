import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const ExamContext = createContext(null);

export const ExamProvider = ({ children }) => {
  const [activeExam, setActiveExam] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Real-time camera & proctoring telemetry
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('STANDBY'); // STANDBY, CONNECTED, DISCONNECTED
  const [currentIntegrity, setCurrentIntegrity] = useState(100.0);
  const [recentWarning, setRecentWarning] = useState(null);

  // Timer reference
  const timerRef = useRef(null);

  // Start exam session
  const startExam = async (exam, student) => {
    setActiveExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setTimeRemaining((exam.durationMinutes || 45) * 60);
    setIsExamCompleted(false);

    try {
      const session = await api.createSession(exam.id, student.id);
      setActiveSession(session);
      setConnectionStatus('CONNECTED');
    } catch (err) {
      console.error('Session start error', err);
    }
  };

  // Timer tick
  useEffect(() => {
    if (!activeExam || isExamCompleted || timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam(); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam, isExamCompleted, timeRemaining]);

  // Answer handler
  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Toggle review flag
  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Trigger telemetry warning alert (from webcam monitor simulation or WebSocket)
  const triggerTelemetryAlert = (alertType, message) => {
    setRecentWarning({
      type: alertType,
      message,
      timestamp: Date.now(),
    });

    // Integrity degradation
    setCurrentIntegrity((prev) => Math.max(20, +(prev - 3.5).toFixed(1)));

    // Auto-clear notification after 4 seconds
    setTimeout(() => {
      setRecentWarning((current) => (current?.type === alertType ? null : current));
    }, 4500);
  };

  // Submit exam
  const submitExam = async () => {
    if (isSubmitting || !activeSession) return;
    setIsSubmitting(true);
    try {
      await api.submitExamSession(activeSession.id, answers);
      setIsExamCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      console.error('Exam submission error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExamContext.Provider
      value={{
        activeExam,
        activeSession,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        flaggedQuestions,
        timeRemaining,
        isSubmitting,
        isExamCompleted,
        cameraActive,
        setCameraActive,
        cameraPermissionGranted,
        setCameraPermissionGranted,
        connectionStatus,
        setConnectionStatus,
        currentIntegrity,
        recentWarning,
        startExam,
        selectAnswer,
        toggleFlagQuestion,
        triggerTelemetryAlert,
        submitExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within an ExamProvider');
  return context;
};
