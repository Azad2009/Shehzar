import { NotificationLog, NotificationPreference, Course, AcademicTerm, StudentProfile } from '../types/academic';
import { calculateHighSchoolGrade, calculateTermAverage, calculateYearlyGeneralAverage } from '../utils/academicCalculations';

export const DEFAULT_NOTIFICATIONS_STORAGE_KEY = 'mnchs_academic_notifications_v1';
export const PREFERENCES_STORAGE_KEY = 'mnchs_academic_preferences_v1';

export const DEFAULT_PREFERENCES: NotificationPreference = {
  emailEnabled: true,
  recipientEmail: 'ugtonanshehzar@gmail.com',
  guardianEmailAlerts: true,
  gradeDropAlert: true,
  gradeDropThreshold: 75, // 75% High School passing mark
  newGradePosted: true,
  upcomingDeadlines: true,
  weeklyDigest: true,
  honorsCelebration: true,
  soundAlerts: true,
};

// Play a pleasant academic chime using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440.0, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.debug('Notification audio cue silent:', err);
  }
}

/**
 * Generates official high school responsive email HTML template for Mati National Comprehensive High School
 */
function createMNCHSEmailHtml({
  badgeText,
  badgeBg,
  badgeColor,
  title,
  subtitle,
  bodyHtml,
  actionButtonText,
  actionButtonUrl,
  recipientEmail,
}: {
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
  recipientEmail: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070d19; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); border: 1px solid #1e293b;">
          <!-- High School Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 26px 30px; border-bottom: 3px solid #6366f1;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a5b4fc; margin-bottom: 3px;">Department of Education &bull; Division of Mati City</div>
                    <div style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">Mati National Comprehensive High School</div>
                    <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Senior High School Academic Monitoring System</div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 6px 12px; background-color: ${badgeBg}; color: ${badgeColor}; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Hero Intro -->
          <tr>
            <td style="padding: 28px 30px 14px 30px;">
              <h1 style="margin: 0 0 6px 0; font-size: 21px; font-weight: 800; color: #0f172a; line-height: 1.3;">${title}</h1>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${subtitle}</p>
            </td>
          </tr>

          <!-- Dynamic Body Content -->
          <tr>
            <td style="padding: 14px 30px 22px 30px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Action CTA -->
          ${
            actionButtonText
              ? `
          <tr>
            <td style="padding: 0 30px 28px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #4f46e5; text-align: center;">
                    <a href="${actionButtonUrl || '#'}" style="display: inline-block; padding: 12px 24px; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      ${actionButtonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Institutional Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-weight: 700; color: #1e293b;">Mati National Comprehensive High School (MNCHS)</div>
                    <div>Sait, Mati City, Davao Oriental &bull; DepEd Grading System: Written 25% | Perf Task 50% | Quarterly Exam 25%</div>
                    <div style="margin-top: 6px;">Delivered to <strong>${recipientEmail}</strong> for student & parent academic records.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Creates a "New Grade Posted" Email Log (High School format)
 */
export function buildNewGradeNotification({
  student,
  course,
  assessment,
  recipientEmail,
}: {
  student: StudentProfile;
  course: Course;
  assessment: { title: string; earned: number; max: number; component: string; type: string; feedback?: string };
  recipientEmail: string;
}): NotificationLog {
  const percentage = Math.round((assessment.earned / assessment.max) * 1000) / 10;
  const gradeSummary = calculateHighSchoolGrade(course);

  const bodyHtml = `
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase;">${course.code} &bull; ${course.name}</div>
      <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 2px; margin-bottom: 12px;">${assessment.title}</div>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        <tr>
          <td style="width: 25%; font-size: 12px; color: #64748b;">
            <div>Grading Category</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${assessment.component}</div>
          </td>
          <td style="width: 25%; font-size: 12px; color: #64748b;">
            <div>Raw Score</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${assessment.earned}/${assessment.max}</div>
          </td>
          <td style="width: 25%; font-size: 12px; color: #64748b;">
            <div>Score Percentage</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${percentage}%</div>
          </td>
          <td style="width: 25%; font-size: 12px; color: #64748b;">
            <div>Subject Standing</div>
            <div style="font-size: 16px; font-weight: 800; color: #4338ca; margin-top: 2px;">${gradeSummary.currentGrade}%</div>
          </td>
        </tr>
      </table>

      ${
        assessment.feedback
          ? `
      <div style="margin-top: 14px; padding: 12px; background-color: #ffffff; border-radius: 6px; border-left: 3px solid #6366f1;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Teacher Remarks (${course.instructor.name})</div>
        <div style="font-size: 13px; color: #334155; margin-top: 4px; font-style: italic;">"${assessment.feedback}"</div>
      </div>
      `
          : ''
      }
    </div>

    <!-- 25-50-25 Tripartite Progress Table -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">MNCHS DepEd Component Standing:</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
        <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
          <th style="padding: 6px 10px; text-align: left;">Written Work (25%)</th>
          <th style="padding: 6px 10px; text-align: left;">Performance Task (50%)</th>
          <th style="padding: 6px 10px; text-align: left;">Summative Exam (25%)</th>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-weight: 600;">${gradeSummary.writtenWork.isGraded ? gradeSummary.writtenWork.rawPercentage + '% (' + gradeSummary.writtenWork.weightedScore.toFixed(1) + '/25)' : 'Pending'}</td>
          <td style="padding: 8px 10px; font-weight: 600;">${gradeSummary.performanceTask.isGraded ? gradeSummary.performanceTask.rawPercentage + '% (' + gradeSummary.performanceTask.weightedScore.toFixed(1) + '/50)' : 'Pending'}</td>
          <td style="padding: 8px 10px; font-weight: 600;">${gradeSummary.summativeExam.isGraded ? gradeSummary.summativeExam.rawPercentage + '% (' + gradeSummary.summativeExam.weightedScore.toFixed(1) + '/25)' : 'Pending'}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0;">
      Subject teacher <strong>${course.instructor.name}</strong> has submitted the official assessment score. Current standing: <strong>${gradeSummary.currentGrade}% (${gradeSummary.descriptor})</strong> &bull; Compliance: <strong>${gradeSummary.isCompliant ? 'Passed / Complying' : 'Deficit / Needs Improvement'}</strong>.
    </p>
  `;

  const htmlBody = createMNCHSEmailHtml({
    badgeText: 'Grade Posted',
    badgeBg: '#e0e7ff',
    badgeColor: '#3730a3',
    title: `New Grade Posted: ${course.name}`,
    subtitle: `${student.name} (${student.lrn}) &bull; ${student.section}`,
    bodyHtml,
    actionButtonText: 'Inspect Subject Compliance',
    recipientEmail,
  });

  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    type: 'new_grade',
    subject: `[MNCHS Grade Update] ${course.code}: ${assessment.title} - ${assessment.earned}/${assessment.max} (${percentage}%)`,
    recipient: recipientEmail,
    status: 'Delivered',
    previewText: `${course.instructor.name} posted score: ${assessment.earned}/${assessment.max} in ${course.name}. Current grade: ${gradeSummary.currentGrade}%.`,
    htmlBody,
    read: false,
    courseCode: course.code,
    metadata: {
      courseName: course.name,
      newGrade: percentage,
      assessmentName: assessment.title,
    },
  };
}

/**
 * Creates a "Low Grade / Remedial Academic Alert" Email Log (High School format)
 */
export function buildLowGradeNotification({
  student,
  course,
  threshold,
  recipientEmail,
}: {
  student: StudentProfile;
  course: Course;
  threshold: number;
  recipientEmail: string;
}): NotificationLog {
  const gradeSummary = calculateHighSchoolGrade(course);

  const bodyHtml = `
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 18px; border: 1px solid #fecaca; margin-bottom: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 700; color: #b91c1c; text-transform: uppercase;">MNCHS Academic Intervention Alert</div>
            <div style="font-size: 17px; font-weight: 800; color: #991b1b; margin-top: 2px;">${course.code}: ${course.name}</div>
            <div style="font-size: 12px; color: #b91c1c; margin-top: 2px;">Subject Teacher: ${course.instructor.name} (${course.instructor.room || 'Faculty'})</div>
          </td>
          <td align="right">
            <div style="font-size: 26px; font-weight: 900; color: #dc2626;">${gradeSummary.currentGrade}%</div>
            <div style="font-size: 11px; font-weight: 700; color: #b91c1c;">Did Not Meet 75% Mark</div>
          </td>
        </tr>
      </table>

      <div style="margin-top: 14px; padding: 12px; background-color: #ffffff; border-radius: 6px; border: 1px solid #fee2e2;">
        <div style="font-size: 12px; color: #7f1d1d; line-height: 1.5;">
          <strong>Attention Parent & Student:</strong> Current standing in this subject has fallen to <strong>${gradeSummary.currentGrade}%</strong>, which does not comply with the DepEd passing standard of <strong>75%</strong>.
        </div>
      </div>
    </div>

    <!-- Component Breakdown -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Subject Component Analysis:</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">Written Works (25%):</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${gradeSummary.writtenWork.rawPercentage >= 75 ? '#16a34a' : '#dc2626'}; text-align: right;">
            ${gradeSummary.writtenWork.rawPercentage}% (${gradeSummary.writtenWork.weightedScore.toFixed(1)}/25 pts)
          </td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">Performance Tasks (50%):</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: ${gradeSummary.performanceTask.rawPercentage >= 75 ? '#16a34a' : '#dc2626'}; text-align: right;">
            ${gradeSummary.performanceTask.rawPercentage}% (${gradeSummary.performanceTask.weightedScore.toFixed(1)}/50 pts)
          </td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 8px 10px;">Quarterly Summative Exam (25%):</td>
          <td style="padding: 8px 10px; font-weight: 700; color: #64748b; text-align: right;">
            ${gradeSummary.summativeExam.isGraded ? gradeSummary.summativeExam.rawPercentage + '%' : 'Pending / Upcoming'}
          </td>
        </tr>
      </table>
    </div>

    <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Recommended Next Steps:</h3>
    <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
      <li>Seek remedial instruction and submission of missing Performance Tasks with <strong>${course.instructor.name}</strong>.</li>
      <li>Performance Tasks carry <strong>50% weight</strong> — improving project scores will immediately lift the subject grade above 75%.</li>
      <li>Parents are requested to review and sign academic status slips with class adviser.</li>
    </ul>
  `;

  const htmlBody = createMNCHSEmailHtml({
    badgeText: 'Remedial Alert',
    badgeBg: '#fee2e2',
    badgeColor: '#991b1b',
    title: `Academic Deficit Alert: ${course.name}`,
    subtitle: `Notice of Academic Standing for ${student.name} (${student.lrn})`,
    bodyHtml,
    actionButtonText: 'Run Performance Task Simulator',
    recipientEmail,
  });

  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    type: 'grade_drop',
    subject: `[MNCHS Academic Alert] ${course.code} standing is below 75% (${gradeSummary.currentGrade}%)`,
    recipient: recipientEmail,
    status: 'Delivered',
    previewText: `Current standing in ${course.code} is ${gradeSummary.currentGrade}%. Remedial intervention recommended before 3rd Term quarterly exams.`,
    htmlBody,
    read: false,
    courseCode: course.code,
    metadata: {
      courseName: course.name,
      newGrade: gradeSummary.currentGrade,
    },
  };
}

/**
 * Creates an "Upcoming Deadline / Performance Task Alert" Email Log (High School format)
 */
export function buildDeadlineNotification({
  student,
  course,
  assessment,
  recipientEmail,
}: {
  student: StudentProfile;
  course: Course;
  assessment: { title: string; dueDate: string; component: string };
  recipientEmail: string;
}): NotificationLog {
  const weight = assessment.component === 'Performance Task' ? 50 : 25;

  const bodyHtml = `
    <div style="background-color: #fffbeb; border-radius: 8px; padding: 18px; border: 1px solid #fde68a; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">MNCHS Academic Deliverable Due Soon</div>
      <div style="font-size: 17px; font-weight: 800; color: #92400e; margin-top: 2px;">${assessment.title}</div>
      <div style="font-size: 12px; color: #78350f; margin-top: 2px;">${course.code}: ${course.name} &bull; ${course.instructor.name}</div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 12px; border-top: 1px solid #fde68a; padding-top: 10px;">
        <tr>
          <td style="width: 50%;">
            <div style="font-size: 11px; color: #92400e;">Deadline Date</div>
            <div style="font-size: 14px; font-weight: 700; color: #78350f; margin-top: 2px;">${assessment.dueDate}</div>
          </td>
          <td style="width: 50%;">
            <div style="font-size: 11px; color: #92400e;">Component Weight</div>
            <div style="font-size: 14px; font-weight: 700; color: #78350f; margin-top: 2px;">${assessment.component} (${weight}%)</div>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0;">
      Please submit all required materials, laboratory outputs, or portfolios directly to your subject teacher on or before the scheduled deadline.
    </p>
  `;

  const htmlBody = createMNCHSEmailHtml({
    badgeText: 'Deadline Notice',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    title: `Academic Deadline Notice: ${assessment.title}`,
    subtitle: `Submission reminder for ${student.name} (${student.section})`,
    bodyHtml,
    actionButtonText: 'View Subject Tasks',
    recipientEmail,
  });

  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    type: 'deadline',
    subject: `[MNCHS Reminder] ${course.code}: ${assessment.title} is due ${assessment.dueDate}`,
    recipient: recipientEmail,
    status: 'Delivered',
    previewText: `${assessment.title} (${assessment.component} - ${weight}%) is due on ${assessment.dueDate}.`,
    htmlBody,
    read: false,
    courseCode: course.code,
    metadata: {
      courseName: course.name,
      assessmentName: assessment.title,
      dueDate: assessment.dueDate,
    },
  };
}

/**
 * Creates a "Weekly Academic Progress Digest" Email Log (High School format)
 */
export function buildWeeklyDigestNotification({
  student,
  currentTerm,
  allTerms,
  recipientEmail,
}: {
  student: StudentProfile;
  currentTerm: AcademicTerm;
  allTerms: AcademicTerm[];
  recipientEmail: string;
}): NotificationLog {
  const termStats = calculateTermAverage(currentTerm.courses);
  const yearlyStats = calculateYearlyGeneralAverage(allTerms);

  const subjectRowsHtml = currentTerm.courses
    .map((c) => {
      const summary = calculateHighSchoolGrade(c);
      return `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #0f172a;">
            ${c.code}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #334155;">
            ${c.name}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center; color: #64748b;">
            ${summary.writtenWork.isGraded ? summary.writtenWork.rawPercentage + '%' : '-'}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center; color: #64748b;">
            ${summary.performanceTask.isGraded ? summary.performanceTask.rawPercentage + '%' : '-'}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; text-align: right; color: ${
            summary.currentGrade >= 90 ? '#16a34a' : summary.currentGrade >= 75 ? '#2563eb' : '#dc2626'
          };">
            ${summary.currentGrade}%
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600; text-align: right; color: ${
            summary.isCompliant ? '#16a34a' : '#dc2626'
          };">
            ${summary.isCompliant ? 'Passed' : 'Deficit'}
          </td>
        </tr>
      `;
    })
    .join('');

  const bodyHtml = `
    <!-- Top KPI cards -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="width: 32%; background-color: #f1f5f9; border-radius: 8px; padding: 14px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Yearly General Average</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${yearlyStats.yearlyAverage.toFixed(1)}%</div>
          <div style="font-size: 10px; color: #16a34a; font-weight: 600; margin-top: 2px;">Target: ${student.targetGeneralAverage.toFixed(1)}%</div>
        </td>
        <td style="width: 2%;"></td>
        <td style="width: 32%; background-color: #f1f5f9; border-radius: 8px; padding: 14px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">${currentTerm.name} Average</div>
          <div style="font-size: 22px; font-weight: 900; color: #4338ca; margin-top: 4px;">${termStats.generalAverage.toFixed(1)}%</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${termStats.passingCount}/${currentTerm.courses.length} Passed</div>
        </td>
        <td style="width: 2%;"></td>
        <td style="width: 32%; background-color: #f1f5f9; border-radius: 8px; padding: 14px; border: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Subject Compliance</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${termStats.complianceRate}%</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">3-Term Tracking</div>
        </td>
      </tr>
    </table>

    <!-- Subject Table Breakdown -->
    <div style="margin-bottom: 18px;">
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${currentTerm.name} Subject Performance & Tripartite Status</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: left; color: #64748b; text-transform: uppercase;">Code</th>
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: left; color: #64748b; text-transform: uppercase;">Subject</th>
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: center; color: #64748b; text-transform: uppercase;">Written 25%</th>
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: center; color: #64748b; text-transform: uppercase;">Perf 50%</th>
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: right; color: #64748b; text-transform: uppercase;">Grade</th>
            <th style="padding: 7px 10px; font-size: 10px; font-weight: 700; text-align: right; color: #64748b; text-transform: uppercase;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRowsHtml}
        </tbody>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
      Report generated by Mati National Comprehensive High School Academic Information System. Senior High School Department &bull; S.Y. 2026 - 2027.
    </p>
  `;

  const htmlBody = createMNCHSEmailHtml({
    badgeText: 'Weekly Digest',
    badgeBg: '#f1f5f9',
    badgeColor: '#1e293b',
    title: `Weekly Academic Progress Digest`,
    subtitle: `${student.name} &bull; ${student.gradeLevel} &bull; ${student.section}`,
    bodyHtml,
    actionButtonText: 'Access MNCHS Student Portal',
    recipientEmail,
  });

  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    type: 'weekly_digest',
    subject: `[MNCHS Weekly Digest] General Average: ${termStats.generalAverage.toFixed(1)}% (${currentTerm.name})`,
    recipient: recipientEmail,
    status: 'Delivered',
    previewText: `Weekly summary: ${termStats.generalAverage.toFixed(1)}% general average, ${termStats.passingCount}/${currentTerm.courses.length} subjects compliant.`,
    htmlBody,
    read: false,
    metadata: {
      average: termStats.generalAverage,
    },
  };
}

/**
 * Creates an Instant Test Verification Email (High School format)
 */
export function buildTestVerificationNotification({
  student,
  recipientEmail,
}: {
  student: StudentProfile;
  recipientEmail: string;
}): NotificationLog {
  const bodyHtml = `
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 18px; border: 1px solid #bfdbfe; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">Alert Connection Verified</div>
      <div style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin-top: 3px;">Mati National Comprehensive High School Notification Pipeline Active</div>
      <div style="font-size: 13px; color: #1e40af; margin-top: 6px; line-height: 1.5;">
        This test confirms that your student email alerts for <strong>${recipientEmail}</strong> are working properly.
        You will receive real-time updates for newly recorded scores in Written Works (25%), Performance Tasks (50%), and Quarterly Exams (25%).
      </div>
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 6px; padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <tr>
        <td>
          <div><strong>Student:</strong> ${student.name} (LRN: ${student.lrn})</div>
          <div style="margin-top: 3px;"><strong>School:</strong> ${student.schoolName}</div>
          <div style="margin-top: 3px;"><strong>Grade & Track:</strong> ${student.gradeLevel} &bull; ${student.strand}</div>
        </td>
      </tr>
    </table>
  `;

  const htmlBody = createMNCHSEmailHtml({
    badgeText: 'Verified',
    badgeBg: '#dbeafe',
    badgeColor: '#1e40af',
    title: `Academic Notification Service Verified`,
    subtitle: `Alert pipeline active for ${recipientEmail}`,
    bodyHtml,
    actionButtonText: 'Open High School Portal',
    recipientEmail,
  });

  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    timestamp: new Date().toISOString(),
    type: 'test',
    subject: `[MNCHS Portal] Verification: Grade Notifications Active for ${recipientEmail}`,
    recipient: recipientEmail,
    status: 'Delivered',
    previewText: `Mati National Comprehensive High School alert dispatch connected to ${recipientEmail}.`,
    htmlBody,
    read: false,
  };
}

export function loadStoredNotifications(): NotificationLog[] {
  try {
    const raw = localStorage.getItem(DEFAULT_NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading notifications:', err);
  }
  return [];
}

export function saveStoredNotifications(notifications: NotificationLog[]) {
  try {
    localStorage.setItem(DEFAULT_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Error saving notifications:', err);
  }
}

export function loadStoredPreferences(): NotificationPreference {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Error loading preferences:', err);
  }
  return DEFAULT_PREFERENCES;
}

export function saveStoredPreferences(prefs: NotificationPreference) {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Error saving preferences:', err);
  }
}
