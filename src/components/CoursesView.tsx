import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Percent,
  Sliders,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';
import { AcademicTerm, Course, Assessment, StudentProfile } from '../types/academic';
import {
  calculateHighSchoolGrade,
  getHighSchoolSubjectCompliance,
} from '../utils/academicCalculations';

interface CoursesViewProps {
  terms: AcademicTerm[];
  selectedTermId: string;
  setSelectedTermId: (id: string) => void;
  student: StudentProfile;
  onOpenCourseModal: (course?: Course) => void;
  onOpenAssessmentModal: (course: Course, assessment?: Assessment) => void;
  onDeleteAssessment: (courseId: string, assessmentId: string) => void;
  onSimulateCourse: (course: Course) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  terms,
  selectedTermId,
  setSelectedTermId,
  student,
  onOpenCourseModal,
  onOpenAssessmentModal,
  onDeleteAssessment,
  onSimulateCourse,
}) => {
  const currentTerm = terms.find((t) => t.id === selectedTermId) || terms[0];
  const [expandedCourseId, setExpandedCourseId] = useState<string>(
    currentTerm.courses[0]?.id || ''
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with 3 Term Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <span>Senior High School Curriculum & Syllabus Manager</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Subject Grades & Tripartite Assessment Breakdown
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              DepEd Order No. 8, s. 2015: Written Works 25% &bull; Performance Tasks 50% &bull; Quarterly Exams 25%
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedTermId(term.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  term.id === selectedTermId
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{term.name}</span>
                {term.isCurrent && (
                  <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">&bull; Active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Accordion / Breakdown List */}
      <div className="space-y-4">
        {currentTerm.courses.map((course) => {
          const summary = calculateHighSchoolGrade(course);
          const comp = getHighSchoolSubjectCompliance(course);
          const isExpanded = expandedCourseId === course.id;

          return (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              {/* Main Course Header Row */}
              <div
                onClick={() => setExpandedCourseId(isExpanded ? '' : course.id)}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      summary.currentGrade >= 90
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : summary.currentGrade >= 75
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {summary.currentGrade.toFixed(0)}%
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {course.code}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        &bull;
                      </span>
                      <span className="text-xs text-slate-400">
                        {course.requirementCategory || 'Core Subject'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">
                        &bull;
                      </span>
                      <span className="text-xs text-slate-400">
                        Teacher: {course.instructor.name}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-0.5">
                      {course.name}
                    </h3>

                    {/* High School Compliance Status Badge */}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold border inline-flex items-center gap-1 ${comp.badgeClass}`}
                      >
                        {comp.isCompliant ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{comp.badgeLabel}</span>
                      </span>

                      <span className="text-xs text-slate-400 hidden sm:inline">
                        &bull; {comp.reason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tripartite Quick Metrics */}
                <div className="flex items-center gap-4 shrink-0 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Written (25%)</div>
                      <div className="font-mono font-bold text-slate-200">
                        {summary.writtenWork.isGraded
                          ? `${summary.writtenWork.rawPercentage}%`
                          : '-'}
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-indigo-400 font-medium">Perf Task (50%)</div>
                      <div className="font-mono font-bold text-indigo-300">
                        {summary.performanceTask.isGraded
                          ? `${summary.performanceTask.rawPercentage}%`
                          : '-'}
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Summative (25%)</div>
                      <div className="font-mono font-bold text-slate-200">
                        {summary.summativeExam.isGraded
                          ? `${summary.summativeExam.rawPercentage}%`
                          : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400 pl-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Assessment Details */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 p-5 bg-slate-950/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Recorded Tasks & Assessment Ledger ({course.assessments.length} Tasks)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Each item maps directly to the 25% Written Works, 50% Performance Tasks, or 25% Quarterly Assessment components.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSimulateCourse(course);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Run What-If Simulator
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAssessmentModal(course);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Task Score</span>
                      </button>
                    </div>
                  </div>

                  {/* Assessments Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-4">Task Title & Category</th>
                          <th className="py-2.5 px-3">DepEd Component</th>
                          <th className="py-2.5 px-3 text-center">Score / Max</th>
                          <th className="py-2.5 px-3 text-center">Percentage</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {course.assessments.map((a) => {
                          const pct =
                            a.earnedPoints !== null && a.maxPoints > 0
                              ? Math.round((a.earnedPoints / a.maxPoints) * 1000) / 10
                              : null;

                          return (
                            <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-200">{a.title}</div>
                                {a.feedback && (
                                  <div className="text-[11px] text-slate-400 italic mt-0.5">
                                    "{a.feedback}"
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    a.component === 'Performance Task'
                                      ? 'bg-indigo-500/20 text-indigo-300'
                                      : a.component === 'Summative Exam'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-cyan-500/20 text-cyan-300'
                                  }`}
                                >
                                  {a.component}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                                {a.earnedPoints !== null ? `${a.earnedPoints}/${a.maxPoints}` : `- / ${a.maxPoints}`}
                              </td>

                              <td className="py-3 px-3 text-center font-mono font-bold">
                                {pct !== null ? (
                                  <span
                                    className={
                                      pct >= 90
                                        ? 'text-emerald-400'
                                        : pct >= 75
                                        ? 'text-slate-200'
                                        : 'text-rose-400'
                                    }
                                  >
                                    {pct}%
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Upcoming</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                                {a.dueDate}
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    a.status === 'Graded'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : 'bg-amber-500/10 text-amber-400'
                                  }`}
                                >
                                  {a.status}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => onOpenAssessmentModal(course, a)}
                                    className="text-slate-400 hover:text-white font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => onDeleteAssessment(course.id, a.id)}
                                    className="text-slate-500 hover:text-rose-400 font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
