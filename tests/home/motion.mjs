// Reduced-motion check against a production build (`astro preview`, :4322 by default).
//   node tests/home/motion.mjs
// With prefers-reduced-motion: reduce, no room may run a CSS animation or transition on arrival, and the
// Motion button must say motion is off. Without the preference, it lists the animations that do run (for information).
import {chromium} from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:4322';
const rooms = ['home', 'papers', 'music', 'trace', 'rethink', 'work', 'idle', 'paths', 'blindspot'];
const browser = await chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
let failures = 0;
for (const [lang, path] of [['zh', '/'], ['en', '/en/']]) {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    const context = await browser.newContext({viewport: {width: 1280, height: 800}, reducedMotion}), page = await context.newPage();
    await page.goto(base + path);
    await page.waitForFunction(() => !document.querySelector('[data-asleep]'), null, {timeout: 60_000});
    const state = await page.evaluate(() => ({motion: document.body.dataset.motion, pressed: document.querySelector('#motion').getAttribute('aria-pressed')}));
    const calm = reducedMotion === 'reduce';
    if (calm && (state.motion !== 'off' || state.pressed !== 'true')) { console.log(`✗ ${lang}: reduced motion not honoured at load (${JSON.stringify(state)})`); failures++; }
    for (const place of rooms) {
      await page.evaluate(h => { location.hash = h; }, place);
      await page.waitForTimeout(calm ? 500 : 2500);
      const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target?.closest?.('[data-scene]') !== null).map(a => `${a.animationName || a.transitionProperty || 'anim'} on ${a.effect.target.tagName.toLowerCase()}${a.effect.target.className && typeof a.effect.target.className === 'string' ? '.' + a.effect.target.className.trim().split(/\s+/)[0] : ''}`));
      const unique = [...new Set(running)];
      if (calm) { console.log(`${unique.length ? '✗' : '✓'} ${lang} ${place}: ${unique.length ? unique.join('; ') : 'still'}`); failures += unique.length ? 1 : 0; }
      else if (lang === 'zh') console.log(`  (motion on) ${place}: ${unique.length ? unique.join('; ') : 'nothing animated by CSS'}`);
    }
    await context.close();
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
