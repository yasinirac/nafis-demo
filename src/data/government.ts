import { companies } from './companies';
import { people } from './people';
import { fig, type DataStatus, type Figure, type Tone } from './types';

/**
 * Government View (brief 6.9): Mariam's Verified Career Record in the
 * February 2030 scenario, as a federal recruitment officer sees it under her
 * Consent Grant. Every value is fictional sample data.
 *
 * A Verified Career Record never holds pay history, monthly report ratings,
 * integrity matters, Direction Profile inventories, survey answers, risk
 * scores, counsellor call notes or health information. Nothing in this file
 * may add any of them.
 */

const mariam = people.mariam;
const qasr = companies.qasr.name;
const status: DataStatus = 'sample';

export interface EmploymentRow {
  id: string;
  employer: string;
  role: string;
  /** Skill level of the job. */
  level: string;
  dates: string;
  /** Verified months in this period. */
  months: Figure;
  /** Sources that confirm the period. */
  sources: string[];
  /** Counts toward relevant verified experience. */
  counted: boolean;
  /** Why a period does not count. */
  note?: string;
}

export interface SkillLevel {
  id: string;
  name: string;
  level: Figure;
  /** The level the Role Profile asks for. */
  required: Figure;
}

export interface PolicyCheck {
  id: string;
  label: string;
  result: string;
  detail?: string;
  tone: Tone;
}

export interface PlacementOption {
  id: string;
  label: string;
}

const verifiedSources = ['Permit', 'Payroll', 'Pension'];

export const careerRecord = {
  status,
  scenarioChip: 'Scenario · February 2030',
  eyebrow: 'Applications · scenario February 2030',
  applicantFirstName: mariam.firstName,
  title: `${mariam.name} · Verified Career Record`,
  application: 'Shortlisted for Senior Financial Analyst · applied 2\u00a0Feb\u00a02030',
  viewLog: {
    lead: `Read under ${mariam.firstName}'s Consent Grant for purpose`,
    purpose: 'P-GOVHIRE-01',
    rest: `Your view is logged, and ${mariam.firstName} sees it under Who viewed my record.`,
  },
  chips: {
    consent: 'Consent valid until 3 May 2030',
    verified: 'Verified 2 Feb 2030',
    sources: 'Sources: work permits · payroll · pension · NAFIS',
    mirror: 'The applicant sees exactly this page',
  },

  employment: {
    title: 'Employment history',
    description: 'Each period is checked against official records before it counts.',
    columns: {
      employer: 'Employer',
      role: 'Role and skill level',
      dates: 'Dates',
      verified: 'Verified by',
    },
    tableLabel: 'Employment history table',
    rows: [
      {
        id: 'qasr-senior',
        employer: qasr,
        role: 'Senior Finance Analyst',
        level: 'Professional',
        dates: 'Apr 2029–now',
        months: fig(10, status),
        sources: verifiedSources,
        counted: true,
      },
      {
        id: 'qasr-analyst',
        employer: qasr,
        role: 'Finance Analyst',
        level: 'Professional',
        dates: 'Jan 2027–Mar 2029',
        months: fig(27, status),
        sources: verifiedSources,
        counted: true,
      },
      {
        id: 'internship',
        employer: 'Audit firm (internship)',
        role: 'Audit Intern',
        level: 'Internship',
        dates: 'Jun–Aug 2025',
        months: fig(3, status),
        sources: ['Permit'],
        counted: false,
        note: '1 source: not counted',
      },
    ] satisfies EmploymentRow[],
    verifiedWord: 'verified',
    countedLabel: '{months} months counted',
    totalLabel: 'Relevant verified experience',
    totalValue: '{months} months · {span}',
    countRule: 'A period counts when at least two sources confirm it.',
    payNote:
      'No pay history. Federal pay follows the grade scale, so this record never shows past salaries. A pay band appears only for market-pay government companies, and only if the applicant opts in.',
  },

  skills: {
    title: 'Skills Passport',
    description: 'Assessed levels from 1 to 5. Last assessed January 2030.',
    chartTitle: 'Skill levels',
    chartSubtitle: 'Each skill shows the level the Senior Financial Analyst role asks for.',
    max: fig(5, status),
    items: [
      { id: 'modelling', name: 'Financial modelling', level: fig(4, status), required: fig(3, status) },
      { id: 'reporting', name: 'Financial reporting', level: fig(4, status), required: fig(3, status) },
      { id: 'analysis', name: 'Data analysis', level: fig(3, status), required: fig(3, status) },
      { id: 'communication', name: 'Stakeholder communication', level: fig(3, status), required: fig(3, status) },
    ] satisfies SkillLevel[],
    levelLabel: '{level} of {max}',
    requiredLabel: 'role asks for {level}',
    barLabel: '{skill}: level {level} of {max}; the role asks for level {required}',
    ariaLabel: "Bar chart of {name}'s Skills Passport levels out of {max}: {list}.",
    tableColumns: { skill: 'Skill', level: 'Level, 1 to 5', required: 'Role asks for' },
    languagesTitle: 'Languages',
    languages: [
      { id: 'ar', name: 'Arabic', level: 'native' },
      { id: 'en', name: 'English', level: 'C1' },
    ],
    certificationsTitle: 'Certifications',
    certifications: [
      { id: 'cma', name: 'CMA Part 1', detail: '2028' },
      { id: 'ifrs16', name: 'IFRS 16', detail: '2027, NAFIS-funded' },
      { id: 'powerbi', name: 'Power BI', detail: '2027' },
    ],
  },

  references: {
    title: 'References chosen by the applicant',
    items: [
      {
        id: 'finance-manager',
        who: `Finance Manager, ${qasr}`,
        when: '2029 review',
        rating: fig(4, status),
        outOf: fig(5, status),
        strengths: ['accuracy', 'ownership'],
      },
    ],
    ratingLabel: '{rating} of {outOf}',
    ratingWord: 'Overall',
    strengthsWord: 'Strengths',
    note: 'References can only add credit. Monthly report ratings and integrity matters never appear in this record.',
  },

  decision: {
    title: 'Grade and salary decision support',
    intro: 'Worked out from the concept grade rules for this demo. You decide the placement.',
    experienceLabel: 'Relevant verified experience',
    experience: fig(37, status, { display: '3 years 1 month' }),
    experienceSub: '37 months across both Qasr Logistics roles',
    placementLabel: 'Suggested placement',
    placement: '[Federal grade + 1] · step 1',
    placementSub: 'Pay follows the federal scale for that grade and step.',
    rulesTitle: 'How the points add up',
    rules: [
      'Experience: 1.0 point per 12 relevant verified months = 3.0 (37 months).',
      'Skills: 0.5 for each core skill one level above the requirement = 1.0. Reference: 0.5.',
      '4.5 points with 36+ relevant months: one grade up (rule R6), at step 1; the 0.5 left gives no step.',
    ],
    checksTitle: 'Policy checks',
    checks: [
      {
        id: 'cooling-off',
        label: 'Cooling-off (under 12 private months)',
        result: 'Not applicable (37 months)',
        tone: 'neutral',
      },
      {
        id: 'transfer',
        label: 'Transfer compensation to NAFIS',
        result: 'Not due',
        detail: 'It falls to zero after 36 verified private months.',
        tone: 'good',
      },
      {
        id: 'credit',
        label: 'Private-experience credit',
        result: 'Applied',
        tone: 'good',
      },
    ] satisfies PolicyCheck[],
    accept: 'Accept suggested placement',
    adjust: 'Adjust with a reason',
    adjustNote: 'Any adjustment needs a written reason. The applicant sees it and can contest it.',
    accepted: 'Placement accepted: [Federal grade + 1] · step 1. The applicant sees this decision on this page.',
    adjustTitle: 'Adjust the placement',
    adjustOptionLabel: 'Adjusted placement',
    adjustOptions: [
      { id: 'grade-step-2', label: '[Federal grade + 1] · step 2' },
      { id: 'grade-plus-2', label: '[Federal grade + 2] · step 1' },
      { id: 'grade-same', label: '[Federal grade] · step 1' },
    ] satisfies PlacementOption[],
    reasonLabel: 'Written reason',
    reasonHint: 'The applicant sees this reason and can contest it.',
    saveAdjustment: 'Save adjustment',
    saveHint: 'Write a reason to save the adjustment.',
    cancel: 'Cancel',
    adjusted: 'Adjusted to {placement}. Your reason is saved. The applicant sees it and can contest it.',
    change: 'Change decision',
  },

  neverIncludedTitle: 'Never included',
  neverIncluded:
    'Never included in a Verified Career Record: pay history, monthly report ratings, integrity matters, Direction Profile inventories, survey answers, risk scores, counsellor call notes or health information.',
};
