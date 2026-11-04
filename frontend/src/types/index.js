export const USER_ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  PROCTOR: 'proctor',
};

export const SESSION_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  TERMINATED: 'TERMINATED',
};

export const EVENT_TYPES = {
  LOOKING_AWAY: 'LOOKING_AWAY',
  ABSENCE: 'ABSENCE',
  MULTIPLE_PERSONS: 'MULTIPLE_PERSONS',
  PHONE_DETECTED: 'PHONE_DETECTED',
  SUSPICIOUS_OBJECT: 'SUSPICIOUS_OBJECT',
  VOICE_DETECTED: 'VOICE_DETECTED',
};

export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CLEARED: 'CLEARED',
};

export const EVENT_CONFIG = {
  LOOKING_AWAY: {
    label: 'Looking Away',
    description: 'Student head gaze diverted beyond normal peripheral angle for >3 seconds',
    severity: 'medium',
    color: 'amber',
    icon: 'EyeOff',
  },
  ABSENCE: {
    label: 'Person Absence',
    description: 'No face detected in webcam frame for >3 seconds',
    severity: 'high',
    color: 'rose',
    icon: 'UserX',
  },
  MULTIPLE_PERSONS: {
    label: 'Multiple Persons',
    description: 'More than one face identified in the monitoring frame',
    severity: 'high',
    color: 'rose',
    icon: 'Users',
  },
  PHONE_DETECTED: {
    label: 'Mobile Phone Detected',
    description: 'Mobile phone or portable electronic device identified in webcam view',
    severity: 'critical',
    color: 'red',
    icon: 'Smartphone',
  },
  SUSPICIOUS_OBJECT: {
    label: 'Suspicious Object',
    description: 'Unauthorized notes, book, or display detected in workspace',
    severity: 'medium',
    color: 'amber',
    icon: 'BookOpen',
  },
  VOICE_DETECTED: {
    label: 'Secondary Audio',
    description: 'Audio speech patterns detected exceeding ambient threshold',
    severity: 'low',
    color: 'blue',
    icon: 'Mic',
  },
};
