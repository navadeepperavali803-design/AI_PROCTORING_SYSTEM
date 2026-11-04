import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Video,
  AlertTriangle,
  FileText,
  BookOpen,
  CheckSquare,
  ShieldAlert,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { pendingEvents, activeSessions } = useAdmin();

  const adminLinks = [
    {
      to: '/admin',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/admin/live',
      label: 'Live Proctor Grid',
      icon: Video,
      badge: activeSessions.length > 0 ? activeSessions.length : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      to: '/admin/review',
      label: 'Incident Review Queue',
      icon: AlertTriangle,
      badge: pendingEvents.length > 0 ? pendingEvents.length : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      to: '/admin/reports',
      label: 'Audit Reports',
      icon: FileText,
    },
  ];

  const studentLinks = [
    {
      to: '/student',
      label: 'My Examination Portal',
      icon: BookOpen,
      end: true,
    },
    {
      to: '/student/instructions',
      label: 'Hardware & System Check',
      icon: CheckSquare,
    },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-navy-900/60 backdrop-blur-md border-r border-navy-800 flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {isAdmin ? 'Academic Administration' : 'Student Workspace'}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/70 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        link.badgeColor || 'bg-navy-800 text-slate-300'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Proctoring Policy Notice Box */}
        <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-700/60 text-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Integrity Guard</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Sessions undergo real-time facial pose & object estimation. Flagged events require human verification.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-500 flex items-center justify-between px-2">
        <span>v2.4.0 • Enterprise</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Connected
        </span>
      </div>
    </aside>
  );
};
