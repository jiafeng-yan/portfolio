import { launchBrowser } from './browser.mjs';

const URL = process.env.PAGE_URL || 'http://127.0.0.1:4322/portfolio/';
const DPR = Number(process.env.DPR || 2);
const CPU = Number(process.env.CPU || 4);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: DPR });

const cdp = await page.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
await cdp.send('Performance.enable');

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
await sleep(2500);

const readMetrics = async () => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]));
};

const sampleFrames = (ms, scroll) =>
  page.evaluate(
    ({ ms, scroll }) =>
      new Promise((resolve) => {
        const frames = [];
        let last = performance.now();
        const start = last;
        let y = window.scrollY;
        const loop = (t) => {
          frames.push(t - last);
          last = t;
          if (scroll) {
            y += 16;
            window.scrollTo(0, y);
          }
          if (t - start < ms) requestAnimationFrame(loop);
          else resolve(frames);
        };
        requestAnimationFrame(loop);
      }),
    { ms, scroll }
  );

const summarize = (frames) => {
  const sorted = [...frames].sort((a, b) => a - b);
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  return {
    fps: +(1000 / avg).toFixed(1),
    p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
    worst: +sorted[sorted.length - 1].toFixed(1),
    over32: frames.filter((v) => v > 32).length
  };
};

async function sample(label) {
  const before = await readMetrics();
  const idle = await sampleFrames(2000, false);
  const scroll = await sampleFrames(2000, true);
  const after = await readMetrics();
  console.log(label, JSON.stringify({
    idle: summarize(idle),
    scroll: summarize(scroll),
    taskMs: Math.round((after.TaskDuration - before.TaskDuration) * 1000),
    scriptMs: Math.round((after.ScriptDuration - before.ScriptDuration) * 1000),
    recalc: Math.round(after.RecalcStyleCount - before.RecalcStyleCount)
  }));
}

console.log(`DPR=${DPR} CPU=${CPU}x`);
await sample('首屏');
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight - 1600));
await sleep(1200);
await sample('统计区');

await browser.close();
