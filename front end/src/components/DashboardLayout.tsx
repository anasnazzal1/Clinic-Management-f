import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { canAccessMessages } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
  LogOut, Menu, X, Building2, Users, Stethoscope, UserPlus,
  CalendarPlus, Calendar, ClipboardList, User, FileText, LayoutDashboard, KeyRound, MessageCircle
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { label: 'dashboard',      path: '/admin',                icon: LayoutDashboard },
    { label: 'departments',    path: '/admin/clinics',        icon: Building2 },
    { label: 'doctors',        path: '/admin/doctors',        icon: Stethoscope },
    { label: 'patients',       path: '/admin/patients',       icon: Users },
    { label: 'receptionists',  path: '/admin/receptionists',  icon: UserPlus },
    { label: 'appointments',   path: '/admin/appointments',   icon: Calendar },
    { label: 'myProfile',      path: '/change-password',      icon: KeyRound },
  ],
  doctor: [
    { label: 'dashboard',       path: '/doctor',              icon: LayoutDashboard },
    { label: 'appointments',    path: '/doctor/appointments', icon: Calendar },
    { label: 'messages',        path: '/doctor/messages',     icon: MessageCircle },
    { label: 'myProfile',       path: '/change-password',     icon: KeyRound },
  ],
  receptionist: [
    { label: 'dashboard',       path: '/reception',                icon: LayoutDashboard },
    { label: 'addPatient',      path: '/reception/add-patient',    icon: UserPlus },
    { label: 'bookAppointment', path: '/reception/book',           icon: CalendarPlus },
    { label: 'appointments',    path: '/reception/appointments',   icon: Calendar },
    { label: 'messages',        path: '/reception/messages',       icon: MessageCircle },
    { label: 'myProfile',       path: '/change-password',          icon: KeyRound },
  ],
  patient: [
    { label: 'dashboard',       path: '/patient',             icon: LayoutDashboard },
    { label: 'appointments',    path: '/patient/appointments',icon: Calendar },
    { label: 'messages',        path: '/patient/messages',    icon: MessageCircle },
    { label: 'medicalHistory',  path: '/patient/history',     icon: FileText },
    { label: 'myProfile',       path: '/change-password',     icon: KeyRound },
  ],
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { t } = useTranslation();

  if (!user) return null;

  const items = (navItems[user.role] || []).filter(item => {
    if (item.label === 'messages') {
      return canAccessMessages(user.role);
    }
    return true;
  });

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
          <span className="font-display font-bold text-sm text-sidebar-accent-foreground">{t('appName')}</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(item => {
            const active = location.pathname === item.path;
            const isMessages = item.label === 'messages';
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
                <span className="flex-1">{t(item.label)}</span>
                {isMessages && unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2 flex items-center gap-3">
            {user.profileImage ? (
              <img src={`http://localhost:3000${user.profileImage}?t=${Date.now()}`} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-sidebar-border" />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground">
                  {user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
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
            {t(items.find(i => location.pathname.startsWith(i.path) && (i.path !== '/admin' || location.pathname === '/admin'))?.label ?? 'dashboard')}
          </h1>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
