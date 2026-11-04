import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, Bell, User, ArrowLeftRight, LogOut, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, role, switchRole, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">ProctorAI</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Intelligent Exam Integrity System</p>
          </div>
        </Link>

        {/* Center System Status Telemetry */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/80 border border-navy-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>CV Engine: <strong className="text-emerald-400">MediaPipe + YOLOv8</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Temporal Anti-Spam: <strong className="text-slate-200">Active (3.0s)</strong></span>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Button for Testing */}
          <button
            onClick={() => switchRole(isAdmin ? 'student' : 'admin')}
            title="Switch demo perspective between Student and Admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 hover:border-slate-600 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className="capitalize font-semibold text-blue-400">{role}</span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 pl-2 border-l border-navy-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-navy-600 object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
