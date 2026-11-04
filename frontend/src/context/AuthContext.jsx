import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { MOCK_USERS } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('proctor_user');
      return stored ? JSON.parse(stored) : MOCK_USERS.student;
    } catch {
      return MOCK_USERS.student;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('proctor_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role = 'student') => {
    setLoading(true);
    try {
      const data = await api.login(email, password, role);
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('proctor_user', JSON.stringify(data.user));
      localStorage.setItem('proctor_token', data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('proctor_user');
    localStorage.removeItem('proctor_token');
  };

  const switchRole = (newRole) => {
    const newUser = newRole === 'admin' ? MOCK_USERS.admin : MOCK_USERS.student;
    setUser(newUser);
    localStorage.setItem('proctor_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || 'student',
        isAdmin: user?.role === 'admin' || user?.role === 'proctor',
        isStudent: user?.role === 'student',
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
