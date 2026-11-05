import { fill, formatInt, formatNumber } from '@/lib/format';
import { disclosure } from './analyst';
import { latestMonth, yearEndCounts } from './published';
import { classOutcomes, hiddenGroupCount, programmes, universityRules } from './university';
import { fig, tierLabels, type DataStatus, type Tone } from './types';

/**
 * Developer Portal: the API catalogue, code samples, sandbox, certification,
 * agent tool registry and changelog for Falak HR Cloud (fictional).
 * Samples use the placeholder host api.nafis.example and synthetic values.
 * Open statistics and Graduate outcomes samples quote the same figures as
 * the public page and the Contributor Portal.
 */

export const apiHost = 'api.nafis.example';

/** Life of an access token from a Consent Grant, in minutes. */
export const tokenLifeMinutes = fig(5, 'illustrative');

/** Every call states one of these purpose codes in its Purpose header. */
export const purposeCodes = {
  'P-PLACE-01': 'Introductions and Talent Cards',
  'P-RET-02': 'Company Monthly Reports and placement events',
  'P-GOVHIRE-01': 'Verified Career Records for government hiring',
  'P-OPEN-01': 'Open statistics',
  'P-EDU-01': 'Graduate outcomes for universities',
} as const;

export type PurposeCode = keyof typeof purposeCodes;

export type ApiId =
  | 'monthly-report'
  | 'introductions'
  | 'talent-cards'
  | 'placement-events'
  | 'career-record'
  | 'open-statistics'
  | 'graduate-outcomes';

export type SampleKind = 'request' | 'response' | 'error';

export interface ApiDef {
  id: ApiId;
  name: string;
  summary: string;
  release: 'GA' | 'Beta';
  scope: string;
  tier: string;
  /** Whether this sandbox app may call the API. */
  allowed: boolean;
  audience: string;
  purposeCode: PurposeCode;
  consent: string;
  /** Show the token revocation rule beside this API. */
  usesTokens: boolean;
  endpoints: string[];
  /** Request lines may contain {key}, the last characters of the sandbox key. */
  samples: Record<SampleKind, string[]>;
  responseStatus: string;
  note: string;
  sampleStatus: DataStatus;
}

const life = tokenLifeMinutes.value;
const tokenHeader = (whose: string) => `Access-Token: at_•••• (from the ${whose} Consent Grant, ${life}-minute life)`;
const appAuth = 'Authorization: Bearer sbx_••••{key}';

/** Sample values that mirror the demo story (Rashid's report, the Finance Analyst role). */
const report = { days: fig(19, 'sample'), pay: fig(10200, 'sample') };
const introPay = fig({ min: 9500, max: 11000 }, 'sample');
const cardsLimit = 20;

const year2024 = yearEndCounts.find((y) => y.year === 2024);
const year2025 = yearEndCounts.find((y) => y.year === 2025);
const outcomes2024 = classOutcomes['2024'];
const accounting = programmes[0]?.label ?? 'BSc Accounting';
/** The same disclosure rules the Analyst Workbench and the Contributor Portal apply. */
const publicRounding = disclosure.publicRoundTo.value;
const publicMinCell = disclosure.publicMinCell.value;
const institutionMinGroup = universityRules.minGroup.value;

export const apis: ApiDef[] = [
  {
    id: 'monthly-report',
    name: 'Company Monthly Report',
    summary: 'Submit the monthly report from your HR system. NAFIS pre-fills pay, attendance and pension.',
    release: 'GA',
    scope: 'reports.write',
    tier: tierLabels.T3,
    allowed: true,
    audience: 'HR systems of private employers',
    purposeCode: 'P-RET-02',
    consent: fill("Required: an access token from the employee's Consent Grant, {n}-minute life.", { n: life }),
    usesTokens: true,
    endpoints: ['POST /v1/establishments/{id}/monthly-reports', 'GET  /v1/establishments/{id}/monthly-reports/{period}'],
    samples: {
      request: [
        'POST /v1/establishments/EST-10422/monthly-reports HTTP/1.1',
        `Host: ${apiHost}`,
        appAuth,
        tokenHeader("employee's"),
        'Purpose: P-RET-02',
        'Content-Type: application/json',
        '',
        '{',
        '  "period": "2026-10",',
        '  "talent_ref": "tr_9f2k1",',
        '  "main_tasks": ["monthly_variance_report", "supplier_reconciliations"],',
        '  "status": "working_normally",',
        `  "days_attended": ${report.days.value},`,
        '  "role_profile_duties_share": "most",',
        '  "performance_vs_expectation": "above",',
        '  "note_to_nafis": null',
        '}',
      ],
      response: [
        'HTTP/1.1 201 Created',
        'Content-Type: application/json',
        '',
        '{',
        '  "report_id": "mr_2026_10_7c1",',
        '  "status": "received",',
        '  "prefilled": {',
        `    "pay_aed": ${report.pay.value},`,
        `    "days_present": ${report.days.value},`,
        '    "pension": "active"',
        '  },',
        '  "visible_to_employee_at": "2026-11-12T08:00:00+04:00"',
        '}',
      ],
      error: [
        'HTTP/1.1 422 Unprocessable Content',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "evidence_required",',
        '  "detail": "Well below or well above needs one line of evidence."',
        '}',
      ],
    },
    responseStatus: '201 Created',
    note: 'The employee sees the report, including any note, within 2 working days after HR attests it. Reports are never used to rank people.',
    sampleStatus: 'sample',
  },
  {
    id: 'introductions',
    name: 'Introduction Requests',
    summary: 'Send an Introduction Request from your applicant tracking system. A pay range is required.',
    release: 'GA',
    scope: 'intro.write',
    tier: 'T2 pseudonymised until accepted',
    allowed: true,
    audience: 'Employer hiring systems',
    purposeCode: 'P-PLACE-01',
    consent: 'Not for the request: the Talent Card is anonymous. Required for /candidate after the person accepts.',
    usesTokens: true,
    endpoints: ['POST /v1/introductions', 'GET  /v1/introductions/{id}', 'GET  /v1/introductions/{id}/candidate'],
    samples: {
      request: [
        'POST /v1/introductions HTTP/1.1',
        `Host: ${apiHost}`,
        appAuth,
        'Purpose: P-PLACE-01',
        'Content-Type: application/json',
        '',
        '{',
        '  "role_profile_id": "rp_finance_analyst_shj",',
        '  "talent_card": "A-7F3K",',
        `  "pay_range_aed": { "min": ${introPay.value.min}, "max": ${introPay.value.max} },`,
        '  "hours": "Sun–Thu 08:00–16:30",',
        '  "message": "Your reporting and Excel skills fit our Finance Analyst role."',
        '}',
      ],
      response: [
        'HTTP/1.1 202 Accepted',
        'Content-Type: application/json',
        '',
        '{',
        '  "introduction_id": "in_31QK",',
        '  "status": "queued_for_talent",',
        '  "expires": "2026-11-09"',
        '}',
      ],
      error: [
        'HTTP/1.1 422 Unprocessable Content',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "pay_range_required",',
        '  "detail": "Requests without a pay range cannot be sent."',
        '}',
      ],
    },
    responseStatus: '202 Accepted',
    note: fill(
      "The person's name stays hidden until they accept. Then call /candidate with an access token from their Consent Grant; each token lasts {n} minutes.",
      { n: life },
    ),
    sampleStatus: 'sample',
  },
  {
    id: 'talent-cards',
    name: 'Talent Cards',
    summary: 'Anonymous Talent Cards ranked for one approved Role Profile. There is no search.',
    release: 'Beta',
    scope: 'talent.cards.read',
    tier: tierLabels.T2,
    allowed: true,
    audience: 'Employer hiring systems',
    purposeCode: 'P-PLACE-01',
    consent: 'Not needed: cards are anonymous.',
    usesTokens: false,
    endpoints: ['GET  /v1/role-profiles/{id}/talent-cards'],
    samples: {
      request: [
        `GET /v1/role-profiles/rp_finance_analyst_shj/talent-cards?limit=${cardsLimit} HTTP/1.1`,
        `Host: ${apiHost}`,
        appAuth,
        'Purpose: P-PLACE-01',
      ],
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "role_profile_id": "rp_finance_analyst_shj",',
        '  "cards": [',
        '    {',
        '      "talent_card": "A-7F3K",',
        '      "fit": "strong",',
        '      "terms_match": ["pay", "hours", "site"],',
        '      "gap": "forecasting",',
        '      "why": "meets all 3 must-haves"',
        '    }',
        '  ],',
        '  "never_included": ["name", "photo", "sex", "age", "family_name", "university"]',
        '}',
      ],
      error: [
        'HTTP/1.1 409 Conflict',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "role_profile_not_approved",',
        '  "detail": "Cards are ranked only for an approved Role Profile."',
        '}',
      ],
    },
    responseStatus: '200 OK',
    note: 'Fit comes as a tier with reasons, never a number. Cards are ranked only for an approved Role Profile, and only people who chose to be visible appear.',
    sampleStatus: 'sample',
  },
  {
    id: 'placement-events',
    name: 'Placement events',
    summary: 'Webhooks when a placement starts or ends, or a work permit changes.',
    release: 'GA',
    scope: 'events.placements.read',
    tier: tierLabels.T2,
    allowed: true,
    audience: 'HR and payroll systems',
    purposeCode: 'P-RET-02',
    consent: 'Not needed: events carry a pseudonymous talent_ref only.',
    usesTokens: false,
    endpoints: ['POST /v1/subscriptions', 'Webhook: CloudEvents 1.0, signed with rotating keys'],
    samples: {
      request: [
        'POST /v1/subscriptions HTTP/1.1',
        `Host: ${apiHost}`,
        appAuth,
        'Purpose: P-RET-02',
        'Content-Type: application/json',
        '',
        '{',
        '  "types": ["placement_started", "placement_ended", "work_permit_amended"],',
        '  "endpoint": "https://hooks.falak.example/nafis"',
        '}',
      ],
      response: [
        'HTTP/1.1 201 Created',
        'Content-Type: application/json',
        '',
        '{ "subscription_id": "sub_4410", "format": "CloudEvents 1.0" }',
        '',
        '# Each event then reaches your endpoint, signed with the current key:',
        'POST /nafis HTTP/1.1',
        'Host: hooks.falak.example',
        'ce-specversion: 1.0',
        'ce-type: ae.nafis.placement_started',
        'ce-source: /establishments/EST-10422',
        'ce-id: evt_8812',
        'Signature: keyid="whk-2026-10", sig="••••"',
        '',
        '{',
        '  "talent_ref": "tr_9f2k1",',
        '  "role_profile_id": "rp_finance_analyst_shj",',
        '  "start": "2027-01-04"',
        '}',
      ],
      error: [
        'HTTP/1.1 403 Forbidden',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "scope_missing",',
        '  "detail": "Add events.placements.read to your app."',
        '}',
      ],
    },
    responseStatus: '201 Created',
    note: 'Events carry a pseudonymous talent_ref only, never a name. Signing keys rotate, so check each signature against the current key list.',
    sampleStatus: 'sample',
  },
  {
    id: 'career-record',
    name: 'Verified Career Record',
    summary: "An applicant's verified work history for a government hiring decision.",
    release: 'GA',
    scope: 'vcr.read + consent',
    tier: tierLabels.T3,
    allowed: false,
    audience: 'Government employer systems only',
    purposeCode: 'P-GOVHIRE-01',
    consent: fill("Required: an access token from the applicant's Consent Grant, {n}-minute life.", { n: life }),
    usesTokens: true,
    endpoints: ['GET  /v1/career-records/{id}'],
    samples: {
      request: [
        'GET /v1/career-records/vcr_5521 HTTP/1.1',
        `Host: ${apiHost}`,
        'Authorization: Bearer <government employer app token>',
        tokenHeader("applicant's"),
        'Purpose: P-GOVHIRE-01',
      ],
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "record": "vcr_5521",',
        '  "verified_at": "2030-02-02",',
        '  "consent_valid_until": "2030-05-03",',
        '  "employment": [',
        '    {',
        '      "employer": "Qasr Logistics",',
        '      "role": "Senior Finance Analyst",',
        '      "from": "2029-04",',
        '      "sources": ["work_permit", "payroll", "pension"]',
        '    }',
        '  ],',
        '  "skills_passport": { "financial_modelling": 4, "financial_reporting": 4 },',
        '  "never_included": [',
        '    "pay_history", "monthly_report_ratings", "integrity_matters",',
        '    "direction_profile", "survey_answers", "risk_scores",',
        '    "counsellor_call_notes", "health"',
        '  ]',
        '}',
      ],
      error: [
        'HTTP/1.1 403 Forbidden',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "purpose_not_permitted",',
        '  "detail": "This app is not approved for P-GOVHIRE-01."',
        '}',
      ],
    },
    responseStatus: '200 OK',
    note: 'Every read is logged and shown to the person under Who viewed my record.',
    sampleStatus: 'sample',
  },
  {
    id: 'open-statistics',
    name: 'Open statistics',
    summary: 'Public series, such as Emiratis in private-sector jobs.',
    release: 'GA',
    scope: 'No key needed',
    tier: tierLabels.T0,
    allowed: true,
    audience: 'Anyone',
    purposeCode: 'P-OPEN-01',
    consent: 'Not needed: public figures only.',
    usesTokens: false,
    endpoints: ['GET  /v1/open/series/{id}'],
    samples: {
      request: ['GET /v1/open/series/M01?from=2024 HTTP/1.1', `Host: ${apiHost}`, 'Purpose: P-OPEN-01'],
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        '  "series": "M01",',
        '  "name": "Emiratis in private-sector jobs",',
        `  "rounding": ${publicRounding},`,
        '  "values": [',
        `    { "period": "2024", "value": ${year2024?.value ?? 0} },`,
        `    { "period": "2025", "value": ${year2025?.value ?? 0} },`,
        `    { "period": "2026-07", "value": ${latestMonth.value}, "label": "July" }`,
        '  ]',
        '}',
      ],
      error: [
        'HTTP/1.1 422 Unprocessable Content',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "cell_too_small",',
        `  "detail": "Cells under ${publicMinCell} people are not published."`,
        '}',
      ],
    },
    responseStatus: '200 OK',
    note: fill(
      'The same figures as the public statistics page. Public tables round to the nearest {round} and do not publish cells under {min} people.',
      { round: publicRounding, min: publicMinCell },
    ),
    sampleStatus: 'published',
  },
  {
    id: 'graduate-outcomes',
    name: 'Graduate outcomes',
    summary: 'Programme-level outcomes for universities and colleges.',
    release: 'Beta',
    scope: 'outcomes.read',
    tier: tierLabels.T1,
    allowed: false,
    audience: 'Universities and colleges only',
    purposeCode: 'P-EDU-01',
    consent: 'Not needed: aggregates only.',
    usesTokens: false,
    endpoints: ['GET  /v1/institutions/{id}/outcomes'],
    samples: {
      request: [
        `GET /v1/institutions/INST-207/outcomes?programme=bsc-accounting&class=${outcomes2024.year} HTTP/1.1`,
        `Host: ${apiHost}`,
        'Authorization: Bearer <university app token>',
        'Purpose: P-EDU-01',
      ],
      response: [
        'HTTP/1.1 200 OK',
        'Content-Type: application/json',
        '',
        '{',
        `  "programme": "${accounting}",`,
        `  "class": ${outcomes2024.year},`,
        `  "graduates": ${outcomes2024.graduates.value},`,
        `  "in_skilled_work_12m": ${formatNumber(outcomes2024.skilledAt12.value / 100, 2)},`,
        `  "starting_pay_band_aed": "${formatInt(outcomes2024.startingPay.value.min)}–${formatInt(outcomes2024.startingPay.value.max)}",`,
        `  "cells_hidden": ${hiddenGroupCount(outcomes2024.year)}`,
        '}',
      ],
      error: [
        'HTTP/1.1 403 Forbidden',
        'Content-Type: application/json',
        '',
        '{',
        '  "error": "aggregate_only",',
        '  "detail": "Person-level outcomes are not available to institutions."',
        '}',
      ],
    },
    responseStatus: '200 OK',
    note: fill('Institutions see counts and shares only. Groups under {min} people are hidden, at least two at a time.', {
      min: institutionMinGroup,
    }),
    sampleStatus: 'sample',
  },
];

export const defaultApi: ApiId = 'monthly-report';

export function apiById(id: ApiId): ApiDef {
  return apis.find((a) => a.id === id) ?? (apis[0] as ApiDef);
}

export interface QuickStep {
  id: 'app' | 'report' | 'events';
  label: string;
  detail: string;
  doneDetail: string;
}

export const quickStart: QuickStep[] = [
  { id: 'app', label: 'Create a sandbox app', detail: 'Done · falak-hr-sandbox', doneDetail: 'Done · falak-hr-sandbox' },
  { id: 'report', label: 'Send a test monthly report', detail: 'Done · 201 Created', doneDetail: 'Done · 201 Created' },
  {
    id: 'events',
    label: 'Subscribe to placement events',
    detail: 'Next · send the subscription request in the sandbox',
    doneDetail: 'Done · 201 Created, subscribed',
  },
];

export const sandbox = {
  talentRecords: fig(5000, 'sample'),
  establishments: fig(300, 'sample'),
  appName: 'falak-hr-sandbox',
  created: '12 Oct 2026',
  /** Last characters of the sandbox key; Rotate key moves to the next one. */
  keySuffixes: ['7Q', 'K2', 'M9', 'X4'],
};

export type CertState = 'passed' | 'not-needed';

export const certification: Array<{ label: string; state: CertState }> = [
  { label: 'Data minimisation review', state: 'passed' },
  { label: 'Security test, including key rotation', state: 'passed' },
  { label: 'Accessibility, WCAG 2.2 AA', state: 'passed' },
  { label: 'Arabic and right-to-left screens', state: 'passed' },
  { label: 'Purpose codes declared for every call', state: 'passed' },
  { label: 'Bias audit, needed only for apps that rank people', state: 'not-needed' },
];

export const certStates: Record<CertState, { label: string; tone: Tone }> = {
  passed: { label: 'Passed', tone: 'good' },
  'not-needed': { label: 'Not needed', tone: 'neutral' },
};

export const agentTools: Array<{ level: string; tools: string[]; rule: string; tone: Tone; detail: string }> = [
  { level: 'Read', tools: ['talent.cards.read', 'reports.read'], rule: 'Allowed', tone: 'good', detail: "Under the principal's own access." },
  { level: 'Draft', tools: ['intro.draft', 'report.draft'], rule: 'Allowed', tone: 'good', detail: 'Drafts wait for a person.' },
  { level: 'Write', tools: ['intro.send', 'report.submit'], rule: 'Human click', tone: 'warning', detail: 'A person confirms each write.' },
  {
    level: 'Money and penalties',
    tools: ['benefit.hold', 'fine.issue'],
    rule: 'Never',
    tone: 'critical',
    detail: 'No agent can move money or issue a penalty.',
  },
];

export const changelog = [
  { version: '1.4', date: '20 Oct 2026', text: 'A Purpose header is required on every call.' },
  { version: '1.3', date: '8 Sep 2026', text: 'Introduction Requests: a pay range is required and binding.' },
  { version: '1.2', date: '14 Jul 2026', text: 'Webhooks move to CloudEvents 1.0, signed with rotating keys.' },
];

export const developerCopy = {
  title: 'API catalogue and sandbox',
  intro: fill(
    "APIs for HR systems, universities and approved agents. Every call states its purpose. Calls about a named person also carry an access token from that person's Consent Grant; each token lasts {n} minutes.",
    { n: life },
  ),
  chips: {
    sandbox: 'Sandbox · synthetic data',
    host: `Placeholder host ${apiHost}`,
  },
  quickStart: {
    heading: 'Quick start',
    label: 'Quick start steps',
    open: 'Open Placement events',
    complete: 'Quick start complete. Placement events now reach your sandbox endpoint.',
  },
  catalogue: {
    heading: 'API catalogue',
    legend: 'Choose an API to read its reference',
    allowed: 'Your app: allowed',
    notAllowed: 'Your app: not allowed',
    release: { GA: 'GA', Beta: 'Beta' },
  },
  detail: {
    forLine: 'For: {who}',
    notAllowedTitle: 'Not available to your app.',
    notAllowedBody: '{who}. You can read the reference, but your app cannot call it.',
    purpose: 'Purpose code',
    scope: 'Scope',
    tier: 'Data tier',
    consent: 'Consent token',
    endpoints: 'Endpoints',
    samples: 'Samples',
    samplesLabel: '{api} samples',
    panelLabel: '{api}: {kind} sample',
    tabs: { request: 'Request', response: 'Response', error: 'Error' } as Record<SampleKind, string>,
    send: 'Send in sandbox',
    sent: 'Sent to the sandbox with synthetic data: {status}. The response is shown.',
    sentPublished: 'Sent: {status}. The response holds published figures, the same for every caller.',
    revocation:
      'Revoking a token stops future access at once. Data already received under a valid token stays lawful, and the receipt is logged.',
  },
  sandbox: {
    heading: 'Sandbox',
    body: fill('Synthetic data only: {records} generated Talent Records and {est} establishments. No real person is in the sandbox.', {
      records: formatInt(sandbox.talentRecords.value),
      est: formatInt(sandbox.establishments.value),
    }),
    app: 'App {app} · key ends in ••{key} · created {created}',
    rotate: 'Rotate key',
    rotated: 'Key rotated. The new key ends in ••{key}. The old key no longer works.',
    reset: 'Reset test data',
    confirm: 'Reset the sandbox? Your test reports and requests are deleted, and the generated records go back to their first state.',
    resetNow: 'Reset now',
    cancel: 'Cancel',
    resetDone: fill('Test data reset: {records} generated Talent Records and {est} establishments.', {
      records: formatInt(sandbox.talentRecords.value),
      est: formatInt(sandbox.establishments.value),
    }),
  },
  certification: {
    heading: 'Go-live certification',
    count: '{passed} of {total} passed',
  },
  agents: {
    heading: 'Agent tool registry',
    lead: 'AI agents call the same APIs through registered tools.',
    principal:
      "An agent acts under the identity and consent of the principal it serves, and has no access of its own beyond that principal's.",
  },
  changelog: {
    heading: 'Changelog',
    entry: 'Version {version} · {date}',
  },
};
