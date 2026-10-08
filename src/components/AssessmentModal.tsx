import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar } from 'lucide-react';
import { Assessment, AssessmentType, GradingComponent, Course } from '../types/academic';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: Assessment, sendEmailAlert: boolean) => void;
  course: Course;
  initialAssessment?: Assessment | null;
}

const COMPONENTS: { id: GradingComponent; label: string; weight: string }[] = [
  { id: 'Written Work', label: 'Written Work / Quiz', weight: '25% Weight' },
  { id: 'Performance Task', label: 'Performance Task', weight: '50% Weight' },
  { id: 'Summative Exam', label: 'Summative / Quarterly Exam', weight: '25% Weight' },
];

const ASSESSMENT_TYPES: AssessmentType[] = [
  'Quiz',
  'Written Test',
  'Unit Test',
  'Seatwork',
  'Performance Task',
  'Laboratory Activity',
  'Group Project',
  'Oral Presentation',
  'Summative Exam',
  'Periodic Exam',
  'Quarterly Assessment',
];

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  course,
  initialAssessment,
}) => {
  const [title, setTitle] = useState('');
  const [component, setComponent] = useState<GradingComponent>('Performance Task');
  const [type, setType] = useState<AssessmentType>('Performance Task');
  const [maxPoints, setMaxPoints] = useState<number>(100);
  const [earnedPoints, setEarnedPoints] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGraded, setIsGraded] = useState(false);
  const [sendEmailAlert, setSendEmailAlert] = useState(true);

  useEffect(() => {
    if (initialAssessment) {
      setTitle(initialAssessment.title);
      setComponent(initialAssessment.component || 'Performance Task');
      setType(initialAssessment.type);
      setMaxPoints(initialAssessment.maxPoints);
      setEarnedPoints(
        initialAssessment.earnedPoints !== null ? String(initialAssessment.earnedPoints) : ''
      );
      setDueDate(initialAssessment.dueDate || '');
      setFeedback(initialAssessment.feedback || '');
      setIsGraded(initialAssessment.status === 'Graded');
    } else {
      setTitle('');
      setComponent('Performance Task');
      setType('Performance Task');
      setMaxPoints(100);
      setEarnedPoints('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setFeedback('');
      setIsGraded(false);
    }
  }, [initialAssessment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numericEarned = isGraded && earnedPoints.trim() !== '' ? Number(earnedPoints) : null;

    const assessmentData: Assessment = {
      id: initialAssessment ? initialAssessment.id : 'a_' + Date.now(),
      title: title.trim(),
      component,
      type,
      maxPoints: Number(maxPoints) || 100,
      earnedPoints: numericEarned,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      gradedDate: isGraded ? new Date().toISOString().split('T')[0] : undefined,
      status: isGraded && numericEarned !== null ? 'Graded' : 'Upcoming',
      feedback: feedback.trim() || undefined,
    };

    onSave(assessmentData, sendEmailAlert && isGraded);
    onClose();
  };

  const calculatedPercentage =
    isGraded && earnedPoints !== '' && maxPoints > 0
      ? Math.round((Number(earnedPoints) / maxPoints) * 1000) / 10
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              {course.code} &bull; {course.name}
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              {initialAssessment ? 'Edit Assessment / Task' : 'Add New Task or Score'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Performance Task: Laboratory Report, Quiz 2, Quarterly Exam"
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tripartite Component Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              DepEd Grading Component:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMPONENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setComponent(c.id);
                    if (c.id === 'Written Work') setType('Quiz');
                    if (c.id === 'Performance Task') setType('Performance Task');
                    if (c.id === 'Summative Exam') setType('Summative Exam');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                    component === c.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <div className="font-bold leading-tight">{c.label}</div>
                  <div className="text-[10px] opacity-80 mt-1 font-mono">{c.weight}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Task Specific Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AssessmentType)}
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Calendar className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Graded Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-200">
                  Task Has Been Graded / Evaluated
                </span>
                <p className="text-xs text-slate-400">
                  Record points to update the {component} component in real time
                </p>
              </div>
              <input
                type="checkbox"
                checked={isGraded}
                onChange={(e) => setIsGraded(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {isGraded && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/50 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Points Earned
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required={isGraded}
                    value={earnedPoints}
                    onChange={(e) => setEarnedPoints(e.target.value)}
                    placeholder="e.g. 95"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Possible Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {calculatedPercentage !== null && (
                  <div className="col-span-2 flex items-center justify-between px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs">
                    <span className="text-indigo-300">Raw Task Percentage:</span>
                    <span className="font-bold font-mono text-indigo-200">
                      {calculatedPercentage}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Teacher Feedback / Rubric Notes
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Very creative demonstration, neat calculations."
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email Notification Option */}
          {isGraded && (
            <div className="flex items-center gap-2.5 p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-xs text-blue-200">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmailAlert}
                onChange={(e) => setSendEmailAlert(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
              <label htmlFor="sendEmail" className="cursor-pointer">
                <strong>Dispatch Real-Time Email:</strong> Automatically send score report to student & parent email upon save.
              </label>
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
              <CheckCircle className="w-4 h-4" />
              <span>{initialAssessment ? 'Save Changes' : 'Record Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
