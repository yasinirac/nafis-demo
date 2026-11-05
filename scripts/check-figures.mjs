#!/usr/bin/env node
/**
 * Guard for the rule "every number comes from src/data; never type a figure
 * into a component". It scans screens and shells for digits written straight
 * into JSX text or into text-bearing attributes. A line can opt out with a
 * trailing comment containing "figure-ok" (for example a step number that is
 * part of the UI, not data).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['src/portals', 'src/app'];
const textAttr = /\b(label|title|aria-label|placeholder|description|alt|legend|caption|sub|unit|detail)=("([^"]*\d[^"]*)"|'([^']*\d[^']*)')/g;
const jsxText = />([^<>{}]*\d[^<>{}]*)</g;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const problems = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.includes('figure-ok')) return;
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      for (const m of line.matchAll(jsxText)) {
        const text = m[1].trim();
        // Ignore arrow functions and comparisons that the regex can catch in TS code.
        if (!text || /=>|&&|\|\||\?\s|===|!==/.test(text)) continue;
        problems.push(`${relative('.', file)}:${i + 1}  JSX text "${text}"`);
      }
      for (const m of line.matchAll(textAttr)) {
        problems.push(`${relative('.', file)}:${i + 1}  ${m[1]}="${m[3] ?? m[4]}"`);
      }
    });
  }
}

if (problems.length) {
  console.error('Figures typed into components (move them to src/data, or mark a UI-only number with "figure-ok"):');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('check-figures: no figures typed into screens or shells.');
