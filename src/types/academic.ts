export type GradingComponent =
  | 'Written Work'      // 25% (Quizzes & Written Tests)
  | 'Performance Task'  // 50% (Projects, Labs, Practical Tasks)
  | 'Summative Exam';   // 25% (Summative Tests & Periodical Exams)

export const COMPONENT_WEIGHTS: Record<GradingComponent, number> = {
  'Written Work': 25,
  'Performance Task': 50,
  'Summative Exam': 25,
};

export type AssessmentType =
  | 'Quiz'
  | 'Written Test'
  | 'Unit Test'
  | 'Seatwork'
  | 'Performance Task'
  | 'Laboratory Activity'
  | 'Group Project'
  | 'Oral Presentation'
  | 'Summative Exam'
  | 'Periodic Exam'
  | 'Quarterly Assessment';

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  component: GradingComponent; // 'Written Work' (25%) | 'Performance Task' (50%) | 'Summative Exam' (25%)
  maxPoints: number;
  earnedPoints: number | null; // null if pending
  dueDate: string;
  gradedDate?: string;
  status: 'Graded' | 'Upcoming' | 'Pending';
  feedback?: string;
}

export interface Teacher {
  name: string;
  email: string;
  room?: string;
}

export type SubjectCategory =
  | 'Core Subject'
  | 'Applied Track'
  | 'Specialized STEM'
  | 'Elective';

export interface Course {
  id: string;
  code: string; // e.g. "MATH 11"
  name: string; // e.g. "General Mathematics"
  units: number; // academic units / hours
  termId: string;
  instructor: Teacher;
  color: string;
  targetGrade: number; // e.g. 90%
  assessments: Assessment[];
  room?: string;
  notes?: string;
  requirementCategory?: SubjectCategory;
  minPassingGrade?: number; // standard 75%
}

export interface AcademicTerm {
  id: string;
  name: string; // "1st Term", "2nd Term", "3rd Term"
  schoolYear: string; // e.g. "S.Y. 2026 - 2027"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  courses: Course[];
}

export interface StudentProfile {
  name: string;
  email: string;
  guardianEmail?: string;
  studentId: string;
  lrn: string; // Learner Reference Number
  gradeLevel: string; // "Grade 11 - Senior High School"
  section: string; // "Section A - STEM Curie"
  strand: string; // "STEM (Science, Technology, Engineering & Math)"
  schoolName: string;
  targetGeneralAverage: number; // e.g. 90.0
  avatarUrl: string;
  passingScoreThreshold: number; // 75.0
}

export interface NotificationPreference {
  emailEnabled: boolean;
  recipientEmail: string;
  guardianEmailAlerts: boolean;
  gradeDropAlert: boolean;
  gradeDropThreshold: number; // default 75% (Passing standard)
  newGradePosted: boolean;
  upcomingDeadlines: boolean;
  weeklyDigest: boolean;
  honorsCelebration: boolean;
  soundAlerts: boolean;
}

export type NotificationType =
  | 'grade_drop'
  | 'new_grade'
  | 'deadline'
  | 'weekly_digest'
  | 'milestone'
  | 'test';

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: NotificationType;
  subject: string;
  recipient: string;
  status: 'Delivered' | 'Queued';
  previewText: string;
  htmlBody: string;
  read: boolean;
  courseCode?: string;
  metadata?: {
    courseName?: string;
    previousGrade?: number;
    newGrade?: number;
    average?: number;
    assessmentName?: string;
    dueDate?: string;
  };
}
