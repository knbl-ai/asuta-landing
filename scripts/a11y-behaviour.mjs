#!/usr/bin/env node
/**
 * Behavioural accessibility checks that axe cannot make: keyboard operation,
 * dialog focus handling, the preference panel's effects, motion and reflow.
 *
 *   npm run build && npm run start
 *   npm run a11y:behaviour [-- --url http://localhost:3000]
 */
import { chromium } from 'playwright-core';

const BASE = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : 'http://localhost:3000';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const browser = await chromium.launch({ channel: 'chrome' });

// ---------- keyboard: skip link ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300); // the skip link slides in over 180ms
  const first = await page.evaluate(() => {
    const el = document.activeElement;
    const r = el.getBoundingClientRect();
    return { cls: el.className, text: el.textContent.trim(), top: Math.round(r.top) };
  });
  check('first Tab reaches the skip link', first.cls.includes('skip-link'), `focused "${first.text}"`);
  check('skip link is visible when focused', first.top >= 0 && first.top < 100, `top=${first.top}px`);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const target = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  check('skip link moves focus to the content', target === 'content', `focus now on #${target}`);
  await ctx.close();
}

// ---------- keyboard: every interactive element has a visible focus ring ----------
for (const width of [1600, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  let checked = 0;
  const unstyled = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return {
        tag: el.tagName,
        label: (el.getAttribute('aria-label') || el.textContent || el.name || '').trim().slice(0, 24),
        outline: s.outlineStyle,
        width: s.outlineWidth,
        shadow: s.boxShadow !== 'none',
      };
    });
    if (!info) continue;
    checked += 1;
    const visible = (info.outline !== 'none' && parseFloat(info.width) > 0) || info.shadow;
    if (!visible) unstyled.push(`${info.tag} "${info.label}"`);
  }
  check(`focused elements show a focus indicator @${width}`, unstyled.length === 0,
    `${checked} elements tabbed${unstyled.length ? `; missing on ${unstyled.slice(0, 3).join(', ')}` : ''}`);
  await ctx.close();
}

// ---------- mobile menu behaves as a dialog ----------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 780 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const burger = page.locator('button[aria-controls="mobile-menu"]');
  await burger.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('#mobile-menu');

  const state = await page.evaluate(() => ({
    inside: document.querySelector('#mobile-menu').contains(document.activeElement),
    inert: document.getElementById('content').hasAttribute('inert') && document.getElementById('contact').hasAttribute('inert'),
    locked: document.body.style.overflow === 'hidden',
    expanded: document.querySelector('button[aria-controls="mobile-menu"]').getAttribute('aria-expanded'),
    role: document.querySelector('#mobile-menu').getAttribute('role'),
    modal: document.querySelector('#mobile-menu').getAttribute('aria-modal'),
  }));
  check('menu opens with focus inside it', state.inside);
  check('menu exposes role=dialog aria-modal=true', state.role === 'dialog' && state.modal === 'true');
  check('page behind the menu is inert', state.inert);
  check('background scroll is locked', state.locked);
  check('hamburger reports aria-expanded=true', state.expanded === 'true');

  let escaped = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => document.querySelector('#mobile-menu')?.contains(document.activeElement)))) {
      escaped = true;
      break;
    }
  }
  check('focus stays trapped inside the menu', !escaped);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({
    gone: !document.querySelector('#mobile-menu'),
    onBurger: document.activeElement?.getAttribute('aria-controls') === 'mobile-menu',
    inert: document.getElementById('content').hasAttribute('inert'),
  }));
  check('Escape closes the menu', after.gone);
  check('focus returns to the hamburger', after.onBurger);
  check('inert is removed on close', !after.inert);
  await ctx.close();
}

// ---------- preference panel ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const fab = page.locator('button[aria-controls="a11y-panel"]');
  await fab.click();
  await page.waitForSelector('#a11y-panel');

  const baseH = await page.evaluate(() => document.documentElement.getBoundingClientRect().height);
  for (let i = 0; i < 5; i++) await page.locator('#a11y-panel button[aria-label="הגדלת טקסט"]').click();
  await page.waitForTimeout(300);
  const zoomed = await page.evaluate(() => ({
    attr: document.documentElement.getAttribute('data-a11y-zoom'),
    h: document.documentElement.getBoundingClientRect().height,
    font: parseFloat(getComputedStyle(document.querySelector('#hero-title')).fontSize) * parseFloat(getComputedStyle(document.documentElement).zoom || 1),
  }));
  check('text size control reaches 200%', zoomed.attr === '200', `data-a11y-zoom=${zoomed.attr}`);
  check('text size control enlarges the page', zoomed.h > baseH * 1.9, `height ${Math.round(baseH)} -> ${Math.round(zoomed.h)}`);

  await page.evaluate(() => scrollTo(0, 2500));
  await page.waitForTimeout(250);
  const fabBottom = await page.evaluate(() => {
    const r = document.querySelector('button[aria-controls="a11y-panel"]').getBoundingClientRect();
    return Math.round(innerHeight - r.bottom);
  });
  check('panel button stays fixed while zoomed', fabBottom >= 0 && fabBottom < 80, `bottom gap=${fabBottom}px`);
  await page.evaluate(() => scrollTo(0, 0));

  for (const [label, attr, value] of [
    ['ניגודיות', 'data-a11y-contrast', 'invert'],
    ['אפור', 'data-a11y-grayscale', 'on'],
    ['קישורים', 'data-a11y-links', 'on'],
    ['אנימציות', 'data-a11y-motion', 'off'],
    ['גופן', 'data-a11y-font', 'readable'],
    ['סמן', 'data-a11y-cursor', 'big'],
  ]) {
    await page.locator(`#a11y-panel button[role="switch"]:has-text("${label}")`).click();
    await page.waitForTimeout(150);
    const got = await page.getAttribute('html', attr);
    check(`panel: ${label}`, got === value, `${attr}="${got}"`);
  }

  await page.evaluate(() => scrollTo(0, 2500));
  await page.waitForTimeout(250);
  const fabUnderFilter = await page.evaluate(() => {
    const r = document.querySelector('button[aria-controls="a11y-panel"]').getBoundingClientRect();
    return Math.round(innerHeight - r.bottom);
  });
  check('panel button stays fixed under the contrast filter', fabUnderFilter >= 0 && fabUnderFilter < 80, `bottom gap=${fabUnderFilter}px`);

  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => ({
    zoom: document.documentElement.getAttribute('data-a11y-zoom'),
    contrast: document.documentElement.getAttribute('data-a11y-contrast'),
  }));
  check('preferences survive a reload', persisted.zoom === '200' && persisted.contrast === 'invert',
    `zoom=${persisted.zoom} contrast=${persisted.contrast}`);

  await fab.click();
  await page.waitForSelector('#a11y-panel');
  await page.locator('#a11y-panel button:has-text("איפוס")').click();
  await page.waitForTimeout(200);
  const left = await page.evaluate(() =>
    [...document.documentElement.attributes].filter((a) => a.name.startsWith('data-a11y-')).map((a) => a.name));
  check('reset clears every preference', left.length === 0, `${left.length} attributes left`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const closed = await page.evaluate(() => ({
    gone: !document.querySelector('#a11y-panel'),
    onFab: document.activeElement?.getAttribute('aria-controls') === 'a11y-panel',
  }));
  check('Escape closes the panel and returns focus', closed.gone && closed.onFab);
  await ctx.close();
}

// ---------- moving content can be paused (2.2.2) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const toggle = page.locator('button[aria-controls="departments-strip"]');
  await toggle.click();
  await page.waitForTimeout(200);
  const r = await page.evaluate(async () => {
    const track = document.querySelector('#departments-strip [class*=track]');
    const a = getComputedStyle(track).transform;
    await new Promise((res) => setTimeout(res, 600));
    return { paused: getComputedStyle(track).animationPlayState, moved: getComputedStyle(track).transform !== a };
  });
  check('departments strip can be paused', r.paused === 'paused' && !r.moved, `play-state=${r.paused}`);
  const label = await toggle.getAttribute('aria-label');
  check('pause button label reflects its state', label?.startsWith('הפעלת'), `"${label}"`);
  await ctx.close();
}

// ---------- reduced motion ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const moved = await page.evaluate(async () => {
    const track = document.querySelector('#departments-strip [class*=track]');
    const a = getComputedStyle(track).transform;
    await new Promise((res) => setTimeout(res, 800));
    return getComputedStyle(track).transform !== a;
  });
  check('reduced motion stops the departments strip', !moved);
  await ctx.close();
}

// ---------- form errors ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.locator('#contact button[type=submit]').click();
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => ({
    invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((e) => e.name),
    focused: document.activeElement?.id,
    message: document.getElementById('lead-message')?.textContent,
    described: document.getElementById('lead-fullName')?.getAttribute('aria-describedby'),
  }));
  check('empty submit marks every required field invalid', r.invalid.length === 4, r.invalid.join(', '));
  check('focus moves to the first invalid field', r.focused === 'lead-fullName', `#${r.focused}`);
  check('error text is announced and linked to the field', !!r.message && r.described === 'lead-message', `"${r.message}"`);
  await ctx.close();
}

// ---------- reflow (WCAG 1.4.10) ----------
for (const width of [320, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => ({
    docSW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  check(`no horizontal scrolling at ${width}px`, r.docSW <= r.clientW + 1, `document scrollWidth ${r.docSW} vs viewport ${r.clientW}`);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
