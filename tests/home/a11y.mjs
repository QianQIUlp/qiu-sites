// Accessibility audit of the homepage, against a production build (`astro preview`, :4322 by default).
//   node tests/home/a11y.mjs [room ...]
// Per language, size and room it reports: interactive elements without an accessible name, names in the
// wrong language, interactive elements that are not reachable by Tab, focus that has no visible
// indicator, and text whose colour against its (opaque ancestor) background is under 4.5:1 (3:1 for
// large text). Background images and gradients are not sampled, so treat contrast hits as leads.
import {chromium} from '@playwright/test';

const base = process.env.BASE_URL || 'http://localhost:4322';
const only = process.argv.slice(2);
const rooms = ['home', 'papers', 'music', 'trace', 'rethink', 'work', 'idle', 'paths', 'blindspot'].filter(r => !only.length || only.includes(r));
const browser = await chromium.launch({channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
let problems = 0;

const audit = ({place, lang}) => {
  const scene = document.querySelector(`[data-scene="${place}"]`);
  const out = [];
  const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden],[inert]'); };
  const nameOf = el => {
    const by = el.getAttribute('aria-labelledby');
    if (by) return by.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim();
    return (el.getAttribute('aria-label') || (el.labels && [...el.labels].map(l => l.textContent).join(' ')) || el.getAttribute('alt') || el.textContent || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ');
  };
  const cjk = /[㐀-鿿]/;
  const label = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  const interactive = [...scene.querySelectorAll('button, a[href], input, select, textarea, [tabindex], [role=button], [role=slider]')].filter(visible);
  for (const el of interactive) {
    const name = nameOf(el);
    if (!name) out.push(`no accessible name: ${label(el)}`);
    else if (lang === 'en' && cjk.test(name) && !/[㐀-鿿]{2}.*\(/.test(name) && !/(千秋|表面之下|做法)/.test(name)) out.push(`Chinese name on the English page: ${label(el)} "${name.slice(0, 40)}"`);
    else if (lang === 'zh' && !cjk.test(name) && !/^[\d.\s°%×·↳-]*$/.test(name) && !/(VU|Centaur|BOSS|BD-2|PS-6|ECHO|Rāna|Rana|Hz|dB|VeriSilo|MealCircuit|Crewlight|Hadoop|^(Em|G|C|D)$)/i.test(name)) out.push(`no Chinese in the name on the Chinese page: ${label(el)} "${name.slice(0, 40)}"`);
    if (el.tabIndex < 0 && !el.disabled && !el.closest('[aria-hidden=true]') && el.matches('button, a[href], input, select')) out.push(`not in the tab order (tabindex ${el.tabIndex}): ${label(el)}`);
  }
  // Pointer-only things: elements with a click/pointer cursor that are neither interactive nor inside something interactive.
  for (const el of scene.querySelectorAll('*')) {
    if (!visible(el) || getComputedStyle(el).cursor !== 'pointer') continue;
    if (el.closest('button, a[href], label, input, select, summary, [tabindex], [role=button], [aria-hidden=true]')) continue;
    if (!el.children.length || el.matches('div, span, li, svg, canvas')) out.push(`pointer cursor but not focusable: ${label(el)}`);
  }
  // Text to check for contrast: colour, opacity and box. The background is sampled from a screenshot
  // taken with all text hidden (see below), so photos, gradients and canvases count.
  const parse = c => { const m = c.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const seen = new Set(), texts = [];
  const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    const text = node.textContent.trim(); if (!text) continue;
    const el = node.parentElement; if (!el || !visible(el) || seen.has(el) || el.closest('[aria-hidden=true],canvas,svg')) continue;
    seen.add(el);
    const cs = getComputedStyle(el), fg = parse(cs.color); if (!fg) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const range = document.createRange(); range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.width < 2 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
    if (el.closest('.dial-label') || el.matches('.dial-label') || el.closest('.string')) continue; // pedal faceplate print and shadowed string letters over the photo
    texts.push({what: `${label(el)} "${text.slice(0, 30)}"`, fg: [fg[0], fg[1], fg[2], fg[3] * op], rect: [r.left, r.top, r.width, r.height], size: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 700});
  }
  window.__texts = texts;
  return out;
};

for (const [lang, path] of [['zh', '/'], ['en', '/en/']]) {
  for (const [size, options] of [['desktop', {viewport: {width: 1280, height: 800}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}]]) {
    const context = await browser.newContext({...options, reducedMotion: 'reduce'}), page = await context.newPage();
    await page.goto(base + path);
    await page.waitForFunction(() => !document.querySelector('[data-asleep]'), null, {timeout: 60_000});
    for (const place of rooms) {
      await page.evaluate(h => { location.hash = h; }, place);
      await page.waitForTimeout(700);
      const found = await page.evaluate(audit, {place, lang}).catch(e => [`audit failed: ${e.message}`]);
      // Contrast: hide all text, photograph the room, and compare each text's colour with the pixels behind it.
      const texts = await page.evaluate(() => window.__texts || []);
      await page.addStyleTag({content: '*{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}'}).then(async tag => {
        const shot = (await page.screenshot()).toString('base64');
        await tag.evaluate(n => n.remove());
        const lines = await page.evaluate(async ({shot, texts}) => {
          const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
          const scale = img.width / innerWidth, canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d', {willReadFrequently: true}); ctx.drawImage(img, 0, 0);
          const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
          const out = [];
          for (const t of texts) {
            const [x, y, w, h] = t.rect.map(v => v * scale);
            const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y)), w0 = Math.min(canvas.width - x0, Math.round(w)), h0 = Math.min(canvas.height - y0, Math.round(h));
            if (w0 < 1 || h0 < 1) continue;
            const d = ctx.getImageData(x0, y0, w0, h0).data, px = [];
            for (let i = 0; i < d.length; i += 4 * Math.max(1, Math.floor(d.length / 4 / 400))) px.push([d[i], d[i + 1], d[i + 2]]);
            const fl = (() => { const bg = px[Math.floor(px.length / 2)]; const a = t.fg[3]; return lum([t.fg[0] * a + bg[0] * (1 - a), t.fg[1] * a + bg[1] * (1 - a), t.fg[2] * a + bg[2] * (1 - a)]); })();
            let worst = 99, worstBg = null;
            if (t.fg[3] < .05) continue;
            // Median-luminance background: photos have bright and dark spots, the middle is what a reader meets.
            const sorted = [...px].sort((p, q) => lum(p) - lum(q));
            for (const bg of [sorted[Math.floor(sorted.length * .25)], sorted[Math.floor(sorted.length / 2)], sorted[Math.floor(sorted.length * .75)]]) { const a = t.fg[3]; const l1 = lum([t.fg[0] * a + bg[0] * (1 - a), t.fg[1] * a + bg[1] * (1 - a), t.fg[2] * a + bg[2] * (1 - a)]), l2 = lum(bg); const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); if (ratio < worst) { worst = ratio; worstBg = bg; } }
            const need = t.size >= 24 || (t.size >= 18.66 && t.bold) ? 3 : 4.5;
            if (worst < need - 0.005) out.push(`contrast ${worst.toFixed(2)}:1 (< ${need}): ${t.what} rgb(${t.fg.slice(0, 3).map(Math.round)})${t.fg[3] < 1 ? '@' + t.fg[3].toFixed(2) : ''} on rgb(${worstBg}) ${t.size}px`);
          }
          return out;
        }, {shot, texts});
        found.push(...lines);
      });
      // Keyboard: Tab through the room, record what takes focus and whether it shows an indicator.
      await page.evaluate(() => { document.activeElement?.blur(); window.__seen = new WeakSet(); });
      const focus = [];
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(place => {
          const el = document.activeElement; if (!el || el === document.body) return null;
          window.__seen ||= new WeakSet(); if (window.__seen.has(el)) return {again: true}; window.__seen.add(el);
          const scene = el.closest('[data-scene]'); const cs = getComputedStyle(el);
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
          const inner = el.closest('.dial, .pedal, .footswitch');
          let ringAny = ring;
          if (!ring && inner) { const k = inner.querySelector('.knob, .stomp-cap'); if (k) { const ks = getComputedStyle(k); ringAny = ks.outlineStyle !== 'none' || ks.boxShadow !== 'none'; } }
          const r = el.getBoundingClientRect();
          return {scene: scene?.dataset.scene || '(chrome)', tag: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`, ring: ringAny, tiny: r.width < 24 || r.height < 24};
        }, place);
        if (!info || info.again) break;
        focus.push(info);
      }
      const mine = focus.filter(f => f.scene === place);
      for (const f of mine) { if (!f.ring) found.push(`focus shows no indicator: ${f.tag}`); }
      const unreachable = await page.evaluate(({place, reached}) => [...document.querySelectorAll(`[data-scene="${place}"] button, [data-scene="${place}"] a[href], [data-scene="${place}"] input`)].filter(el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && !el.closest('[hidden],[inert]') && !reached.includes(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`); }).length, {place, reached: focus.map(f => f.tag)});
      console.log(`${lang} ${size} ${place}: tab reached ${mine.length} control(s)${unreachable ? `, ${unreachable} not reached within 60 tabs` : ''}`);
      for (const line of found) { console.log(`   ✗ ${line}`); problems++; }
    }
    await context.close();
  }
}
await browser.close();
console.log(problems ? `\n${problems} lead(s)` : '\nclean');
