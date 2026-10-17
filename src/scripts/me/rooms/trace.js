// 留一笔 ("Leave a line"): a pencil line becomes a string. Its length tunes it (a monochord's rule,
// written on the ruler along the bottom edge); where it is touched shapes the shiver; a line that
// closes on itself rings like a bowl and sends out ripples; lines that cross answer each other.
// The lines are drawn on the shared world canvas, so they stay crisp at any zoom.
// The house reaches in two ways: the strings room's pedals colour what you hear and show it (the ringing
// envelope takes the first engaged pedal's colour, an echo shivers the line again in time with its
// repeats, a harmony names its second note), and the paths room can hand over the route you walked,
// which is written here as a line of its own (`receive`).
import {clamp} from '../room-kit.js';
import {harmonyFor} from '../audio-engine.js';

let ctx, sound;
let lines = [], drawing = null, lineContact = null, lastLinePluck = 0, drawArea, writing = null, pending = null, through;
const scale = [98, 110, 123.47, 146.83, 164.81, 196, 220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33, 659.25, 783.99];
const noteNames = ['G2', 'A2', 'B2', 'D3', 'E3', 'G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G5'];
const SPAN = 117.5, graphite = 'rgba(46,48,44,.84)';
const tuneTo = length => { const raw = SPAN / Math.max(length, .04); let best = 0; scale.forEach((f, i) => { if (Math.abs(Math.log(f / raw)) < Math.abs(Math.log(scale[best] / raw))) best = i; }); return best; };
let crossings = [], ruler = {note: -1, amp: 0};
const found = key => ctx.found(key);
const pitchNames = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const pitchName = hz => { const midi = Math.round(69 + 12 * Math.log2(hz / 440)); return `${pitchNames[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`; };
// A line's note, and (with the Harmonist on) the second voice that rings with it.
const noteLabel = strand => noteNames[strand.note] + (sound.params.harm ? ` + ${pitchName(harmonyFor(scale[strand.note], sound.params.harmKey, sound.params.harmShift))}` : '');
function showThrough() {
  const {names, rgb} = sound.board;
  through.hidden = !names.length;
  through.textContent = names.length ? ctx.t(`经过 ${names.join(' · ')}`, `Through ${names.join(' · ')}`) : '';
  if (rgb) through.style.setProperty('--through', `rgb(${rgb})`); else through.style.removeProperty('--through');
}

function line(g, points, color, lineWidth = .8) {
  if (!points.length) return;
  g.beginPath(); g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
  g.strokeStyle = color; g.lineWidth = lineWidth; g.stroke();
}
function drawBounds() { const {width} = ctx; return width <= 600 ? {x: .07, y: .32, w: .86, h: .47} : width <= 700 ? {x: .33, y: .15, w: .62, h: .68} : {x: .05, y: .07, w: .74, h: .76}; }
function traceFrame() { const b = drawBounds(), {width, height} = ctx; return {b, x0: (.06 + b.x) * width, y0: (-1.11 + b.y) * height, bw: b.w * width, bh: b.h * height}; }
function shapeAt(strand, u) {
  if (strand.loop) return Math.sin(u * Math.PI * 4);
  // A fresh pluck is a bent string, peaked where the finger was; it relaxes into the round mode.
  const a = clamp(strand.at, .08, .92), bent = u < a ? u / a : (1 - u) / (1 - a), fresh = clamp(strand.amp * 1.5 - .45, 0, 1);
  return bent * fresh + Math.sin(u * Math.PI) * (1 - fresh);
}
function drawRuler(g, f) {
  const {width} = ctx, y = f.y0 + f.bh + (width <= 600 ? 18 : 12), sparse = width <= 600;
  g.save(); g.strokeStyle = 'rgba(46,48,44,.26)'; g.fillStyle = 'rgba(46,48,44,.42)'; g.lineWidth = .6; g.font = `${sparse ? 7 : 8}px ${getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'}`; g.textAlign = 'center';
  g.beginPath(); g.moveTo(f.x0, y); g.lineTo(f.x0 + f.bw, y); g.moveTo(f.x0, y - 4); g.lineTo(f.x0, y + 4); g.stroke();
  scale.forEach((hz, i) => {
    const length = SPAN / hz; if (length > 1) return;
    const x = f.x0 + length * f.bw, gNote = noteNames[i][0] === 'G', lit = ruler.note === i ? ruler.amp : 0, named = !sparse || gNote || noteNames[i][0] === 'D';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + (gNote ? 7 : 4)); g.strokeStyle = lit > .02 ? `rgba(232,61,39,${.3 + lit * .7})` : 'rgba(46,48,44,.3)'; g.stroke();
    if (named) { g.fillStyle = lit > .02 ? `rgba(232,61,39,${.45 + lit * .55})` : 'rgba(46,48,44,.4)'; g.fillText(noteNames[i], x, y - (i % 2 ? 12 : 5)); }
    if (lit > .02) { g.beginPath(); g.moveTo(x, y + 9); g.lineTo(x - 3, y + 14); g.lineTo(x + 3, y + 14); g.closePath(); g.fillStyle = `rgba(232,61,39,${lit})`; g.fill(); }
  });
  g.restore();
}
function drawTrace(g, now) {
  const f = traceFrame(), motion = ctx.motion, {height} = ctx, tint = sound.board.rgb;
  g.strokeStyle = '#878e7130'; g.lineWidth = .6;
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => { const x = f.x0 + u * f.bw, y = f.y0 + v * f.bh; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.stroke(); });
  drawRuler(g, f);
  [...lines, ...(drawing ? [drawing] : [])].forEach((strand, k) => {
    const n = strand.points.length; if (n < 2) return;
    const speed = .018 + .05 * (strand.note ?? 6) / 15, swing = motion ? Math.sin(now * speed + k * 1.7) : 0, reach = strand.amp * height * (strand.loop ? .012 : .024);
    const at = (i, s) => {
      const p = strand.points[i], prev = strand.points[Math.max(0, i - 1)], next = strand.points[Math.min(n - 1, i + 1)];
      const dx = (next.x - prev.x) * f.bw, dy = (next.y - prev.y) * f.bh, len = Math.hypot(dx, dy) || 1, d = motion ? shapeAt(strand, i / (n - 1)) * reach * s : 0;
      return {x: f.x0 + p.x * f.bw - dy / len * d, y: f.y0 + p.y * f.bh + dx / len * d, w: p.w || 1.2};
    };
    // A ringing string blurs into the lens-shaped envelope; the pencil line itself swings inside it.
    if (strand.amp > .04 && motion) {
      if (tint) { g.save(); g.shadowColor = `rgba(${tint},.6)`; g.shadowBlur = 7 * strand.amp; }
      [1, -1].forEach(s => line(g, strand.points.map((_, i) => at(i, s)), tint ? `rgba(${tint},${strand.amp * .5})` : `rgba(232,61,39,${strand.amp * .22})`, tint ? .9 : .7));
      if (tint) g.restore();
    }
    const points = strand.points.map((_, i) => at(i, swing)), ink = strand.amp > .06 ? `rgba(${Math.round(46 + 186 * strand.amp)},${Math.round(48 + 13 * strand.amp)},${Math.round(44 - 5 * strand.amp)},.88)` : graphite;
    g.lineCap = 'round';
    for (let i = 1; i < points.length; i++) { g.beginPath(); g.moveTo(points[i - 1].x, points[i - 1].y); g.lineTo(points[i].x, points[i].y); g.strokeStyle = ink; g.lineWidth = (points[i - 1].w + points[i].w) * .5; g.stroke(); }
    // Graphite grain: a lighter second pass, a hair off the first.
    line(g, points.map(p => ({x: p.x + .45, y: p.y - .35})), 'rgba(46,48,44,.16)', .5);
    g.lineCap = 'butt';
    if (strand.loop) {
      const c = points.reduce((s, p) => ({x: s.x + p.x / n, y: s.y + p.y / n}), {x: 0, y: 0}), r = points.reduce((s, p) => s + Math.hypot(p.x - c.x, p.y - c.y), 0) / n;
      if (strand.amp > .03 && motion) for (let j = 0; j < 3; j++) { const grow = (1 - strand.amp) * .75 + j * .16; g.beginPath(); g.arc(c.x, c.y, r * (1.06 + grow), 0, Math.PI * 2); g.strokeStyle = `rgba(46,48,44,${strand.amp * (.34 - j * .1)})`; g.lineWidth = .7; g.stroke(); }
      if (strand.amp > .05 && strand.note != null) { g.font = `9px ${getComputedStyle(document.body).getPropertyValue('--mono')}`; g.textAlign = 'center'; g.fillStyle = `rgba(232,61,39,${strand.amp})`; g.fillText(noteLabel(strand), c.x, c.y + 3); g.textAlign = 'start'; }
    } else if (strand !== drawing || n > 3) {
      [points[0], points[points.length - 1]].forEach(p => { g.beginPath(); g.arc(p.x, p.y, 2.4, 0, Math.PI * 2); g.fillStyle = '#eeede7'; g.fill(); g.strokeStyle = '#e83d27'; g.lineWidth = .8; g.stroke(); });
      if (strand.amp > .05 && strand.note != null) { const e = points[points.length - 1]; g.font = `9px ${getComputedStyle(document.body).getPropertyValue('--mono')}`; g.fillStyle = `rgba(232,61,39,${strand.amp})`; g.fillText(noteLabel(strand), e.x + 7, e.y - 6); }
      if (strand.from && strand !== drawing) { const s = points[0]; g.font = `8px ${getComputedStyle(document.body).getPropertyValue('--mono')}`; g.fillStyle = 'rgba(46,48,44,.5)'; g.fillText(`↳ ${ctx.places[strand.from].name}`, s.x - 2, s.y + 17); }
    }
  });
  crossings.forEach(c => { const x = f.x0 + c.x * f.bw, y = f.y0 + c.y * f.bh, lit = Math.max(c.a.amp, c.b.amp); g.beginPath(); g.arc(x, y, 1.7, 0, Math.PI * 2); g.fillStyle = lit > .05 ? `rgba(232,61,39,${.4 + lit * .6})` : graphite; g.fill(); if (lit > .05) { g.beginPath(); g.arc(x, y, 4 + lit * 5, 0, Math.PI * 2); g.strokeStyle = `rgba(232,61,39,${lit * .35})`; g.lineWidth = .6; g.stroke(); } });
}
// From far away (the overview) an empty sheet shows one red pencil wave, an invitation.
function drawInvitation(g) {
  const {camera, width, height} = ctx;
  if (camera.z >= .65 || lines.length) return;
  g.globalAlpha = clamp((.65 - camera.z) / .18, 0, 1);
  const marks = []; for (let i = 0; i < 85; i++) { const t = i / 84; marks.push({x: (.43 + .51 * t) * width, y: (-.52 + Math.sin(t * Math.PI * 2.5) * .12) * height}); }
  line(g, marks, '#e83d27', 1 / camera.z);
  g.globalAlpha = 1;
}

function localPoint(event) { const b = drawArea.getBoundingClientRect(); return {x: clamp((event.clientX - b.left) / b.width, 0, 1), y: clamp((event.clientY - b.top) / b.height, 0, 1)}; }
// Lengths and distances in drawing-area widths, so a line keeps its note at any window size.
const pxOf = (a, c) => { const {bw, bh} = traceFrame(); return Math.hypot((a.x - c.x) * bw, (a.y - c.y) * bh) / bw; };
function nearest(p, reach) { let hit = null, distance = reach; lines.forEach(strand => strand.points.forEach((point, i) => { const d = pxOf(point, p); if (d < distance) { distance = d; hit = {strand, u: i / (strand.points.length - 1)}; } })); return hit; }
function sing(strand, strength) {
  if (!sound.live) return;
  const hz = scale[strand.note], now = sound.context.currentTime;
  sound.rig.play(hz, strength * .85);
  // A closed line is a bowl: the same note with its upper partials, slightly late, slightly apart.
  if (strand.loop) { sound.rig.play(hz * 2.01, strength * .3, now + .014); sound.rig.play(hz * 2.99, strength * .16, now + .03); }
  sound.tail(sound.params.echo ? 12 : strand.loop ? 5 : 3.3);
}
function strike(strand, u, strength, answer = false, silent = false) {
  strand.amp = Math.max(strand.amp, strength); strand.at = u; ruler = {note: strand.note, amp: Math.max(ruler.note === strand.note ? ruler.amp : 0, strength)};
  ctx.schedule();
  if (!silent) {
    sing(strand, strength);
    // After Hours on: the line shivers again with each repeat you can hear, as loud as the echo is.
    if (sound.live && sound.params.echo) for (let n = 1, level = strength * sound.params.echoFeedback / 100; n <= 4 && level > .1; n++, level *= sound.params.echoFeedback / 100) setTimeout(() => { if (lines.includes(strand) && ctx.motion) strike(strand, u, level * .9, true, true); }, n * sound.params.echoTime);
  }
  if (answer) return;
  // Where two lines cross, the other one answers, quietly, from the crossing point.
  const partners = crossings.filter(c => c.a === strand || c.b === strand);
  partners.forEach((c, i) => setTimeout(() => { const other = c.a === strand ? c.b : c.a; if (lines.includes(other)) strike(other, c.a === strand ? c.ub : c.ua, .34, true); }, 70 + i * 40));
  if (partners.length) found('trace-cross');
}
function crossingsOf(strand) {
  const out = [], {bw, bh} = traceFrame(), P = strand.points.map(p => ({x: p.x * bw, y: p.y * bh}));
  lines.forEach(other => {
    if (other === strand) return; let count = 0; const Q = other.points.map(p => ({x: p.x * bw, y: p.y * bh}));
    for (let i = 1; i < P.length && count < 3; i++) for (let j = 1; j < Q.length && count < 3; j++) {
      const a = P[i - 1], b = P[i], c = Q[j - 1], d = Q[j], den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x); if (!den) continue;
      const s = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den, t = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den;
      if (s < 0 || s > 1 || t < 0 || t > 1) continue;
      out.push({a: strand, b: other, ua: (i - 1 + s) / (P.length - 1), ub: (j - 1 + t) / (Q.length - 1), x: (a.x + (b.x - a.x) * s) / bw, y: (a.y + (b.y - a.y) * s) / bh}); count++;
    }
  });
  return out;
}
function commitLine(from = null) {
  const strand = drawing; drawing = null;
  if (strand && strand.points.length > 3) {
    const pts = strand.points; let length = 0; for (let i = 1; i < pts.length; i++) length += pxOf(pts[i - 1], pts[i]);
    // Ends that meet close the line into a ring.
    strand.loop = pts.length >= 14 && length > .22 && pxOf(pts[0], pts[pts.length - 1]) < Math.max(.035, length * .09);
    if (strand.loop) pts.push({...pts[0]});
    strand.note = tuneTo(strand.loop ? length / 2 : length); strand.amp = 0; strand.at = .5; if (from) strand.from = from;
    lines.push(strand);
    if (lines.length > 18) { const gone = lines.shift(); crossings = crossings.filter(c => c.a !== gone && c.b !== gone); }
    crossings.push(...crossingsOf(strand));
    strike(strand, .5, .62, true);
    drawArea.classList.add('has-lines'); drawArea.dataset.lines = lines.length;
    if (!from) found('trace-line');
    if (strand.loop) found('trace-loop');
    // A new line can make the room's next lesson possible (a loop to close, two lines to cross).
    document.dispatchEvent(new Event('hint:recheck'));
  }
  ctx.schedule();
}

function mountDrawing() {
  let lastMove = 0;
  drawArea.addEventListener('pointerdown', event => {
    if (event.button !== 0) return; event.stopPropagation(); drawArea.setPointerCapture(event.pointerId);
    writing = null; pending = null;
    if (!sound.context) sound.set(true);
    lastMove = performance.now(); drawing = {points: [{...localPoint(event), w: 1.4}], amp: 0, pointer: event.pointerId};
  });
  drawArea.addEventListener('pointermove', event => {
    const p = localPoint(event);
    if (drawing && drawing.pointer === event.pointerId) {
      const last = drawing.points[drawing.points.length - 1], step = pxOf(p, last), now = performance.now();
      if (step > .004 && drawing.points.length < 300) {
        // Pencil pressure: a slow hand leaves a darker, wider line than a quick one.
        const pace = step * 1000 / Math.max(8, now - lastMove); lastMove = now;
        drawing.points.push({...p, w: last.w + (clamp(2 - pace * .9, .65, 2) - last.w) * .35});
      }
      ctx.schedule(); return;
    }
    const hit = nearest(p, .028), contact = hit?.strand ?? null;
    if (hit && (contact !== lineContact || performance.now() - lastLinePluck > 350)) { strike(hit.strand, hit.u, .7); lastLinePluck = performance.now(); found('trace-pluck'); }
    lineContact = contact;
  });
  drawArea.addEventListener('pointerup', event => {
    event.stopPropagation();
    if (drawing && drawing.pointer === event.pointerId) {
      if (drawing.points.length <= 3) { const hit = nearest(localPoint(event), .055); if (hit) { strike(hit.strand, hit.u, .85); found('trace-pluck'); } }
      commitLine();
      if (drawArea.hasPointerCapture(event.pointerId)) drawArea.releasePointerCapture(event.pointerId);
    }
  });
  drawArea.addEventListener('pointercancel', () => { drawing = null; ctx.schedule(); }); drawArea.addEventListener('pointerleave', () => lineContact = null);
  document.querySelector('#add-line').addEventListener('click', () => { const k = lines.length; drawing = {points: Array.from({length: 65}, (_, i) => { const t = i / 64; return {x: .08 + .84 * t, y: clamp(.5 + Math.sin(t * Math.PI * 2 + k * .9) * (.17 + (k % 3) * .035) + (k % 3 - 1) * .08, .05, .95), w: 1.1 + Math.sin(t * Math.PI) * .5}; }), amp: 0}; commitLine(); });
  document.querySelector('#clear-lines').addEventListener('click', () => { ctx.unlink('route'); writing = null; pending = null; drawing = null; lines = []; crossings = []; drawing = null; drawArea.classList.remove('has-lines'); drawArea.dataset.lines = 0; ctx.schedule(); });
}

// The quiet tutorial (hints.js). A pencil sketches a line by itself and the line hums; later the
// visitor's own line shivers once, waiting to be touched; later still the pencil closes a small
// ring that sends out ripples. None of it makes a sound.
function mountLessons() {
  const ghost = drawArea.querySelector('.trace-ghost path');
  document.addEventListener('hint:sketch', () => {
    if (!ctx.motion || ctx.active !== 'trace' || drawing || !ghost) return;
    const svg = ghost.ownerSVGElement; svg.getAnimations({subtree: true}).forEach(a => a.cancel());
    ghost.animate([{clipPath: 'inset(-20% 100% -20% 0)'}, {clipPath: 'inset(-20% -2% -20% 0)'}], {duration: 1500, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both'});
    svg.animate([{opacity: 0, offset: 0}, {opacity: 1, offset: .04}, {opacity: 1, offset: .78}, {opacity: 0}], {duration: 4300, fill: 'both'});
    // Once drawn, it is plucked by an invisible finger: a damped shiver across its length.
    const ring = [1, 1.5, .62, 1.3, .82, 1.12, .95, 1];
    svg.animate(ring.map((y, i) => ({scale: `1 ${y}`, offset: .4 + .6 * i / (ring.length - 1)})), {duration: 2600, easing: 'ease-in-out'});
  });
  document.addEventListener('hint:quiver', () => { if (!ctx.motion || ctx.active !== 'trace' || !lines.length) return; const last = lines[lines.length - 1]; last.at = .3; last.amp = .42; ctx.schedule(); });
  const ghostRing = drawArea.querySelector('.trace-ghost-ring');
  document.addEventListener('hint:ring', () => {
    if (!ctx.motion || ctx.active !== 'trace' || drawing || !ghostRing) return;
    ghostRing.getAnimations({subtree: true}).forEach(a => a.cancel());
    ghostRing.querySelector('path').animate([{strokeDashoffset: 1}, {strokeDashoffset: 0}], {duration: 1300, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both'});
    ghostRing.animate([{opacity: 0, offset: 0}, {opacity: 1, offset: .04}, {opacity: 1, offset: .8}, {opacity: 0}], {duration: 4200, fill: 'both'});
    ghostRing.querySelectorAll('circle').forEach((c, i) => c.animate([{r: '11px', opacity: .55}, {r: `${19 + i * 4}px`, opacity: 0}], {duration: 1500, delay: 1350 + i * 260, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both'}));
  });
}

// Another room's line, written here as if by the pencil: `shape` is its points in 0–1 of a box that is
// `aspect` times as wide as it is tall. It waits for the camera to arrive, then writes itself, then rings.
function write(job) {
  const {bw, bh} = traceFrame(), width = bw * (ctx.width <= 600 ? .86 : .66), height = Math.min(width / job.aspect, bh * .55), span = height * job.aspect;
  const points = job.shape.map(p => ({x: .5 + (p.x - .5) * span / bw, y: .46 + (p.y - .5) * height / bh, w: 1.35}));
  drawing = {points: [], amp: 0, pointer: -1};
  writing = {points, from: job.from, start: performance.now(), duration: ctx.motion ? 1500 : 0};
  ctx.schedule();
}

export default {
  place: 'trace',
  mount(house) {
    ctx = house; sound = ctx.sound;
    drawArea = document.querySelector('.draw-area');
    through = document.querySelector('.trace-through');
    mountDrawing(); mountLessons(); showThrough();
  },
  enter() {
    showThrough();
    if (pending) { const job = pending; pending = null; setTimeout(() => ctx.active === 'trace' && write(job), ctx.motion ? 420 : 0); }
  },
  // Public side, for other rooms (ctx.use('trace')): receive a line to write, now or on arrival.
  receive(job) {
    if (ctx.active === 'trace') setTimeout(() => ctx.active === 'trace' && write(job), ctx.motion ? 420 : 0);
    else pending = job;
  },
  frame(now, dt) {
    lines.forEach(l => l.amp *= Math.pow(ctx.motion ? .95 : .65, dt));
    if (writing) {
      const t = writing.duration ? clamp((now - writing.start) / writing.duration, 0, 1) : 1, eased = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const count = Math.max(2, Math.round(eased * writing.points.length));
      if (drawing) drawing.points = writing.points.slice(0, count);
      if (t === 1) { const from = writing.from; writing = null; commitLine(from); ctx.link('route', from, 'trace'); }
      return true;
    }
    return lines.some(l => l.amp > .015);
  },
  paint(g, now) { drawTrace(g, now); drawInvitation(g); },
};
