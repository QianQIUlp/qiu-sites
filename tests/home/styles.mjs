// Computed-style parity for the homepage: records every element's computed style (and its
// ::before/::after) in every room, zh/en, desktop/phone, so a CSS reorganisation can prove that
// nothing changed. Reduced motion and all lessons found, as in parity.mjs.
//   node tests/home/styles.mjs capture <file.json>
//   node tests/home/styles.mjs compare <before.json> <after.json>
import {chromium} from '@playwright/test';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const base = process.env.BASE_URL || 'http://localhost:4321';
const rooms = ['home', 'papers', 'music', 'trace', 'rethink', 'work', 'idle', 'paths', 'blindspot', 'overview'];
const lessons = ['wander', 'papers-light', 'music-strings', 'trace-line', 'trace-pluck', 'trace-loop', 'trace-cross', 'rethink-walk', 'rethink-cut', 'work-cut', 'idle-still', 'idle-letgo', 'paths-bend', 'paths-pick', 'blind-angle', 'blind-brush', 'blind-eye'];
const configs = [
  ['zh-desktop', '/', {viewport: {width: 1280, height: 800}}],
  ['zh-phone', '/', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}],
  ['en-desktop', '/en/', {viewport: {width: 1280, height: 800}}],
  ['en-phone', '/en/', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}],
];
// Values JS writes every frame or that only reflect the moment, not the stylesheet.
const skip = /^(transform|translate|rotate|scale|left|top|width|height|inset.*|right|bottom|perspective-origin|transform-origin|--.*)$/;

function snapshot(skipSource) {
  const skip = new RegExp(skipSource), out = {};
  const keyOf = el => {
    const parts = [];
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      const index = node.parentElement ? [...node.parentElement.children].indexOf(node) : 0;
      parts.unshift(`${node.tagName.toLowerCase()}${node.id ? '#' + node.id : ''}:${index}`);
    }
    return parts.join('>');
  };
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    for (const pseudo of [null, '::before', '::after']) {
      const style = getComputedStyle(el, pseudo);
      if (pseudo && (style.content === 'none' || style.content === 'normal')) continue;
      const props = {};
      for (const name of style) if (!skip.test(name)) props[name] = style.getPropertyValue(name);
      out[keyOf(el) + (pseudo || '')] = props;
    }
  }
  return out;
}

async function capture(file) {
  const browser = await chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const result = {};
  for (const [name, path, options] of configs) {
    if (process.env.STATES && !process.env.STATES.split(',').some(s => s.startsWith(name))) continue;
    const context = await browser.newContext({...options, deviceScaleFactor: 1, reducedMotion: 'reduce'});
    await context.addInitScript(keys => { try { localStorage.setItem('me-found', JSON.stringify(keys)); } catch {} }, lessons);
    const page = await context.newPage();
    await page.goto(base + path);
    await page.waitForFunction(() => document.body.classList.contains('guitar-home-ready') && !document.querySelector('[data-asleep]'), null, {timeout: 60000});
    await page.waitForTimeout(800);
    for (const room of rooms) {
      const only = process.env.STATES?.split(',');
      await page.evaluate(place => { location.hash = place; }, room);
      await page.waitForTimeout(room === 'work' ? 2500 : 1000);
      if (only && !only.includes(`${name}/${room}`) && !only.includes(name)) continue;
      const shot = await page.evaluate(snapshot, skip.source);
      // Full detail for the home state; hashes elsewhere keep the file small.
      result[`${name}/${room}`] = room === 'home' || process.env.STATES ? shot : Object.fromEntries(Object.entries(shot).map(([k, v]) => [k, createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 12)]));
    }
    await context.close();
  }
  await browser.close();
  writeFileSync(file, JSON.stringify(result));
}

function compare(a, b) {
  const before = JSON.parse(readFileSync(a)), after = JSON.parse(readFileSync(b));
  let total = 0;
  for (const state of Object.keys(before)) {
    const x = before[state], y = after[state] || {}, lines = [];
    for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (!(key in y)) { lines.push(`  - ${key}`); continue; }
      if (!(key in x)) { lines.push(`  + ${key}`); continue; }
      if (typeof x[key] === 'string') { if (x[key] !== y[key]) lines.push(`  ~ ${key}`); continue; }
      const changed = Object.keys({...x[key], ...y[key]}).filter(p => x[key][p] !== y[key][p]);
      if (changed.length) lines.push(`  ~ ${key}\n${changed.map(p => `      ${p}: ${x[key][p]} → ${y[key][p]}`).join('\n')}`);
    }
    if (lines.length) { console.log(`${state}: ${lines.length} differences`); console.log(lines.slice(0, 40).join('\n')); }
    total += lines.length;
  }
  console.log(total ? `${total} differences` : 'identical');
  process.exitCode = total ? 1 : 0;
}

const [mode, a, b] = process.argv.slice(2);
if (mode === 'capture') await capture(a);
else if (mode === 'compare') compare(a, b);
else console.log('usage: styles.mjs capture <file> | compare <before> <after>');
