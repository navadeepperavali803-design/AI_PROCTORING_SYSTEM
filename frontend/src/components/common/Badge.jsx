import React from 'react';
import { EVENT_CONFIG } from '../../types';

export const Badge = ({ variant = 'default', children, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-navy-800 text-slate-300 border border-navy-600',
    safe: 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-950/70 text-rose-300 border border-rose-500/30',
    info: 'bg-blue-950/70 text-blue-300 border border-blue-500/30',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const EventBadge = ({ type }) => {
  const conf = EVENT_CONFIG[type] || { label: type, color: 'blue' };
  const variant = conf.color === 'rose' || conf.color === 'red' ? 'danger' : conf.color === 'amber' ? 'warning' : 'info';

  return <Badge variant={variant}>{conf.label}</Badge>;
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return (
        <Badge variant="safe">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Active
        </Badge>
      );
    case 'SUBMITTED':
      return <Badge variant="info">Submitted</Badge>;
    case 'TERMINATED':
      return <Badge variant="danger">Terminated</Badge>;
    case 'CONFIRMED':
      return <Badge variant="danger">Confirmed Misconduct</Badge>;
    case 'CLEARED':
      return <Badge variant="safe">Cleared (Compliant)</Badge>;
    case 'PENDING':
      return <Badge variant="warning">Pending Review</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
