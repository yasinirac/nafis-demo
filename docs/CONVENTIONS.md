# Building screens: conventions

This is the working guide for anyone adding a screen. The binding spec is the build brief; this file explains how the code base expects a screen to be put together.

## Shells

- Desktop portals: wrap the screen in `AppShell` from `src/app/AppShell.tsx` with `portal` and `persona` ids from `src/data/platform.ts`. It renders the sticky top bar (brand, organisation chip, role chip, concept chip, role switcher, Platform map link, avatar initial), the left nav and `<main id="main">`. Pass `extraChips` for things like an access tier.
- Talent phone screens: wrap in `PhoneShell` from `src/app/PhoneShell.tsx` with `persona`. Use `PhoneHeader` for the title row. The bottom nav is built in.
- Never render a second `<main>` or a second concept chip inside a shell.
- Start each desktop screen with `PageHeader` (from `src/components/Card.tsx`) holding the one `<h1>`.

## Components (src/components)

| Need | Use |
|---|---|
| Action | `Button` / `ButtonLink` (variants primary, secondary, ghost; min height 44px) |
| Container | `Card`, `CardHeader`, `PageHeader` |
| Static label | `Chip` (tones neutral, outline, accent, warning, critical, good, dark) |
| Data status of a figure | `DataTag status="sample"` (published, sample, estimate, provisional, illustrative) |
| On/off chip | `ToggleChip` (aria-pressed) |
| Status with meaning | `StatusPill` / `StatusBanner` with tone good, warning, critical, accent, neutral. Always icon + word. Use `live` on banners that appear after an action. |
| AI-drafted content | `AiNote agent="Coach Agent"` + who decides, e.g. `you decide` or `a person decides` |
| KPI | `Tile` (label, value, unit, sub, status, badge) |
| Table | `DataTable` (caption, columns with `numeric`, `rowHeader`) |
| Tabs | `Tabs` (ARIA tabs, arrow keys) |
| Choose one | `RadioGroup` (native radios; variants pill, segmented, card, compact) |
| Switch | `Switch` (role="switch") |
| Inputs | `Field` render prop + `TextInput`, `TextArea`, `Select`; `Checkbox` |
| Steps | `Stepper` (aria-current="step"), `SegmentProgress` |

## Charts (src/charts)

Wrap every chart in `ChartFrame` (title, status, legend for 2+ series, `table` spec for the "Show table" toggle, footnote). Inside it put one of `LineWithBand`, `StepLines`, `Bars` (horizontal or vertical), `Funnel`, `Heatmap` (+ `HeatmapLegend`), `SegmentedBar`. Each takes a one-sentence `ariaLabel`. Colours come from `chartColors` in `src/charts/core.ts`: series 1–3, muted, the sequential and ordinal ramps. Teal is never used in charts. No pies, dual axes or gauges.

## Data

- Every figure lives in `src/data`, never typed into a component. Text with numbers in it lives in data too (use `fill()` from `src/lib/format.ts` for templates).
- Figures carry a status (`fig(value, 'sample')`). Show `DataTag` wherever a reader could mistake sample data for fact.
- `npm run check:figures` fails if JSX text or a text attribute in `src/portals` or `src/app` contains a digit. A UI-only number (for example a step number in a label) may carry a `figure-ok` comment on the same line; use it rarely.
- Formatting helpers: `formatInt`, `formatAED`, `formatAEDRange`, `formatPct`, `formatSignedPct`, `formatCompact` in `src/lib/format.ts`.

## Guardrails that shape screens

- Employers never see a risk score, retention prediction, "likely to stay" label or any number about a person. Fit is a tier with reasons.
- Talent Cards are anonymous codes until the person accepts an Introduction Request. No filters by sex, age, disability, family name, emirate of origin, university name, photo or commute time.
- Nothing about a person reaches an employer or a government recruiter without a Consent Grant. Every view is logged where the person can see it.
- No automatic penalties: a model raises an alert, a person opens a case, a second person reviews, the affected person gets a hearing.
- AI agents draft and recommend; people decide. Name the agent on every AI-drafted element.
- Confidentiality wording names who sees what and the exception ("unless you agree, or a legal order requires it"). Never "nothing will happen" or "you are not in trouble".
- No emoji, no marketing adjectives, no exclamation marks, short sentences.
- No real organisations, officials, logos, laws or government domains beyond those the brief uses (MoHRE, Partners Club).

## Accessibility

Real `<button>`, `<a href>`/`Link`, `<input>` with `<label>`. `aria-pressed` on toggles, native radio groups for pills, `aria-label` on icon-only buttons, `lang="ar" dir="rtl"` on Arabic text. Use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`) so RTL can be added later. Text contrast at least 4.5:1: use `text-ink`, `text-ink2` or `text-muted` on white or ground, never lighter greys. Control borders use `border-control`.

## Checks before handing over

```
npx tsc --noEmit -p tsconfig.json
npx eslint <your files> --max-warnings=0
node scripts/check-figures.mjs
node scripts/shot.mjs <route> <out.png> 1440   # and 390 for phone widths
```
