import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '@/lib/api';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  linkedId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('clinicUser');
    if (stored) { try { return JSON.parse(stored); } catch { return null; } }
    return null;
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const { data } = await authApi.login(username, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('clinicUser', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('clinicUser');
    localStorage.removeItem('token');
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
