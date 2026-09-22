#!/usr/bin/env node
/**
 * Run axe-core over every route, width and interactive state.
 *
 *   npm run build && npm run start
 *   npm run a11y [-- --url http://localhost:3000] [--json out.json]
 *
 * Exits non-zero on any serious or critical violation, so it can gate CI.
 * A clean run is a floor, not a pass: automated tooling catches roughly a third
 * of WCAG issues. See docs/accessibility.md.
 */
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs';

const flag = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i === -1 ? d : process.argv[i + 1];
};
const BASE = flag('url', 'http://localhost:3000');
const JSON_OUT = flag('json', null);

// IS 5568 adopts WCAG 2.0/2.1 AA. `best-practice` catches landmark and
// heading-order problems that the AA tags alone do not.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

/** state name -> what to do to the page before scanning (false = not applicable) */
const STATES = {
  default: null,
  'menu-open': async (page) => {
    const btn = page.locator('button[aria-controls="mobile-menu"]');
    if (!(await btn.count()) || !(await btn.isVisible())) return false;
    await btn.click();
    await page.waitForSelector('#mobile-menu', { timeout: 3000 });
    return true;
  },
  'a11y-panel-open': async (page) => {
    await page.locator('button[aria-controls="a11y-panel"]').click();
    await page.waitForSelector('#a11y-panel', { timeout: 3000 });
    return true;
  },
  'form-errors': async (page) => {
    const submit = page.locator('#contact button[type=submit]');
    if (!(await submit.count())) return false;
    await submit.scrollIntoViewIfNeeded();
    await submit.click();
    await page.waitForSelector('[aria-invalid="true"]', { timeout: 3000 });
    return true;
  },
};

const ROUTES = ['/', '/thank-you', '/accessibility'];
const WIDTHS = [1600, 375];

const browser = await chromium.launch({ channel: 'chrome' });
const all = [];
let serious = 0;
let scans = 0;

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    for (const [state, setup] of Object.entries(STATES)) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      // Stop the marquee first: scanning moving elements gives unstable results.
      await page.evaluate(() => document.documentElement.setAttribute('data-a11y-motion', 'off'));
      await page.waitForTimeout(150);

      if (setup) {
        const ok = await setup(page).catch(() => false);
        if (!ok) {
          await context.close();
          continue;
        }
      }

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      scans += 1;
      await context.close();

      for (const v of results.violations) {
        all.push({
          route, width, state, id: v.id, impact: v.impact, help: v.help,
          count: v.nodes.length,
          targets: v.nodes.slice(0, 4).map((n) => n.target.join(' ')),
        });
        if (v.impact === 'serious' || v.impact === 'critical') serious += 1;
      }
    }
  }
}
await browser.close();

// Collapse: the same rule failing on several widths is one problem, not several.
const byRule = new Map();
for (const v of all) {
  const key = `${v.id}|${v.impact}`;
  if (!byRule.has(key)) byRule.set(key, { ...v, where: [] });
  byRule.get(key).where.push(`${v.route}@${v.width}/${v.state}`);
}

const RANK = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const rules = [...byRule.values()].sort((a, b) => RANK[a.impact] - RANK[b.impact]);

console.log(`\naxe-core — ${scans} scans across ${ROUTES.length} routes x ${WIDTHS.length} widths x up to ${Object.keys(STATES).length} states\n`);
if (!rules.length) {
  console.log('  No violations.\n');
} else {
  for (const r of rules) {
    console.log(`  [${(r.impact || 'n/a').toUpperCase()}] ${r.id} — ${r.help}`);
    console.log(`      ${r.count} node(s), e.g. ${r.targets[0]}`);
    console.log(`      seen in: ${[...new Set(r.where)].slice(0, 6).join(', ')}`);
    console.log();
  }
}

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(rules, null, 2));

console.log(
  serious
    ? `FAIL — ${serious} serious/critical violation instance(s).`
    : 'PASS — no serious or critical violations. (Automated checks only; manual passes still required.)',
);
process.exit(serious ? 1 : 0);
