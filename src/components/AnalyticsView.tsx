import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AcademicTerm, Course, StudentProfile, GradingComponent } from '../types/academic';
import {
  calculateHighSchoolGrade,
  calculateTermAverage,
  calculateYearlyGeneralAverage,
  calculateRequiredScoreForTarget,
  getHighSchoolDescriptor,
} from '../utils/academicCalculations';

interface AnalyticsViewProps {
  terms: AcademicTerm[];
  student: StudentProfile;
  onSelectCourse: (course: Course) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  terms,
  student,
  onSelectCourse,
}) => {
  const currentTerm = terms.find((t) => t.isCurrent) || terms[terms.length - 1];

  // Selected subject for simulator
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string>(
    currentTerm.courses[0]?.id || ''
  );
  const [simulatorComponent, setSimulatorComponent] = useState<GradingComponent>('Performance Task');
  const [targetSubjectGrade, setTargetSubjectGrade] = useState<number>(90);

  const yearlyStats = calculateYearlyGeneralAverage(terms);

  // Component averages across the academic year
  let totalWrittenScore = 0;
  let totalWrittenCount = 0;
  let totalPerfScore = 0;
  let totalPerfCount = 0;
  let totalExamScore = 0;
  let totalExamCount = 0;

  terms.forEach((term) => {
    term.courses.forEach((c) => {
      const g = calculateHighSchoolGrade(c);
      if (g.writtenWork.isGraded) {
        totalWrittenScore += g.writtenWork.rawPercentage;
        totalWrittenCount++;
      }
      if (g.performanceTask.isGraded) {
        totalPerfScore += g.performanceTask.rawPercentage;
        totalPerfCount++;
      }
      if (g.summativeExam.isGraded) {
        totalExamScore += g.summativeExam.rawPercentage;
        totalExamCount++;
      }
    });
  });

  const avgWritten = totalWrittenCount > 0 ? Math.round((totalWrittenScore / totalWrittenCount) * 10) / 10 : 0;
  const avgPerf = totalPerfCount > 0 ? Math.round((totalPerfScore / totalPerfCount) * 10) / 10 : 0;
  const avgExam = totalExamCount > 0 ? Math.round((totalExamScore / totalExamCount) * 10) / 10 : 0;

  // Find simulated course
  const allCourses = terms.flatMap((t) => t.courses);
  const selectedCourse = allCourses.find((c) => c.id === simulatorSubjectId) || allCourses[0];

  const simulationResult = selectedCourse
    ? calculateRequiredScoreForTarget(selectedCourse, targetSubjectGrade, simulatorComponent)
    : null;

  // Check honors eligibility: GWA >= 90 and no subject < 75 in any term
  let hasFailingSubject = false;
  terms.forEach((t) => {
    t.courses.forEach((c) => {
      if (calculateHighSchoolGrade(c).currentGrade < 75) {
        hasFailingSubject = true;
      }
    });
  });

  const isHonorsEligible = yearlyStats.yearlyAverage >= 90.0 && !hasFailingSubject;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Academic Performance Analytics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              General Average Trends & What-If Simulator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.schoolName} &bull; S.Y. 2026 - 2027
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
              <div className="text-[11px] text-slate-400 font-medium">Academic Standing</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                <Award className="w-4 h-4" />
                <span>{isHonorsEligible ? 'With Honors Qualifier' : 'In Good Standing'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Term Trend Visualization & Component Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3-Term Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">3-Term General Average Progression</h3>
                <p className="text-xs text-slate-400">
                  Continuous performance tracking across 1st, 2nd, and 3rd Terms.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>Term Average</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Honors Cutoff (90%)</span>
                </div>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="h-56 w-full relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                {/* 90% Honors Line */}
                <line
                  x1="30"
                  y1="60"
                  x2="480"
                  y2="60"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <text x="485" y="64" fill="#10b981" fontSize="10" fontFamily="monospace">
                  90.0%
                </text>

                {/* 75% Passing Line */}
                <line
                  x1="30"
                  y1="140"
                  x2="480"
                  y2="140"
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                  opacity="0.4"
                />
                <text x="485" y="144" fill="#ef4444" fontSize="10" fontFamily="monospace">
                  75.0%
                </text>

                {/* Coordinate mapping for 3 terms */}
                {(() => {
                  const points = terms.map((term, i) => {
                    const avg = calculateTermAverage(term.courses).generalAverage;
                    // map average (60% to 100%) to y (170 down to 20)
                    const x = 90 + i * 160;
                    const y = 180 - ((avg - 60) / 40) * 160;
                    return { x, y, avg, name: term.name };
                  });

                  const pathD = points.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );

                  return (
                    <>
                      {/* Gradient Area under line */}
                      <path
                        d={`${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`}
                        fill="url(#trendGrad)"
                        opacity="0.25"
                      />
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Main connecting line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Nodes */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="6"
                            fill="#0f172a"
                            stroke="#6366f1"
                            strokeWidth="3"
                          />
                          <circle cx={p.x} cy={p.y} r="2.5" fill="#ffffff" />
                          <text
                            x={p.x}
                            y={p.y - 12}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {p.avg.toFixed(1)}%
                          </text>
                          <text
                            x={p.x}
                            y={175}
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {p.name}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Overall S.Y. General Average: <strong className="text-white font-mono">{yearlyStats.yearlyAverage.toFixed(1)}%</strong></span>
            <span>Target: <strong className="text-emerald-400 font-mono">{student.targetGeneralAverage.toFixed(1)}% (With Honors)</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Component Mastery 25 - 50 - 25 Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Component Weight Mastery</h3>
            <p className="text-xs text-slate-400 mb-4">
              DepEd tripartite distribution performance across all subjects.
            </p>

            <div className="space-y-4">
              {/* Written Work 25% */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-slate-200">Written Work & Quizzes</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">25% Weight</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    {avgWritten.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {((avgWritten * 0.25)).toFixed(1)} / 25.0 pts
                  </span>
                </div>
                <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, avgWritten)}%` }}
                  />
                </div>
              </div>

              {/* Performance Tasks 50% */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <span className="font-semibold text-slate-200">Performance Tasks</span>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold text-[11px]">50% Highest Weight</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    {avgPerf.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {((avgPerf * 0.50)).toFixed(1)} / 50.0 pts
                  </span>
                </div>
                <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, avgPerf)}%` }}
                  />
                </div>
              </div>

              {/* Summative Exams 25% */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-slate-200">Quarterly Summative Exams</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">25% Weight</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    {avgExam.toFixed(1)}%
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {((avgExam * 0.25)).toFixed(1)} / 25.0 pts
                  </span>
                </div>
                <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, avgExam)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time "What-If" Subject Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Real-Time High School Target Grade Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Calculate what score you need on upcoming Performance Tasks (50%) or Summative Exams (25%).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Subject to Simulate:
              </label>
              <select
                value={simulatorSubjectId}
                onChange={(e) => setSimulatorSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.name} ({calculateHighSchoolGrade(c).currentGrade}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upcoming Component to Score:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatorComponent('Performance Task')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                    simulatorComponent === 'Performance Task'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div>Performance Task</div>
                  <div className="text-[10px] font-mono opacity-80">50% Weight</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorComponent('Summative Exam')}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                    simulatorComponent === 'Summative Exam'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <div>Quarterly Exam</div>
                  <div className="text-[10px] font-mono opacity-80">25% Weight</div>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
                <span>Desired Final Subject Grade:</span>
                <span className="font-mono text-indigo-400 text-sm font-bold">
                  {targetSubjectGrade}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="98"
                step="1"
                value={targetSubjectGrade}
                onChange={(e) => setTargetSubjectGrade(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>75% (Passing)</span>
                <span>85% (Very Satisfactory)</span>
                <span>90% (With Honors)</span>
                <span>95%+ (High Honors)</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            {selectedCourse && simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-indigo-400">
                      {selectedCourse.code} &bull; {selectedCourse.requirementCategory}
                    </div>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      {selectedCourse.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Teacher: {selectedCourse.instructor.name}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Current Standing</div>
                    <div className="text-2xl font-black font-mono text-white tabular-nums">
                      {calculateHighSchoolGrade(selectedCourse).currentGrade}%
                    </div>
                  </div>
                </div>

                {/* Score Required Hero Display */}
                <div
                  className={`p-4 rounded-xl border ${
                    simulationResult.isFeasible
                      ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Score Needed on Upcoming {simulatorComponent}:
                      </div>
                      <div className="text-3xl font-black font-mono mt-1 tabular-nums">
                        {simulationResult.requiredPercentage}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold border ${
                          simulationResult.isFeasible
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {simulationResult.isFeasible ? '✓ Realistically Achievable' : '⚠ Extra Credit Required'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs mt-3 opacity-90 leading-relaxed">
                    {simulationResult.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-slate-400">Target Descriptor:</span>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {getHighSchoolDescriptor(targetSubjectGrade).descriptor}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-slate-400">Target Honors Tag:</span>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      {getHighSchoolDescriptor(targetSubjectGrade).honorsTag || 'Regular Pass'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>DepEd Form 138 compliant calculations</span>
              {selectedCourse && (
                <button
                  onClick={() => onSelectCourse(selectedCourse)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <span>Open Subject Syllabus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
