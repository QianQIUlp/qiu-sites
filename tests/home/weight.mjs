// First-load weight of the homepage, against a production build (`astro preview`, :4322 by default).
// Reports bytes by type at the `load` event and after the page has sat idle on the home room.
// Budgets (set from the step-4 measurements, 2026-10-17, ~15% headroom; /en/ at load is 360-530 KB depending on whether the first idle font lands before the load event) fail the run with exit code 1.
// Local preview does not compress, so JS/CSS figures are uncompressed sizes.
//   node tests/home/weight.mjs [path]
import {chromium} from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:4322';
const path = process.argv[2] || '/';
// First load = at the `load` event; settled = after 8 s idle with every room awake. Uncompressed KB.
const budget = {'/': {load: 620, settled: 2600, requests: 11, js: 24}, '/en/': {load: 620, settled: 2400, requests: 11, js: 24}}[path];
let over = 0;
const browser = await chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
for (const [name, options] of [['desktop', {viewport: {width: 1280, height: 800}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}]]) {
  const context = await browser.newContext(options), page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled', {cacheDisabled: true});
  const types = new Map(), done = [];
  let phase = 'load';
  cdp.on('Network.responseReceived', e => types.set(e.requestId, {url: e.response.url, mime: e.response.mimeType}));
  cdp.on('Network.loadingFinished', e => { const r = types.get(e.requestId); if (r && !r.url.startsWith('data:')) done.push({...r, bytes: e.encodedDataLength, phase}); });
  await page.goto(base + path, {waitUntil: 'load'});
  phase = 'idle';
  await page.waitForTimeout(8000);
  const kind = mime => /javascript/.test(mime) ? 'js' : /css/.test(mime) ? 'css' : /font|woff/.test(mime) ? 'font' : /image/.test(mime) ? 'image' : /html/.test(mime) ? 'html' : 'other';
  const sum = list => list.reduce((s, r) => s + r.bytes, 0), kb = n => `${(n / 1024).toFixed(0)} KB`;
  for (const p of ['load', 'idle']) {
    const list = done.filter(r => p === 'load' ? r.phase === 'load' : true);
    const by = {};
    for (const r of list) by[kind(r.mime)] = (by[kind(r.mime)] || 0) + r.bytes;
    if (budget) { const kbTotal = sum(list) / 1024, jsKb = (by.js || 0) / 1024, limit = budget[p === 'load' ? 'load' : 'settled']; if (kbTotal > limit || (p === 'load' && (list.length > budget.requests || jsKb > budget.js))) { over++; console.log(`✗ over budget (${p}: ${limit} KB, ${budget.requests} requests at load, ${budget.js} KB JS at load)`); } }
    console.log(`${name} ${p === 'load' ? 'at load' : 'after idle'}: ${kb(sum(list))} in ${list.length} requests  ${Object.entries(by).map(([k, v]) => `${k} ${kb(v)}`).join(', ')}`);
  }
  if (process.env.VERBOSE) for (const r of done.sort((a, b) => b.bytes - a.bytes).slice(0, 25)) console.log(`  ${r.phase.padEnd(5)} ${kb(r.bytes).padStart(7)}  ${r.url.replace(base, '')}`);
  await context.close();
}
await browser.close();
if (over) process.exit(1);
