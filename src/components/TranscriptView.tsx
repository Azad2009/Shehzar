import React, { useRef } from 'react';
import { Printer, Download, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AcademicTerm, StudentProfile, Course } from '../types/academic';
import {
  calculateHighSchoolGrade,
  calculateTermAverage,
  calculateYearlyGeneralAverage,
  getHighSchoolDescriptor,
} from '../utils/academicCalculations';

interface TranscriptViewProps {
  student: StudentProfile;
  terms: AcademicTerm[];
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ student, terms }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const yearlyStats = calculateYearlyGeneralAverage(terms);

  // Group unique subject titles across terms to display in Form 138 rows
  const allSubjectCodes = Array.from(
    new Set(terms.flatMap((t) => t.courses.map((c) => c.name)))
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      student,
      school: student.schoolName,
      academicYear: 'S.Y. 2026 - 2027',
      gradingSystem: {
        writtenWork: '25%',
        performanceTask: '50%',
        quarterlyExam: '25%',
      },
      terms: terms.map((t) => ({
        term: t.name,
        average: calculateTermAverage(t.courses).generalAverage,
        courses: t.courses.map((c) => ({
          code: c.code,
          name: c.name,
          category: c.requirementCategory,
          ...calculateHighSchoolGrade(c),
        })),
      })),
      yearlyGeneralAverage: yearlyStats.yearlyAverage,
      standing: yearlyStats.yearlyAverage >= 90 ? 'With Honors' : 'Passed',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MNCHS_SF9_ReportCard_${student.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>DepEd Form 138 / SF9 Official Report Card</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Official Transcript
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mati National Comprehensive High School &bull; Senior High School Permanent Academic Record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Form 138 / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Card Document Area */}
      <div
        ref={printAreaRef}
        className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 max-w-4xl mx-auto"
      >
        {/* DepEd Institutional Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            Republic of the Philippines &bull; Department of Education
          </div>
          <div className="text-xs font-bold uppercase text-slate-700 mt-0.5">
            Region XI &bull; Division of Mati City &bull; District of Mati Central
          </div>
          <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight mt-1">
            Mati National Comprehensive High School
          </h1>
          <div className="text-xs text-slate-600 font-medium">
            Sait, Mati City, Davao Oriental &bull; School ID: 304261
          </div>
          <div className="mt-3 inline-block px-4 py-1 bg-slate-100 border border-slate-300 rounded font-bold text-xs uppercase tracking-wider text-slate-900">
            Progress Report Card &bull; Senior High School (DepEd SF9)
          </div>
        </div>

        {/* Student Learner Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 py-4 border-b border-slate-300 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Learner Name:</span>
            <div className="font-bold text-slate-950 uppercase">{student.name}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">LRN:</span>
            <div className="font-mono font-bold text-slate-950">{student.lrn}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Grade & Section:</span>
            <div className="font-bold text-slate-950">{student.gradeLevel} - {student.section}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Track & Strand:</span>
            <div className="font-bold text-slate-950">{student.strand}</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">School Year:</span>
            <div className="font-bold text-slate-950">2026 - 2027</div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Curriculum Standards:</span>
            <div className="font-bold text-slate-950">K to 12 Basic Education</div>
          </div>
        </div>

        {/* 3-Term Grades Table */}
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-400 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-bold uppercase">
                <th className="py-2.5 px-3 border-r border-slate-400 w-1/3">Subjects / Learning Areas</th>
                <th className="py-2.5 px-2 border-r border-slate-400 text-center w-20">1st Term</th>
                <th className="py-2.5 px-2 border-r border-slate-400 text-center w-20">2nd Term</th>
                <th className="py-2.5 px-2 border-r border-slate-400 text-center w-20">3rd Term</th>
                <th className="py-2.5 px-2 border-r border-slate-400 text-center w-24">Final Rating</th>
                <th className="py-2.5 px-3 text-center">Remarks / Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {terms[2].courses.map((courseCurrent, idx) => {
                // Find matching or sequential subjects
                const t1Course = terms[0]?.courses[idx];
                const t2Course = terms[1]?.courses[idx];
                const t3Course = courseCurrent;

                const g1 = t1Course ? calculateHighSchoolGrade(t1Course).currentGrade : 92.0;
                const g2 = t2Course ? calculateHighSchoolGrade(t2Course).currentGrade : 91.5;
                const g3 = t3Course ? calculateHighSchoolGrade(t3Course).currentGrade : 89.0;

                const finalRating = Math.round(((g1 + g2 + g3) / 3) * 10) / 10;
                const isPassed = finalRating >= 75.0;

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 border-r border-slate-300 font-semibold text-slate-900">
                      <div>{t3Course.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {t3Course.code} &bull; {t3Course.requirementCategory}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-800">
                      {g1.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-800">
                      {g2.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-bold text-slate-800">
                      {g3.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-black text-slate-950 text-sm">
                      {finalRating.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          finalRating >= 90
                            ? 'text-emerald-800 bg-emerald-100'
                            : isPassed
                            ? 'text-blue-800 bg-blue-100'
                            : 'text-rose-800 bg-rose-100'
                        }`}
                      >
                        {finalRating >= 90 ? 'Passed (With Honors)' : isPassed ? 'Passed' : 'Remedial'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* General Average Row */}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                <td className="py-3 px-3 border-r border-slate-400 uppercase text-slate-950">
                  General Average (GWA)
                </td>
                <td className="py-3 px-2 border-r border-slate-400 text-center font-mono text-sm">
                  {calculateTermAverage(terms[0].courses).generalAverage.toFixed(0)}
                </td>
                <td className="py-3 px-2 border-r border-slate-400 text-center font-mono text-sm">
                  {calculateTermAverage(terms[1].courses).generalAverage.toFixed(0)}
                </td>
                <td className="py-3 px-2 border-r border-slate-400 text-center font-mono text-sm">
                  {calculateTermAverage(terms[2].courses).generalAverage.toFixed(0)}
                </td>
                <td className="py-3 px-2 border-r border-slate-400 text-center font-mono text-base text-emerald-800">
                  {yearlyStats.yearlyAverage.toFixed(1)}
                </td>
                <td className="py-3 px-3 text-center text-emerald-800 uppercase font-black tracking-wide">
                  {yearlyStats.yearlyAverage >= 90 ? 'Qualified for Honors' : 'Passed / Promoted'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DepEd Grading Scale Legend */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="font-bold text-slate-800">Outstanding:</span>
            <div className="text-slate-600 font-mono">90 - 100 (Passed)</div>
          </div>
          <div>
            <span className="font-bold text-slate-800">Very Satisfactory:</span>
            <div className="text-slate-600 font-mono">85 - 89 (Passed)</div>
          </div>
          <div>
            <span className="font-bold text-slate-800">Satisfactory:</span>
            <div className="text-slate-600 font-mono">80 - 84 (Passed)</div>
          </div>
          <div>
            <span className="font-bold text-slate-800">Fairly Satisfactory:</span>
            <div className="text-slate-600 font-mono">75 - 79 (Passing Mark: 75)</div>
          </div>
        </div>

        {/* Tripartite System Statement */}
        <div className="mt-3 text-[11px] text-slate-500 text-center italic">
          Grades computed in accordance with DepEd Order No. 8, s. 2015: Written Works (25%), Performance Tasks (50%), and Quarterly Assessment (25%).
        </div>

        {/* Signatures Block */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="font-bold text-slate-950 uppercase tracking-wide border-b border-slate-900 pb-1 mx-8">
              Mrs. Jocelyn Ramos
            </div>
            <div className="text-slate-600 mt-1">Class Adviser / STEM Coordinator</div>
          </div>
          <div>
            <div className="font-bold text-slate-950 uppercase tracking-wide border-b border-slate-900 pb-1 mx-8">
              Dr. Antonio S. Mercado, EdD
            </div>
            <div className="text-slate-600 mt-1">Secondary School Principal IV</div>
          </div>
        </div>
      </div>
    </div>
  );
};
