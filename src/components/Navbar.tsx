import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Mail,
  FileText,
  Plus,
  Send,
} from 'lucide-react';
import { StudentProfile } from '../types/academic';

export type NavTab =
  | 'dashboard'
  | 'courses'
  | 'compliance'
  | 'analytics'
  | 'emails'
  | 'transcript';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  student: StudentProfile;
  unreadCount: number;
  onOpenAddCourse: () => void;
  onTriggerQuickEmail: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  student,
  unreadCount,
  onOpenAddCourse,
  onTriggerQuickEmail,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'courses', label: 'Courses & Syllabus', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'compliance', label: 'Subject Compliance', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Real-Time Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    {
      id: 'emails',
      label: 'Email & Alerts',
      icon: (
        <span className="relative">
          <Mail className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
          )}
        </span>
      ),
    },
    { id: 'transcript', label: 'Official Transcript', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                AcademiaPulse
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onTriggerQuickEmail}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              title="Test Email Dispatch to student address"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulate Alert</span>
            </button>

            <button
              onClick={onOpenAddCourse}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enroll Course</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={student.avatarUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                  {student.name}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  {student.studentId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile secondary nav row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
