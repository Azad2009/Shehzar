import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Sparkles } from 'lucide-react';
import { Course, AcademicTerm, Assessment, SubjectCategory } from '../types/academic';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  terms: AcademicTerm[];
  initialCourse?: Course | null;
  activeTermId?: string;
}

const CATEGORIES: SubjectCategory[] = [
  'Core Subject',
  'Applied Track',
  'Specialized STEM',
  'Elective',
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  terms,
  initialCourse,
  activeTermId,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [termId, setTermId] = useState(activeTermId || terms[0]?.id || '');
  const [category, setCategory] = useState<SubjectCategory>('Core Subject');
  const [targetGrade, setTargetGrade] = useState<number>(90);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [room, setRoom] = useState('');
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (initialCourse) {
      setCode(initialCourse.code);
      setName(initialCourse.name);
      setTermId(initialCourse.termId);
      setCategory(initialCourse.requirementCategory || 'Core Subject');
      setTargetGrade(initialCourse.targetGrade);
      setTeacherName(initialCourse.instructor.name);
      setTeacherEmail(initialCourse.instructor.email);
      setRoom(initialCourse.room || '');
      setColor(initialCourse.color || 'indigo');
    } else {
      setCode('');
      setName('');
      setTermId(activeTermId || terms[0]?.id || '');
      setCategory('Core Subject');
      setTargetGrade(90);
      setTeacherName('');
      setTeacherEmail('');
      setRoom('');
      setColor('indigo');
    }
  }, [initialCourse, isOpen, activeTermId, terms]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    let defaultAssessments: Assessment[] = initialCourse ? initialCourse.assessments : [];

    if (!initialCourse) {
      // Starter DepEd 25% Written, 50% Performance, 25% Summative structure
      defaultAssessments = [
        {
          id: 'a_' + Date.now() + '_1',
          title: 'Quiz 1: Introductory Concepts',
          component: 'Written Work',
          type: 'Quiz',
          maxPoints: 50,
          earnedPoints: 46,
          dueDate: new Date().toISOString().split('T')[0],
          gradedDate: new Date().toISOString().split('T')[0],
          status: 'Graded',
          feedback: 'Great foundational mastery.',
        },
        {
          id: 'a_' + Date.now() + '_2',
          title: 'Performance Task 1: Practical Demonstration Output',
          component: 'Performance Task',
          type: 'Performance Task',
          maxPoints: 100,
          earnedPoints: 94,
          dueDate: new Date().toISOString().split('T')[0],
          gradedDate: new Date().toISOString().split('T')[0],
          status: 'Graded',
          feedback: 'High rubric scores on creativity and presentation.',
        },
        {
          id: 'a_' + Date.now() + '_3',
          title: 'Performance Task 2: Capstone Inquiry Portfolio',
          component: 'Performance Task',
          type: 'Performance Task',
          maxPoints: 100,
          earnedPoints: null,
          dueDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
          status: 'Upcoming',
        },
        {
          id: 'a_' + Date.now() + '_4',
          title: 'Quarterly Periodic Summative Examination',
          component: 'Summative Exam',
          type: 'Summative Exam',
          maxPoints: 100,
          earnedPoints: null,
          dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
          status: 'Upcoming',
        },
      ];
    }

    const courseData: Course = {
      id: initialCourse ? initialCourse.id : 'c_' + Date.now(),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      units: 4,
      termId: termId || terms[0]?.id || 'term_3',
      targetGrade: Number(targetGrade) || 90,
      requirementCategory: category,
      minPassingGrade: 75,
      instructor: {
        name: teacherName.trim() || 'Faculty Member',
        email: teacherEmail.trim() || 'faculty@mati-nchs.edu.ph',
      },
      room: room.trim() || undefined,
      color,
      assessments: defaultAssessments,
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {initialCourse ? 'Edit High School Subject' : 'Enroll High School Subject'}
              </h2>
              <p className="text-xs text-slate-400">Mati National Comprehensive High School</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MATH 13"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs uppercase font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subject Descriptive Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. General Biology 1"
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Academic Term
              </label>
              <select
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Grade (%)
              </label>
              <input
                type="number"
                min="75"
                max="100"
                value={targetGrade}
                onChange={(e) => setTargetGrade(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subject Teacher
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g. Mrs. Jocelyn Ramos"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Classroom / Room
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Bldg 4 - Rm 201"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!initialCourse && (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Automatic DepEd 25% - 50% - 25% Component Setup:</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                Subject will be automatically provisioned with starter tasks for <strong>Written Works (25%)</strong>, <strong>Performance Tasks (50%)</strong>, and <strong>Quarterly Assessment (25%)</strong>.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{initialCourse ? 'Save Changes' : 'Enroll Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
