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

    // 只取「贴在滚动区左缘」的那一个标签作为判定依据，
    // 其余标签只是在轨道上就位，不代表当前可见区间
    const pinned = visibleYearLabels
      .filter((y) => Math.abs(y.x - Math.round(rect.left)) <= 4)
      .map((y) => y.label.replace('年', ''));

    out.push({ s, dateAtLeft, pinned });
  }
  scroller.scrollLeft = max;
  return out;
}, 'github');

let mismatches = 0;
let checked = 0;
for (const row of sweep) {
  if (!row.dateAtLeft) continue; // 探针落在月组之间的空隙，跳过
  checked++;
  const dateYear = row.dateAtLeft.slice(0, 4);
  const ok = row.pinned.length === 0 || row.pinned.some((y) => y === dateYear);
  if (!ok) mismatches++;
  if (!ok || row.s % 300 === 0) {
    console.log(
      `scrollLeft=${row.s} leftDate=${row.dateAtLeft} pinned=${row.pinned.join(',') || 'none'}${ok ? '' : '  <-- MISMATCH'}`
    );
  }
}
console.log(`\n有效采样 ${checked}/${sweep.length}，错位 ${mismatches} 处`);

await browser.close();
