import { AcademicTerm, Course, Assessment, GradingComponent, COMPONENT_WEIGHTS } from '../types/academic';

export interface HighSchoolGradeDescriptor {
  descriptor: string;
  minGrade: number;
  honorsTag?: string;
  badgeColor: string;
}

export const HS_GRADE_SCALE: HighSchoolGradeDescriptor[] = [
  { descriptor: 'Outstanding', minGrade: 95, honorsTag: 'With Highest Honors', badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { descriptor: 'Outstanding', minGrade: 90, honorsTag: 'With Honors', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { descriptor: 'Very Satisfactory', minGrade: 85, badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { descriptor: 'Satisfactory', minGrade: 80, badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { descriptor: 'Fairly Satisfactory', minGrade: 75, badgeColor: 'text-slate-300 bg-slate-800 border-slate-700' },
  { descriptor: 'Did Not Meet Expectations', minGrade: 0, honorsTag: 'Remedial Required', badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];

export function getHighSchoolDescriptor(grade: number): HighSchoolGradeDescriptor {
  const rounded = Math.round(grade * 10) / 10;
  for (const s of HS_GRADE_SCALE) {
    if (rounded >= s.minGrade) {
      return s;
    }
  }
  return HS_GRADE_SCALE[HS_GRADE_SCALE.length - 1];
}

export interface ComponentBreakdown {
  component: GradingComponent;
  weight: number; // 25, 50, 25
  totalEarned: number;
  totalMax: number;
  rawPercentage: number; // 0 - 100%
  weightedScore: number; // (rawPercentage * weight) / 100
  gradedCount: number;
  totalCount: number;
  isGraded: boolean;
}

export interface HighSchoolCourseSummary {
  currentGrade: number; // 0 - 100
  descriptor: string;
  honorsTag?: string;
  isPassing: boolean;
  isCompliant: boolean;
  status: 'Compliant' | 'Honors Compliant' | 'Deficit / Needs Remedial';
  completedWeight: number; // out of 100
  writtenWork: ComponentBreakdown;    // 25%
  performanceTask: ComponentBreakdown; // 50%
  summativeExam: ComponentBreakdown;   // 25%
}

export function inferGradingComponent(a: Assessment): GradingComponent {
  if (a.component) return a.component;

  const t = (a.type || '').toLowerCase();
  const title = (a.title || '').toLowerCase();

  if (
    t.includes('summative') ||
    t.includes('exam') ||
    t.includes('periodic') ||
    t.includes('quarterly') ||
    title.includes('exam') ||
    title.includes('quarter') ||
    title.includes('periodic') ||
    title.includes('summative')
  ) {
    return 'Summative Exam';
  }

  if (
    t.includes('performance') ||
    t.includes('lab') ||
    t.includes('project') ||
    t.includes('presentation') ||
    title.includes('performance') ||
    title.includes('project') ||
    title.includes('presentation') ||
    title.includes('experiment')
  ) {
    return 'Performance Task';
  }

  return 'Written Work';
}

/**
 * Calculates High School Subject Grade based on:
 * Written Work / Quiz = 25%
 * Performance Task = 50%
 * Summative Test / Exam = 25%
 */
export function calculateHighSchoolGrade(
  course: Course,
  simulatedOverrides?: Record<string, number>
): HighSchoolCourseSummary {
  const buckets: Record<GradingComponent, { earned: number; max: number; gradedCount: number; totalCount: number }> = {
    'Written Work': { earned: 0, max: 0, gradedCount: 0, totalCount: 0 },
    'Performance Task': { earned: 0, max: 0, gradedCount: 0, totalCount: 0 },
    'Summative Exam': { earned: 0, max: 0, gradedCount: 0, totalCount: 0 },
  };

  for (const a of course.assessments) {
    const comp = inferGradingComponent(a);
    buckets[comp].totalCount++;

    let earned = a.earnedPoints;
    let isGraded = a.status === 'Graded' && earned !== null;

    if (simulatedOverrides && simulatedOverrides[a.id] !== undefined) {
      earned = simulatedOverrides[a.id];
      isGraded = true;
    }

    if (isGraded && earned !== null) {
      buckets[comp].earned += earned;
      buckets[comp].max += a.maxPoints;
      buckets[comp].gradedCount++;
    }
  }

  const buildComponent = (comp: GradingComponent, weight: number): ComponentBreakdown => {
    const b = buckets[comp];
    const isGraded = b.gradedCount > 0 && b.max > 0;
    const rawPercentage = isGraded ? Math.round((b.earned / b.max) * 1000) / 10 : 0;
    const weightedScore = isGraded ? Math.round((rawPercentage * (weight / 100)) * 100) / 100 : 0;

    return {
      component: comp,
      weight,
      totalEarned: Math.round(b.earned * 10) / 10,
      totalMax: b.max,
      rawPercentage,
      weightedScore,
      gradedCount: b.gradedCount,
      totalCount: b.totalCount,
      isGraded,
    };
  };

  const writtenWork = buildComponent('Written Work', COMPONENT_WEIGHTS['Written Work']);
  const performanceTask = buildComponent('Performance Task', COMPONENT_WEIGHTS['Performance Task']);
  const summativeExam = buildComponent('Summative Exam', COMPONENT_WEIGHTS['Summative Exam']);

  let activeWeight = 0;
  let earnedWeightSum = 0;

  if (writtenWork.isGraded) {
    activeWeight += writtenWork.weight;
    earnedWeightSum += writtenWork.weightedScore;
  }
  if (performanceTask.isGraded) {
    activeWeight += performanceTask.weight;
    earnedWeightSum += performanceTask.weightedScore;
  }
  if (summativeExam.isGraded) {
    activeWeight += summativeExam.weight;
    earnedWeightSum += summativeExam.weightedScore;
  }

  // Baseline if no grades recorded yet
  if (activeWeight === 0) {
    return {
      currentGrade: 100,
      descriptor: 'Enrolled / In Progress',
      isPassing: true,
      isCompliant: true,
      status: 'Compliant',
      completedWeight: 0,
      writtenWork,
      performanceTask,
      summativeExam,
    };
  }

  // Current scaled grade out of 100
  const currentGrade = Math.round(((earnedWeightSum / activeWeight) * 100) * 10) / 10;
  const isPassing = currentGrade >= (course.minPassingGrade || 75.0);
  const desc = getHighSchoolDescriptor(currentGrade);

  let status: 'Compliant' | 'Honors Compliant' | 'Deficit / Needs Remedial' = 'Compliant';
  if (currentGrade >= 90) {
    status = 'Honors Compliant';
  } else if (!isPassing) {
    status = 'Deficit / Needs Remedial';
  }

  return {
    currentGrade,
    descriptor: desc.descriptor,
    honorsTag: desc.honorsTag,
    isPassing,
    isCompliant: isPassing,
    status,
    completedWeight: activeWeight,
    writtenWork,
    performanceTask,
    summativeExam,
  };
}

/**
 * Calculates Term General Average (GWA) across subjects in High School
 */
export function calculateTermAverage(
  courses: Course[],
  simulatedOverrides?: Record<string, Record<string, number>>
): {
  generalAverage: number;
  totalUnits: number;
  passingCount: number;
  failingCount: number;
  complianceRate: number;
} {
  if (courses.length === 0) {
    return { generalAverage: 0, totalUnits: 0, passingCount: 0, failingCount: 0, complianceRate: 100 };
  }

  let totalWeightedGrade = 0;
  let totalUnits = 0;
  let passingCount = 0;
  let failingCount = 0;

  for (const c of courses) {
    const override = simulatedOverrides ? simulatedOverrides[c.id] : undefined;
    const summary = calculateHighSchoolGrade(c, override);
    const units = c.units || 1;

    totalWeightedGrade += summary.currentGrade * units;
    totalUnits += units;

    if (summary.isCompliant) {
      passingCount++;
    } else {
      failingCount++;
    }
  }

  const generalAverage = totalUnits > 0 ? Math.round((totalWeightedGrade / totalUnits) * 10) / 10 : 0;
  const complianceRate = Math.round((passingCount / courses.length) * 100);

  return {
    generalAverage,
    totalUnits,
    passingCount,
    failingCount,
    complianceRate,
  };
}

/**
 * Calculates Academic Year General Average across all 3 terms
 */
export function calculateYearlyGeneralAverage(
  terms: AcademicTerm[],
  simulatedCurrentOverrides?: Record<string, Record<string, number>>
): {
  yearlyAverage: number;
  termAverages: { termId: string; termName: string; average: number; coursesCount: number; compliantCount: number }[];
  overallComplianceRate: number;
} {
  let totalScore = 0;
  let totalWeight = 0;
  let allCoursesCount = 0;
  let allCompliantCount = 0;

  const termAverages = terms.map((term) => {
    const overrides = term.isCurrent ? simulatedCurrentOverrides : undefined;
    const stats = calculateTermAverage(term.courses, overrides);
    totalScore += stats.generalAverage * term.courses.length;
    totalWeight += term.courses.length;

    allCoursesCount += term.courses.length;
    allCompliantCount += stats.passingCount;

    return {
      termId: term.id,
      termName: term.name,
      average: stats.generalAverage,
      coursesCount: term.courses.length,
      compliantCount: stats.passingCount,
    };
  });

  const yearlyAverage = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 10) / 10 : 0;
  const overallComplianceRate = allCoursesCount > 0 ? Math.round((allCompliantCount / allCoursesCount) * 100) : 100;

  return {
    yearlyAverage,
    termAverages,
    overallComplianceRate,
  };
}

/**
 * Subject Compliance Inspector details
 */
export interface HighSchoolSubjectCompliance {
  isCompliant: boolean;
  complianceLevel: 'With Honors (≥90%)' | 'Passed / Compliant (≥75%)' | 'Deficit / Remedial Required (<75%)';
  badgeLabel: string;
  badgeClass: string;
  reason: string;
  category: string;
  componentDeficitNote?: string;
}

export function getHighSchoolSubjectCompliance(
  course: Course,
  simulatedOverrides?: Record<string, number>
): HighSchoolSubjectCompliance {
  const summary = calculateHighSchoolGrade(course, simulatedOverrides);
  const category = course.requirementCategory || 'Core Subject';

  // Find lowest component to explain deficit or strength
  const compNotes: string[] = [];
  if (summary.writtenWork.isGraded) {
    compNotes.push(`Written (25%): ${summary.writtenWork.rawPercentage}%`);
  }
  if (summary.performanceTask.isGraded) {
    compNotes.push(`Perf Task (50%): ${summary.performanceTask.rawPercentage}%`);
  }
  if (summary.summativeExam.isGraded) {
    compNotes.push(`Summative (25%): ${summary.summativeExam.rawPercentage}%`);
  }

  if (summary.currentGrade >= 90) {
    return {
      isCompliant: true,
      complianceLevel: 'With Honors (≥90%)',
      badgeLabel: 'With Honors (Compliant)',
      badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      reason: `Exceeds High School ${category} standard with ${summary.currentGrade}%. Qualified for Academic Honors.`,
      category,
      componentDeficitNote: compNotes.join(' · '),
    };
  }

  if (summary.currentGrade >= 75) {
    return {
      isCompliant: true,
      complianceLevel: 'Passed / Compliant (≥75%)',
      badgeLabel: 'Passed (Compliant)',
      badgeClass: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
      reason: `Complies with High School passing threshold (75%). Current standing: ${summary.currentGrade}%.`,
      category,
      componentDeficitNote: compNotes.join(' · '),
    };
  }

  // Below 75% -> Remedial / At Risk
  return {
    isCompliant: false,
    complianceLevel: 'Deficit / Remedial Required (<75%)',
    badgeLabel: 'Deficit / Remedial Required',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    reason: `Current grade of ${summary.currentGrade}% is below the 75% High School passing mark. Academic intervention required.`,
    category,
    componentDeficitNote: compNotes.join(' · '),
  };
}

/**
 * High School What-If Simulator:
 * What score do I need on the upcoming Summative Exam (25%) or Performance Task (50%) to achieve target grade?
 */
export function calculateRequiredScoreForTarget(
  course: Course,
  targetGrade: number,
  targetComponent: GradingComponent
): {
  requiredPercentage: number;
  isFeasible: boolean;
  message: string;
} {
  const summary = calculateHighSchoolGrade(course);
  const targetCompWeight = COMPONENT_WEIGHTS[targetComponent]; // 25 or 50

  // Calculate earned weight from OTHER components
  let otherEarnedWeight = 0;
  if (targetComponent !== 'Written Work' && summary.writtenWork.isGraded) {
    otherEarnedWeight += summary.writtenWork.weightedScore;
  }
  if (targetComponent !== 'Performance Task' && summary.performanceTask.isGraded) {
    otherEarnedWeight += summary.performanceTask.weightedScore;
  }
  if (targetComponent !== 'Summative Exam' && summary.summativeExam.isGraded) {
    otherEarnedWeight += summary.summativeExam.weightedScore;
  }

  const weightNeeded = targetGrade - otherEarnedWeight;
  const requiredPercentage = Math.round((weightNeeded / (targetCompWeight / 100)) * 10) / 10;

  if (requiredPercentage <= 0) {
    return {
      requiredPercentage: 0,
      isFeasible: true,
      message: `Target of ${targetGrade}% is already secured even with 0% on ${targetComponent}!`,
    };
  }

  if (requiredPercentage > 100) {
    return {
      requiredPercentage,
      isFeasible: false,
      message: `Requires ${requiredPercentage}% on ${targetComponent} (${targetCompWeight}% weight) — higher than max points. Extra credit required.`,
    };
  }

  return {
    requiredPercentage,
    isFeasible: true,
    message: `You need at least ${requiredPercentage}% on ${targetComponent} to achieve your ${targetGrade}% target.`,
  };
}
