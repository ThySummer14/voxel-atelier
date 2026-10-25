import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] || '/tmp/shoot';
mkdirSync(out, { recursive: true });

const shots = JSON.parse(process.argv[3] || `[
  {"name":"qing-all","url":"http://127.0.0.1:8899/qinian/?still&pure&mood=qing","w":1600,"h":1000},
  {"name":"qing-front","url":"http://127.0.0.1:8899/qinian/?still&pure&mood=qing&view=front","w":1600,"h":1000},
  {"name":"qing-hero","url":"http://127.0.0.1:8899/qinian/?still&pure&mood=qing&cam=0,4.5,62,0,15.5,0,40","w":1600,"h":1000}
]`);

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--use-gl=angle',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--window-size=1600,1000',
  ],
});

async function grab(page, { name, url, w, h }) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.__engine && document.body.classList.contains('ready'), { timeout: 90000 });
  await page.evaluate(() => {
    const e = window.__engine;
    e.still = true;
    e.dirty = true;
    e.shadowDirty = true;
    e.frame(0.016);
  });
  await new Promise((r) => setTimeout(r, 1800));
  const path = `${out}/${name}.png`;
  await page.screenshot({ path, type: 'png' });
  console.log(JSON.stringify({ name, path, ms: Date.now() - t0 }));
}

const page = await browser.newPage();
page.setDefaultTimeout(120000);
for (const shot of shots) {
  try { await grab(page, shot); }
  catch (err) { console.error('FAIL', shot.name, err.message); }
}
await browser.close();
