# Decisions

Choices the build brief left open, and why. Grouped by area.

## Process

- **Planning sources.** The user asked for the earlier NAFIS chats to be read first. The local Claude Code and Cowork histories had no NAFIS chat. The user's claude.ai artifacts from that work were read instead: four planning documents (platform blueprint, talent journey, AI build plan, forensic analysis plan) and the design canvas "NAFIS Platform Demo — Full Structure" with one artboard per screen. The canvas was used as layout reference; the brief wins wherever they differ (for example, the older documents describe automatic holds and clawbacks, a five-minute four-rating monthly report and ranking by predicted survival, all of which the brief replaces).
- **Shared chat link.** A claude.ai share link the user sent opens a sign-in page in the built-in browser, so it could not be read; the artifacts above cover the same work.
- **"Use /find".** The skills registry search (`npx skills find`) returned only low-install packages from unknown authors, so none were installed. Installed skills were used instead: `dataviz` for chart rules (the series palette was run through its colour-blind validator and passes every check).
- **"Ultra code".** Taken as a request for multi-agent work: the shared core was built first, then five agents built the portal groups in parallel, each followed by a reviewer that checked its screens item by item against the brief and fixed gaps.
- **Publishing.** Creating the public GitHub repository was first blocked by the local permission system as a new public surface; it went ahead after the user's explicit approval. Pushing the deploy workflow needed the `workflow` scope on the GitHub CLI login, which the user granted in the browser.

## Stack and build

- **HashRouter** rather than BrowserRouter plus a `404.html` copy: deep links work on GitHub Pages with no rewrite rules and no flash of a 404 page.
- **Tailwind CSS 3** with a `tailwind.config.ts` that maps every colour to the CSS variables in `src/styles/tokens.css`, so the tokens file stays the single source of truth (the brief asks for tokens mirrored in the Tailwind config).
- **Vite 6** (supports Node 20, which the deploy workflow uses).
- **Fonts are self-hosted** with Fontsource packages, bundled into `dist/`, so the demo makes no requests to third-party font servers.
- **Vite `base`** comes from `GITHUB_REPOSITORY` in CI and falls back to `/nafis-demo/` locally, so dev, preview, tests and Pages use the same URLs.
- **`noindex, nofollow`** meta tag: a concept that uses a real programme's name should not surface in search results next to the real service.
- **Favicon** is a plain letter mark drawn inline (a data URI), not a logo, which also avoids a 404 request for `favicon.ico`.
- **Figures check.** `scripts/check-figures.mjs` fails the build if JSX text or a text attribute in a screen or shell contains a digit, enforcing "never type a figure into a component". UI-only numbers can be marked `figure-ok`.
- **Dependencies.** Runtime: React, React Router, lucide-react, the Fontsource fonts and `tailwind-merge` (added so a className override on a shared component always beats the component's own classes, whatever the CSS order). Dev only: `@playwright/test` and `@axe-core/playwright` for the smoke and accessibility tests.

## Design system

- **Light theme only.** The brief defines one set of tokens on a light ground; no dark mode was invented.
- **Data status tags** (`DataTag`) are neutral pills with an icon and a word for each of the five statuses, kept visually apart from the status colours, which are reserved for good, warning and critical meanings.
- **Status colours** always come with an icon and a word (`StatusPill`, `StatusBanner`).
- **Touch targets** are at least 44 px on every button, link styled as a button, radio pill, toggle chip and switch.
- **Mobile header.** From 640 px up the top bar is one sticky row. On phones the sticky part holds only the brand and the concept chip, so the notice stays on screen while scrolling; the role switcher and the Platform map link sit in a row below it.
- **Left nav** lists the built screens as links and the planned screens as plain text marked "Planned, not built in this demo"; below 900 px the planned list folds into a disclosure.

## Charts

- **Hand-rolled SVG**, no chart library.
- **Keyboard access.** Each chart's SVG keeps `role="img"` with a one-sentence `aria-label`; the hover targets are transparent HTML buttons laid over the plot, with a roving tab index (one tab stop per chart, arrow keys move between points, Home and End jump). The focused target's accessible name carries the same values as the tooltip.
- **"Show table"** is a toggle button with `aria-pressed` that renders the same values as a table below the chart.
- **Heatmap selection** is outlined in ink, because teal is never used in charts.
- **Ordinal ramp** is used for ordered groups (Support levels, cohorts); the sequential ramp only for magnitude (skills coverage).

## Interaction

- **Role switcher** is a disclosure button with a list of links, not a `<select>`: keyboard users can browse personas without triggering navigation on each arrow key.
- **Talent bottom nav.** Learn and Jobs are planned screens; tapping them shows a short status message instead of navigating to an empty page.
- **Platform map footer** computes its counts from the portal list: 16 built screens and 43 planned ones, shown as "40+".
- **Planned screen names** avoid real bodies: the canvas's "FNC answers" became "Answers to official questions", and the analyst's "names only by break-glass" follows the brief's Linkage Unit request instead.

## Shared fixes after the screen review

The reviewers flagged problems in shared code they were not allowed to edit; these were fixed centrally:

- Segmented radio options are true 8 px segments (the pill classes no longer clash), and disabled radio groups, toggle chips and checkboxes look disabled.
- `<select>` no longer looks read-only: read-only styling applies to text inputs only.
- Tables and chart tables sit in a positioned scroll region that is a tab stop only when it actually scrolls; long headers can wrap; numbers align with logical `text-end`.
- On phones, the role switcher row under the sticky header is a labelled "Demo controls" navigation landmark; the brand link meets the 44 px target; `scroll-padding-top` keeps focused elements clear of the sticky header (WCAG 2.4.11).
- `LiveRegion` (always present) carries messages that appear after an action, so screen readers announce them.
- Chart tooltips size to their content (200–300 px) and never wrap values; segmented-bar and heatmap targets are at least 44 px tall; heatmap row labels truncate instead of overlapping; funnel conversion text sits on its own line; line-chart hover zones follow uneven x spacing; bars can carry a warning flag (icon and word), which replaced a screen-level overlay.
- `AiNote` takes a prefix and suffix ("Drafted by your Coach Agent from Emirati career records · you decide"); `Card` has a 16 px padding option; `Tabs` has a compact size; form controls and toggle chips forward refs.
- The analyst's certified metrics list sits in the left nav through a new `navExtra` slot, as the brief places it.
- Disclosure rules (groups under 10 hidden internally, public tables rounded to 10 with cells under 20 hidden) now come from one file, `src/data/disclosure.ts`.
- React Router future flags are set, which removes two console warnings on every route.
- Each screen keeps its own state, so the talent screens are separate snapshots of one scenario: accepting the Introduction Request on Talent Home does not change the Privacy screen, where the brief shows the Qasr Logistics permission already active.

## Screen decisions

Recorded by the agents that built and reviewed each portal group. Each line is a choice the brief left open.

### Talent portal (phone screens)

- Talent Home: Qasr Logistics' Introduction Request is pending (5 days left) and includes the proposed interview (Tue 3 Nov 10:00). 'Confirm' in Next steps opens and focuses the request, so the pay range and what is shared are seen before accepting. Accepting confirms the interview and creates the Qasr Consent Grant (until 28 Jan 2027) shown on Privacy and consent.
- Talent Home: the coach message offers to draft answers to three likely interview questions. 'Draft them' shows the drafts inline with an AiNote ('you decide what to keep'). 'Not now' defers. Both have Undo so the demo can be replayed.
- Talent Home: the notification button opens an inline list of two items (new Introduction Request 28 Oct; counsellor added a Development Plan step 26 Oct). Opening it clears the unread badge and the aria-label count.
- Talent Home: a date line 'Thursday 29 October 2026' sits above the greeting. The Arabic greeting is the main h1 line in Alexandria; the English line sits inside the same h1, under it.
- Talent Home: the progress card fills 6 of 8 segments of the shared SegmentProgress. 'Show all 8 stages' opens the shared vertical Stepper with the planning-document stage names. Stage 6 reads 'Ready to apply: targeting and placement'.
- Talent Home: request details show Employer Quality Score B and 12-month retention 78% (sector 64%), read from companies.ts. This matches what Talent Discovery says the Coach shows. '5 days left' is a warning-tone chip with a clock icon.
- Career Path: paths B and C roles and the pay ranges for later steps come from the design artboard. B is Audit Associate, Senior Auditor, Risk Manager. C is Junior Data Analyst, Data Analyst, Analytics Lead. Pay is tagged Sample and chances Estimate.
- Career Path: High/Medium/Low is computed from the chance using thresholds in data. It shows as a neutral chip with a signal icon and the word, not colour.
- Career Path: a readiness line appears on each path's first step only (ready now / ready in 6 months / ready in 12 months). Every step has a 'Skills to build' line.
- Career Path: the Skills Passport baseline is Excel 4, financial reporting 3, data analysis 3, English C1, matching Talent Card A-7F3K and the Privacy fit row.
- Career Path: 'Add to my plan' toggles per path (it becomes 'Remove from plan') and shows a confirmation. 'Change my goals' opens a panel stating that the counsellor, not the agent, signs the Direction Profile, with an 'Ask Aisha for a review' action.
- Career Path: tab labels are two lines ('Path A' over 'Finance'). The tabs are local ARIA tabs because the shared Tabs' fixed padding makes the labels wrap at 390px.
- Alignment Check: the 3-step bar is the check's steps: Your work (this screen), Your new manager, Anything else. 'Save and continue' marks step 1 Saved and says step 2 is a planned screen. Changing any answer clears Saved.
- Alignment Check: role tasks for the flag rule are the first four rows. 'Filing, data entry or admin' and 'Had no real work to do' are not role tasks.
- Alignment Check: the result is computed live under 'Your result so far'. Flagged shows an amber banner titled 'Mismatch noted'; otherwise a teal banner titled 'On track'. Both fixed texts are verbatim.
- Alignment Check: the privacy banner uses the neutral tone with a lock icon, keeping teal for actions and the fit result.
- Alignment Check: 'I would rather talk to my counsellor' is styled as a link but is a button. It shows an inline confirmation: the assigned counsellor offers a call this week, and the employer is not told.
- Privacy: 'Hidden' means no employer sees a card, and she can still apply herself. 'Open' means the card also shows her name and full Skills Passport to any employer whose role fits her. Employers still cannot search.
- Privacy: changing 'Who can find me' shows 'Saved: <option>. It applies from now on, and the change is logged.'
- Privacy: Open to move is a working switch, off by default. It notes that it starts once she has a job.
- Privacy: the Support level row lists three things that would move her up to Accelerate. The Audit Associate gap is audit sampling, closed by a 6-week course. 'Question this' says a person reviews within 5 working days and the employer is not told.
- Privacy: Revoke asks for confirmation, then shows the given result text and a 'Revoked today' pill. University 'Opt out' shows a confirmation and offers 'Opt back in'.
- Privacy: Ramadan mode defaults to on, following the artboard. 'Turn the coach off' asks for confirmation and says turning the coach off is never used as a reason to call or to change the Support level.
- Privacy: Download my data and Correct something show inline confirmations of what happens next. No file is created.
- Data: data figures are fig() values with a status (pay ranges, chances, days left, stage, skill levels, employer count, retention). Numbers inside fixed rule sentences (10 or more people, 12 months, 5 working days) stay as strings in src/data/talent.ts.
- DataTags appear on the Introduction Request card (Sample), the Career Path footnote (Estimate for chances, Sample for pay) and Every score about me (Sample). The Alignment Check shows no data figures, so it has none.
- Focus: when a pressed control is replaced by its result, focus moves to that result through a local StrictMode-safe useFocusTarget hook. Buttons with repeated labels carry aria-labels that start with the visible text.
- I did not look for the Talent artboards. The brief says it is the whole specification and that no outside design files should be sought. Every check was made against brief sections 0 and 3 to 6.
- Introduction Request card: the Sample DataTag sits in the heading row. Every figure on the card is sample: pay, deadline, EQS and retention. The pay range is the first line of content, then the role line with the '5 days left' chip. In 'See request', Pay range stays the first row.
- The builder's request model is kept. On Home the Qasr request is pending (5 days left) and includes the proposed interview, so accepting it confirms the interview. Privacy shows the Consent Grant as it stands after acceptance. State is not shared between screens, so each screen keeps matching its own section of the brief.
- 'Open' visibility widens reach (roles outside the Direction Profile) and never reveals identity. The four options run from most to least private, and every card stays anonymous until a request is accepted.
- Where copy promises that someone is not told, it names the exception 'unless you agree or a legal order requires it'. This covers the coach drafts, the fit-tier questions and the talk-to-counsellor request. The brief's fixed texts are left word for word.
- 'Finish Excel level 3' is treated as a Development Plan course, not a Skills Passport level. This fits with Excel 4 on Mariam's Skills Passport (brief 6.5 and 6.7). '2 lessons' and 'about 25 min' are sample figures.
- Career Path says who sees the estimates: Mariam and her assigned counsellor, never employers.
- The likelihood band cue is a decorative three-bar meter in ink and control grey. The band word and the 'in 100' number carry the meaning, and there is no teal.
- The Support level row adds 'Employers never see your Support level.' This follows the rule that no score about a person reaches an employer.
- The Revoke confirmation uses the same wording as the result text: revoking stops future access.
- The coach's Why line says 'the proposed interview' until the interview is confirmed.

### Employer portal

- Tenure weighting counts completed months in the current job: 0.5 under 6, 1.0 for 6 to 24, 1.5 above 24. 'Month 6' (Rashid) counts as 5 completed months (0.5), 'Month 7' (Saeed) as 6 (1.0), Hamad 2 (0.5), Noura 25 (1.5), Latifa 38 (1.5).
- The other 8 of the 13 sample Emiratis are unnamed roster entries in src/data/employer.ts (3 under 6 months, 5 at 6 to 24 months), so the weights sum to 5×0.5 + 6×1.0 + 2×1.5 = 11.5. The legal count and the 11.5 are computed from this roster.
- The tenure disclosure is a details/summary under the KPI row with a band table (completed months, weight, Emiratis, counts as). It says the weighted figure is never used for the legal count or for a contribution.
- The five dashboard KPI tiles share one 'Sample' tag in the 'Where you stand' heading instead of one per tile. Tile labels get a two-line box at lg and up, so the five values line up.
- The dashboard h1 is 'Good morning, Huda' with the eyebrow 'Employer dashboard' and the line '…for this week · Thursday 29 October 2026', following the artboard.
- The EQS tile's 'Rising' badge is a trend icon plus the word, styled like a good-tone pill. '1 short' and 'Avoidable' are warning pills. 'Above sector' is a good pill.
- Employer Agent actions: Find candidates links to /employer/discovery. Schedule reviews and Assign buddies show a confirmation ('Any pay change stays your decision.' / buddy requests to team leads). Every item has 'Not now' (hides it until next week, with Undo). Why lines cite the legal count, the lowest EQS part and the onboarding plan, never a prediction.
- The 3 people for pay reviews: Noura and Latifa (next step 'Schedule a pay review' in the team table) plus one unnamed Emirati with 19 months' tenure.
- Team table report column: Rashid, Saeed and Hamad are 'Due 7 Nov' (Rashid 'With Ahmed, his line manager', linking to the report). Noura and Latifa are 'Submitted 27/28 Oct · You attest by 10 Nov'. The fourth due report belongs to an Emirati not shown in the table ('Showing 5 of your 13 Emiratis').
- Training this quarter: Rashid 4 h (matches the IFRS 16 module on his report), Noura 6 h, Saeed 0 h, Latifa 9 h, Hamad 20 h. Next steps: Book the six-month review, Schedule a pay review, Agree a training plan, Schedule a pay review, Book the day-90 review.
- The hiring pipeline uses the shared horizontal Bars (series blue, scaled to the first stage), not the Funnel, with a stage/people table.
- The lowest EQS part is computed from the data. It is drawn in the warning bar colour with a 'Lowest' pill (warning icon and word) placed just after its value. Its accessible name and tooltip also say 'lowest part'. The table view adds a Points column (weight × result) and a total row: 100%, 72, 72.1.
- The 'Fastest route to A…' note is the quality chart's footnote. The money card says 'NAFIS support paid to your Emiratis, 2026 to date' and notes that support is paid to each Emirati, not to the company.
- Discovery availability counts: graduating within 6 months 9, looking for work 18, returning to work 4, employed and open to move 7, which sums to 38. The heading count follows the ticked groups. Cards only show or hide and never re-order. 'Showing n of N' explains this.
- Card details the brief left open: B has Financial reporting 3, Excel 3, Business writing 3, English B2, and 5 of 6 should-haves. C has Financial reporting 4, Excel 3, Payroll 3, English B2, and 4 of 6. D has Financial reporting 3, Excel 4, VAT returns 3, English B2, and 4 of 6. Why lines for B and C are written to match.
- C-8L1T's terms match reads 'Pay and site' with a second line 'Hours: prefers 8:00–15:00', because the role is 8:00–16:30.
- A-7F3K is selected by default. Selecting a card moves focus to the request panel heading. The selected card shows a teal border and a 'Selected' pill. Sent cards show 'Request sent' and a 'View request' button, and their form is locked.
- The pay range is two inputs (From / To, AED a month), prefilled from the Role Profile with the hint 'The candidate sees the pay range first.' An empty, non-numeric or reversed range blocks sending. The page shows an inline error plus a 'Not sent. <reason>' banner and moves focus to the pay field. Editing the pay range clears the banner.
- The message is a per-card Employer Agent draft that names that card's gap. Hours and location are prefilled from the Role Profile and editable. Each send uses one of the 8 monthly introductions for the opening. Each card can receive one request.
- Monthly report task chips start unselected, so the manager picks actively. Submitting needs at least one task. The evidence line (max 160 characters) is required only for Well below or Well above.
- Submitting shows 'Submitted. Huda, your HR Admin, attests it by 10 Nov. You can edit it until then.' and locks the questions until Edit report. Save draft shows 'Draft saved. Finish it by 7 Nov.' Added tasks join the chips already pressed.
- The pension registration source is 'Pension records' (the brief gave none). The note hint reads 'HR, NAFIS and Rashid see any note you write.' The evidence hint says Rashid sees the line with the report.
- 'Report 1 of 4 this month' uses the same figure as the dashboard's 'Monthly reports due' (4). The report page uses the brief's title, 'Monthly report · October 2026'. The nav keeps 'Company Monthly Report'.
- The report questions sit under a visible 'Your answers' section heading, which also names the form landmark.
- Each Talent Card holds its own Introduction Request draft (pay range, hours, message), prefilled from the Role Profile and a per-card Employer Agent message. A sent request becomes read-only, and 'View request' shows exactly what was sent. Edits never carry across cards.
- Pay-range errors appear after the first send attempt for that card and then update live. The 'Not sent. <reason>' banner clears when the pay range is edited.
- After a successful send, focus goes to the 'Sent.' confirmation. It is rendered outside the role=status region so screen readers read it once, and the counter is a polite live region.
- Team-table 'Next step' entries are labelled as Employer Agent suggestions with 'you decide', since they are recommended actions.
- In the submitted monthly report, the questions get a grey locked look. The chosen task chips and rating pill stay light teal so the answers stay readable until 'Edit report'.
- The two new hires and the 18-month pay-review threshold are sample figures in src/data/employer.ts (newHires, payReviews.monthsWithoutChange).
- Programmatic focus goes through a local helper, C:\nafis-demo\src\portals\employer\focus.ts (focusInView). It focuses without scrolling, then centres the element only when it is out of view or under the sticky top bar.
- The tenure-weighting table lets its long headers wrap at phone width instead of scrolling, so the 11.5 total stays visible.
- The contribution tile keeps '/ month' as its unit, following the brief's notation, even though it wraps under the value in the five-column row at 1440.
- The team table's 'Open report' link carries a hidden suffix with the person's name ('for Rashid Al Ketbi'). The visible text is unchanged.

### Government View and Staff Console

- Government View: the employment table puts the skill level under the role ('Role and skill level') so four columns fit at 1440; the internship row shows level 'Internship' because the brief gives none.
- Government View: each period shows 'N months counted' (10 and 27) or 'Not counted', a footer row reads '37 months · 3 years 1 month', and a rule line says 'A period counts when at least two sources confirm it.' to explain '1 source: not counted'.
- Government View: Skills Passport bars show the level the role asks for (3) beside each skill. This is inferred from the rule '0.5 for each core skill one level above the requirement = 1.0'. Value labels read '4 of 5', with no track behind the bars.
- Government View: the header names the Consent Grant purpose P-GOVHIRE-01 (taken from the Developer Portal spec) and says the view is logged under Who viewed my record.
- Government View: the decision support is rule-based, not an agent, so it has no AiNote. Its intro reads 'Worked out from the concept grade rules for this demo. You decide the placement.'
- Government View: 'Adjust with a reason' opens an inline form with a placement select ([Federal grade + 1] · step 2, [Federal grade + 2] · step 1, [Federal grade] · step 1) and a required reason. Save stays disabled until the reason has text. Accepted and adjusted states show a confirmation (the adjusted reason is quoted) and a 'Change decision' button.
- Government View: the reference shows as 'Overall 4 of 5'. 'Last assessed January 2030' for the Skills Passport comes from the artboard.
- Counsellor console: call times are Khalid today 10:00 and Fatima today 11:30, then Fri 30 Oct for Hamad 09:00, Saeed 10:30 and Mariam 11:30, so all five fall within 'this week'.
- Counsellor console: working days are Mon–Fri. High cards show the signal date and the 5-working-day deadline: Khalid signal 26 Oct, due 2 Nov; Fatima signal 27 Oct, due 3 Nov.
- Counsellor console: support levels are Khalid Stabilise, Fatima Support, Hamad Stabilise, Saeed Grow and Mariam Grow (matching the Privacy screen). Last contacts are 24 Sep, 9 Oct, 1 Oct, 18 Sep and 26 Oct; Mariam's 26 Oct matches 'Counsellor Aisha · career review · 26 Oct'.
- Counsellor console: Hamad's missed days come from Qasr's HR system with his consent, because the October Company Monthly Report is not due until 7 Nov. His night-shift statement comes from his day-90 Alignment Check on 27 Oct.
- Counsellor console: call plans for all five people (questions, offers, avoid) are written from the artboard and the brief. A plan footnote says nothing in the plan is sent to the person or an employer.
- Counsellor console: all six outcome chips show a note. The 'Talk to employer' and 'Refer to integrity review' notes are verbatim from the brief; the other four are new copy.
- Counsellor console: 'Reassign to Omar (free 11:00)' keeps Khalid's card in the queue and changes its time to 'Today 11:00 · with Omar'. It also adds a 'Reassigned to Omar' pill, updates the header summary and the Flagged tile's 'calls booked this week', disables the call button, replaces the outcome form with 'Omar records the outcome after his call.', and offers Undo.
- Counsellor console: saving an outcome marks the queue card 'Saved · <outcome>'. Any later change re-enables Save. Outcome, notes and check-in are kept per person while switching cases.
- Counsellor console: the call button toggles to 'End call' and shows a status saying no call is placed in this demo.
- Counsellor console: the queue is a native radio group (arrow keys move between calls). Each card is labelled by the person's name and described by priority, reasons and time.
- Counsellor console: a line under the queue states what is never a reason for a call, worded without the literal labels ('switching the coach off, a wish to change employer, or not answering a survey').
- Counsellor console: the caller preference banner uses the artboard's amber attention style with an Info icon, not a warning triangle.
- Counsellor console: next check-in options are In 2 weeks · Thu 12 Nov, In 4 weeks · Thu 26 Nov (the default), and In 8 weeks · Thu 24 Dec.
- Counsellor console: tile DataTags sit in the tile footer so the labels stay on one line.
- Access chips in the top bar: 'Full record for own caseload · every view logged' for Aisha, 'Assigned cases only · every view logged' for Salem, and 'Scenario · February 2030' for the recruiter.
- Integrity case: the h1 is 'Case IC-2026-1183' and the brief's header line is the description. '(sample)' is kept as text in the At stake chip.
- Integrity case: R21's 'How the model uses it' line is 'Weight only: in a small firm one person often signs every report.' The brief gave lines only for the other five reasons.
- Integrity case: reason sources are payroll records, bank pattern flag only, address records, tax registration and invoice records (yes or no only), work permits and trade licence, and Company Monthly Reports with their signing records. The artboard's 'WPS' wording was dropped.
- Integrity case: Confirmed / Not confirmed are aria-pressed toggles; pressing the active one again clears the mark. A live counter shows 'n of 6 reasons checked', and a hint under Send says what is still missing.
- Integrity case: each decision option has a short description that restates the safeguards (for example 'No penalty before inspection'; 'Nothing is clawed back automatically, and the 6 employees keep their support').
- Integrity case: after sending, the stage chip reads 'Stage: second review with Mona', reasons, decision and reason lock, and 'Withdraw to edit' reopens them. 'Close, no issue found' gets its own message because no establishment notice follows; the other three show the brief's text verbatim.
- Integrity case: the pay chart's y axis is fixed at 0–12,000. The tooltip title carries 'AED a month' so the values fit the shared 220px tooltip. Each month's keyboard target reads a full sentence.
- Integrity case: Money and links uses grey (muted) for salary lines, purple (series 2) with arrows for money sent on, blue dashed (series 1) for the shared address, and ink for the owner's links. The owner is a dark pill linked to both shared points. There is no separate ownership edge; the table lists all 16 links.
- Integrity case: the timeline marks 29 Oct as Today (aria-current='step'). The Safeguards panel adds 20-day appeals and the model-entry line. The 6 employees panel adds the confidentiality exception wording.
- All three screens move keyboard focus after state changes: Reassign or Undo, Accept, Adjust or Change, Save outcome, Send or Withdraw. Focus goes to the control or confirmation that replaces the one pressed.
- Government View: below 640px the employment history is a stacked list, one block per period, so no column is cut off. The table is used from 640px up. Measured: the table fits without scrolling down to a 520px content width.
- Government View: 'N months counted' appears only on periods that count. A period that does not count gives its reason once, in the brief's sources note '1 source: not counted'.
- Government View: the Consent and Verified header chips use the outline style with green icons, not the good tint, which is too close to the #F5F6F8 ground. The status still has an icon and a word.
- Government View: Accept and Adjust stack at full width where the panel is narrow (under 640px, and the 380px side column from xl up). The experience and placement boxes use two columns between 768 and 1279px.
- Counsellor console: after the brief's footnote, the sentence 'The only exception is a legal order that requires NAFIS to disclose them.' was added to meet the section 0 rule that confidentiality wording names the exception. The verbatim brief line is unchanged.
- Counsellor console: Fatima's queue chip reads 'Declined 4 roles over 60 min away' instead of 'far-away roles'.
- Counsellor console: below 1280px the selected queue card offers 'Go to <name>'s case', which scrolls to the case and focuses its heading. The page does not auto-scroll on selection, so arrow keys in the radio group never move the page.
- Counsellor console: only the header summary and the reassignment banner are live regions. The Flagged tile count updates silently.
- Integrity case: while the case is with Mona, the decision panel shows a locked summary of the decision and reason rather than disabled controls. 'Withdraw to edit' restores the editable form with the same values.
- Integrity case: the score, precision and pay-chart sentences are fill() templates in src/data/cases.ts, so every figure is written once.
- Selects on my screens carry a local !bg-surface !text-ink override until the shared select class stops greying out every select. It is harmless once the shared fix lands.

### Analyst Workbench, Developer Portal and Contributor Portal

- Analyst: the Certified metrics list sits in a card in the right column under the Release check, because the shared AppShell left nav cannot take screen-specific content.
- Analyst: Table is the default result tab. A small bar chart 'Still in verified private work at month 12, by year hired' (78/81/85%) sits under the results, so a chart and its Show table toggle are on screen at load, as the repo's interaction tests expect.
- Analyst: the Compare cohorts chart is labelled 'All workplaces and sectors', because its month-12 values (81% for 2024 hires, 85% for 2025 hires) match the national M09 figure, not the pooled Sharjah and Dubai table (about 76%).
- Analyst: cohort lines use ordinal ramp steps 1, 3 and 4 (#5CB8E6, #0073AB, #04334D), older years lighter, because steps 2 and 3 were too close to tell apart. End labels, the tooltip and the table carry every value.
- Analyst: hidden cells are not returned by the query (HAVING COUNT(*) >= 10), so 'about 18,600 people' and a totals row (Sharjah about 3,900, Dubai about 14,700) come from returned cells, rounded to the nearest 100.
- Analyst: the Copilot summary paragraph is computed from the table values in src/data/analyst.ts and adds the Healthcare-in-Sharjah wide-interval caveat.
- Analyst: Run replays the sample question (a 0.7 s running state, then the run line). If the question is edited, a note says the concept reads only the sample question and offers 'Use the sample question'.
- Analyst: the blocked person-level export has a 'What a request needs' disclosure: a Linkage Unit request with a purpose code, a written justification, a second approver, and a time limit of 24 hours by default.
- Analyst: data grades show as chips: final to August (good tone), September provisional (warning tone), the snapshot id, and 'Synthetic data, no real person'.
- Developer: the brief gives purpose codes for only five APIs, so the Open statistics and Graduate outcomes requests carry two further codes, P-OPEN-01 and P-EDU-01. Every sample request then states its purpose.
- Developer: the Company Monthly Report request carries an Access-Token from the employee's Consent Grant, applying the intro rule that calls about a named person carry a token.
- Developer: Talent Cards and Graduate outcomes are Beta; the other five APIs are GA. Placement events use scope events.placements.read on T2.
- Developer: the default selected API is Company Monthly Report. Switching API resets the samples to the Request tab.
- Developer: 'Send in sandbox' (allowed APIs only) switches to the Response tab and announces the status code. Sending the Placement events subscription completes quick-start step 3. 'Open Placement events' selects that API and focuses its heading.
- Developer: Rotate key cycles the key suffix (7Q, K2, M9, X4), and the Authorization header in the request samples follows it. Reset test data asks for an inline confirmation; focus moves to 'Reset now' and then back.
- Developer: samples use the placeholder hosts api.nafis.example and hooks.falak.example. The VCR sample lists sources as work_permit, payroll and pension, and its never_included list mirrors the Government View footer.
- Developer: Open statistics sample values are read from src/data/published.ts and tagged Published. Graduate outcomes values come from src/data/university.ts (class of 2024), with cells_hidden computed by the same small-group rule.
- Developer: each API detail lists purpose code, scope, data tier and consent token, plus the token revocation sentence where tokens are used. The agent principal sentence sits in the Agent tool registry.
- Developer: per-API rate limits from the artboard are left out, because the brief does not give those figures.
- Contributor: the default class is 2024, which the repo's interaction test expects (142 graduates at load).
- Contributor: people per group are share × graduates, rounded to the nearest person (2024 'Other private work': 9.94 rounds to 10 and is shown). Each class then hides exactly two groups.
- Contributor: the 25-graduate rule for skill gaps applies to graduates in private work (skilled plus other private), whose managers give the day-90 ratings. That base is never displayed because it could reveal a hidden group.
- Contributor: the programme select also lists BBA Finance and BSc Business Analytics. They show a 'No sample data' card with a way back, and the class radio is disabled for them.
- Contributor: tiles show deltas against the previous class for skilled work, months to first job and still with first employer. The class of 2023 reads 'No earlier class in this view'.
- Contributor: 'Typical starting pay' is the middle half of first monthly pay. Tiles use a 3 + 2 grid so the pay range fits at 1440.
- Contributor: 'Fix 3' opens an inline panel listing the three unmatched internship records, each with a MoHRE establishment ID field. Saving marks records fixed and counts down; with all fixed, the row reads 'Up to date'.
- Contributor: suggestion confidence is medium for the Power BI lab, medium for IFRS 16 and low for the internship term. Evidence lines name the selected class.
- Contributor: in 'Where they are 12 months on', skilled private work uses series blue and the other groups use the de-emphasis grey, on a 0–100% scale.
- Data: datasets carry one status through fig(value, status) on the array or object, for example fig(rows, 'sample'). Disclosure thresholds, rounding steps and token life carry 'illustrative'.
- Code panel: a dark read-only CodePanel (src/portals/developer/CodePanel.tsx) serves both the developer samples and the analyst SQL tab. Comments render in code-muted.
- Analyst: I kept the builder's extra S(12)-by-year chart so the shared interaction test passes. Table stays the default result tab because it answers the question as asked.
- Analyst: a wide interval shows as a second line in the cell (warning icon plus '±8 pts'). Screen readers hear 'wide interval, plus or minus 8 points'.
- Analyst: the totals row label is 'Total, rounded'. The rounding step and the fact that hidden cells are not counted are explained once, in the note under the table.
- Analyst: a 'scrolls sideways' hint shows only below 640px. At wider widths all five columns fit.
- Developer: tap-to-reveal applies only below the xl breakpoint (1280px), where the catalogue and the reference stack. The breakpoint is a named UI constant in DeveloperPortal.tsx.
- Developer: for published samples, the post-send message names published figures. Every other API keeps 'synthetic data'.
- Contributor: invalid fields use the critical text colour as a border plus a 1px ring, always with the written error.
- Contributor: only the skills chart (0–60% scale) gets a track. The destinations chart (0–100%) does not, because an empty track next to '—' could read as zero.
- Reviewed and kept these builder choices: purpose codes P-OPEN-01 and P-EDU-01 for the two APIs the brief gives no code for; people per group rounded to the nearest person (7% of 142 implies a count of 10, so 2024 'Other private work' shows); default class 2024; default API Company Monthly Report; cohort colours from ordinal steps 1, 3 and 4; metrics.ts limited to the brief's 11 certified metrics.

### Executive Command Centre and Public statistics

- Command Centre: the 'Data as of' freshness chip sits in the PageHeader chips, not the top bar, because the shared top bar already wraps to two rows at 1440.
- Command Centre: the h1 is 'Programme overview' (from the artboard). There is no eyebrow, because the left nav already names the portal.
- Command Centre: the Emirate and Sector filters share one drill-down state with the heatmap. Choosing both selects the cell. Choosing one shows a national row or column status line from sample aggregates. Clear drill-down resets both.
- Command Centre: the Period filter keeps its state, but the concept holds one period of data. Changing it shows a note that the figures stay the same.
- Command Centre: typed questions are matched to the three prepared answers by keywords. Anything else gets a 'three prepared questions only' message. Answers are labelled 'Analyst Copilot · ... you decide what to act on'.
- Command Centre: the first prepared question reads 'Why is 12-month retention low in Ajman logistics?', so it does not imply a fall. Its answer adds one sample figure: 38% of these hires work night shifts that were not in their Introduction Request.
- Command Centre: the quota answer keeps the brief's 'about 1,200 missing in 2027', although the chart series gives 235,700 − 234,400 = 1,300. The 61,300 gap for 2031 is computed from the series. AED 7.4bn a year uses AED 10,000 a month for each missing Emirati.
- Command Centre: each heatmap cell's 12-month retention is round(50 + 34 × coverage). Open cases are round(emirate base × sector weight × (1 − coverage)). Logistics in Ajman is fixed at 61% and 14 cases.
- Command Centre: national sector values are set so the canned answers hold: logistics 70% retention (Ajman sits 9 points below), construction 0.38, hospitality 0.43, national SCI 0.56.
- Command Centre: a hidden (null) heatmap cell can still be selected; its status line says it is not shown because too few people. Clicking the selected cell again clears the drill-down.
- Command Centre: briefing point 2 cites metric id 'M06 job-ready pool v1.0', which is not in the Analyst Workbench list. Status tags: point 1 Sample, points 2 and 3 Estimate.
- Command Centre: the hero RSE tile adds an 'Outlook, model estimates' box computed from the RSE series: +27,800 added during 2026, central forecast 194,100 for 2031, low to high 149,900–234,500.
- Command Centre: the hero's 44% divides the RSE nowcast (92,100) by the 2026 nowcast of Emiratis in private jobs (208,000), which reproduces the brief's 44%.
- Command Centre: the history chart is full width, with x ticks every five years (2016, 2021, 2026, 2031).
- Command Centre: in the history chart, the band starts at the 2026 join point, and 'Quota would need' starts at 2027 because the brief gives no 2026 value.
- Command Centre: history markers are drawn on the history line only, hollow for estimates (2016–2017, the 2026 nowcast and every RSE value).
- Command Centre: the chart caption says 'Quota would need' assumes the quota rises 1 point a year, which matches the quota answer.
- Command Centre: following the artboard, δ is defined as the share of supported Emiratis who would otherwise have taken a state-funded job.
- Command Centre: the fiscal chart plots δ from 0.10 to 0.40 in 0.01 steps. A live sentence turns the return into 'each AED 1 spent returns about AED x'.
- Command Centre: Money and return is a full-width card (money tiles, fiscal controls, fiscal chart) so the row beside the history chart is not uneven. Funnel and heatmap sit side by side at 5fr/6fr with equal heights.
- Command Centre: below 640px the heatmap scrolls sideways inside its own region, with a hint line. The funnel fits at 390 without scrolling.
- Monthly pack: the brief's title line is split into the h1 'Monthly report to the Undersecretary's office' and a description line with the rest.
- Monthly pack: Request changes marks the current step 'Returned' and turns the button into 'Withdraw request', so the demo can continue. Export PDF shows 'PDF export is planned, not built in this demo.'
- Monthly pack: after the last approval, focus moves to the locked status message, Approve and Request changes are removed, and the header pill reads Locked.
- Monthly pack: lineage chains, owners and checks are sample text with generic internal owners (Placements team, Statistics unit, Counselling service, Integrity unit, Finance team, skills team). No payroll system names are used.
- Monthly pack: M14 and M17 are treated as certified metrics, although the Analyst Workbench list does not show them.
- Monthly pack: the SCI target reads '0.60 by Dec' to match the Command Centre tile.
- Monthly pack: the Arabic master text is my own MSA translation of the English paragraph, using 'وظائف مهارية' for skilled jobs. It keeps Western digits and the % sign, which correctly display as %85 in right-to-left text.
- Monthly pack: below 1280px the lineage panel appears directly under the key-numbers table; at 1280px and wider it is a sticky side panel. On phones the Target and Status columns move under each measure.
- Monthly pack: sections that contain figures carry DataTags beside their heading (summary: Sample and Estimate; What changed: Sample). Decision costs carry Estimate tags.
- Monthly pack: Report Writer notes name who decides: the sign-off chain for the summary, the Undersecretary's office for the decisions.
- Public: the page has its own shell. Nav items are buttons that scroll to and focus each section, because HashRouter owns the URL hash and in-page hash links would change the route.
- Public: the 'Emirates' nav target is a small 'By emirate · Planned' card that states the rounding and suppression rules. No emirate figures were invented.
- Public: the brand reads 'NAFIS · Public statistics' (plain text) and the h1 is 'Emiratisation statistics', with a one-line lead.
- Public: every bar carries a value label when the chart is at least 900px wide; narrower, only the July 2026 bar is labelled. Below 480px the marker reads 'NAFIS launched, Sep 2021' so it is not clipped.
- Public: the launch marker sits between the 2021 and 2022 bars, because the 2021 bar is the year-end count, taken after the September launch. The July 2026 bar uses the first ordinal step (#5CB8E6) as its lighter tint.
- Public: Download CSV and All tables (CSV) build UTF-8 CSV files with a byte-order mark in the browser. All tables is one long-format file (table, row, measure, value, status, note). A status line confirms each download.
- Public: Data dictionary opens an inline definition list. 'Report a problem with these figures' shows a note that reporting is planned; there is no form.
- Public: Mining and quarrying is stored as null (suppressed); no underlying count is kept. The 85% tile's sub-line reads 'Shows how the measure would be reported'.
- Public: sector table headers wrap so the table fits at 390 without sideways scrolling.
- Command Centre: the Ask panel opens with the first prepared question answered, as on the Executive-CEO artboard, so source, confidence, status tag and the Analyst Copilot label are visible on load. Clicking the pressed chip clears it back to the empty state.
- Command Centre: Clear drill-down uses aria-disabled rather than disabled at the top level, so focus never drops after a clear.
- Command Centre: each briefing point shows the metric id on its own line, then 'Confidence x' with the status tag. This avoids a dangling separator.
- Command Centre: construction's case weight is 0.8, so no other heatmap cell repeats the canned Logistics-in-Ajman pair (61%, 14 cases). Ajman logistics stays the only logistics cell 9 points below its sector (70%).
- Command Centre: the strip that scrolls sideways on phones is not its own tab stop. The heatmap cells are the keyboard targets and scroll the strip.
- Command Centre: kept the builder's M06 job-ready pool v1.0 metric id (from the artboard). The Analyst Workbench list is not exhaustive, since the pack also uses M14 and M17. Kept the brief's 'about 1,200' missing in 2027, although the series gives 1,300.
- Monthly pack: kept the artboard wording 'Owns the decisions asked' for the Programme Director's upcoming step. The returned step detail reads 'back with the Report Writer agent for changes'. The locked banner has no title, and the Versions card carries a Sample tag.
- Public: the concept strip is sticky like the portal shells' top bar. On phones only the notice row sticks.
- Public: kept the NAFIS launch marker between the 2021 and 2022 bars, as on the Public-Statistics artboard. This reads the 2021 year-end count as the launch-year baseline. The builder's stated reason, that the count was 'taken after the launch', actually argues for placing it before the 2021 bar, so the artboard is the basis.
- Public: below 640px the S(12) column header reads 'At 12 months', because the card title carries the rest. A fully suppressed row shows '—' in each cell and 'Not published' under the sector name, and the note below the table gives the under-20 rule.
- Public: the 'العربية' control keeps lang='ar' on the button and puts dir='rtl' on its text, so the button's logical margins follow the page.
- AED amounts built in my data files use a non-breaking space after 'AED'. Shared formatAED is untouched; its output is wrapped locally.
