import puppeteer from 'puppeteer';

const URL = 'http://localhost:4322/portfolio/';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setRequestInterception(true);
page.on('request', (r) => {
  const u = r.url();
  if (u.includes('ghchart') || u.includes('fonts.')) return r.abort();
  r.continue();
});
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 4000));

const sweep = await page.evaluate(async (type) => {
  const scroller = document.getElementById(`${type}-scroll-container`);
  const grid = document.getElementById(`${type}-calendar-grid`);
  const groups = Array.from(grid.querySelectorAll(`.${type}-calendar__month-group`));
  const years = Array.from(document.querySelectorAll(`.${type}-calendar__year`));
  const max = scroller.scrollWidth - scroller.clientWidth;
  const out = [];

  for (let s = 0; s <= max; s += 60) {
    scroller.style.scrollBehavior = 'auto';
    scroller.scrollLeft = s;
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));

    const rect = scroller.getBoundingClientRect();
    const probeX = rect.left + 4;
    const hit = groups.find((g) => {
      const b = g.getBoundingClientRect();
      return b.left <= probeX && b.right >= probeX;
    });
    const dateAtLeft = hit?.querySelector('[data-date]')?.dataset.date || null;

    const visibleYearLabels = years
      .map((y) => ({ label: y.textContent.trim(), x: Math.round(y.getBoundingClientRect().left), op: Number(getComputedStyle(y).opacity) }))
      .filter((y) => y.op === 1);

    out.push({ s, dateAtLeft, labels: visibleYearLabels });
  }
  scroller.scrollLeft = max;
  return out;
}, 'github');

let mismatches = 0;
for (const row of sweep) {
  const dateYear = row.dateAtLeft ? row.dateAtLeft.slice(0, 4) : '?';
  const labelYears = row.labels.map((l) => l.label.replace('年', ''));
  const ok = labelYears.length === 0 || labelYears.some((y) => y === dateYear);
  if (!ok) mismatches++;
  if (!ok || row.s % 300 === 0) {
    console.log(
      `scrollLeft=${row.s} leftDate=${row.dateAtLeft} labels=${row.labels.map((l) => `${l.label}@${l.x}`).join(',') || 'none'}${ok ? '' : '  <-- MISMATCH'}`
    );
  }
}
console.log(`\n总采样 ${sweep.length}，错位 ${mismatches} 处`);

await browser.close();
