import React from 'react';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Send,
  BookOpen,
} from 'lucide-react';
import { AcademicTerm, Course, StudentProfile, NotificationLog } from '../types/academic';
import {
  calculateHighSchoolGrade,
  calculateTermAverage,
  calculateYearlyGeneralAverage,
  getHighSchoolSubjectCompliance,
} from '../utils/academicCalculations';

interface DashboardViewProps {
  terms: AcademicTerm[];
  selectedTermId: string;
  setSelectedTermId: (id: string) => void;
  student: StudentProfile;
  notifications: NotificationLog[];
  onOpenCourseModal: (course?: Course) => void;
  onOpenAssessmentModal: (course: Course) => void;
  onSelectCourseDetail: (course: Course) => void;
  onOpenEmailPreview: (notif: NotificationLog) => void;
  onNavigateToTab: (tab: 'courses' | 'compliance' | 'analytics' | 'emails') => void;
  onTriggerQuickAlert: (course: Course) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  terms,
  selectedTermId,
  setSelectedTermId,
  student,
  notifications,
  onOpenCourseModal,
  onOpenAssessmentModal,
  onSelectCourseDetail,
  onOpenEmailPreview,
  onNavigateToTab,
  onTriggerQuickAlert,
}) => {
  const currentTerm = terms.find((t) => t.id === selectedTermId) || terms[terms.length - 1];
  const termStats = calculateTermAverage(currentTerm.courses);
  const yearlyStats = calculateYearlyGeneralAverage(terms);

  // Overall compliance across all 3 terms
  let totalCourses = 0;
  let compliantCourses = 0;
  const deficitCoursesList: { course: Course; termName: string }[] = [];

  terms.forEach((term) => {
    term.courses.forEach((c) => {
      totalCourses++;
      const comp = getHighSchoolSubjectCompliance(c);
      if (comp.isCompliant) {
        compliantCourses++;
      } else {
        deficitCoursesList.push({ course: c, termName: term.name });
      }
    });
  });

  const compliancePercent =
    totalCourses > 0 ? Math.round((compliantCourses / totalCourses) * 100) : 100;

  // Upcoming assignments in current term
  const upcomingDeliverables: { course: Course; assessment: Course['assessments'][0] }[] = [];
  currentTerm.courses.forEach((course) => {
    course.assessments.forEach((a) => {
      if (a.status === 'Upcoming') {
        upcomingDeliverables.push({ course, assessment: a });
      }
    });
  });

  upcomingDeliverables.sort(
    (a, b) => new Date(a.assessment.dueDate).getTime() - new Date(b.assessment.dueDate).getTime()
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 3-Term Navigation Switcher & High School Identification Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{student.schoolName} &bull; S.Y. 2026 - 2027</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Senior High School Grade & Academic Progress Monitor
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.name} &bull; {student.gradeLevel} &bull; {student.section} (LRN: {student.lrn})
            </p>
          </div>

          {/* 3 Terms Selector Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
            {terms.map((term) => {
              const isSelected = term.id === selectedTermId;
              const tStats = calculateTermAverage(term.courses);
              return (
                <button
                  key={term.id}
                  onClick={() => setSelectedTermId(term.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{term.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tStats.generalAverage.toFixed(0)}%
                  </span>
                  {term.isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Term" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-time KPI Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Yearly General Average */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Yearly General Average (GWA)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {yearlyStats.yearlyAverage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold font-mono">
              Target: {student.targetGeneralAverage.toFixed(1)}%
            </span>
            <span aria-hidden="true">&bull;</span>
            <span className="truncate">
              {yearlyStats.yearlyAverage >= 90 ? 'With Honors' : 'Passing'}
            </span>
          </div>
        </div>

        {/* Selected Term Average */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">{currentTerm.name} Average</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono tabular-nums tracking-tight">
              {termStats.generalAverage.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span>{termStats.passingCount} of {currentTerm.courses.length} Passed</span>
            <span aria-hidden="true">&bull;</span>
            <span className="text-indigo-300 font-medium">Passing Mark: 75%</span>
          </div>
        </div>

        {/* Subject Compliance Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Subject Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {compliancePercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({compliantCourses}/{totalCourses} Subjects)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>3-Term DepEd Tracking</span>
            <button
              onClick={() => onNavigateToTab('compliance')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5"
            >
              See What Comply &rarr;
            </button>
          </div>
        </div>

        {/* DepEd Grading System Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">DepEd Grading Weights</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-slate-200">
            <div>Written: <span className="text-cyan-400">25%</span></div>
            <div className="mt-0.5">Perf Tasks: <span className="text-indigo-400">50%</span> (Highest)</div>
            <div className="mt-0.5">Summative: <span className="text-amber-400">25%</span></div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            DepEd Order No. 8, s. 2015
          </div>
        </div>
      </div>

      {/* Remedial / Deficit Alert Banner if any course is < 75% */}
      {deficitCoursesList.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-200">
                  Academic Intervention Alert: Subject Needs Remedial Action
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                  Below 75% Passing Mark
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                {deficitCoursesList.map((item) => {
                  const s = calculateHighSchoolGrade(item.course);
                  return (
                    <span key={item.course.id}>
                      <strong>{item.course.code} ({item.course.name})</strong> in {item.termName} is
                      standing at{' '}
                      <strong className="font-mono">
                        {s.currentGrade}% ({s.descriptor})
                      </strong>
                      . Performance Tasks (50% weight) completion is required to clear passing status.
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {deficitCoursesList[0] && (
              <button
                onClick={() => onTriggerQuickAlert(deficitCoursesList[0].course)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Warning Email</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
            >
              <span>Simulate Needed Score</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Term Subjects Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentTerm.name} Subjects & Compliance Status</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({currentTerm.courses.length} Enrolled Subjects)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time weights: Written Works 25%, Performance Tasks 50%, Quarterly Exams 25%.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('compliance')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open All 3 Terms Compliance Matrix</span>
          </button>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTerm.courses.map((course) => {
            const summary = calculateHighSchoolGrade(course);
            const comp = getHighSchoolSubjectCompliance(course);

            return (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
              >
                <div>
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-indigo-400">
                        {course.code}
                      </div>
                      <h3
                        onClick={() => onSelectCourseDetail(course)}
                        className="text-base font-bold text-white mt-0.5 group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1"
                        title={course.name}
                      >
                        {course.name}
                      </h3>
                    </div>

                    {/* Final Grade Stamp */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-2xl font-black font-mono tabular-nums ${
                          summary.currentGrade >= 90
                            ? 'text-emerald-400'
                            : summary.currentGrade >= 75
                            ? 'text-white'
                            : 'text-rose-400'
                        }`}
                      >
                        {summary.currentGrade.toFixed(0)}%
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {summary.descriptor}
                      </div>
                    </div>
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <span>{course.requirementCategory || 'Core Subject'}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span className="truncate">{course.instructor.name}</span>
                    {course.room && (
                      <>
                        <span aria-hidden="true">&bull;</span>
                        <span className="truncate">{course.room}</span>
                      </>
                    )}
                  </div>

                  {/* Subject Compliance Badge */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Compliance:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${comp.badgeClass}`}
                      >
                        {comp.isCompliant ? '✓ Complying' : '⚠ Non-Compliant (<75%)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {comp.reason}
                    </div>
                  </div>

                  {/* Tripartite Breakdown Meters */}
                  <div className="mt-3.5 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Tripartite Component Standing:
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-500">Written 25%</div>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">
                          {summary.writtenWork.isGraded
                            ? `${summary.writtenWork.rawPercentage}%`
                            : '-'}
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-indigo-400 font-medium">Perf Task 50%</div>
                        <div className="font-mono font-bold text-indigo-300 mt-0.5">
                          {summary.performanceTask.isGraded
                            ? `${summary.performanceTask.rawPercentage}%`
                            : '-'}
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-500">Summative 25%</div>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">
                          {summary.summativeExam.isGraded
                            ? `${summary.summativeExam.rawPercentage}%`
                            : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footers */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectCourseDetail(course)}
                    className="text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View Tasks ({course.assessments.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenAssessmentModal(course)}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
                    >
                      + Add Task
                    </button>
                    {!comp.isCompliant && (
                      <button
                        onClick={() => onTriggerQuickAlert(course)}
                        className="px-2 py-1 text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors"
                        title="Send Remedial Warning Email"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Bottom Widgets: Upcoming Deliverables & Real-Time Email Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Left Column: Upcoming Performance Tasks & Deadlines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Upcoming Tasks & Assessments</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {upcomingDeliverables.length} Scheduled
            </span>
          </div>

          {upcomingDeliverables.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No pending tasks scheduled for this term.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeliverables.slice(0, 4).map(({ course, assessment }) => {
                const due = new Date(assessment.dueDate);
                const today = new Date();
                const diffDays = Math.ceil(
                  (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={assessment.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {course.code}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          &bull;
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {assessment.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{assessment.component}</span>
                        <span aria-hidden="true">&bull;</span>
                        <span>Due {assessment.dueDate}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          diffDays <= 3
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : diffDays <= 7
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {diffDays <= 0 ? 'Due Today' : `in ${diffDays}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Email Alerts Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Dispatched High School Email Notifications
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('emails')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Email Hub &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 4).map((notif) => {
              const formattedTime = new Date(notif.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => onOpenEmailPreview(notif)}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {notif.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {notif.previewText}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono">
                      <span>To: {notif.recipient}</span>
                      <span>&bull;</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    Delivered
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
