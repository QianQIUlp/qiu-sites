// Parity screenshots for the homepage: every room, zh/en, desktop/phone, with reduced motion and
// every lesson already found so nothing depends on timing. Used before and after refactors.
//   node tests/home/parity.mjs capture <dir>      (dev server on :4321, or BASE_URL)
//   node tests/home/parity.mjs compare <before> <after>
import {chromium} from '@playwright/test';
import {mkdirSync, readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:4321';
const rooms = ['home', 'papers', 'music', 'trace', 'rethink', 'work', 'idle', 'paths', 'blindspot', 'overview'];
const lessons = ['wander', 'papers-light', 'music-strings', 'trace-line', 'trace-pluck', 'trace-loop', 'trace-cross', 'rethink-walk', 'rethink-cut', 'work-cut', 'idle-still', 'idle-letgo', 'paths-bend', 'paths-pick', 'blind-angle', 'blind-brush', 'blind-eye'];
const configs = [
  {lang: 'zh', path: '/', name: 'desktop', viewport: {width: 1280, height: 800}},
  {lang: 'zh', path: '/', name: 'phone', viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
  {lang: 'en', path: '/en/', name: 'desktop', viewport: {width: 1280, height: 800}},
  {lang: 'en', path: '/en/', name: 'phone', viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true},
];
const launch = () => chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});

async function capture(dir) {
  mkdirSync(dir, {recursive: true});
  const browser = await launch();
  for (const config of configs) {
    const context = await browser.newContext({viewport: config.viewport, isMobile: config.isMobile, hasTouch: config.hasTouch, deviceScaleFactor: 1, reducedMotion: 'reduce'});
    await context.addInitScript(keys => { try { localStorage.setItem('me-found', JSON.stringify(keys)); } catch {} }, lessons);
    const page = await context.newPage();
    await page.goto(base + config.path);
    await page.waitForFunction(() => document.body.classList.contains('guitar-home-ready') && !document.querySelector('[data-asleep]'), null, {timeout: 60000});
    await page.waitForTimeout(800);
    for (const room of rooms) {
      await page.evaluate(place => { location.hash = place; }, room);
      await page.waitForTimeout(room === 'work' ? 2500 : 1200);
      await page.screenshot({path: join(dir, `${config.lang}-${config.name}-${room}.png`)});
    }
    await context.close();
  }
  await browser.close();
}

async function compare(before, after) {
  const browser = await launch(), page = await browser.newPage();
  let worst = 0;
  for (const file of readdirSync(before).filter(name => name.endsWith('.png')).sort()) {
    const a = readFileSync(join(before, file)).toString('base64');
    let b;
    try { b = readFileSync(join(after, file)).toString('base64'); } catch { console.log(`${file}  MISSING`); worst = 1; continue; }
    const share = await page.evaluate(async ([a, b]) => {
      const load = src => new Promise(resolve => { const img = new Image(); img.onload = () => resolve(img); img.src = `data:image/png;base64,${src}`; });
      const [x, y] = await Promise.all([load(a), load(b)]);
      if (x.width !== y.width || x.height !== y.height) return 1;
      const pixels = img => { const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; };
      const p = pixels(x), q = pixels(y);
      let changed = 0;
      for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 48) changed++;
      return changed / (p.length / 4);
    }, [a, b]);
    worst = Math.max(worst, share);
    console.log(`${file.padEnd(32)} ${(share * 100).toFixed(2)}% changed`);
  }
  await browser.close();
  console.log(`worst: ${(worst * 100).toFixed(2)}%`);
}

const [mode, a, b] = process.argv.slice(2);
if (mode === 'capture') await capture(a);
else if (mode === 'compare') await compare(a, b);
else console.log('usage: parity.mjs capture <dir> | compare <before> <after>');
