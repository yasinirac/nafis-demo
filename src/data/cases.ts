import { companies } from './companies';
import { people, staff } from './people';
import { fig, type DataStatus, type Figure, type SupportLevel } from './types';

/**
 * Staff Console data: the counsellor console (brief 6.10) and integrity case
 * IC-2026-1183 (brief 6.11). Every person, firm and figure is fictional
 * sample data.
 *
 * Counsellor guardrails: switching the coach off, being open to move or not
 * answering a survey is never a reason for a call. A high-risk signal needs a
 * contact within 5 working days. A gap starts a conversation, never a penalty.
 *
 * Integrity guardrails: a model raises an alert, a person opens the case, a
 * second person reviews it, and the establishment gets a hearing. No
 * automatic penalty or clawback; the six employees keep their support.
 */

const status: DataStatus = 'sample';

/* ------------------------------------------------------------------ */
/* Counsellor console                                                  */
/* ------------------------------------------------------------------ */

export type Priority = 'High' | 'Medium' | 'Routine';

export type OutcomeId = 'close' | 'training' | 'employer' | 'role' | 'integrity' | 'retry';

export interface CaseSignal {
  id: string;
  tag: string;
  detail: string;
  source: string;
}

export interface CallCase {
  id: string;
  name: string;
  firstName: string;
  roleLine: string;
  supportLevel: SupportLevel;
  lastContact: string;
  priority: Priority;
  /** Booked call time shown on the queue card. */
  due: string;
  /** The call falls on the scenario day, Thursday 29 October 2026. */
  today: boolean;
  /** High-risk signals only: when it was raised and when the contact is due. */
  deadline?: string;
  /** Short reasons on the queue card. */
  reasons: string[];
  signals: CaseSignal[];
  /** What the manager reported against what the person said, when they differ. */
  gap?: {
    title: string;
    managerLabel: string;
    managerSays: string;
    personLabel: string;
    personSays: string;
    note: string;
  };
  /** A caller preference the person stated, with a reassignment. */
  preference?: {
    text: string;
    action: string;
    due: string;
    done: string;
    chip: string;
    callNote: string;
    outcomeNote: string;
  };
  /** Drafted by the Counsellor Copilot from the signals; the counsellor decides. */
  plan: {
    questions: string[];
    offer: string[];
    avoid: string[];
  };
}

export interface OutcomeOption {
  id: OutcomeId;
  label: string;
  /** Shown when the outcome is chosen. {name} is the person's first name. */
  note: string;
}

const khalid = people.khalid;
const fatima = people.fatima;
const hamad = people.hamad;
const saeed = people.saeed;
const mariam = people.mariam;
const qasr = companies.qasr.name;
const omar = staff.omar.name;

export const counsellorConsole = {
  status,
  header: {
    eyebrow: 'Sharjah team · Thursday 29 October 2026',
    title: 'Counsellor console',
    summary: '{calls} calls booked this week, {today} today.',
    summaryMoved: '{calls} calls booked this week, {today} today. {moved} moved to {colleague}.',
    copilot: 'The Counsellor Copilot drafts a plan for each call. You decide what to ask and what happens next.',
    accessChip: 'Full record for own caseload · every view logged',
    colleague: omar,
  },

  tilesLabel: 'Caseload summary',
  tiles: {
    caseload: { label: 'Caseload', value: fig(168, status), cap: fig(200, status), sub: 'Cap {cap}' },
    flagged: { label: 'Flagged this month', value: fig(9, status), sub: '{calls} calls booked this week' },
    median: { label: 'Median days since contact', value: fig(21, status), target: fig(30, status), sub: 'Target under {target}' },
  },
  supportMix: {
    title: 'Caseload by support level',
    subtitle: 'From least to most help needed',
    ariaLabel: 'Segmented bar of the caseload by support level: {list}.',
    unit: 'people',
    segments: [
      { level: 'Accelerate', value: fig(41, status) },
      { level: 'Grow', value: fig(62, status) },
      { level: 'Stabilise', value: fig(44, status) },
      { level: 'Support', value: fig(21, status) },
    ] satisfies Array<{ level: SupportLevel; value: Figure }>,
    tableColumns: { level: 'Support level', people: 'People', share: 'Share of caseload' },
  },

  queue: {
    title: "This week's calls",
    subtitle: 'Highest priority first. A high-risk signal needs a contact within 5 working days.',
    legend: 'Choose a call to open its case',
    guardrail: 'Never a reason for a call: switching the coach off, a wish to change employer, or not answering a survey.',
    priorityWord: 'priority',
    /** Shown on the selected card while the case detail sits below the list (narrow screens). */
    openCase: "Go to {name}'s case",
  },

  priorityLabels: { High: 'High', Medium: 'Medium', Routine: 'Routine' } satisfies Record<Priority, string>,

  cases: [
    {
      id: 'khalid',
      name: khalid.name,
      firstName: khalid.firstName,
      roleLine: `${khalid.role} · ${companies.wadi.name} · month\u00a07`,
      supportLevel: 'Stabilise',
      lastContact: '24 Sep, 35 days ago',
      priority: 'High',
      due: 'Today 10:00',
      today: true,
      deadline: 'Signal 26 Oct · contact due by 2 Nov',
      reasons: ["Duties don't match title", 'Report disagrees', 'Pulse fell 4 → 2'],
      signals: [
        {
          id: 'alignment',
          tag: 'Alignment Check',
          detail: 'His Alignment Check on 12 Oct says about 70% of his week is data entry and filing.',
          source: 'Alignment Check, 12 Oct',
        },
        {
          id: 'report',
          tag: 'Report gap',
          detail: "His manager's October report says he leads the weekly supplier reviews. Khalid says he is not part of them.",
          source: 'Company Monthly Report, compared with his Alignment Check',
        },
        {
          id: 'pulse',
          tag: 'Pulse',
          detail: 'His Pulse fell from 4 to 2.',
          source: 'Talent Monthly Pulse, September and October',
        },
        {
          id: 'development',
          tag: 'Development',
          detail: 'No development hours in 3 months.',
          source: 'Development Plan and training records',
        },
      ],
      gap: {
        title: "The manager's report and Khalid's answers differ",
        managerLabel: 'Manager, October report',
        managerSays: 'Khalid leads the weekly supplier reviews.',
        personLabel: 'Khalid, Alignment Check on 12 Oct',
        personSays: 'He is not part of the supplier reviews.',
        note: "Ask open questions first and don't quote either side. Each answer was given in confidence. A gap starts a conversation; it never triggers a penalty.",
      },
      preference: {
        text: `${khalid.firstName} asked for a male counsellor on calls.`,
        action: `Reassign to ${omar} (free 11:00)`,
        due: `Today 11:00 · with ${omar}`,
        done: `Reassigned to ${omar} for 11:00 today. ${khalid.firstName} gets a message with the new time, and the call plan moves with the case.`,
        chip: `Reassigned to ${omar}`,
        callNote: `${omar} takes this call at 11:00.`,
        outcomeNote: `${omar} records the outcome after his call.`,
      },
      plan: {
        questions: [
          'Talk me through a normal week. What takes most of your time?',
          'Which parts of the job use what you studied?',
          'How do the supplier reviews work, and would you like a part in them?',
          'What would make the next three months better for you?',
        ],
        offer: ['A supplier management course that NAFIS funds', 'A three-way talk with his manager, only if he agrees'],
        avoid: ["Quoting his manager's report or his own answers", 'Promising a move or a pay rise'],
      },
    },
    {
      id: 'fatima',
      name: fatima.name,
      firstName: fatima.firstName,
      roleLine: 'Jobseeker · BSc Marketing 2025 · lives in Kalba',
      supportLevel: 'Support',
      lastContact: '9 Oct, 20 days ago',
      priority: 'High',
      due: 'Today 11:30',
      today: true,
      deadline: 'Signal 27 Oct · contact due by 3 Nov',
      reasons: ['9 months, no offer', 'Declined 4 roles over 60 min away'],
      signals: [
        {
          id: 'search',
          tag: 'Job search',
          detail: '9 months looking for work, with no offer yet.',
          source: 'Talent Record, registered January 2026',
        },
        {
          id: 'declines',
          tag: 'Introductions',
          detail: 'Declined 4 introductions. Each job was more than 60 minutes from Kalba.',
          source: 'Introduction Requests and her decline reasons',
        },
      ],
      plan: {
        questions: [
          'What work would you take tomorrow if it were close to home?',
          'Would remote or hybrid roles work for you?',
          'What would help most in your next interview?',
        ],
        offer: ['Remote roles and roles on the east coast', 'Interview practice with feedback'],
        avoid: ['Pushing roles she has already declined', 'Suggesting she move away from Kalba'],
      },
    },
    {
      id: 'hamad',
      name: hamad.name,
      firstName: hamad.firstName,
      roleLine: `${hamad.role} · ${qasr}, Dubai branch · month\u00a03`,
      supportLevel: 'Stabilise',
      lastContact: '1 Oct, 28 days ago',
      priority: 'Medium',
      due: 'Fri 30 Oct, 09:00',
      today: false,
      reasons: ['Missed 4 days in October', 'Night shifts not mentioned at hire'],
      signals: [
        {
          id: 'attendance',
          tag: 'Attendance',
          detail: 'Missed 4 working days in October.',
          source: `${qasr} HR system, shared with his consent`,
        },
        {
          id: 'shifts',
          tag: 'Alignment Check',
          detail: 'Says night shifts were not mentioned when he was hired.',
          source: 'Alignment Check at day 90, 27 Oct',
        },
      ],
      plan: {
        questions: [
          'How are the night shifts working for you?',
          'Were the shifts explained when you were offered the job?',
          'What would help you make every shift?',
        ],
        offer: ['Check his offer against the Introduction Request', `Ask ${qasr} about a shift pattern, only if he agrees`],
        avoid: ['Judging the missed days before hearing why'],
      },
    },
    {
      id: 'saeed',
      name: saeed.name,
      firstName: saeed.firstName,
      roleLine: `${saeed.role} · ${qasr}, Sharjah HQ · month\u00a07`,
      supportLevel: 'Grow',
      lastContact: '18 Sep, 41 days ago',
      priority: 'Medium',
      due: 'Fri 30 Oct, 10:30',
      today: false,
      reasons: ['No training in 7 months', 'Asked for a call'],
      signals: [
        {
          id: 'request',
          tag: 'Request',
          detail: 'Asked his Coach on 20 Oct for a call about pay and his next step.',
          source: 'Coach Agent, passed on at his request',
        },
        {
          id: 'training',
          tag: 'Development',
          detail: 'No training recorded in 7 months.',
          source: 'Training records and Company Monthly Reports',
        },
      ],
      plan: {
        questions: [
          'You asked to talk about pay and your next step. What would you like to change?',
          `Has anyone at ${qasr} talked with you about training?`,
          'Would it help to prepare for a pay conversation with your manager?',
        ],
        offer: ['Practice for a pay conversation', 'A sales course that NAFIS funds'],
        avoid: ['Promising a pay rise'],
      },
    },
    {
      id: 'mariam',
      name: mariam.name,
      firstName: mariam.firstName,
      roleLine: 'Final-year student · BSc Accounting · graduates December 2026',
      supportLevel: 'Grow',
      lastContact: '26 Oct, 3 days ago',
      priority: 'Routine',
      due: 'Fri 30 Oct, 11:30',
      today: false,
      reasons: ['First interview Tue 3 Nov'],
      signals: [
        {
          id: 'interview',
          tag: 'Interview',
          detail: `First interview with ${qasr} for a Finance Analyst role, Tue 3 Nov at 10:00.`,
          source: 'Introduction Request she accepted',
        },
        {
          id: 'practice',
          tag: 'Coach',
          detail: 'Her Coach Agent suggested interview practice.',
          source: 'Coach Agent',
        },
      ],
      plan: {
        questions: [
          'Would a 20-minute practice interview help before Tuesday?',
          'Do you have the pay range, hours and site in writing?',
          'What would you like to ask them about training?',
        ],
        offer: ['A practice interview', 'A first-week checklist'],
        avoid: ['Long preparation; keep it short'],
      },
    },
  ] satisfies CallCase[],

  outcomes: [
    { id: 'close', label: 'On track, close', note: 'Closes this signal. {name} keeps the regular check-ins.' },
    { id: 'training', label: 'Training plan', note: "Adds a training step to {name}'s Development Plan. {name} sees it and can change it." },
    { id: 'employer', label: 'Talk to employer', note: 'Ask for consent on the call. Nothing {name} told you reaches the employer without it.' },
    { id: 'role', label: 'Role change support', note: 'Starts support to find a role that fits better. The employer is not told unless {name} agrees.' },
    {
      id: 'integrity',
      label: 'Refer to integrity review',
      note: "With the person's consent, this opens an integrity review that names them. Without consent, NAFIS sends an employer-level signal only. The person is never penalised automatically.",
    },
    { id: 'retry', label: 'No answer, try again', note: 'Keeps {name} in your queue. A high-risk signal still needs a contact within 5 working days.' },
  ] satisfies OutcomeOption[],

  checkIns: [
    { id: '2w', label: 'In 2 weeks · Thu 12 Nov' },
    { id: '4w', label: 'In 4 weeks · Thu 26 Nov' },
    { id: '8w', label: 'In 8 weeks · Thu 24 Dec' },
  ],
  defaultCheckIn: '4w',

  copy: {
    call: 'Call through NAFIS line',
    endCall: 'End call',
    calling: 'Call started through the NAFIS line. In this demo no call is placed.',
    ended: 'Call ended. Record the outcome below.',
    supportLevel: 'Support level: {level}',
    lastContact: 'Last contact {when}',
    preferenceLabel: 'Caller preference',
    undo: 'Undo',
    whyTitle: 'Why {name} is on your list',
    whyNote: 'Each signal shows where it came from. There is no single score here; you decide what the call covers.',
    sourceWord: 'Source',
    planTitle: 'Call plan',
    planAgentNote: 'you decide what to ask',
    questionsTitle: 'Questions to open with',
    offerTitle: 'Offer if it helps',
    avoidTitle: 'Avoid',
    planFootnote: 'Drafted only from the signals above. Nothing in the plan is sent to {name} or to an employer.',
    afterTitle: 'After the call',
    outcomeLegend: 'Outcome',
    notesLabel: 'Notes',
    notesHint: 'What you agreed, in plain words.',
    checkInLabel: 'Next check-in',
    save: 'Save outcome',
    saveHint: 'Choose an outcome to save the call.',
    saved: "Saved to {name}'s case. Next check-in: {date}.",
    savedChip: 'Saved · {outcome}',
    footnote:
      'Call notes are seen only by NAFIS counselling staff. They are never shared with employers or government recruiters, and {name} can ask to read them. The only exception is a legal order that requires NAFIS to disclose them.',
  },
};

/* ------------------------------------------------------------------ */
/* Integrity case IC-2026-1183                                         */
/* ------------------------------------------------------------------ */

export type ReasonMark = 'confirmed' | 'not-confirmed';

export type IntegrityDecisionId = 'close' | 'documents' | 'inspection' | 'inspection-support';

export interface IntegrityReason {
  code: string;
  title: string;
  detail: string;
  source: string;
  rule: string;
  /** How the Ghost-Job Detector uses this reason. */
  modelUse: string;
  /** Marked before this review session. */
  preset?: ReasonMark;
}

export interface LinkRow {
  from: string;
  to: string;
  link: string;
  evidence: string;
}

const salem = staff.salem.name;
const mona = staff.mona.name;
const shortName = 'Dune Crest';
const hireCodes = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
/** E1 to E4: money leaves within 2 days of payday (R12). */
const moneyFrom = [0, 1, 2, 3];
/** E2, E3, E5 and E6: the owner's registered address as home (R03). */
const addressFrom = [1, 2, 4, 5];
const householdAccount = "One account linked to the owner's household";
const registeredAddress = "Owner's registered address";

const linkRows: LinkRow[] = [
  ...hireCodes.map((code) => ({ from: shortName, to: code, link: 'Salary, AED 6,000 a month', evidence: 'Payroll records' })),
  ...moneyFrom.map((i) => ({
    from: hireCodes[i] as string,
    to: householdAccount,
    link: 'About AED 4,000 within 2 days of payday',
    evidence: 'Bank pattern flag',
  })),
  ...addressFrom.map((i) => ({
    from: hireCodes[i] as string,
    to: registeredAddress,
    link: 'Gives it as home address',
    evidence: 'Address records',
  })),
  { from: 'Owner', to: householdAccount, link: "Linked to the owner's household", evidence: 'Bank pattern flag' },
  { from: 'Owner', to: registeredAddress, link: 'Registered address of the owner', evidence: 'Licence records' },
];

export const integrityCase = {
  id: 'IC-2026-1183',
  status,
  eyebrow: 'Integrity case',
  title: 'Case IC-2026-1183',
  headerLine: `${companies.duneCrest.name} (fictional) · 6 Emirati hires · flagged 3 Oct 2026 by the Ghost-Job Detector · opened 5 Oct by ${salem}`,
  accessChip: 'Assigned cases only · every view logged',
  chips: {
    stage: 'Stage: evidence review',
    stageSent: `Stage: second review with ${mona}`,
    day: 'Day {day} of {limit}',
    dayValue: fig(24, status),
    dayLimit: fig(60, status),
    investigator: `Investigator ${salem}`,
    reviewer: `Second reviewer ${mona}`,
    atStake: 'At stake: 6 counted placements · about AED 0.6m a year in contributions (sample)',
  },

  model: {
    title: 'Why the model flagged it',
    score: fig(0.91, status),
    version: 'v3.2',
    summary:
      'Ghost-Job Detector score {score} (model {version}). A score raises an alert; a person opens the case, and a score never decides one.',
    principle: 'Every score carries reason codes a firm can read and appeal.',
    agentNote: 'raised the alert · a person decides',
    progress: '{done} of {total} reasons checked',
    modelUseLabel: 'How the model uses it:',
    confirmed: 'Confirmed',
    notConfirmed: 'Not confirmed',
    groupLabel: 'Review of {code}: {title}',
    lockedNote: `Locked while ${mona} reviews. Withdraw the decision to change a mark.`,
  },

  reasons: [
    {
      code: 'R07',
      title: 'Pay pinned at the floor',
      detail: 'All 6 are paid exactly AED 6,000 a month, with no allowances and no change.',
      source: 'Payroll records, Jan–Sep 2026',
      rule: 'Rule RL-07, legal basis on file',
      modelUse: 'Weight only: honest small firms also pay floor salaries.',
      preset: 'confirmed',
    },
    {
      code: 'R12',
      title: 'Pay flows back',
      detail: "For 4 of the 6, a bank flag shows about AED 4,000 leaving within 2 days of payday, to one account linked to the owner's household.",
      source: 'Bank pattern flag only',
      rule: 'Rule RL-12, legal basis on file',
      modelUse: 'Raises a review, checked by a person: family transfers can look similar.',
    },
    {
      code: 'R03',
      title: 'Shared address',
      detail: "4 of the 6 give the owner's registered address as their home.",
      source: 'Address records',
      rule: 'Rule RL-03, legal basis on file',
      modelUse: 'Weight only: family firms are legal.',
    },
    {
      code: 'R15',
      title: 'No trading footprint',
      detail: 'No VAT registration and no customer invoices, for a firm that declares 31 staff.',
      source: 'Tax registration and invoice records, yes or no only',
      rule: 'Rule RL-15, legal basis on file',
      modelUse: 'Raises a review.',
    },
    {
      code: 'R09',
      title: 'Hired just before a checkpoint',
      detail: '5 of the 6 were hired between 8 and 29 December 2025. The firm was licensed in August 2025.',
      source: 'Work permits and trade licence',
      rule: 'Rule RL-09, legal basis on file',
      modelUse: 'Raises a review.',
      preset: 'confirmed',
    },
    {
      code: 'R21',
      title: 'Reports too good to be true',
      detail: 'All 54 monthly reports rate every hire well above expectations. The owner signed each one on the same device, in under 2 minutes.',
      source: 'Company Monthly Reports and their signing records',
      rule: 'Rule RL-21, legal basis on file',
      modelUse: 'Weight only: in a small firm one person often signs every report.',
    },
  ] satisfies IntegrityReason[],

  evidence: {
    title: 'Evidence pack',
    tabsLabel: 'Evidence views',
    tabs: { pay: 'Pay pattern', links: 'Money and links', timeline: 'Timeline' },
  },

  payPattern: {
    title: 'Monthly pay, January to September 2026',
    subtitle: 'Payroll records. Similar firms: same sector and size band.',
    year: 2026,
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
    hires: fig([6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000], status),
    p25: fig([7600, 7600, 7650, 7700, 7700, 7750, 7800, 7800, 7850], status),
    p75: fig([10150, 10150, 10200, 10250, 10250, 10300, 10350, 10350, 10400], status),
    yMax: 12000,
    yTicks: [0, 3000, 6000, 9000, 12000],
    ariaLabel:
      'Line chart: all 6 hires were paid {hires} every month from January to September 2026, below the middle half of pay at similar firms, about AED {low} to {high}.',
    legendHires: 'These 6 hires (all identical)',
    legendBand: 'Similar firms, middle half of pay',
    tableMonth: '{month} {year}',
    tooltipTitle: '{month} {year}, AED a month',
    tooltipHires: 'These 6 hires',
    tooltipBand: 'Similar firms',
    pointLabel: '{month} {year}: each of the 6 hires was paid AED {hires}; the middle half of pay at similar firms was AED {p25} to {p75}.',
    tableColumns: {
      month: 'Month',
      hires: 'Each of the 6 hires (AED)',
      p25: 'Similar firms, 25th percentile (AED)',
      p75: 'Similar firms, 75th percentile (AED)',
    },
    footnote: 'NAFIS receives a yes-or-no pattern flag from banks, never statements.',
  },

  links: {
    title: 'Money and links between the employer, the 6 hires and the owner',
    subtitle: 'E1 to E6 stand for the six hires. Their names stay in the case file.',
    ariaLabel:
      "Network diagram: Dune Crest pays 6 hires; 4 of them send money on to one account linked to the owner's household, and 4 give the owner's registered address as home.",
    hireLabels: hireCodes,
    moneyFrom,
    addressFrom,
    employerLines: [shortName, 'employer'],
    accountLinesWide: ['One account linked to', "the owner's household"],
    accountLinesNarrow: ['One account linked', "to the owner's", 'household'],
    addressLines: ["Owner's registered", 'address'],
    ownerLabel: 'Owner',
    salaryNote: 'AED 6,000 a month each',
    moneyNote: '≈ AED 4,000 within 2 days of payday',
    narrowCaption: 'Salary: AED 6,000 a month each. Money sent on: about AED 4,000 within 2 days of each payday.',
    legend: {
      salary: 'Salary paid (payroll)',
      money: 'Money sent on (bank pattern flag)',
      address: 'Same home address (address records)',
      owner: "Owner's links (licence and bank records)",
    },
    tableColumns: { from: 'From', to: 'To', link: 'Link', evidence: 'Evidence' },
    rows: linkRows,
    footnote: 'NAFIS receives a yes-or-no pattern flag from banks, never statements. Amounts are bands, not transactions.',
  },

  timeline: {
    title: 'Case timeline',
    todayLabel: 'Today',
    events: [
      { id: 'alert', date: '3 Oct', text: 'The Ghost-Job Detector raised an alert.', today: false },
      {
        id: 'opened',
        date: '5 Oct',
        text: `${salem} opened the case after triage. Counsellors offered each hire a confidential call.`,
        today: false,
      },
      {
        id: 'calls',
        date: '9 Oct',
        text: '2 of the 6 took the call. What they said stays with counselling unless they agree to share it or a legal order requires it.',
        today: false,
      },
      { id: 'bank', date: '14 Oct', text: 'Bank pattern flag received for 4 of the 6.', today: false },
      { id: 'declaration', date: '20 Oct', text: 'The establishment signed its monthly declaration that no pay is returned.', today: false },
      { id: 'review', date: '29 Oct', text: 'Evidence review.', today: true },
    ],
  },

  decision: {
    title: 'Your decision',
    legend: 'Decision',
    options: [
      {
        id: 'close',
        label: 'Close, no issue found',
        description: 'The case closes with your reason on file. Nothing is sent to the establishment.',
      },
      {
        id: 'documents',
        label: 'Ask the establishment for documents',
        description: `After ${mona} approves, the establishment gets a notice listing what is needed.`,
      },
      {
        id: 'inspection',
        label: 'Refer to MoHRE inspection',
        description: 'Inspectors check that the work is real. No penalty before inspection.',
      },
      {
        id: 'inspection-support',
        label: 'Refer to MoHRE, and ask a case officer to review support (RB-1)',
        description: 'A case officer reviews the support linked to these placements. Nothing is clawed back automatically, and the 6 employees keep their support.',
      },
    ] satisfies Array<{ id: IntegrityDecisionId; label: string; description: string }>,
    reasonLabel: 'Reason for your decision',
    reasonHint: `${mona} reads it with the evidence before she approves.`,
    send: `Send to ${mona} for second review`,
    noReason: 'No reason written.',
    remainingOne: 'the last reason',
    remainingMany: 'the {left} remaining reasons',
    needMarksAndDecision: 'Mark {which} and choose a decision to send.',
    needMarks: 'Mark {which} to send.',
    needDecision: 'Choose a decision to send.',
    ready: `Ready to send. ${mona} reviews it before anything reaches the establishment.`,
    sent: `Sent to ${mona}. Nothing reaches the establishment until she approves. If she does, they get a notice listing every reason with its evidence and have 10 working days to respond.`,
    sentClose: `Sent to ${mona}. If she agrees, the case closes with your reason on file. Nothing reaches the establishment.`,
    withdraw: 'Withdraw to edit',
  },

  employees: {
    title: 'The 6 employees',
    points: [
      'They may have been exploited. Their NAFIS support continues while the case is open.',
      'Each was offered a confidential call with a counsellor. What they say stays with counselling unless they agree to share it, or a legal order requires it.',
      'No person is penalised without their own hearing.',
    ],
  },

  safeguards: {
    title: 'Safeguards',
    points: [
      'The establishment sees nothing until a referral is approved. It can then answer within 10 working days and appeal to Legal, Privacy & Appeals, then to the independent appeals panel.',
      'Appeals are decided within 20 days.',
      'No clawback or penalty is automatic. The 6 employees keep their support.',
      'Every reason code traces to a legal clause. If Legal flags a rule, it is paused within 2 working days.',
      'Every model entry has a version, a training set hash, a fairness report and a named owner.',
    ],
    modelLine: 'Model {version}: precision {precision} on confirmed 2025 cases. Bias audit September 2026.',
    precision: fig(0.78, status),
  },

  notFound: {
    title: 'Case not found in this demo',
    body: 'There is no case {id} in this demo. It holds one integrity case.',
    open: 'Open case {id}',
  },
};
