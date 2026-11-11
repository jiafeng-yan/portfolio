import puppeteer from 'puppeteer';
import fs from 'node:fs';

const URL = 'http://localhost:4322/portfolio/';
const OUT = 'output/review';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

async function shot(name, { width, height, dark = false, full = false, scrollTo = null, hover = null, mobile = false }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1.5, isMobile: mobile, hasTouch: mobile });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('clustrmaps') || u.includes('leetcode.cn') || u.includes('ghchart') || u.includes('fonts.gstatic') || u.includes('fonts.googleapis')) {
      req.abort();
      return;
    }
    req.continue();
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  if (scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: 'start' });
    }, scrollTo);
    await new Promise(r => setTimeout(r, 1800));
  }
  if (hover) {
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, hover);
    if (box) {
      await page.mouse.move(box.x, box.y);
      await new Promise(r => setTimeout(r, 1200));
    }
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  await page.close();
}

await shot('01-hero-desktop', { width: 1440, height: 900 });
await shot('02-profile-desktop', { width: 1440, height: 900, scrollTo: '#profile' });
await shot('03-projects-desktop', { width: 1440, height: 900, scrollTo: '#projects' });
await shot('04-projects-hover', { width: 1440, height: 900, scrollTo: '#projects', hover: '.project-showcase__panel' });
await shot('05-skills-desktop', { width: 1440, height: 900, scrollTo: '#skills' });
await shot('06-experience-desktop', { width: 1440, height: 900, scrollTo: '#experience' });
await shot('07-stats-desktop', { width: 1440, height: 900, scrollTo: '#stats' });
await shot('08-full-desktop', { width: 1440, height: 1000, full: true });
await shot('09-hero-mobile', { width: 390, height: 844, mobile: true });
await shot('10-full-mobile', { width: 390, height: 844, mobile: true, full: true });
await shot('11-projects-mobile', { width: 390, height: 844, mobile: true, scrollTo: '#projects' });
await shot('12-dark-desktop', { width: 1440, height: 900, dark: true, scrollTo: '#projects' });
await shot('13-dark-hero', { width: 1440, height: 900, dark: true });

await browser.close();
console.log('done');
