// The camera over the house: dragging, coasting, zooming, routing by #hash, the room bar, and the
// room registry. Every room is a module (rooms/<place>.js) that plugs in through one contract:
//
//   export default {
//     place: 'music',
//     mount(ctx) {},        // once, the first time the room is needed; ctx is the shared house below
//     enter() {},           // the camera has arrived here
//     leave() {},           // the camera has gone somewhere else
//     frame(now, dt) {},    // every camera frame while mounted; return true to ask for another one
//     paint(g, now) {},     // draw on the shared world canvas, already in world space (when in view)
//   };
//
// All hooks except `place` are optional. Rooms never reach into each other: anything shared goes
// through `ctx` (sound, camera state, the other rooms' public parts via ctx.use).
import {t, english} from './language.js';
import {places, rooms, wanderHint} from './places.js';
import {sound} from './sound.js';

const sans = getComputedStyle(document.documentElement).getPropertyValue('--sans');
const room = document.querySelector('#room'), world = document.querySelector('#world');
const canvas = document.querySelector('#instrument'), g = canvas.getContext('2d');
const underlay = document.createElement('div'); underlay.className = 'world underlay'; underlay.append(document.querySelector('.name')); room.prepend(underlay);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduced.matches, width = 1, height = 1, dpr = 1, lastFrame = 0, frameId = 0;
let camera = {x: 0, y: 0, z: 1}, target = {...camera}, active = 'home', fling = null;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const listeners = {motion: [], resize: []};

// The registry: how to load each room, the rooms already mounted, and the ones on their way.
const loaders = {}, mounted = new Map(), loading = new Map();
// What has travelled between rooms in this visit (a page that landed elsewhere, a route that became a
// line): the overview draws each as a pencil thread with a bead where it ended. See ctx.link.
const links = new Map();

export const ctx = {
  room, world, t, english, places, sound,
  get active() { return active; },
  get camera() { return camera; },
  get width() { return width; },
  get height() { return height; },
  get dpr() { return dpr; },
  get motion() { return motion; },
  // The afternoon (afternoon.js): {hour, gold, dusk}, shared by every room.
  get light() { return window.qiuHour || {hour: 0, gold: 0, dusk: 0}; },
  inView,
  schedule,
  go,
  found: key => document.dispatchEvent(new CustomEvent('found', {detail: key})),
  // Remember that something travelled: `link(key, from, to)`, where each end is a place or a point
  // {x, y} in room units from the home room's centre. Linking the same key again moves it.
  link(key, from, to) {
    const sig = JSON.stringify([from, to]);
    if (links.get(key)?.sig === sig) return;
    links.set(key, {from, to, sig}); noted(); schedule();
  },
  unlink(key) { if (links.delete(key)) { noted(); schedule(); } },
  // Another room's public side, mounting it if needed: ctx.use('music').then(music => ...).
  use: place => load(place),
  on(type, fn) { listeners[type].push(fn); },
};

export function define(place, loader) { loaders[place] = loader; }

function load(place) {
  if (mounted.has(place)) return Promise.resolve(mounted.get(place));
  if (!loading.has(place)) loading.set(place, loaders[place]().then(module => {
    const piece = module.default;
    // A room's markup sleeps (no layout, no fonts, no images) until its module is ready to use it.
    document.querySelectorAll(`[data-scene="${place}"][data-asleep], [data-asleep="${place}"]`).forEach(node => node.removeAttribute('data-asleep'));
    piece.mount?.(ctx);
    mounted.set(place, piece);
    if (active === place) piece.enter?.();
    schedule();
    return piece;
  }).catch(error => { loading.delete(place); console.error(`Room ${place}:`, error); }));
  return loading.get(place);
}
// Rooms the camera is about to reach load first; overview needs them all.
function approach() {
  const half = .5 / target.z;
  for (const place of rooms) {
    if (mounted.has(place) || loading.has(place) || !loaders[place]) continue;
    const p = places[place];
    if (target.z < .65 || (Math.abs(p.x - target.x) < half + .8 && Math.abs(p.y - target.y) < half + .8)) load(place);
  }
}
// After the first paint and the page's load, the rest of the house wakes one room at a time.
export function wakeAll() {
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1));
  const order = rooms.filter(place => loaders[place]).sort((a, b) => Math.hypot(places[a].x - camera.x, places[a].y - camera.y) - Math.hypot(places[b].x - camera.x, places[b].y - camera.y));
  const next = () => { const place = order.shift(); if (!place) return; load(place).finally(() => idle(next, {timeout: 600})); };
  idle(next, {timeout: 600});
}

function inView(place) {
  const half = .5 / camera.z, p = places[place];
  return Math.abs(p.x - camera.x) < half + .55 && Math.abs(p.y - camera.y) < half + .55;
}

function thread(from, to, color = '#e83d2730') {
  const x1 = from[0] * width, y1 = from[1] * height, x2 = to[0] * width, y2 = to[1] * height;
  g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + (x2 - x1) * .3, y1 + height * .12, x2 - (x2 - x1) * .25, y2 + height * .19, x2, y2); g.strokeStyle = color; g.lineWidth = .65; g.stroke();
}
// From far away the house shows what travelled: a dashed pencil thread from where it left to where it
// landed, a bead at the landing. Ends that are rooms sit at the room's edge, facing the other end.
// The keys, readable from outside (the smoke test, CSS): <div id="room" data-links="route page-2">.
const noted = () => { if (links.size) room.dataset.links = [...links.keys()].join(' '); else delete room.dataset.links; };
function drawLinks() {
  if (!links.size) return;
  const point = end => typeof end === 'string' ? {x: places[end].x, y: places[end].y} : end;
  g.save(); g.globalAlpha = clamp((.65 - camera.z) / .18, 0, 1) * .8; g.strokeStyle = g.fillStyle = '#e83d27'; g.lineWidth = 1 / camera.z; g.setLineDash([4 / camera.z, 4 / camera.z]);
  for (const {from, to} of links.values()) {
    let a = point(from), b = point(to); const d = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
    if (typeof from === 'string') a = {x: a.x + ux * .4, y: a.y + uy * .4};
    if (typeof to === 'string') b = {x: b.x - ux * .4, y: b.y - uy * .4};
    g.beginPath(); g.moveTo((a.x + .5) * width, (a.y + .5) * height); g.lineTo((b.x + .5) * width, (b.y + .5) * height); g.stroke();
    g.beginPath(); g.setLineDash([]); g.arc((b.x + .5) * width, (b.y + .5) * height, 3 / camera.z, 0, Math.PI * 2); g.fill(); g.setLineDash([4 / camera.z, 4 / camera.z]);
  }
  g.restore();
}
function render(now) {
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, width, height);
  g.save(); g.translate(width / 2 - camera.x * width * camera.z, height / 2 - camera.y * height * camera.z); g.scale(camera.z, camera.z); g.translate(-width / 2, -height / 2);
  thread([.39, .77], [-.72, .67]); thread([.86, .93], [1.58, .46]); thread([.61, .15], [.77, -.6]);
  thread([-.54, .84], [-.62, 1.46]); thread([1.67, .85], [1.65, 1.48]); thread([.48, .92], [.51, 1.55]);
  thread([-.62, -.16], [-.62, .3]); thread([1.67, -.16], [1.65, .3]);
  thread([-.3, -.56], [.33, -.5]); thread([.91, -.51], [1.38, -.54]);
  for (const [place, piece] of mounted) if (piece.paint && inView(place)) piece.paint(g, now);
  if (camera.z < .65) {
    g.globalAlpha = clamp((.65 - camera.z) / .18, 0, 1); g.fillStyle = '#626b55'; g.font = `${11 / camera.z}px ${sans}`; g.textAlign = 'center';
    [[-.56, .11, places.papers.name], [1.74, .12, places.music.name], [.69, -.87, places.trace.name], [-.62, -.87, places.paths.name], [1.64, -.87, places.blindspot.name], [-.62, 1.23, places.rethink.name], [.51, 1.23, places.idle.name], [1.64, 1.23, places.work.name]].forEach(([x, y, label]) => g.fillText(label, x * width, y * height)); g.textAlign = 'start';
    g.globalAlpha = 1;
    drawLinks();
  }
  g.restore();
  const transform = `translate(${-camera.x * width * camera.z}px,${-camera.y * height * camera.z}px) scale(${camera.z})`;
  world.style.transform = transform; underlay.style.transform = transform; world.style.setProperty('--detail', clamp((camera.z - .45) / .35, 0, 1));
}
function frame(now) {
  frameId = 0; const dt = Math.min(2.5, (now - (lastFrame || now - 16)) / 16.667); lastFrame = now;
  const ease = motion ? 1 - Math.pow(.82, dt) : 1;
  if (fling) coast(dt);
  ['x', 'y', 'z'].forEach(k => camera[k] += (target[k] - camera[k]) * ease);
  let busy = false;
  for (const piece of mounted.values()) if (piece.frame?.(now, dt, ease)) busy = true;
  render(now);
  const moving = ['x', 'y', 'z'].some(k => Math.abs(camera[k] - target[k]) > .0003);
  if (fling || moving || busy || sound.ringing) schedule();
}
function schedule() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(frame); }
sound.onChange(schedule);
function resize() {
  const rect = room.getBoundingClientRect(); width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  setActive(active); listeners.resize.forEach(fn => fn()); schedule();
}
function setActive(place) {
  const changed = active !== place, before = active;
  active = place; room.dataset.place = place; room.classList.toggle('overviewing', place === 'overview');
  document.querySelectorAll('.language-switch a').forEach(link => link.hash = place);
  document.querySelector('#where-name').textContent = places[place].name;
  document.querySelector('#where-hint').textContent = places[place].hint || wanderHint(width <= 600);
  document.querySelectorAll('[data-scene]').forEach(node => node.inert = node.dataset.scene !== place);
  document.querySelectorAll('.room-map button').forEach(node => { const current = node.dataset.place === place; node.classList.toggle('active', current); if (current) node.setAttribute('aria-current', 'location'); else node.removeAttribute('aria-current'); });
  document.querySelectorAll('.portal').forEach(node => node.hidden = place !== 'overview');
  if (changed) {
    mounted.get(before)?.leave?.();
    mounted.get(place)?.enter?.();
    document.dispatchEvent(new CustomEvent('roomchange', {detail: {place}}));
  }
  if (place !== 'overview' && loaders[place]) load(place);
}
function go(place) {
  fling = null; const p = places[place]; target = {x: p.x, y: p.y, z: p.z};
  setActive(place); history.replaceState(null, '', `#${place}`); approach(); schedule();
}
function classify() {
  approach();
  if (target.z < .61) { setActive('overview'); return; }
  let best = 'home', distance = Infinity;
  rooms.forEach(k => { const p = places[k], d = Math.hypot(target.x - p.x, target.y - p.y); if (d < distance) { distance = d; best = k; } });
  setActive(best);
}
for (const name of rooms) {
  const portal = document.createElement('button'); portal.type = 'button'; portal.className = 'portal'; portal.dataset.place = name; portal.setAttribute('aria-label', t(`走近${places[name].name}`, `Explore: ${places[name].name}`)); portal.hidden = true;
  Object.assign(portal.style, {position: 'absolute', left: `${(places[name].x + .04) * 100}%`, top: `${(places[name].y + .05) * 100}%`, width: '92%', height: '88%', pointerEvents: 'auto', zIndex: '30', background: 'transparent'}); world.append(portal);
}
document.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => go(button.dataset.place)));
function zoomAt(factor, x = width / 2, y = height / 2) {
  fling = null;
  const old = target.z, next = clamp(old * factor, .2, 1.75);
  target.x = clamp(target.x + (x - width / 2) / width * (1 / old - 1 / next), -1.65, 1.72);
  target.y = clamp(target.y + (y - height / 2) / height * (1 / old - 1 / next), -1.5, 1.7); target.z = next; classify(); schedule();
}
document.querySelector('#zoom-in').addEventListener('click', () => zoomAt(1.2)); document.querySelector('#zoom-out').addEventListener('click', () => zoomAt(1 / 1.2));
room.addEventListener('wheel', event => { if (event.ctrlKey || event.metaKey || event.target.closest('input,.pedal-deck,[data-room-control]')) return; event.preventDefault(); const r = room.getBoundingClientRect(); zoomAt(Math.exp(-clamp(event.deltaY, -120, 120) * .002), event.clientX - r.left, event.clientY - r.top); }, {passive: false});
const contacts = new Map(); let pan = null, pinch = null, trail = [];
// Letting go keeps the room moving: the release speed carries on and bleeds away.
// Only a camera that drifts to rest beside a corner is drawn the last bit of the way.
function throwCamera(now) {
  const recent = trail.filter(p => now - p.t < 90);
  if (!motion || recent.length < 2 || now - recent[recent.length - 1].t > 45) return;
  const a = recent[0], b = recent[recent.length - 1], span = Math.max(16, b.t - a.t);
  let vx = (b.x - a.x) / span, vy = (b.y - a.y) / span; const speed = Math.hypot(vx, vy), max = .006;
  if (speed < .00025) return;
  if (speed > max) { vx *= max / speed; vy *= max / speed; }
  fling = {vx, vy};
}
function coast(dt) {
  const ms = dt * 16.667, decay = Math.pow(.945, dt);
  const nx = target.x + fling.vx * ms, ny = target.y + fling.vy * ms;
  target.x = clamp(nx, -1.65, 1.72); target.y = clamp(ny, -1.5, 1.7);
  if (target.x !== nx) fling.vx *= -.25; if (target.y !== ny) fling.vy *= -.25;
  fling.vx *= decay; fling.vy *= decay;
  approach();
  if (Math.hypot(fling.vx, fling.vy) > .00006) return;
  fling = null; classify();
  const p = places[active]; if (p && active !== 'overview' && Math.hypot(target.x - p.x, target.y - p.y) < .14) { target.x = p.x; target.y = p.y; }
}
room.addEventListener('pointerdown', event => {
  if (event.button !== 0 || event.target.closest('button,a,input,label,.pedal-deck,.loose-paper,.draw-area,[data-room-control]')) return;
  fling = null; contacts.set(event.pointerId, {x: event.clientX, y: event.clientY}); room.setPointerCapture(event.pointerId); room.classList.add('dragging');
  if (contacts.size === 1) { target = {...camera}; pan = {x: event.clientX, y: event.clientY, camera: {...camera}}; trail = []; }
  else if (contacts.size === 2) { const [a, b] = [...contacts.values()]; pinch = {distance: Math.hypot(a.x - b.x, a.y - b.y), z: camera.z}; pan = null; }
});
room.addEventListener('pointermove', event => {
  if (!contacts.has(event.pointerId)) return;
  const bounds = room.getBoundingClientRect();
  contacts.set(event.pointerId, {x: event.clientX, y: event.clientY});
  if (pinch && contacts.size === 2) { const [a, b] = [...contacts.values()]; const next = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance, .2, 1.75); zoomAt(next / target.z, (a.x + b.x) / 2 - bounds.left, (a.y + b.y) / 2 - bounds.top); }
  else if (pan) { target.x = clamp(pan.camera.x - (event.clientX - pan.x) / width / pan.camera.z, -1.65, 1.72); target.y = clamp(pan.camera.y - (event.clientY - pan.y) / height / pan.camera.z, -1.5, 1.7); trail.push({t: event.timeStamp, x: target.x, y: target.y}); if (trail.length > 8) trail.shift(); approach(); }
  camera = {...target};
  schedule();
});
function endPan(event) { if (!contacts.has(event.pointerId)) return; contacts.delete(event.pointerId); if (room.hasPointerCapture(event.pointerId)) room.releasePointerCapture(event.pointerId); if (contacts.size === 1) { const p = [...contacts.values()][0]; pan = {x: p.x, y: p.y, camera: {...target}}; pinch = null; } else if (!contacts.size) { if (pan && event.type === 'pointerup') { throwCamera(event.timeStamp); if (Math.hypot(event.clientX - pan.x, event.clientY - pan.y) > 40) document.dispatchEvent(new CustomEvent('found', {detail: 'wander'})); } pan = null; pinch = null; room.classList.remove('dragging'); classify(); } schedule(); }
// The newcomer's lesson (hints.js): the room drifts a breath toward the pages and settles back,
// the same coast a released drag makes, so the world shows that it moves before anyone is told.
document.addEventListener('hint:nudge', () => { if (!motion || active !== 'home' || pan || pinch || fling) return; target = {...camera}; fling = {vx: -.00017, vy: .00002}; schedule(); });
room.addEventListener('pointerup', endPan); room.addEventListener('pointercancel', endPan);
document.addEventListener('keydown', event => {
  if (document.querySelector('#guitar-closeup').open) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input,textarea,[contenteditable=true]')) return;
  if (event.key === 'Escape' || event.key === 'Home') { event.preventDefault(); go('home'); return; }
  if (event.target.closest('[data-room-control]')) return;
  const directions = {ArrowLeft: [-.2, 0], ArrowRight: [.2, 0], ArrowUp: [0, -.2], ArrowDown: [0, .2]};
  if (directions[event.key]) { event.preventDefault(); fling = null; const d = directions[event.key]; target.x = clamp(target.x + d[0] / target.z, -1.65, 1.72); target.y = clamp(target.y + d[1] / target.z, -1.5, 1.7); classify(); schedule(); }
});
const motionButton = document.querySelector('#motion');
function setMotion(value, byButton = false) { motion = value; document.body.dataset.motion = value ? 'on' : 'off'; motionButton.setAttribute('aria-pressed', String(!value)); motionButton.textContent = value ? t("动态开", "Motion on") : t("动态关", "Motion off"); listeners.motion.forEach(fn => fn(value, byButton)); schedule(); }
motionButton.addEventListener('click', () => setMotion(!motion, true)); reduced.addEventListener('change', e => setMotion(!e.matches));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
  else { lastFrame = 0; schedule(); }
});
document.querySelector('.language-switch a[aria-current="page"]').addEventListener('click', event => event.preventDefault());
document.fonts.ready.then(schedule);

export function start() {
  new ResizeObserver(resize).observe(room); setMotion(motion); setActive('home'); resize();
  const entry = location.hash.slice(1); if (Object.hasOwn(places, entry)) go(entry);
  window.addEventListener('hashchange', () => { const place = location.hash.slice(1); if (Object.hasOwn(places, place)) go(place); });
}
