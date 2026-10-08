import React, { useState } from 'react';
import {
  Mail,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  NotificationLog,
  NotificationPreference,
  StudentProfile,
  AcademicTerm,
  Course,
} from '../types/academic';
import {
  buildNewGradeNotification,
  buildLowGradeNotification,
  buildDeadlineNotification,
  buildWeeklyDigestNotification,
  buildTestVerificationNotification,
  playNotificationSound,
} from '../services/notificationService';

interface EmailCenterViewProps {
  student: StudentProfile;
  terms: AcademicTerm[];
  notifications: NotificationLog[];
  preferences: NotificationPreference;
  onUpdatePreferences: (prefs: NotificationPreference) => void;
  onDispatchNotification: (notif: NotificationLog) => void;
  onOpenEmailPreview: (notif: NotificationLog) => void;
  onClearNotifications: () => void;
}

export const EmailCenterView: React.FC<EmailCenterViewProps> = ({
  student,
  terms,
  notifications,
  preferences,
  onUpdatePreferences,
  onDispatchNotification,
  onOpenEmailPreview,
  onClearNotifications,
}) => {
  const [recipientInput, setRecipientInput] = useState(preferences.recipientEmail);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [savedBadge, setSavedBadge] = useState(false);

  const currentTerm = terms.find((t) => t.isCurrent) || terms[terms.length - 1];

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientInput.trim()) return;
    onUpdatePreferences({ ...preferences, recipientEmail: recipientInput.trim() });
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleTriggerTestVerification = () => {
    const notif = buildTestVerificationNotification({
      student,
      recipientEmail: preferences.recipientEmail,
    });
    if (preferences.soundAlerts) playNotificationSound();
    onDispatchNotification(notif);
  };

  const handleTriggerGradeDrop = () => {
    const physics = currentTerm.courses.find((c) => c.code.includes('SCI 14')) || currentTerm.courses[0];
    const notif = buildLowGradeNotification({
      student,
      course: physics,
      threshold: 75,
      recipientEmail: preferences.recipientEmail,
    });
    if (preferences.soundAlerts) playNotificationSound();
    onDispatchNotification(notif);
  };

  const handleTriggerNewGrade = () => {
    const research = currentTerm.courses.find((c) => c.code.includes('RES 11')) || currentTerm.courses[1];
    const notif = buildNewGradeNotification({
      student,
      course: research,
      assessment: {
        title: 'Oral Proposal Defense & Conceptual Framework',
        earned: 96,
        max: 100,
        component: 'Performance Task (50%)',
        type: 'Oral Presentation',
        feedback: 'Superb mastery of data triangulation and interview protocols.',
      },
      recipientEmail: preferences.recipientEmail,
    });
    if (preferences.soundAlerts) playNotificationSound();
    onDispatchNotification(notif);
  };

  const handleTriggerWeeklyDigest = () => {
    const notif = buildWeeklyDigestNotification({
      student,
      currentTerm,
      allTerms: terms,
      recipientEmail: preferences.recipientEmail,
    });
    if (preferences.soundAlerts) playNotificationSound();
    onDispatchNotification(notif);
  };

  const handleTriggerDeadline = () => {
    const calculus = currentTerm.courses.find((c) => c.code.includes('MATH 13')) || currentTerm.courses[0];
    const notif = buildDeadlineNotification({
      student,
      course: calculus,
      assessment: {
        title: 'Performance Task 2: Related Rates Simulation Output',
        dueDate: '2027-04-18',
        component: 'Performance Task',
      },
      recipientEmail: preferences.recipientEmail,
    });
    if (preferences.soundAlerts) playNotificationSound();
    onDispatchNotification(notif);
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.previewText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Real-Time Email Notification Dispatch Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Student & Parent Email Alerts Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.schoolName} &bull; Real-time automated academic notifications to{' '}
              <strong className="text-indigo-300 font-mono">{preferences.recipientEmail}</strong>
            </p>
          </div>

          <button
            onClick={handleTriggerTestVerification}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Verification Email</span>
          </button>
        </div>
      </div>

      {/* Grid: Preferences Settings + Quick Test Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Email Configuration & Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Alert Preferences & Recipient</span>
          </div>

          {/* Email input */}
          <form onSubmit={handleSaveEmail} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Recipient Email Address:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="student@gmail.com"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Save
              </button>
            </div>
            {savedBadge && (
              <span className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
                ✓ Recipient saved successfully!
              </span>
            )}
          </form>

          {/* Trigger Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Remedial Alert (&lt; 75%)</div>
                <div className="text-[11px] text-slate-400">Trigger alert if subject grade falls below 75% mark</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.gradeDropAlert}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, gradeDropAlert: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">New Score Recorded Alert</div>
                <div className="text-[11px] text-slate-400">Immediate email when teacher posts a score</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.newGradePosted}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, newGradePosted: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Performance Task Deadlines</div>
                <div className="text-[11px] text-slate-400">Reminders for upcoming deliverables (50% weight)</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.upcomingDeadlines}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, upcomingDeadlines: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Weekly Performance Digest</div>
                <div className="text-[11px] text-slate-400">Full 3-term summary sent every weekend</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, weeklyDigest: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 cursor-pointer">
              <div className="flex items-center gap-1.5">
                {preferences.soundAlerts ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <div className="font-semibold text-slate-200">In-App Chime Audio</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundAlerts}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, soundAlerts: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Right 2 Columns: Live Simulated Email Dispatch Triggers */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Email Dispatch Triggers</h3>
              <p className="text-xs text-slate-400">
                Click any trigger below to immediately dispatch a formatted email to{' '}
                <span className="text-indigo-400 font-mono">{preferences.recipientEmail}</span>.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Pipeline Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Trigger 1: Remedial Alert */}
            <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl flex flex-col justify-between hover:border-rose-700/60 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>Academic Remedial Alert</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-xs text-rose-200/80 mt-1.5 leading-relaxed">
                  Sends urgent notice that <strong>General Physics 1</strong> is at <strong>71.8%</strong> (below 75% DepEd passing mark).
                </p>
              </div>
              <button
                onClick={handleTriggerGradeDrop}
                className="mt-4 w-full py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Remedial Alert Email</span>
              </button>
            </div>

            {/* Trigger 2: New Grade Posted */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl flex flex-col justify-between hover:border-indigo-700/60 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                  <span>New Grade Score Posted</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed">
                  Sends notification that teacher posted <strong>96/100</strong> for <strong>Practical Research 1</strong> Proposal Defense (50% Performance Task).
                </p>
              </div>
              <button
                onClick={handleTriggerNewGrade}
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Grade Posted Email</span>
              </button>
            </div>

            {/* Trigger 3: Weekly Digest */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>Weekly Academic Progress Digest</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Sends comprehensive weekly summary with General Average (89.2%), 3-term stats, and subject compliance status.
                </p>
              </div>
              <button
                onClick={handleTriggerWeeklyDigest}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Weekly Digest Email</span>
              </button>
            </div>

            {/* Trigger 4: Deadline Reminder */}
            <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl flex flex-col justify-between hover:border-amber-700/60 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>Performance Task Deadline</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs text-amber-200/80 mt-1.5 leading-relaxed">
                  Sends 50% weight submission reminder for <strong>Basic Calculus: Related Rates Motion Project</strong>.
                </p>
              </div>
              <button
                onClick={handleTriggerDeadline}
                className="mt-4 w-full py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Deadline Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sent Email Outbox & Audit History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Dispatched Notification History & Email Outbox</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({filteredNotifications.length} Delivered Messages)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any dispatched message to inspect the full formatted DepEd HTML email letterhead.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search subjects or emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 w-48 sm:w-60 focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Clear Log
              </button>
            )}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notification logs found matching search criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredNotifications.map((notif) => {
              const formattedTime = new Date(notif.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => onOpenEmailPreview(notif)}
                  className="p-4 sm:px-6 hover:bg-slate-800/40 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                        {notif.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {notif.previewText}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-mono">
                      <span>Recipient: {notif.recipient}</span>
                      <span>&bull;</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Delivered
                    </span>
                    <button
                      type="button"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Inspect Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
