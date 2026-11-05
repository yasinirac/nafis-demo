# Decisions

Choices the build brief left open, and why. Grouped by area.

## Process

- **Planning sources.** The user asked for the earlier NAFIS chats to be read first. The local Claude Code and Cowork histories had no NAFIS chat. The user's claude.ai artifacts from that work were read instead: four planning documents (platform blueprint, talent journey, AI build plan, forensic analysis plan) and the design canvas "NAFIS Platform Demo — Full Structure" with one artboard per screen. The canvas was used as layout reference; the brief wins wherever they differ (for example, the older documents describe automatic holds and clawbacks, a five-minute four-rating monthly report and ranking by predicted survival, all of which the brief replaces).
- **Shared chat link.** A claude.ai share link the user sent opens a sign-in page in the built-in browser, so it could not be read; the artifacts above cover the same work.
- **"Use /find".** The skills registry search (`npx skills find`) returned only low-install packages from unknown authors, so none were installed. Installed skills were used instead: `dataviz` for chart rules (the series palette was run through its colour-blind validator and passes every check).
- **"Ultra code".** Taken as a request for multi-agent work: the shared core was built first, then five agents built the portal groups in parallel, each followed by a reviewer that checked its screens item by item against the brief and fixed gaps.
- **Publishing.** Creating a public GitHub repository was blocked by the local permission system as a new public surface. Everything is committed locally; publishing waits for the user's go-ahead (see the final report).

## Stack and build

- **HashRouter** rather than BrowserRouter plus a `404.html` copy: deep links work on GitHub Pages with no rewrite rules and no flash of a 404 page.
- **Tailwind CSS 3** with a `tailwind.config.ts` that maps every colour to the CSS variables in `src/styles/tokens.css`, so the tokens file stays the single source of truth (the brief asks for tokens mirrored in the Tailwind config).
- **Vite 6** (supports Node 20, which the deploy workflow uses).
- **Fonts are self-hosted** with Fontsource packages, bundled into `dist/`, so the demo makes no requests to third-party font servers.
- **Vite `base`** comes from `GITHUB_REPOSITORY` in CI and falls back to `/nafis-demo/` locally, so dev, preview, tests and Pages use the same URLs.
- **`noindex, nofollow`** meta tag: a concept that uses a real programme's name should not surface in search results next to the real service.
- **Favicon** is a plain letter mark drawn inline (a data URI), not a logo, which also avoids a 404 request for `favicon.ico`.
- **Figures check.** `scripts/check-figures.mjs` fails the build if JSX text or a text attribute in a screen or shell contains a digit, enforcing "never type a figure into a component". UI-only numbers can be marked `figure-ok`.
- **Dev dependencies for tests:** `@playwright/test` and `@axe-core/playwright`. Runtime dependencies stay at React, React Router, lucide-react and the fonts.

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
