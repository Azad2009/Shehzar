/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CoursesView } from './components/CoursesView';
import { ComplianceView } from './components/ComplianceView';
import { AnalyticsView } from './components/AnalyticsView';
import { EmailCenterView } from './components/EmailCenterView';
import { TranscriptView } from './components/TranscriptView';
import { CourseModal } from './components/CourseModal';
import { AssessmentModal } from './components/AssessmentModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  AcademicTerm,
  Course,
  Assessment,
  StudentProfile,
  NotificationLog,
  NotificationPreference,
} from './types/academic';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_TERMS,
  INITIAL_NOTIFICATIONS,
} from './data/initialData';
import {
  loadStoredNotifications,
  saveStoredNotifications,
  loadStoredPreferences,
  saveStoredPreferences,
  buildNewGradeNotification,
  buildLowGradeNotification,
  buildTestVerificationNotification,
  playNotificationSound,
} from './services/notificationService';
import { calculateHighSchoolGrade } from './utils/academicCalculations';

const TERMS_STORAGE_KEY = 'mnchs_academic_terms_v1';

export default function App() {
  const [terms, setTerms] = useState<AcademicTerm[]>(() => {
    try {
      const saved = localStorage.getItem(TERMS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TERMS;
  });

  const [selectedTermId, setSelectedTermId] = useState<string>('term_3');
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const loaded = loadStoredNotifications();
    return loaded.length > 0 ? loaded : INITIAL_NOTIFICATIONS;
  });

  const [preferences, setPreferences] = useState<NotificationPreference>(loadStoredPreferences());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [courseForAssessment, setCourseForAssessment] = useState<Course | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const [previewNotification, setPreviewNotification] = useState<NotificationLog | null>(null);

  // Save terms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(terms));
    } catch (err) {
      console.error('Error saving terms:', err);
    }
  }, [terms]);

  // Save notifications to localStorage
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Save preferences
  const handleUpdatePreferences = (newPrefs: NotificationPreference) => {
    setPreferences(newPrefs);
    saveStoredPreferences(newPrefs);
    addToast({
      id: 'toast_' + Date.now(),
      type: 'success',
      title: 'Preferences Updated',
      message: `Alert settings saved for ${newPrefs.recipientEmail}`,
    });
  };

  const addToast = (toast: ToastMessage) => {
    setToasts((prev) => [toast, ...prev.slice(0, 4)]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDispatchNotification = (notif: NotificationLog) => {
    setNotifications((prev) => [notif, ...prev]);
    addToast({
      id: 'toast_' + Date.now(),
      type: 'email',
      title: 'Email Alert Dispatched',
      message: `${notif.subject} → delivered to ${notif.recipient}`,
    });
  };

  // Course handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course?: Course) => {
    setEditingCourse(course || null);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (savedCourse: Course) => {
    setTerms((prevTerms) =>
      prevTerms.map((term) => {
        if (term.id === savedCourse.termId) {
          const exists = term.courses.some((c) => c.id === savedCourse.id);
          const updatedCourses = exists
            ? term.courses.map((c) => (c.id === savedCourse.id ? savedCourse : c))
            : [...term.courses, savedCourse];
          return { ...term, courses: updatedCourses };
        }
        return term;
      })
    );

    addToast({
      id: 'toast_' + Date.now(),
      type: 'success',
      title: editingCourse ? 'Subject Updated' : 'Subject Enrolled',
      message: `${savedCourse.name} (${savedCourse.code}) enrolled with 25-50-25 DepEd components.`,
    });
  };

  // Assessment handlers
  const handleOpenAddAssessment = (course: Course) => {
    setCourseForAssessment(course);
    setEditingAssessment(null);
    setIsAssessmentModalOpen(true);
  };

  const handleOpenEditAssessment = (course: Course, assessment?: Assessment) => {
    setCourseForAssessment(course);
    setEditingAssessment(assessment || null);
    setIsAssessmentModalOpen(true);
  };

  const handleSaveAssessment = (savedAssessment: Assessment, sendEmailAlert: boolean) => {
    if (!courseForAssessment) return;

    let targetCourseUpdated: Course | null = null;

    setTerms((prevTerms) =>
      prevTerms.map((term) => ({
        ...term,
        courses: term.courses.map((course) => {
          if (course.id === courseForAssessment.id) {
            const exists = course.assessments.some((a) => a.id === savedAssessment.id);
            const updatedAssessments = exists
              ? course.assessments.map((a) => (a.id === savedAssessment.id ? savedAssessment : a))
              : [...course.assessments, savedAssessment];

            const updatedCourse = { ...course, assessments: updatedAssessments };
            targetCourseUpdated = updatedCourse;
            return updatedCourse;
          }
          return course;
        }),
      }))
    );

    addToast({
      id: 'toast_' + Date.now(),
      type: 'success',
      title: 'Score Recorded & GPA Recalculated',
      message: `${savedAssessment.title} added to ${courseForAssessment.code} (${savedAssessment.component}).`,
    });

    // Check if email notification should be sent
    if (sendEmailAlert && targetCourseUpdated) {
      if (preferences.soundAlerts) playNotificationSound();

      const notif = buildNewGradeNotification({
        student,
        course: targetCourseUpdated,
        assessment: {
          title: savedAssessment.title,
          earned: savedAssessment.earnedPoints || 0,
          max: savedAssessment.maxPoints,
          component: savedAssessment.component,
          type: savedAssessment.type,
          feedback: savedAssessment.feedback,
        },
        recipientEmail: preferences.recipientEmail,
      });

      handleDispatchNotification(notif);

      // Check for remedial alert if course grade is below 75%
      const summary = calculateHighSchoolGrade(targetCourseUpdated);
      if (summary.currentGrade < 75 && preferences.gradeDropAlert) {
        setTimeout(() => {
          const dropNotif = buildLowGradeNotification({
            student,
            course: targetCourseUpdated!,
            threshold: 75,
            recipientEmail: preferences.recipientEmail,
          });
          handleDispatchNotification(dropNotif);
        }, 1200);
      }
    }
  };

  const handleDeleteAssessment = (courseId: string, assessmentId: string) => {
    setTerms((prevTerms) =>
      prevTerms.map((term) => ({
        ...term,
        courses: term.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              assessments: course.assessments.filter((a) => a.id !== assessmentId),
            };
          }
          return course;
        }),
      }))
    );

    addToast({
      id: 'toast_' + Date.now(),
      type: 'info',
      title: 'Task Removed',
      message: 'Assessment score deleted and subject average recalculated.',
    });
  };

  const handleTriggerQuickAlert = (course: Course) => {
    if (preferences.soundAlerts) playNotificationSound();
    const notif = buildLowGradeNotification({
      student,
      course,
      threshold: 75,
      recipientEmail: preferences.recipientEmail,
    });
    handleDispatchNotification(notif);
  };

  const handleSimulateCourse = (course: Course) => {
    setActiveTab('analytics');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    addToast({
      id: 'toast_' + Date.now(),
      type: 'info',
      title: 'Log Cleared',
      message: 'Notification history cleared.',
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        student={student}
        unreadCount={unreadCount}
        onOpenAddCourse={handleOpenAddCourse}
        onTriggerQuickEmail={() => {
          if (preferences.soundAlerts) playNotificationSound();
          const notif = buildTestVerificationNotification({
            student,
            recipientEmail: preferences.recipientEmail,
          });
          handleDispatchNotification(notif);
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            terms={terms}
            selectedTermId={selectedTermId}
            setSelectedTermId={setSelectedTermId}
            student={student}
            notifications={notifications}
            onOpenCourseModal={handleOpenEditCourse}
            onOpenAssessmentModal={handleOpenAddAssessment}
            onSelectCourseDetail={(c) => {
              setActiveTab('courses');
            }}
            onOpenEmailPreview={(n) => setPreviewNotification(n)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onTriggerQuickAlert={handleTriggerQuickAlert}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            terms={terms}
            selectedTermId={selectedTermId}
            setSelectedTermId={setSelectedTermId}
            student={student}
            onOpenCourseModal={handleOpenEditCourse}
            onOpenAssessmentModal={handleOpenAddAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onSimulateCourse={handleSimulateCourse}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceView
            terms={terms}
            selectedTermId={selectedTermId}
            setSelectedTermId={setSelectedTermId}
            student={student}
            onSelectCourse={(c) => setActiveTab('courses')}
            onSimulateCourse={handleSimulateCourse}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            terms={terms}
            student={student}
            onSelectCourse={(c) => setActiveTab('courses')}
          />
        )}

        {activeTab === 'emails' && (
          <EmailCenterView
            student={student}
            terms={terms}
            notifications={notifications}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onDispatchNotification={handleDispatchNotification}
            onOpenEmailPreview={(n) => setPreviewNotification(n)}
            onClearNotifications={handleClearNotifications}
          />
        )}

        {activeTab === 'transcript' && (
          <TranscriptView student={student} terms={terms} />
        )}
      </main>

      {/* Modals */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        terms={terms}
        initialCourse={editingCourse}
        activeTermId={selectedTermId}
      />

      {courseForAssessment && (
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          onSave={handleSaveAssessment}
          course={courseForAssessment}
          initialAssessment={editingAssessment}
        />
      )}

      <EmailPreviewModal
        notification={previewNotification}
        onClose={() => setPreviewNotification(null)}
        onResend={(n) => {
          handleDispatchNotification({
            ...n,
            id: 'notif_' + Date.now(),
            timestamp: new Date().toISOString(),
          });
        }}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
