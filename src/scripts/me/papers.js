// Loose pages behave like paper. They carry a throw, glide on the air and land; a hard
// throw can carry one out of its corner into the next room, where it waits for the rest
// of the visit. Held up into the window light, a page turns translucent: its back and an
// erased pencil draft show through. All of it stays in this visit.
const room = document.querySelector('#room');
const world = document.querySelector('#world');
const layer = document.querySelector('.paper-layer');
const sun = document.querySelector('.paper-sun');
const reset = document.querySelector('.paper-reset');
const papers = [...layer.querySelectorAll('.loose-paper')];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const still = () => document.body.dataset.motion === 'off';

// Room origins in room-size units, measured from the loose pages' own corner (scene.js places).
const origin = {x: -1.12, y: .01};
const corners = {home: [0, 0], papers: [-1.12, .01], music: [1.13, 0], trace: [.06, -1.11], rethink: [-1.12, 1.12], work: [1.13, 1.12], idle: [0, 1.12], paths: [-1.12, -1.11], blindspot: [1.13, -1.11]};
const bounds = Object.fromEntries(Object.entries(corners).map(([name, [x, y]]) => [name, {x: x - origin.x, y: y - origin.y}]));
const reach = {x0: 0, y0: bounds.paths.y, x1: bounds.home.x + 1, y1: bounds.rethink.y + 1};

const AIR = .95;           // per 60 Hz frame while gliding
const FRICTION = .0000024; // room units per ms², once a page is back on the floor
const SPIN_DRAG = .93;
const ESCAPE = .0011;      // room units per ms needed to slide past a corner's edge
const MAX_SPEED = .0036;

const state = papers.map((paper, index) => ({
  paper, index, x: 0, y: 0, vx: 0, vy: 0, spin: 0, vr: 0, lift: 0, glow: 0, sunlit: 0,
  room: 'papers', drag: null, homing: false, base: null,
}));
let top = 4, frame = 0, last = 0;

function measure() {
  const w = layer.clientWidth || 1, h = layer.clientHeight || 1;
  for (const s of state) {
    const p = s.paper;
    s.base = {x: p.offsetLeft / w, y: p.offsetTop / h, w: p.offsetWidth / w, h: p.offsetHeight / h};
  }
}

// The front shows the back's words through the paper and the back shows the front's, mirrored.
for (const s of state) {
  const front = s.paper.querySelector('.paper-front'), back = s.paper.querySelector('.paper-back');
  const ghost = (from, into) => {
    const target = into.querySelector('.paper-through');
    for (const node of from.querySelectorAll(':scope > h3, :scope > p')) {
      const copy = document.createElement(node.tagName === 'H3' ? 'b' : 'span');
      copy.innerHTML = node.innerHTML;
      target.append(copy);
    }
  };
  ghost(back, front);
  ghost(front, back);
}

function centre(s) {
  return {x: s.base.x + s.base.w / 2 + s.x, y: s.base.y + s.base.h / 2 + s.y};
}
function roomAt(point) {
  let best = 'papers', distance = Infinity;
  for (const [name, b] of Object.entries(bounds)) {
    const d = Math.hypot(point.x - (b.x + .5), point.y - (b.y + .5));
    if (d < distance) { distance = d; best = name; }
  }
  return best;
}

// Inside its corner a page meets soft edges; fast enough, it slides on past them.
function walls(s) {
  const b = bounds[s.room], c = centre(s), mx = s.base.w * .32, my = s.base.h * .32;
  const edges = [['x', b.x + mx, b.x + 1 - mx, 'vx'], ['y', b.y + my, b.y + 1 - my, 'vy']];
  for (const [axis, min, max, v] of edges) {
    const over = c[axis] < min ? c[axis] - min : c[axis] > max ? c[axis] - max : 0;
    if (!over) continue;
    if (Math.abs(s[v]) > ESCAPE && Math.sign(s[v]) === Math.sign(over)) continue;
    s[axis] -= over;
    if (Math.sign(s[v]) === Math.sign(over)) s[v] *= -.28;
  }
  // The world itself has walls; a page always lands whole inside them.
  const outer = centre(s), ox = s.base.w * .56, oy = s.base.h * .56;
  const cx = clamp(outer.x, reach.x0 + ox, reach.x1 - ox), cy = clamp(outer.y, reach.y0 + oy, reach.y1 - oy);
  if (cx !== outer.x) { s.x += cx - outer.x; s.vx *= -.25; }
  if (cy !== outer.y) { s.y += cy - outer.y; s.vy *= -.25; }
}

function overlap(a, b) {
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return w * h / Math.max(1, a.width * a.height);
}

function paint(s) {
  const style = s.paper.style, w = layer.clientWidth, h = layer.clientHeight;
  style.setProperty('--dx', `${(s.x * w).toFixed(2)}px`);
  style.setProperty('--dy', `${(s.y * h).toFixed(2)}px`);
  style.setProperty('--spin', `${s.spin.toFixed(2)}deg`);
  style.setProperty('--lift', s.lift.toFixed(3));
  style.setProperty('--glow', s.glow.toFixed(3));
  style.setProperty('--sunlit', s.sunlit.toFixed(3));
}

function step(now) {
  frame = 0;
  const ms = Math.min(48, now - (last || now - 16.7)); last = now;
  const f = ms / 16.667, calm = still();
  const sunRect = sun.getBoundingClientRect();
  let busy = false;
  for (const s of state) {
    if (s.drag) {
      s.lift += (1 - s.lift) * (calm ? 1 : 1 - Math.pow(.8, f));
      s.spin += s.vr * ms; s.vr *= Math.pow(.86, f);
      const held = clamp(s.spin, s.drag.spin - 30, s.drag.spin + 30);
      if (held !== s.spin) { s.spin = held; s.vr = 0; }
    } else if (s.homing) {
      const k = calm ? 1 : 1 - Math.pow(.88, f);
      s.x += -s.x * k; s.y += -s.y * k; s.spin += -s.spin * k;
      s.lift += (.35 - s.lift) * k;
      if (Math.hypot(s.x, s.y) < .0008 && Math.abs(s.spin) < .05) { s.x = s.y = s.spin = 0; s.homing = false; s.room = 'papers'; }
    } else {
      s.x += s.vx * ms; s.y += s.vy * ms; s.spin += s.vr * ms;
      const air = Math.pow(AIR, f);
      s.vx *= air; s.vy *= air; s.vr *= Math.pow(SPIN_DRAG, f);
      // Back on the floor, it slides to a definite stop instead of drifting forever.
      if (s.lift < .5) {
        const v = Math.hypot(s.vx, s.vy), k = v ? Math.max(0, 1 - FRICTION * ms / v) : 0;
        s.vx *= k; s.vy *= k;
      }
      walls(s);
      const speed = Math.hypot(s.vx, s.vy);
      // A gliding page stays a little airborne, then settles as it slows.
      const aloft = clamp(speed / .0016, 0, 1) * .75;
      s.lift += (aloft - s.lift) * (calm ? 1 : 1 - Math.pow(aloft > s.lift ? .7 : .84, f));
      if (speed < .00002) { s.vx = s.vy = 0; }
      if (Math.abs(s.vr) < .0005) s.vr = 0;
      if (s.vx || s.vy) s.room = roomAt(centre(s));
    }
    // Light only reaches the corner by the window.
    const lit = s.room === 'papers' ? clamp(overlap(s.paper.getBoundingClientRect(), sunRect) * 1.6, 0, 1) : 0;
    const smooth = lit * lit * (3 - 2 * lit);
    const glowTarget = smooth * clamp((s.lift - .2) / .7, 0, 1);
    const ease = calm ? 1 : 1 - Math.pow(.78, f);
    s.glow += (glowTarget - s.glow) * ease;
    s.sunlit += (smooth - s.sunlit) * ease;
    if (Math.abs(glowTarget - s.glow) < .002) s.glow = glowTarget;
    if (Math.abs(smooth - s.sunlit) < .002) s.sunlit = smooth;
    if (!s.drag && !s.homing && !s.vx && !s.vy && s.lift < .004) s.lift = 0;
    paint(s);
    busy ||= Boolean(s.drag || s.homing || s.vx || s.vy || s.vr || s.lift || Math.abs(glowTarget - s.glow) > 0 || Math.abs(smooth - s.sunlit) > 0);
  }
  updateAccess();
  if (busy) schedule();
}
function schedule() { if (!frame) frame = requestAnimationFrame(step); }

// A page is within reach only in the room where it lies.
function updateAccess() {
  const place = room.dataset.place;
  for (const s of state) {
    const away = s.room !== place;
    if (s.paper.inert !== away) s.paper.inert = away;
    s.paper.classList.toggle('strayed', s.room !== 'papers');
  }
}

function flip(paper) {
  const flipped = !paper.classList.contains('flipped');
  paper.classList.toggle('flipped', flipped);
  paper.setAttribute('aria-pressed', String(flipped));
  paper.querySelector('.paper-front').inert = flipped;
  paper.querySelector('.paper-back').inert = !flipped;
}

for (const s of state) {
  const {paper} = s;
  paper.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('a,button')) return;
    event.stopPropagation();
    paper.style.zIndex = ++top;
    const scale = world.getBoundingClientRect(), rect = paper.getBoundingClientRect();
    s.homing = false; s.vx = s.vy = 0;
    s.drag = {
      id: event.pointerId, px: event.clientX, py: event.clientY, x: s.x, y: s.y, t: event.timeStamp, spin: s.spin,
      sx: scale.width, sy: scale.height, travel: 0, trail: [{t: event.timeStamp, x: s.x, y: s.y}],
      // Where the hand holds the page, from its centre, in room units.
      gx: (event.clientX - (rect.left + rect.width / 2)) / scale.width,
      gy: (event.clientY - (rect.top + rect.height / 2)) / scale.height,
    };
    paper.setPointerCapture(event.pointerId);
    paper.classList.add('held');
    schedule();
  });
  paper.addEventListener('pointermove', event => {
    const d = s.drag;
    if (d?.id !== event.pointerId) return;
    event.stopPropagation();
    const nx = d.x + (event.clientX - d.px) / d.sx, ny = d.y + (event.clientY - d.py) / d.sy;
    const dt = Math.max(1, event.timeStamp - d.trail[d.trail.length - 1].t);
    const vx = (nx - s.x) / dt, vy = (ny - s.y) / dt;
    // Pulled by one point, a page turns until that point leads the way.
    if (!still()) {
      const turn = (s.spin - d.spin) * Math.PI / 180, cos = Math.cos(turn), sin = Math.sin(turn);
      const gx = d.gx * cos - d.gy * sin, gy = d.gx * sin + d.gy * cos;
      // The desk holds it back: the further it has turned, the harder the next degree.
      const give = clamp(1 - Math.abs(s.spin - d.spin) / 32, 0, 1);
      s.vr += ((gx * vy - gy * vx) * 1500 * give - s.vr) * .35;
    }
    s.x = nx; s.y = ny;
    d.travel = Math.max(d.travel, Math.hypot(event.clientX - d.px, event.clientY - d.py));
    d.trail.push({t: event.timeStamp, x: s.x, y: s.y});
    if (d.trail.length > 8) d.trail.shift();
    schedule();
  });
  const release = (event, cancel = false) => {
    const d = s.drag;
    if (d?.id !== event.pointerId) return;
    event.stopPropagation();
    s.drag = null;
    paper.classList.remove('held');
    if (paper.hasPointerCapture(event.pointerId)) paper.releasePointerCapture(event.pointerId);
    if (!cancel && d.travel < 7 && event.timeStamp - d.t < 450) { flip(paper); schedule(); return; }
    const recent = d.trail.filter(p => event.timeStamp - p.t < 90);
    if (!cancel && !still() && recent.length > 1 && event.timeStamp - recent[recent.length - 1].t < 45) {
      const a = recent[0], b = recent[recent.length - 1], span = Math.max(16, b.t - a.t);
      s.vx = (b.x - a.x) / span; s.vy = (b.y - a.y) / span;
      const speed = Math.hypot(s.vx, s.vy);
      if (speed > MAX_SPEED) { s.vx *= MAX_SPEED / speed; s.vy *= MAX_SPEED / speed; }
      // No hand throws perfectly straight: a little turn comes with every toss.
      s.vr = clamp(s.vr + (Math.random() - .5) * Math.min(speed, MAX_SPEED) * 28, -.08, .08);
    } else { s.vr = 0; }
    s.room = roomAt(centre(s));
    schedule();
  };
  paper.addEventListener('pointerup', event => release(event));
  paper.addEventListener('pointercancel', event => release(event, true));
  paper.addEventListener('keydown', event => {
    if (event.target === paper && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); flip(paper); }
  });
  paper.querySelector('.turn-back').addEventListener('click', event => { event.stopPropagation(); flip(paper); });
}

// Putting the pages back calls the strays home too, through the air.
reset.addEventListener('click', () => {
  for (const s of state) {
    s.homing = true; s.vx = s.vy = s.vr = 0;
    if (s.paper.classList.contains('flipped')) flip(s.paper);
  }
  schedule();
});

new MutationObserver(updateAccess).observe(room, {attributes: true, attributeFilter: ['data-place']});
new ResizeObserver(() => { measure(); state.forEach(paint); schedule(); }).observe(layer);
measure();
updateAccess();
schedule();
