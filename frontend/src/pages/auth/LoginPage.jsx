import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('sarah.chen@university.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password, selectedRole);
    if (selectedRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const handleQuickDemo = async (role) => {
    setSelectedRole(role);
    const demoEmail = role === 'admin' ? 'a.vance@university.edu' : 'sarah.chen@university.edu';
    setEmail(demoEmail);
    await login(demoEmail, 'password123', role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-950 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mx-auto shadow-lg shadow-blue-500/25">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ProctorAI Enterprise</h1>
          <p className="text-xs text-slate-400">
            AI-Powered Examination Integrity & Proctoring Platform
          </p>
        </div>

        {/* 1-Click Demo Login Selector */}
        <div className="space-y-2 pt-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block text-center">
            One-Click Portfolio Demo Access
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 hover:border-blue-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Student Demo</span>
              </div>
              <p className="text-[10px] text-slate-400">Sarah Chen (CS-401)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 hover:border-blue-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">Proctor Demo</span>
              </div>
              <p className="text-[10px] text-slate-400">Dr. Arthur Vance (Admin)</p>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-navy-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-semibold uppercase">or sign in with email</span>
          <div className="flex-grow border-t border-navy-800"></div>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-950 border border-navy-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500">
          Protected by AES-256 TLS Encryption • FERPA & GDPR Compliant
        </p>
      </div>
    </div>
  );
};
