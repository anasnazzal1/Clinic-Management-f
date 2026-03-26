import React, { createContext, useContext, useState, useCallback } from 'react';
import { users, User, UserRole } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('clinicUser');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((username: string, password: string) => {
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('clinicUser', JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('clinicUser');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const getRolePath = (role: UserRole) => {
  const paths: Record<UserRole, string> = {
    admin: '/admin',
    doctor: '/doctor',
    receptionist: '/reception',
    patient: '/patient',
  };
  return paths[role];
};
