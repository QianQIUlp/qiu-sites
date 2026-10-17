// Mid-range phone profile (390×844, touch, 4× CPU slowdown, Fast 3G-ish network) against a production build
// (`astro preview`, :4322 by default). Reports when the page is usable, when the 3D guitar is ready,
// long main-thread tasks and the frame rate in the home and strings rooms.
// There is no GPU here (software WebGL), so frame rates are a lower bound and only the main thread is meaningful.
//   node tests/home/phone.mjs [path]
import {chromium} from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:4322';
const browser = await chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8});
await page.addInitScript(() => { window.__long = []; new PerformanceObserver(list => list.getEntries().forEach(e => window.__long.push(Math.round(e.duration)))).observe({type: 'longtask', buffered: true}); });
const t0 = Date.now();
await page.goto(base + (process.argv[2] || '/'), {waitUntil: 'load'});
const loaded = Date.now() - t0;
await page.waitForFunction(() => document.body.classList.contains('guitar-home-ready'), null, {timeout: 120_000});
const guitar = Date.now() - t0;
const fps = () => page.evaluate(() => new Promise(resolve => { let n = 0; const start = performance.now(); const tick = now => { n++; if (now - start < 3000) requestAnimationFrame(tick); else resolve(Math.round(n / ((now - start) / 1000))); }; requestAnimationFrame(tick); }));
const homeFps = await fps();
await page.waitForFunction(() => !document.querySelector('[data-asleep]'), null, {timeout: 120_000});
await page.evaluate(() => { location.hash = 'music'; });
await page.waitForTimeout(1500);
const musicFps = await fps();
const long = await page.evaluate(() => window.__long);
console.log(`load ${loaded} ms, 3D guitar ready ${guitar} ms; long tasks ${long.length} (worst ${Math.max(0, ...long)} ms, total ${long.reduce((a, b) => a + b, 0)} ms); ~${homeFps} fps home, ~${musicFps} fps strings room`);
await browser.close();
