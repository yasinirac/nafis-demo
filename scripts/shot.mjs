#!/usr/bin/env node
/**
 * Screenshot one route for visual review.
 * Usage: node scripts/shot.mjs <route> <out.png> [width=1440] [height=900]
 * Example: node scripts/shot.mjs /employer C:/tmp/employer.png 1440
 * Needs the dev server on http://localhost:5173 (override with SHOT_BASE).
 * Prints JSON with the file path and any console errors.
 */
import { chromium } from '@playwright/test';

const [rawRoute = '/', out = 'shot.png', w = '1440', h = '900'] = process.argv.slice(2);
// Git Bash rewrites "/employer" into "C:/Program Files/Git/employer"; undo that,
// and accept routes written without the leading slash ("employer").
const stripped = rawRoute.replace(/^[A-Za-z]:[\\/].*?[\\/]Git[\\/]?/, '/').replace(/\\/g, '/');
const route = stripped.startsWith('/') ? stripped : `/${stripped}`;
const base = process.env.SHOT_BASE ?? 'http://localhost:5173/nafis-demo/#';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(base + route, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify({ out, route, width: Number(w), errors }));
await browser.close();
