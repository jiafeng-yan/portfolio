import fs from 'node:fs';
import puppeteer from 'puppeteer';

// 优先用本机已安装的 Chrome / Edge，避免删除缓存后必须重新下载 Chromium。
// CI 里没有这些路径，会回退到 Puppeteer 自带的浏览器。
const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

export function launchBrowser(extraArgs = []) {
  const executablePath =
    process.env.CHROME_PATH || CANDIDATES.find((candidate) => fs.existsSync(candidate));

  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--no-proxy-server', ...extraArgs],
    ...(executablePath ? { executablePath } : {})
  });
}
