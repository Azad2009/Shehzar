import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Filter,
  ArrowRight,
  TrendingUp,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { AcademicTerm, Course, StudentProfile } from '../types/academic';
import {
  calculateHighSchoolGrade,
  getHighSchoolSubjectCompliance,
  calculateTermAverage,
  calculateYearlyGeneralAverage,
} from '../utils/academicCalculations';

interface ComplianceViewProps {
  terms: AcademicTerm[];
  selectedTermId: string;
  setSelectedTermId: (id: string) => void;
  student: StudentProfile;
  onSelectCourse: (course: Course) => void;
  onSimulateCourse: (course: Course) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  terms,
  selectedTermId,
  setSelectedTermId,
  student,
  onSelectCourse,
  onSimulateCourse,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'compliant' | 'deficit'>('all');
  const [activeTermFilter, setActiveTermFilter] = useState<string>('all');

  const yearlyStats = calculateYearlyGeneralAverage(terms);

  // Collect all courses across selected scope
  const coursesToAudit: { course: Course; term: AcademicTerm }[] = [];
  terms.forEach((term) => {
    if (activeTermFilter === 'all' || activeTermFilter === term.id) {
      term.courses.forEach((c) => {
        coursesToAudit.push({ course: c, term });
      });
    }
  });

  const filteredCourses = coursesToAudit.filter(({ course }) => {
    const comp = getHighSchoolSubjectCompliance(course);
    if (filterMode === 'compliant') return comp.isCompliant;
    if (filterMode === 'deficit') return !comp.isCompliant;
    return true;
  });

  const totalFiltered = coursesToAudit.length;
  const compliantCount = coursesToAudit.filter(({ course }) =>
    getHighSchoolSubjectCompliance(course).isCompliant
  ).length;
  const deficitCount = totalFiltered - compliantCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DepEd Curriculum & Graduation Audit &bull; 3-Term System</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Subject Compliance & Passing Standards Inspector
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.schoolName} &bull; {student.gradeLevel} ({student.strand})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[11px] text-slate-400 font-medium">Yearly General Average</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {yearlyStats.yearlyAverage.toFixed(1)}%
              </div>
            </div>
            <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[11px] text-slate-400 font-medium">Compliance Rate</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {yearlyStats.overallComplianceRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Terms Compliance Summary Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {terms.map((term, index) => {
          const tStats = calculateTermAverage(term.courses);
          const isSelected = activeTermFilter === term.id;
          const passingRate = tStats.complianceRate;

          return (
            <div
              key={term.id}
              onClick={() => setActiveTermFilter(isSelected ? 'all' : term.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{term.name}</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                  Avg: {tStats.generalAverage.toFixed(1)}%
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between text-xs">
                <span className="text-slate-400">
                  {tStats.passingCount} of {term.courses.length} Subjects Comply
                </span>
                <span
                  className={`font-semibold font-mono ${
                    passingRate === 100 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {passingRate}% Compliant
                </span>
              </div>

              <div className="mt-2 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    passingRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${passingRate}%` }}
                />
              </div>

              <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{term.schoolYear}</span>
                <span className="text-indigo-400 font-medium">
                  {isSelected ? 'Active Filter ✓' : 'Click to filter'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Subjects:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Subjects ({totalFiltered})
          </button>
          <button
            onClick={() => setFilterMode('compliant')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'compliant'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Compliant / Passed ({compliantCount})
          </button>
          <button
            onClick={() => setFilterMode('deficit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterMode === 'deficit'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Deficit / Remedial Required ({deficitCount})
          </button>
        </div>

        {activeTermFilter !== 'all' && (
          <button
            onClick={() => setActiveTermFilter('all')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear Term Filter &rarr;
          </button>
        )}
      </div>

      {/* Compliance Detailed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Subject Tripartite Compliance Audit Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              DepEd DepEd Order No. 8, s. 2015: Written 25% &bull; Performance 50% &bull; Quarterly Exam 25% (Passing Mark: 75%)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredCourses.length} Subjects Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subject & Teacher</th>
                <th className="py-3 px-3">Term</th>
                <th className="py-3 px-3">Track Category</th>
                <th className="py-3 px-3 text-center">Written Work (25%)</th>
                <th className="py-3 px-3 text-center">Performance Task (50%)</th>
                <th className="py-3 px-3 text-center">Quarterly Exam (25%)</th>
                <th className="py-3 px-3 text-right">Final Standing</th>
                <th className="py-3 px-4 text-center">Compliance Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCourses.map(({ course, term }) => {
                const summary = calculateHighSchoolGrade(course);
                const comp = getHighSchoolSubjectCompliance(course);

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {course.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-indigo-400 font-semibold">{course.code}</span>
                        <span>&bull;</span>
                        <span>{course.instructor.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {term.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                      {course.requirementCategory || 'Core Subject'}
                    </td>

                    {/* Written Work 25% */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {summary.writtenWork.isGraded ? (
                        <div>
                          <div className="font-mono font-bold text-slate-200">
                            {summary.writtenWork.rawPercentage}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {summary.writtenWork.weightedScore.toFixed(1)} / 25 pts
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Performance Task 50% */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {summary.performanceTask.isGraded ? (
                        <div>
                          <div className="font-mono font-bold text-slate-200">
                            {summary.performanceTask.rawPercentage}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {summary.performanceTask.weightedScore.toFixed(1)} / 50 pts
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Summative Exam 25% */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {summary.summativeExam.isGraded ? (
                        <div>
                          <div className="font-mono font-bold text-slate-200">
                            {summary.summativeExam.rawPercentage}%
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {summary.summativeExam.weightedScore.toFixed(1)} / 25 pts
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">Upcoming</span>
                      )}
                    </td>

                    {/* Final Standing */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div
                        className={`text-base font-black font-mono tabular-nums ${
                          summary.currentGrade >= 90
                            ? 'text-emerald-400'
                            : summary.currentGrade >= 75
                            ? 'text-indigo-300'
                            : 'text-rose-400'
                        }`}
                      >
                        {summary.currentGrade}%
                      </div>
                      <div className="text-[10px] text-slate-400">{summary.descriptor}</div>
                    </td>

                    {/* Compliance Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-flex items-center gap-1 ${comp.badgeClass}`}
                      >
                        {comp.isCompliant ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{summary.currentGrade >= 90 ? 'With Honors' : 'Complies'}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>Remedial Required</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md font-medium transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onSimulateCourse(course)}
                          className="px-2 py-1 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800 rounded-md font-medium transition-colors"
                          title="Simulate target score"
                        >
                          Simulate
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
    </div>
  );
};
