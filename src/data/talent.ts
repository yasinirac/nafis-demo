import { companies } from './companies';
import { people, staff } from './people';
import { fig, supportLevels, type DataStatus, type Figure, type FitTier, type SupportLevel } from './types';

/**
 * Talent portal: Talent Home, Career Path, Alignment Check, Privacy and
 * consent. Every person and company is fictional and every figure carries a
 * status. Scenario date: Thursday 29 October 2026. Mariam's first interview
 * is on Tuesday 3 November.
 */

export interface PayRange {
  min: number;
  max: number;
}

export interface Skill {
  name: string;
  /** Short name used in compact lines, for example "reporting 3". */
  short: string;
  /** 1–5 on the Skills Passport scale; English uses CEFR bands. */
  level: Figure<number | string>;
}

const qasr = companies.qasr;
const mariam = people.mariam;
const rashid = people.rashid;
const counsellor = staff.aisha;

export const talentScenario = {
  dateLong: 'Thursday 29 October 2026',
};

/** Mariam's Skills Passport levels. */
export const mariamSkills = {
  excel: { name: 'Excel', short: 'Excel', level: fig(4, 'sample') },
  reporting: { name: 'financial reporting', short: 'reporting', level: fig(3, 'sample') },
  analysis: { name: 'data analysis', short: 'data analysis', level: fig(3, 'sample') },
  english: { name: 'English', short: 'English', level: fig('C1', 'sample') },
} satisfies Record<string, Skill>;

export function skillText(skill: Skill, short = false): string {
  return `${short ? skill.short : skill.name} ${skill.level.value}`;
}

/* ------------------------------------------------------------------ */
/* Introduction Request (Talent Home)                                  */
/* ------------------------------------------------------------------ */

/** The request Qasr Logistics sent to Mariam's anonymous card. Pay range first, always. */
export const introRequest = {
  role: 'Finance Analyst',
  employer: qasr.name,
  site: 'Sharjah HQ',
  pay: fig<PayRange>({ min: 9500, max: 11000 }, 'sample'),
  daysLeft: fig(5, 'sample'),
  hours: 'Sun–Thu 8:00–16:30',
  start: 'By Jan 2027',
  interview: 'Tue 3 Nov, 10:00',
  eqsBand: qasr.eqs.band,
  retention: qasr.retention12,
  sectorRetention: qasr.sectorRetention12,
  message: 'Your skills match our Finance Analyst role at Sharjah HQ. We would like to meet you for an interview.',
};

/* ------------------------------------------------------------------ */
/* Talent Home                                                          */
/* ------------------------------------------------------------------ */

/** The eight stages of the Talent journey. Stage 6 reads "Ready to apply". */
export const talentStages = [
  'Discovery (final year of study)',
  'Interests, aspirations and work style',
  'Level assessment',
  'Development Plan and courses',
  'Coach Agent from here on',
  'Ready to apply: targeting and placement',
  'Onboarding and the two-sided monthly loop',
  'Growth, progression, exits and re-entry',
];

export const talentHome = {
  date: talentScenario.dateLong,
  greetingAr: 'صباح الخير يا مريم',
  greetingEn: `Good morning, ${mariam.firstName}`,
  notifications: {
    label: 'Notifications, {count} new',
    labelNone: 'Notifications, none new',
    heading: 'Notifications',
    items: [
      { id: 'n1', text: 'New Introduction Request: Finance Analyst, Qasr Logistics', when: 'Wed 28 Oct' },
      { id: 'n2', text: `Counsellor ${counsellor.name} added a step to your Development Plan`, when: 'Mon 26 Oct' },
    ],
  },
  stage: {
    current: fig(6, 'sample'),
    label: 'Ready to apply',
    heading: 'Stage {current} of {total} · {label}',
    barLabel: 'Stage {current} of {total} reached',
    link: 'See my Career Path',
    summary: 'You can apply for roles that fit your Skills Passport. The next stage starts when you begin a job.',
    show: 'Show all {total} stages',
    hide: 'Hide the stages',
    listLabel: 'The {total} stages',
  },
  next: {
    heading: 'Your next steps',
    interview: {
      title: 'Confirm interview',
      // Non-breaking spaces keep the date and time together on one line.
      detail: 'Qasr Logistics · Tue\u00a03\u00a0Nov\u00a010:00',
      action: 'Confirm',
      actionLabel: 'Confirm interview: see the Introduction Request first',
      confirmed: 'Confirmed',
      declined: 'Declined',
    },
    excel: {
      title: 'Finish Excel level 3',
      // "Excel level 3" is a course on the Development Plan, not a Skills Passport level.
      detail: 'Development Plan course · {lessons} lessons left · about {minutes} min',
      lessons: fig(2, 'sample'),
      minutes: fig(25, 'sample'),
    },
    alignment: {
      title: 'Preview the Alignment Check',
      detail: 'Asked at day 90 and month 9 of a new job, then once a year',
    },
  },
  coach: {
    heading: 'Your coach',
    decides: 'you decide',
    message: 'Qasr Logistics proposed an interview on Tuesday at 10:00. Shall I draft answers to three likely questions from your Skills Passport, for you to check?',
    why: 'Why: the proposed interview is in 5 days, and forecasting is the one gap in your fit for this role.',
    draft: 'Draft them',
    notNow: 'Not now',
    draftedHeading: 'Draft answers to three likely questions',
    drafted: [
      {
        q: 'Tell us about a report you prepared from start to finish.',
        answer: 'In my final-year project I built a monthly management report, checked it against the ledger and explained each variance.',
      },
      {
        q: 'A supplier balance does not match your ledger. What do you do?',
        answer: 'I compare the statement with the ledger line by line, check payments in transit, then agree the fix with my manager.',
      },
      {
        q: 'How would you build a simple monthly forecast?',
        answer: "I start from last year's monthly figures and adjust for known changes. Forecasting is my gap, so I am taking a short course.",
      },
    ],
    draftedNote: 'Edit or delete them before you practise. Only you see them, unless you share them or a legal order requires it.',
    draftedDecides: 'you decide what to keep',
    later: 'Saved for later. You can ask your coach at any time.',
    undo: 'Undo',
  },
  request: {
    heading: 'Introduction Request',
    daysLeft: '{days} days left',
    payUnit: 'a month',
    roleLine: '{role} · {employer}',
    anonNote: `${qasr.name} has seen only your anonymous Talent Card. It sees your name only if you accept.`,
    see: 'See request',
    hide: 'Hide request',
    confirmHint: 'To confirm the interview, accept this request. Check the pay range and what you share first.',
    rows: {
      pay: 'Pay range',
      role: 'Role',
      site: 'Site',
      hours: 'Hours',
      start: 'Start',
      interview: 'Proposed interview',
      eqs: 'Employer Quality Score',
      retention: '12-month retention',
    },
    retentionValue: '{value} (sector {sector})',
    messageLabel: 'Message from the employer',
    shares: 'If you accept, Qasr Logistics sees your name, Skills Passport levels and CV until 28 Jan 2027. You can revoke this at any time in Privacy and consent.',
    accept: 'Accept and confirm interview',
    decline: 'Decline',
    accepted: 'Accepted. Qasr Logistics now sees your name, Skills Passport levels and CV until 28 Jan 2027. Your interview on Tue 3 Nov at 10:00 is confirmed.',
    declined: 'Declined. Qasr Logistics sees only that you declined. Your card stays anonymous.',
    privacyLink: 'Manage this permission',
    undo: 'Undo',
  },
};

/* ------------------------------------------------------------------ */
/* Career Path                                                          */
/* ------------------------------------------------------------------ */

export type PathId = 'A' | 'B' | 'C';
export type Likelihood = 'High' | 'Medium' | 'Low';

/** High is 60 or more in 100, Medium 35 to 59, Low under 35. */
export const likelihoodBands = { high: 60, medium: 35, mediumTop: 59 };

export function likelihoodOf(chance: number): Likelihood {
  if (chance >= likelihoodBands.high) return 'High';
  if (chance >= likelihoodBands.medium) return 'Medium';
  return 'Low';
}

export interface Milestone {
  year: number;
  role: string;
  pay: Figure<PayRange>;
  /** How many of 100 similar people reached this step. */
  chance: Figure<number>;
  readiness?: string;
  build: string;
}

export interface CareerPathOption {
  id: PathId;
  name: string;
  title: string;
  milestones: Milestone[];
  reasons: string[];
}

export const careerPaths: CareerPathOption[] = [
  {
    id: 'A',
    name: 'Finance',
    title: 'Finance Analyst to FP&A Lead',
    milestones: [
      {
        year: 2027,
        role: 'Finance Analyst',
        pay: fig({ min: 9500, max: 11000 }, 'sample'),
        chance: fig(72, 'estimate'),
        readiness: 'ready now',
        build: 'financial modelling 3 · Power BI 2',
      },
      {
        year: 2029,
        role: 'Senior Finance Analyst',
        pay: fig({ min: 14000, max: 17000 }, 'sample'),
        chance: fig(48, 'estimate'),
        build: 'IFRS 16 · stakeholder reporting',
      },
      {
        year: 2031,
        role: 'FP&A Lead',
        pay: fig({ min: 20000, max: 25000 }, 'sample'),
        chance: fig(31, 'estimate'),
        build: 'forecasting 4 · leading a team',
      },
    ],
    reasons: [
      'Your Skills Passport already meets the must-haves for the first role: financial reporting 3, Excel 3 and English B2.',
      'It matches your Direction Profile: you like working with numbers and you asked for steady hours.',
      'Finance roles are the most common first step for accounting graduates in the record, so these estimates rest on many people.',
    ],
  },
  {
    id: 'B',
    name: 'Audit and risk',
    title: 'Audit Associate to Risk Manager',
    milestones: [
      {
        year: 2027,
        role: 'Audit Associate',
        pay: fig({ min: 9000, max: 11000 }, 'sample'),
        chance: fig(62, 'estimate'),
        readiness: 'ready in 6 months',
        build: 'audit sampling 3 · IFRS basics 3',
      },
      {
        year: 2029,
        role: 'Senior Auditor',
        pay: fig({ min: 13000, max: 16000 }, 'sample'),
        chance: fig(45, 'estimate'),
        build: 'internal controls · report writing',
      },
      {
        year: 2031,
        role: 'Risk Manager',
        pay: fig({ min: 19000, max: 24000 }, 'sample'),
        chance: fig(28, 'estimate'),
        build: 'risk frameworks · leading reviews',
      },
    ],
    reasons: [
      'Your fit for Audit Associate is Good. The gap is audit sampling, and a 6-week course closes it.',
      'Audit gives you broad experience across many companies, which helps a later move into risk.',
      'Busy seasons mean long hours in some months. You asked for steady hours, so this path ranks second.',
    ],
  },
  {
    id: 'C',
    name: 'Data analytics',
    title: 'Junior Data Analyst to Analytics Lead',
    milestones: [
      {
        year: 2027,
        role: 'Junior Data Analyst',
        pay: fig({ min: 9500, max: 11500 }, 'sample'),
        chance: fig(55, 'estimate'),
        readiness: 'ready in 12 months',
        build: 'SQL 2 · Power BI 3',
      },
      {
        year: 2029,
        role: 'Data Analyst',
        pay: fig({ min: 13000, max: 16000 }, 'sample'),
        chance: fig(41, 'estimate'),
        build: 'Python 2 · data storytelling',
      },
      {
        year: 2031,
        role: 'Analytics Lead',
        pay: fig({ min: 19000, max: 26000 }, 'sample'),
        chance: fig(24, 'estimate'),
        build: 'experiment design · leading a team',
      },
    ],
    reasons: [
      'Your Excel 4 and data analysis 3 are a good base. SQL is the main gap, about 3 months of study.',
      'More Role Profiles ask for data skills alongside accounting than a year ago.',
      'Fewer people have made this move, so these estimates are less certain.',
    ],
  },
];

export const careerPath = {
  title: 'Your Career Path',
  intro: 'Built from your Skills Passport, your Direction Profile and the careers of Emirati graduates like you.',
  agentBefore: 'Drafted by your',
  agentAfter: 'from Emirati career records',
  decides: 'you decide',
  tabsLabel: 'Career paths',
  pathLabel: 'Path {id}',
  timelineLabel: 'Milestones on path {id}',
  now: {
    when: 'Now',
    title: 'Final year, BSc Accounting',
    detail: 'Graduating December 2026',
    baseline: 'Skills Passport baseline',
  },
  payUnit: 'a month',
  chance: '{band} · {chance} in 100',
  chanceLabel: '{band} likelihood: {chance} in 100 similar people reached this step',
  readiness: 'Readiness:',
  build: 'Skills to build:',
  estimateNote: 'Each estimate shows how many of 100 similar people reached that step.',
  bandsNote: 'High: {high} or more · Medium: {medium} to {mediumTop} · Low: under {medium}',
  payNote: 'Pay ranges are typical monthly pay for each step.',
  whoSees: 'Only you and your assigned counsellor see these paths. Employers never see them or these estimates.',
  whyHeading: 'Why this path',
  add: 'Add to my plan',
  remove: 'Remove from plan',
  added: 'Added to your Development Plan: {title}. Your Coach Agent will suggest the first course. You decide.',
  change: 'Change my goals',
  changeBody: `Your goals come from your Direction Profile. The counsellor, not the agent, signs the Direction Profile, so a change goes to your assigned counsellor, ${counsellor.name}.`,
  ask: `Ask ${counsellor.name} for a review`,
  asked: `Sent to ${counsellor.name}. Your paths stay as they are until you agree a change together.`,
};

/* ------------------------------------------------------------------ */
/* Alignment Check                                                      */
/* ------------------------------------------------------------------ */

export type Frequency = 'never' | 'monthly' | 'weekly' | 'daily';
export type StudyShare = 'none' | 'little' | 'half' | 'most' | 'all';
export type TitleMatch = 'yes' | 'partly' | 'no';

export interface AlignmentTask {
  id: string;
  label: string;
  /** A usual task of the job title. "No real work" and admin are not. */
  roleTask: boolean;
  /** Marks the "no real work" row used in the flag rule. */
  noRealWork?: boolean;
  defaultValue: Frequency;
}

export const frequencyOptions: Array<{ value: Frequency; label: string }> = [
  { value: 'never', label: 'Never' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
];

export const alignmentTasks: AlignmentTask[] = [
  { id: 'variance', label: 'Prepared a monthly variance or budget report', roleTask: true, defaultValue: 'weekly' },
  { id: 'reconcile', label: 'Reconciled supplier or bank accounts', roleTask: true, defaultValue: 'weekly' },
  { id: 'forecast', label: 'Built or updated a forecast model', roleTask: true, defaultValue: 'monthly' },
  { id: 'present', label: 'Presented numbers to a manager or client', roleTask: true, defaultValue: 'monthly' },
  { id: 'admin', label: 'Filing, data entry or admin', roleTask: false, defaultValue: 'weekly' },
  { id: 'nowork', label: 'Had no real work to do', roleTask: false, noRealWork: true, defaultValue: 'never' },
];

export const studyOptions: Array<{ value: StudyShare; label: string }> = [
  { value: 'none', label: 'Almost none' },
  { value: 'little', label: 'A little' },
  { value: 'half', label: 'About half' },
  { value: 'most', label: 'Most' },
  { value: 'all', label: 'Nearly all' },
];

export const titleOptions: Array<{ value: TitleMatch; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'partly', label: 'Partly' },
  { value: 'no', label: 'No' },
];

export const alignmentCheck = {
  title: 'Alignment Check',
  meta: '4 min · day 90, month 9, then yearly',
  personaChip: '{name} · {role} · month {month} · extra check after a change of manager',
  person: { name: rashid.firstName, role: rashid.role, month: fig(6, 'sample') },
  step: {
    current: 1,
    label: 'Step {current} of {total} · {name}',
    saved: 'Saved',
    names: ['Your work', 'Your new manager', 'Anything else'],
  },
  privacy:
    'Your employer never sees your answers, only totals for groups of 10 or more people. We compare them with the usual tasks of your job title and with your studies, to check that the role is real and right for you.',
  questionLabel: 'Question {n} of {total}',
  q1: 'In the last 4 weeks, how often did you do each of these?',
  q2: 'How much of your week uses what you studied?',
  q3: 'Does your job title match what you do?',
  studyDefault: 'half' as StudyShare,
  titleDefault: 'partly' as TitleMatch,
  resultHeading: 'Your result so far',
  flaggedTitle: 'Mismatch noted',
  flagged:
    'Thank you for telling us. A counsellor will offer you a call this week, at a time you choose. No decision about your support is made from this answer alone; a person talks with you first.',
  fitTitle: 'On track',
  fit: 'Your answers fit your role. Your coach may suggest a forecasting task, the next skill on your path to Senior Analyst.',
  save: 'Save and continue',
  saved: 'Saved. Step 2 of 3, about working with your new manager, is a planned screen in this demo.',
  talk: 'I would rather talk to my counsellor',
  talked:
    'Request sent. Your assigned counsellor will offer you a call this week, at a time you choose. Your employer is not told, unless you agree or a legal order requires it. You can come back to the check later.',
};

/* ------------------------------------------------------------------ */
/* Privacy and consent                                                  */
/* ------------------------------------------------------------------ */

export type Visibility = 'hidden' | 'anonymous' | 'verified' | 'open';

export interface ScoreRow {
  id: string;
  title: string;
  value: SupportLevel | FitTier;
  why: string;
  employerNote?: string;
  moveUpHeading?: string;
  moveUp?: string[];
  questioned: string;
}

const supportLevel: SupportLevel = 'Grow';
const levelAbove = supportLevels[Math.max(0, supportLevels.indexOf(supportLevel) - 1)];
const auditEmployers = fig(2, 'sample');

export const privacy = {
  title: 'Privacy and consent',
  intro: 'You decide who sees what. Every view of your record is listed here.',
  findMe: {
    heading: 'Who can find me',
    defaultValue: 'anonymous' as Visibility,
    recommended: 'Recommended',
    options: [
      { value: 'hidden' as Visibility, label: 'Hidden', description: 'No employer sees your Talent Card. You can still apply for jobs yourself.' },
      {
        value: 'anonymous' as Visibility,
        label: 'Anonymous card',
        recommended: true,
        description:
          'Employers see your skills and availability, never your name, photo, family name, sex, age or university, until you accept a request.',
      },
      {
        value: 'verified' as Visibility,
        label: 'Verified employers only',
        description:
          'Your anonymous Talent Card, shown only to verified employers: licence checked, no upheld integrity finding in 24 months, quality band not D. New companies are included.',
      },
      {
        // Open widens reach, never identity: every Talent Card stays anonymous until the person accepts a request.
        value: 'open' as Visibility,
        label: 'Open',
        description:
          'Your anonymous Talent Card is also shown for roles outside your Direction Profile. Your name stays hidden until you accept a request.',
      },
    ],
    note: 'You chose this on 14 Sep 2026. No card existed before you chose, and nothing was pre-selected.',
    changed: 'Saved: {label}. It applies from now on, and the change is logged.',
  },
  openToMove: {
    label: 'Open to move',
    off: 'Off unless you turn it on.',
    points: [
      'Your current employer, its group and firms that share its owners, signatories or address never see it.',
      'Requests reach you after 12 months in your job, or sooner if your pay is late or short, your Alignment Check shows a mismatch, or you report a safety problem.',
      'Only step-up offers reach you: at least 10% more pay, a higher level, or a step on your Career Path.',
    ],
    noJob: 'It starts once you have a job.',
    on: 'On. It starts when your first job starts. You can turn it off at any time.',
  },
  scores: {
    heading: 'Every score about me',
    status: 'sample' as DataStatus,
    intro: 'Your coach and counsellor use these to support you. A person reviews any score you question.',
    question: 'Question this',
    withdraw: 'Withdraw',
    rows: [
      {
        id: 'support',
        title: 'Support level',
        value: supportLevel,
        why: 'Why: steady progress on your Development Plan. Rechecked every 3 months.',
        employerNote: 'Employers never see your Support level.',
        moveUpHeading: `What would move you up to ${levelAbove}`,
        moveUp: [
          'Finish Excel level 3.',
          'Complete the forecasting course on your Development Plan.',
          'Do one practice interview with your coach or counsellor.',
        ],
        questioned: `Review requested. ${counsellor.name}, your assigned counsellor, goes through it with you within 5 working days. Your level stays as it is until then, and a person makes the decision.`,
      },
      {
        id: 'fit-qasr',
        title: 'Fit for Finance Analyst, Qasr Logistics',
        value: 'Strong',
        why: `Top skills: ${skillText(mariamSkills.excel, true)}, ${skillText(mariamSkills.reporting, true)}. Gap: forecasting.`,
        employerNote: 'The employer sees the same tier, not a number.',
        questioned:
          'Review requested. A person in the matching team checks the skills behind this tier and replies here within 5 working days. Qasr Logistics is not told that you asked, unless you agree or a legal order requires it.',
      },
      {
        id: 'fit-audit',
        title: `Fit for Audit Associate, ${auditEmployers.value} employers`,
        value: 'Good',
        why: `Top skills: ${skillText(mariamSkills.reporting, true)}, ${skillText(mariamSkills.analysis, true)}. Gap: audit sampling, which a 6-week course closes.`,
        employerNote: 'The employers see the same tier, not a number.',
        questioned:
          'Review requested. A person in the matching team checks the skills behind this tier and replies here within 5 working days. The employers are not told that you asked, unless you agree or a legal order requires it.',
      },
    ] satisfies ScoreRow[],
  },
  permissions: {
    heading: 'Permissions',
    intro: 'Each permission is a Consent Grant: one recipient, one purpose and a list of fields. Each use of it needs an access token.',
    labels: { purpose: 'Purpose', fields: 'Shares', until: 'Until' },
    qasr: {
      recipient: qasr.name,
      purpose: 'Interview',
      fields: 'Name · Skills Passport levels · CV',
      until: '28 Jan 2027',
    },
    university: {
      recipient: 'Your university',
      purpose: 'Graduate outcomes',
      fields: 'Counts only, never your name',
      until: 'Ongoing',
    },
    revoke: 'Revoke',
    revokeConfirm: `Revoke this permission? ${qasr.name} loses future access to your name, Skills Passport levels and CV.`,
    revokeYes: 'Revoke access',
    revokeNo: 'Keep it',
    revoked: 'Revoking stops future access at once. Data Qasr Logistics already received under a valid token stays lawful, and the receipt is logged.',
    revokedState: 'Revoked today',
    optOut: 'Opt out',
    optedOut: "Opted out. Your university's next outcome counts leave you out. It never received your name.",
    optedOutState: 'Opted out',
    optIn: 'Opt back in',
  },
  viewed: {
    heading: 'Who viewed my record',
    intro: 'Every view is logged here, with the fields that were seen.',
    seen: 'Saw:',
    rows: [
      {
        id: 'v1',
        who: `Counsellor ${counsellor.name}`,
        purpose: 'Career review',
        date: '26 Oct',
        seen: 'Skills Passport, Development Plan and Direction Profile',
      },
      {
        id: 'v2',
        who: qasr.name,
        purpose: 'Anonymous card in a shortlist for its Finance Analyst role',
        date: '24 Oct',
        seen: 'skills, availability and fit tier, with no name',
      },
      {
        id: 'v3',
        who: 'Statistics unit',
        purpose: 'Cohort study, no name shown',
        date: '20 Oct',
        seen: 'study and job fields under a pseudonym',
      },
    ],
  },
  coach: {
    heading: 'Coach settings',
    rows: [
      { label: 'Quiet hours', value: '21:00–08:00' },
      { label: 'Coach messages', value: 'Light, 1 a week' },
    ],
    channels: 'Arabic and English, text and voice, inside the NAFIS app; nothing on third-party messaging.',
    channelsLabel: 'Where it reaches you',
    ramadan: 'Ramadan mode',
    ramadanHelp: 'During Ramadan, messages come later in the day and are shorter.',
    ramadanDefault: true,
    off: 'Turn the coach off',
    offConfirm:
      'Your Coach Agent stops messaging you and stops drafting for you. Turning the coach off is never used as a reason to call you or to change your Support level.',
    offYes: 'Turn it off',
    offNo: 'Keep the coach',
    offDone: 'Coach off. It sends no messages and drafts nothing until you turn it back on.',
    onAgain: 'Turn the coach back on',
  },
  rights: {
    download: 'Download my data',
    downloaded:
      'Request logged. A file with your full Talent Record and this access log will be in Messages within 24 hours. In this demo no file is made.',
    correct: 'Correct something',
    corrected:
      'Tell your coach or counsellor what is wrong and where it came from. A person checks it against the source within 10 working days and tells you the result. Until then, the item is marked as disputed.',
  },
};
