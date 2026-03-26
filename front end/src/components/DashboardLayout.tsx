import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LogOut, Menu, X, Building2, Users, Stethoscope, UserPlus,
  CalendarPlus, Calendar, ClipboardList, User, FileText, LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard',      path: '/admin',                icon: LayoutDashboard },
    { label: 'Departments',    path: '/admin/clinics',        icon: Building2 },
    { label: 'Doctors',        path: '/admin/doctors',        icon: Stethoscope },
    { label: 'Patients',       path: '/admin/patients',       icon: Users },
    { label: 'Receptionists',  path: '/admin/receptionists',  icon: UserPlus },
    { label: 'Appointments',   path: '/admin/appointments',   icon: Calendar },
  ],
  doctor: [
    { label: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
    { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
  ],
  receptionist: [
    { label: 'Dashboard', path: '/reception', icon: LayoutDashboard },
    { label: 'Add Patient', path: '/reception/add-patient', icon: UserPlus },
    { label: 'Book Appointment', path: '/reception/book', icon: CalendarPlus },
    { label: 'Appointments', path: '/reception/appointments', icon: Calendar },
  ],
  patient: [
    { label: 'Dashboard', path: '/patient', icon: LayoutDashboard },
    { label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Medical History', path: '/patient/history', icon: FileText },
  ],
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sm text-sidebar-accent-foreground">MediCare Clinic</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display font-semibold text-foreground text-lg truncate">
            {items.find(i => location.pathname.startsWith(i.path) && (i.path !== '/admin' || location.pathname === '/admin'))?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
