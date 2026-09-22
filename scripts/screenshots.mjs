// Full-page screenshots at the two design widths, for comparing against the PDF.
// Usage: npm run shots -- [baseUrl] [outDir]   (needs Google Chrome installed)
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:3000';
const out = process.argv[3] || 'screenshots';
const pages = ['/', '/thank-you'];
const viewports = [
  { name: 'desktop', width: 1600, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile', width: 375, height: 812, deviceScaleFactor: 2 },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Scroll through the page so lazy-loaded images are fetched before the capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const file = `${out}/${vp.name}${p === '/' ? '-home' : p.replace(/\//g, '-')}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await ctx.close();
}
await browser.close();
