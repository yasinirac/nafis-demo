import type { Tier } from './types';

/**
 * Platform structure: portals, built screens, planned screens, demo personas.
 * The route list here is the single source for routing, page titles and
 * docs/SCREENS.md.
 */

export const conceptNotice = 'Concept · not an official NAFIS or UAE Government service · sample data';

export type PortalId =
  | 'talent'
  | 'employer'
  | 'government'
  | 'staff'
  | 'analyst'
  | 'developer'
  | 'contributor'
  | 'executive'
  | 'public';

export type PersonaId =
  | 'mariam'
  | 'rashid'
  | 'huda'
  | 'ahmed'
  | 'recruiter'
  | 'aisha'
  | 'salem'
  | 'noor'
  | 'reem'
  | 'hessa'
  | 'chief'
  | 'visitor';

export interface Persona {
  id: PersonaId;
  name: string;
  detail: string;
  path: string;
  initial: string;
  /** Organisation chip in the portal header. */
  org: string;
  /** Role chip in the portal header. */
  role: string;
}

export const personas: Persona[] = [
  { id: 'mariam', name: 'Mariam Al Shamsi', detail: 'Talent · final-year student', path: '/talent', initial: 'M', org: 'Talent app', role: 'Student' },
  { id: 'rashid', name: 'Rashid Al Ketbi', detail: 'Talent · Finance Analyst, month 6', path: '/talent/alignment-check', initial: 'R', org: 'Talent app', role: 'Employee' },
  { id: 'huda', name: 'Huda', detail: 'Employer · HR Admin, Qasr Logistics', path: '/employer', initial: 'H', org: 'Qasr Logistics · 2 licences', role: 'HR Admin' },
  { id: 'ahmed', name: 'Ahmed', detail: 'Employer · line manager, Qasr Logistics', path: '/employer/monthly-report', initial: 'A', org: 'Qasr Logistics · Sharjah HQ', role: 'Line manager' },
  { id: 'recruiter', name: 'Recruitment officer', detail: 'Government · federal entity, February 2030 scenario', path: '/government/career-record', initial: 'R', org: 'Federal entity (fictional)', role: 'Recruitment officer' },
  { id: 'aisha', name: 'Aisha', detail: 'Staff · counsellor, Sharjah team', path: '/staff/counsellor', initial: 'A', org: 'NAFIS counselling · Sharjah team', role: 'Counsellor' },
  { id: 'salem', name: 'Salem', detail: 'Staff · investigator', path: '/staff/integrity/IC-2026-1183', initial: 'S', org: 'NAFIS integrity unit', role: 'Investigator' },
  { id: 'noor', name: 'Noor', detail: 'Analyst · Statistics & Evaluation unit', path: '/analyst', initial: 'N', org: 'Statistics & Evaluation unit', role: 'Analyst · T2 read-only' },
  { id: 'reem', name: 'Reem', detail: 'Developer · Falak HR Cloud (fictional)', path: '/developer', initial: 'R', org: 'Falak HR Cloud (fictional) · sandbox', role: 'Developer' },
  { id: 'hessa', name: 'Hessa', detail: 'Contributor · Gulf Coast University (fictional)', path: '/contributor', initial: 'H', org: 'Gulf Coast University (fictional) · College of Business', role: 'Careers office' },
  { id: 'chief', name: 'Chief executive', detail: 'Executive Command Centre', path: '/executive', initial: 'C', org: 'Office of the chief executive', role: 'Chief executive' },
  { id: 'visitor', name: 'Public visitor', detail: 'Public statistics, no sign-in', path: '/public', initial: 'P', org: 'Public', role: 'Visitor' },
];

export interface ScreenInfo {
  path: string;
  title: string;
  portal: PortalId | 'map';
  persona: PersonaId | null;
  purpose: string;
}

export const screens: ScreenInfo[] = [
  { path: '/', title: 'Platform map', portal: 'map', persona: null, purpose: 'The core record, policy engine and agent mesh, and the nine portals with their built and planned screens.' },
  { path: '/talent', title: 'Talent Home', portal: 'talent', persona: 'mariam', purpose: 'Greeting, progress through the stages, next steps, a Coach Agent draft and an Introduction Request.' },
  { path: '/talent/path', title: 'Career Path', portal: 'talent', persona: 'mariam', purpose: 'Three possible paths with milestones and how many of 100 similar people reached each step.' },
  { path: '/talent/alignment-check', title: 'Alignment Check', portal: 'talent', persona: 'rashid', purpose: 'A four-minute check that the role is real and right, with the privacy promise and a computed result.' },
  { path: '/talent/privacy', title: 'Privacy and consent', portal: 'talent', persona: 'mariam', purpose: 'Who can find me, every score about me, permissions, who viewed my record and coach settings.' },
  { path: '/employer', title: 'Employer dashboard', portal: 'employer', persona: 'huda', purpose: 'Legal count, contributions, retention, quality score, Employer Agent actions, pipeline and team.' },
  { path: '/employer/discovery', title: 'Talent Discovery', portal: 'employer', persona: 'huda', purpose: 'Anonymous Talent Cards ranked for a Role Profile and an Introduction Request with the pay range first.' },
  { path: '/employer/monthly-report', title: 'Company Monthly Report', portal: 'employer', persona: 'ahmed', purpose: 'A two-minute monthly report by the line manager, pre-filled from payroll and HR systems.' },
  { path: '/government/career-record', title: 'Verified Career Record', portal: 'government', persona: 'recruiter', purpose: 'A consented, verified record with grade and salary decision support for a federal recruiter.' },
  { path: '/staff/counsellor', title: 'Counsellor console', portal: 'staff', persona: 'aisha', purpose: "This week's calls, why each person is on the list, and a Counsellor Copilot call plan." },
  { path: '/staff/integrity/IC-2026-1183', title: 'Integrity case IC-2026-1183', portal: 'staff', persona: 'salem', purpose: 'A Ghost-Job Detector alert under human review, with evidence, safeguards and a second reviewer.' },
  { path: '/analyst', title: 'Analyst Workbench', portal: 'analyst', persona: 'noor', purpose: 'Ask the data in plain words, read certified metrics and pass the release check.' },
  { path: '/developer', title: 'Developer Portal', portal: 'developer', persona: 'reem', purpose: 'API catalogue with purpose codes, Consent Grants and access tokens, sandbox and certification.' },
  { path: '/contributor', title: 'Contributor Portal', portal: 'contributor', persona: 'hessa', purpose: 'Graduate outcomes for one programme in aggregate, skill gaps and faculty suggestions.' },
  { path: '/executive', title: 'Executive Command Centre', portal: 'executive', persona: 'chief', purpose: 'Headline figures with status, history and forecast, money and return, funnel and skills coverage.' },
  { path: '/executive/monthly-pack', title: 'Monthly pack', portal: 'executive', persona: 'chief', purpose: "The monthly report to the Undersecretary's office with sign-off, key numbers and decisions." },
  { path: '/public', title: 'Public statistics', portal: 'public', persona: 'visitor', purpose: 'Published counts, illustrative retention by sector, how we count and the release calendar.' },
];

export interface PortalInfo {
  id: PortalId;
  number: number;
  name: string;
  /** Shown in the header as "NAFIS · <brand>". */
  brand: string;
  channel: string;
  sees: string;
  tiers: Tier[];
  group: 'served' | 'runs';
  home: string;
  built: Array<{ label: string; path: string }>;
  planned: string[];
}

export const portals: PortalInfo[] = [
  {
    id: 'talent',
    number: 1,
    name: 'Talent Portal',
    brand: 'Talent',
    channel: 'App · Emirati students, jobseekers, employees, returners',
    sees: 'Own full record, plus a log of who viewed it',
    tiers: ['T3', 'T4'],
    group: 'served',
    home: '/talent',
    built: [
      { label: 'Home and next steps', path: '/talent' },
      { label: 'Career Path', path: '/talent/path' },
      { label: 'Alignment Check', path: '/talent/alignment-check' },
      { label: 'Privacy and consent', path: '/talent/privacy' },
    ],
    planned: ['Direction Profile', 'Skills Passport', 'Development Plan', 'Coach chat', 'Opportunities', 'Benefits statement', 'Messages'],
  },
  {
    id: 'employer',
    number: 2,
    name: 'Employer Portal',
    brand: 'Employer Portal',
    channel: 'Web · owners, HR, recruiters, line managers, finance',
    sees: 'Own staff, and anonymous Talent Cards until a candidate accepts',
    tiers: ['T2', 'T3'],
    group: 'served',
    home: '/employer',
    built: [
      { label: 'Dashboard', path: '/employer' },
      { label: 'Talent Discovery', path: '/employer/discovery' },
      { label: 'Company Monthly Report', path: '/employer/monthly-report' },
    ],
    planned: ['Role Profiles', 'Pipeline and interviews', 'Offers and contracts', 'Onboarding plans', 'Compliance and finance', 'Users and roles'],
  },
  {
    id: 'government',
    number: 3,
    name: 'Government View',
    brand: 'Government View',
    channel: 'Web · federal and local government HR',
    sees: "An applicant's Verified Career Record, with their consent",
    tiers: ['T3'],
    group: 'served',
    home: '/government/career-record',
    built: [{ label: 'Verified Career Record', path: '/government/career-record' }],
    planned: ['Applications', 'Consent requests', 'Grade rules', 'Transfer compensation'],
  },
  {
    id: 'staff',
    number: 4,
    name: 'Staff Console',
    brand: 'Staff Console',
    channel: 'Web · counsellors, case officers, investigators, contact centre',
    sees: 'Own caseload or assigned cases only, every view logged',
    tiers: ['T3', 'T4'],
    group: 'runs',
    home: '/staff/counsellor',
    built: [
      { label: 'Counsellor console', path: '/staff/counsellor' },
      { label: 'Integrity case', path: '/staff/integrity/IC-2026-1183' },
    ],
    planned: ['Benefits case queue', 'Contact-centre desk', 'Partnership accounts', 'Quality and supervision'],
  },
  {
    id: 'analyst',
    number: 5,
    name: 'Analyst Workbench',
    brand: 'Analyst Workbench',
    channel: 'Web · analysts, statisticians, evaluators',
    sees: 'Pseudonymised data and certified metrics; names only through a Linkage Unit request',
    tiers: ['T1', 'T2'],
    group: 'runs',
    home: '/analyst',
    built: [{ label: 'Certified metrics and ask the data', path: '/analyst' }],
    planned: ['Cohort builder', 'Survival analysis', 'Scenario simulator', 'Notebooks', 'Output checking'],
  },
  {
    id: 'developer',
    number: 6,
    name: 'Developer Portal',
    brand: 'Developer Portal',
    channel: 'Web · engineers at HR software firms, universities and approved agents',
    sees: 'Synthetic sandbox data and APIs; named records only with a Consent Grant',
    tiers: ['T0', 'T2', 'T3'],
    group: 'runs',
    home: '/developer',
    built: [{ label: 'API catalogue and sandbox', path: '/developer' }],
    planned: ['Model registry', 'Release train', 'Status', 'Partner certification queue'],
  },
  {
    id: 'contributor',
    number: 7,
    name: 'Contributor Portal',
    brand: 'Contributor Portal',
    channel: 'Web · universities, training providers, assessors, mentors',
    sees: 'Outcomes of its own graduates and learners, in aggregate only',
    tiers: ['T1'],
    group: 'runs',
    home: '/contributor',
    built: [{ label: 'Programme outcomes', path: '/contributor' }],
    planned: ['Provider catalogue', 'Assessor marking queue', 'Mentor matches', 'Sector standards', 'Research access'],
  },
  {
    id: 'executive',
    number: 8,
    name: 'Executive Command Centre',
    brand: 'Executive Command Centre',
    channel: 'Web and mobile · chief executive, board and senior officials',
    sees: 'Every aggregate, with drill-down under the access rules',
    tiers: ['T1'],
    group: 'runs',
    home: '/executive',
    built: [
      { label: 'Command Centre home', path: '/executive' },
      { label: 'Monthly pack', path: '/executive/monthly-pack' },
    ],
    planned: ['Drill-down explorer', 'Scenario simulator', 'Alerts', 'Board pack', 'Answers to official questions'],
  },
  {
    id: 'public',
    number: 9,
    name: 'Public Transparency',
    brand: 'Public statistics',
    channel: 'Web · anyone, no sign-in',
    sees: 'Published statistics with method notes',
    tiers: ['T0'],
    group: 'runs',
    home: '/public',
    built: [{ label: 'Statistics', path: '/public' }],
    planned: ['Method notes', 'Open data downloads', 'Release calendar'],
  },
];

export const portalGroups: Record<PortalInfo['group'], { title: string; description: string }> = {
  served: { title: 'Served by NAFIS', description: 'The people and organisations the programme serves.' },
  runs: { title: 'Run and feed the platform', description: 'Staff, partners and the public who run it, feed it and check it.' },
};

export const coreCards = [
  {
    title: 'One joined record',
    body: 'Talent Records, establishment records, Verified Career Records, survey and report data, and the benefit ledger. Emirates ID is held in an identity vault; systems join on a surrogate person key. Establishments are keyed on the MoHRE establishment ID, with a group key above each licence.',
    accent: true,
  },
  {
    title: 'Policy engine',
    body: 'Checks role, purpose, data tier and consent on every request. Every access is logged, and the person sees who viewed their record and why.',
    accent: false,
  },
  {
    title: 'Agent mesh',
    body: "A Coach Agent for every Emirati, an Employer Agent for every company, copilots for staff, and worker agents for matching, reports and integrity. Agents act only under their principal's access. They draft and recommend; people decide money, penalties and Support levels.",
    accent: false,
  },
];

export const platformCounts = {
  built: portals.reduce((sum, p) => sum + p.built.length, 0),
  planned: portals.reduce((sum, p) => sum + p.planned.length, 0),
};

export function personaById(id: PersonaId): Persona {
  return personas.find((p) => p.id === id) ?? (personas[0] as Persona);
}

export function portalById(id: PortalId): PortalInfo {
  return portals.find((p) => p.id === id) ?? (portals[0] as PortalInfo);
}

export function screenForPath(path: string): ScreenInfo | undefined {
  if (path.startsWith('/staff/integrity/')) {
    const known = screens.find((s) => s.path === path);
    return known ?? { path, title: 'Integrity case not found', portal: 'staff', persona: 'salem', purpose: 'Unknown case id.' };
  }
  return screens.find((s) => s.path === path);
}
