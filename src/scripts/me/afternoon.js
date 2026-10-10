// 不赶时间 ("No hurry"): the afternoon passes only while you are still. Stop touching anything
// in this corner and the window light slides across the floor, the leaf shadows stretch, dust
// drifts in the beam, the light warms towards evening and a small lamp clicks on. Move, and time
// simply waits. Nothing resets and nothing scolds you. The hour then stays for the rest of the
// visit in every room of the house (`--hour`, `--gold`, `--dusk` on #room).
import {t} from './language.js';

const room = document.querySelector('#room');
const idle = document.querySelector('.idle');
const sun = idle.querySelector('.idle-sun');
const canvas = idle.querySelector('.idle-dust');
const dusk = idle.querySelector('.idle-dusk');
const lamp = idle.querySelector('.idle-lamp');
const hands = {hour: idle.querySelector('.clock-hour'), minute: idle.querySelector('.clock-minute')};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = (a, b, n) => { const x = clamp((n - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const calm = () => document.body.dataset.motion === 'off' || reduced.matches;

const DAY = 34000;   // ms of stillness from mid-afternoon to dusk
const WAIT = 1400;   // how long you must be still before the clock starts
const LAMP = .86;    // the hour at which the lamp clicks on
const START = 15 * 60, SPAN = 210; // the clock reads 15:00 → 18:30

let hour = 0;
try { hour = clamp(Number(sessionStorage.getItem('me-hour')) || 0, 0, 1); } catch {}
let lastStir = performance.now(), pace = 0, frame = 0, last = 0, saved = hour, painted = -1;
let lampLit = false, line = false;

function save() {
  if (Math.abs(saved - hour) < .004 && hour < 1) return;
  saved = hour;
  try { sessionStorage.setItem('me-hour', hour.toFixed(4)); } catch {}
}

function paint(quiet = false) {
  if (hour === painted) return;
  painted = hour;
  const gold = smooth(.06, .64, hour), evening = smooth(.5, 1, hour);
  room.style.setProperty('--hour', hour.toFixed(4));
  room.style.setProperty('--gold', gold.toFixed(4));
  room.style.setProperty('--dusk', evening.toFixed(4));
  window.qiuHour = {hour, gold, dusk: evening};
  document.dispatchEvent(new CustomEvent('timeofday', {detail: window.qiuHour}));
  const minutes = START + hour * SPAN;
  hands.minute.style.transform = `rotate(${(minutes % 60) * 6}deg)`;
  hands.hour.style.transform = `rotate(${((minutes / 60) % 12) * 30}deg)`;
  if (hour >= LAMP && !lampLit) {
    lampLit = true;
    lamp.classList.add('lit');
    room.style.setProperty('--lamp', '1');
    lamp.classList.toggle('steady', quiet);
    if (!quiet) document.dispatchEvent(new CustomEvent('roomsound', {detail: 'lamp'}));
  }
  if (hour >= 1 && !line) {
    line = true;
    dusk.querySelector('span').textContent = t('灯亮了。', 'The lamp is on.');
    dusk.querySelector('p').innerHTML = t('一个下午过去了。<br><em>你什么也没错过。</em>', 'A whole afternoon went by.<br><em>You didn’t miss a thing.</em>');
    idle.classList.add('dusk');
    document.dispatchEvent(new CustomEvent('found', {detail: 'idle-still'}));
  }
}

// Dust only shows where the beam crosses it: from the window, high on the right, to the patch.
const motes = Array.from({length: 84}, () => ({u: Math.random(), v: (Math.random() - .5) * 2, r: .5 + Math.random() * 1.4, phase: Math.random() * 6.28, drift: .4 + Math.random()}));
let ctx = null, size = {w: 0, h: 0, dpr: 1}, seen = 0;
function fit() {
  const w = idle.clientWidth, h = idle.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  if (w === size.w && h === size.h && dpr === size.dpr) return;
  size = {w, h, dpr};
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  ctx = canvas.getContext('2d');
}
function beam() {
  const box = idle.getBoundingClientRect(), patch = sun.getBoundingClientRect(), scale = box.width / idle.clientWidth || 1;
  const to = {x: (patch.left + patch.width / 2 - box.left) / scale, y: (patch.top + patch.height / 2 - box.top) / scale};
  return {from: {x: size.w * 1.04, y: -size.h * .18}, to, width: patch.width / scale * .42};
}
function dust(ms, now) {
  fit();
  if (!ctx) return;
  const target = calm() ? 0 : now - lastStir > WAIT ? 1 : .16;
  seen += (target - seen) * (1 - Math.pow(target > seen ? .985 : .9, ms / 16.667));
  ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
  ctx.clearRect(0, 0, size.w, size.h);
  if (seen < .01) return;
  const {from, to, width} = beam(), dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy);
  const nx = -dy / length, ny = dx / length, warm = window.qiuHour?.gold || 0, fading = 1 - (window.qiuHour?.dusk || 0) * .85;
  for (const m of motes) {
    // Slow Brownian wandering, a faint updraft, and the odd catch of light as a speck turns.
    m.phase += ms * .0007 * m.drift;
    m.u -= ms * .0000075 * m.drift;
    m.v += Math.sin(m.phase * 1.7) * ms * .00006;
    if (m.u < .12 || Math.abs(m.v) > 1.6) { m.u = .94 + Math.random() * .06; m.v = (Math.random() - .5) * 2; }
    const x = from.x + dx * m.u + nx * m.v * width, y = from.y + dy * m.u + ny * m.v * width;
    const glint = .55 + .45 * Math.sin(m.phase * 3.1);
    const a = seen * fading * Math.exp(-m.v * m.v * 1.6) * smooth(.12, .4, m.u) * glint;
    if (a < .02) continue;
    ctx.fillStyle = `rgba(70,48,24,${(a * .1).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(x - 1.2, y + 1.6, m.r * 1.1, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgba(255,${Math.round(250 - warm * 34)},${Math.round(232 - warm * 80)},${a.toFixed(3)})`;
    ctx.beginPath(); ctx.arc(x, y, m.r, 0, 6.283); ctx.fill();
  }
}

function step(now) {
  frame = 0;
  // A slow device still keeps time; only a long gap (a stalled tab) counts as a pause.
  const gap = now - (last || now - 16.7), ms = Math.min(50, gap), real = gap > 400 ? 16.7 : gap; last = now;
  const here = room.dataset.place === 'idle' && !document.hidden;
  const running = here && !calm() && hour < 1 && now - lastStir > WAIT;
  // Time eases into motion over a second or so, and stops the moment you do.
  pace += ((running ? 1 : 0) - pace) * (1 - Math.pow(running ? .965 : .6, real / 16.667));
  if (pace < .001 && !running) pace = 0;
  hour = Math.min(1, hour + pace * real / DAY);
  paint();
  if (here) dust(ms, now);
  if (!running) save();
  if (here && !calm()) frame = requestAnimationFrame(step);
  else { save(); last = 0; }
}
function wake() { if (!frame && room.dataset.place === 'idle' && !document.hidden) frame = requestAnimationFrame(step); }

// Any movement at all holds the afternoon where it is.
let px = -1, py = -1;
function stir() { lastStir = performance.now(); }
addEventListener('pointermove', event => {
  if (Math.hypot(event.clientX - px, event.clientY - py) < 3) return;
  px = event.clientX; py = event.clientY; stir();
}, {passive: true});
for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove', 'scroll']) addEventListener(type, stir, {passive: true, capture: true});

// With motion off nobody waits for the payoff: arriving here is already dusk.
function arrive() {
  if (room.dataset.place !== 'idle') return;
  if (calm() && hour < 1) { hour = 1; paint(); save(); }
  stir(); wake();
}
document.addEventListener('roomchange', arrive);
document.addEventListener('visibilitychange', wake);
new MutationObserver(arrive).observe(document.body, {attributes: true, attributeFilter: ['data-motion']});
paint(true);
arrive();
