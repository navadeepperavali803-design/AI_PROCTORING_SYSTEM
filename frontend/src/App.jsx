import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExamProvider } from './context/ExamContext';
import { AdminProvider } from './context/AdminContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Student Pages
import { StudentPortal } from './pages/student/StudentPortal';
import { ExamInstructions } from './pages/student/ExamInstructions';
import { ExamRoom } from './pages/student/ExamRoom';
import { ExamResult } from './pages/student/ExamResult';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LiveMonitorPage } from './pages/admin/LiveMonitorPage';
import { SessionReview } from './pages/admin/SessionReview';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// App Layout Wrapper
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Full-screen distraction-free view for live examination and login
  const isExamRoom = location.pathname.startsWith('/student/exam/');
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {!isExamRoom && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${isExamRoom ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'p-6 sm:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Route Redirector based on current user role
const RootRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/admin' : '/student'} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <ExamProvider>
        <AdminProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Student Flow */}
                <Route path="/student" element={<StudentPortal />} />
                <Route path="/student/instructions/:examId?" element={<ExamInstructions />} />
                <Route path="/student/exam/:examId?" element={<ExamRoom />} />
                <Route path="/student/result" element={<ExamResult />} />

                {/* Admin Flow */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/live" element={<LiveMonitorPage />} />
                <Route path="/admin/review" element={<SessionReview />} />
                <Route path="/admin/reports" element={<SessionReview />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AdminProvider>
      </ExamProvider>
    </AuthProvider>
  );
};

export default App;
