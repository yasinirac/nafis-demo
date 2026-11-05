# NAFIS platform concept demo

> **Concept · not an official NAFIS or UAE Government service · sample data**

This is a clickable concept of an AI-native redesign of NAFIS, the UAE's Emiratisation programme, shown as nine portals on one joined record. It is a static front-end. The people and companies are fictional and most figures are made up. There is no backend, no login and no connection to any real system. It is not affiliated with, endorsed by or connected to NAFIS, MoHRE or any UAE Government entity. It uses no official logos, emblems, government domains or real officials' names, and a demo role switcher replaces sign-in.

## The nine portals

| # | Portal | Persona in the demo | Built screens |
|---|---|---|---|
| — | Platform map | — | `/` |
| 1 | Talent (phone app) | Mariam, final-year student · Rashid, Finance Analyst | `/talent` · `/talent/path` · `/talent/alignment-check` · `/talent/privacy` |
| 2 | Employer Portal | Huda, HR Admin · Ahmed, line manager | `/employer` · `/employer/discovery` · `/employer/monthly-report` |
| 3 | Government View | Federal recruitment officer (2030 scenario) | `/government/career-record` |
| 4 | Staff Console | Aisha, counsellor · Salem, investigator | `/staff/counsellor` · `/staff/integrity/IC-2026-1183` |
| 5 | Analyst Workbench | Noor, Statistics & Evaluation unit | `/analyst` |
| 6 | Developer Portal | Reem, Falak HR Cloud (fictional) | `/developer` |
| 7 | Contributor Portal | Hessa, Gulf Coast University (fictional) | `/contributor` |
| 8 | Executive Command Centre | Chief executive | `/executive` · `/executive/monthly-pack` |
| 9 | Public Transparency | Anyone | `/public` |

The app uses hash routing, so a deep link looks like `/#/employer/discovery`. `docs/SCREENS.md` lists every route with its persona and purpose; the platform map also lists the 40+ planned screens that are not built.

## Run it

Node 20 or later.

```bash
npm i
npm run dev
```

Then open http://localhost:5173/nafis-demo/.

| Command | What it does |
|---|---|
| `npm run verify` | Typecheck, lint, the figures check and a production build |
| `npm run check:figures` | Fails if a screen types a number directly instead of reading it from `src/data` |
| `npm run test:smoke` | Playwright: every route at 1440 and 390 px, concept chip present, no console errors, no sideways scroll, axe scan (first run: `npx playwright install chromium`) |
| `npm run preview` | Serve the production build |

## How it deploys

`.github/workflows/deploy.yml` runs on every push to `main`: install, typecheck, lint, figures check, build, then publish `dist/` to GitHub Pages with the official Pages actions. Vite's `base` comes from the repository name (`GITHUB_REPOSITORY`), so the site works under `https://<owner>.github.io/<repo>/`. Hash routing keeps deep links working without a server rewrite. In the repository settings, Pages must be set to build from GitHub Actions.

## Data status tags

Every figure lives in `src/data` and carries one of five statuses. Screens show the tag wherever a reader could mistake sample data for fact.

| Tag | Meaning |
|---|---|
| Published | A figure that has been published, with its date |
| Sample | Fictional sample data made up for this concept |
| Estimate | A model estimate, not a count |
| Provisional | A count that may still be revised |
| Illustrative | An illustrative figure that shows how the screen would work |

## Guardrails the screens follow

- This is a concept. Every page shows the concept chip. No official logos, emblems, government domains, real officials or login forms.
- All people and companies are fictional, except figures tagged Published.
- Every number comes from `src/data` with a status; screens never type figures.
- Employers never see a risk score, a retention prediction, a "likely to stay" label or any number about a person. Fit shows as a tier (Strong, Good, Stretch, Cannot assess) with reasons.
- Employers cannot search the pool and cannot filter by sex, age, disability, family name, emirate of origin, university name, photo or commute time. Talent Cards are anonymous codes until the person accepts an Introduction Request.
- Nothing about a person reaches an employer or a government recruiter without that person's Consent Grant. Every view of a record is logged where the person can see it.
- No automatic penalties. A model raises an alert, a person opens a case, a second person reviews it, and the affected person gets a hearing.
- AI agents draft and recommend; people decide. Every AI-drafted element names its agent.
- Confidentiality wording says who sees what and names the exception ("unless you agree, or a legal order requires it").
- No emoji, no marketing adjectives, no exclamation marks, short sentences.

## What is real

| Figure | Value | Date | Status |
|---|---|---|---|
| Emiratis in private-sector jobs | 190,000+ | July 2026 | Published |
| Companies employing Emiratis | 32,000+ | July 2026 | Published |
| Emiratis in private-sector jobs at year end | 2018 27,055 · 2019 26,921 · 2020 28,912 · 2021 29,810 · 2022 50,228 · 2023 about 92,000 · 2024 about 131,000 · 2025 about 171,000 | Year ends; 2023–2025 published as rounded totals | Published |
| NAFIS launch | September 2021 | — | Published |

Everything else is not real: every person, company, case, KPI, survey answer, forecast, cost and model score is sample, estimate, provisional or illustrative data made up for this concept. The published values above were supplied in the build brief and were not independently re-checked in this repository.

## Project structure

```
src/
  app/          routes, AppShell (desktop portals), PhoneShell (talent), TopBar, RoleSwitcher, ConceptChip
  components/   Button, Card, Chip, DataTag, Tile, DataTable, Tabs, RadioGroup, Switch, Field, StatusPill, AiNote, Stepper
  charts/       LineWithBand, StepLines, Bars, Funnel, Heatmap, SegmentedBar, ChartFrame (legend + table toggle)
  data/         every figure, with its status
  portals/      one folder per portal
  styles/       tokens.css (design tokens), fonts.css (self-hosted fonts)
docs/           SCREENS.md, DECISIONS.md, CONVENTIONS.md
tests/          Playwright smoke and accessibility tests
```

Stack: Vite, React 18, TypeScript, Tailwind CSS 3, React Router 6, lucide-react icons. Charts are hand-rolled SVG components.
