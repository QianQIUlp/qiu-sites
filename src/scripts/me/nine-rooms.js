import {t as localize} from './language.js';
import {setIcon} from './icons.js';
const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono');

// Two more corners of the same room. Geometry and choices stay in this visit.
const $ = selector => document.querySelector(selector);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const mix = (a, b, t) => a + (b - a) * t;
const still = () => document.body.dataset.motion === 'off';
const ink = '#252825', red = '#e83d27', paper = '#eeede7';
let active = location.hash.slice(1) || 'home';

// Two motions that belong to the object, not to the visitor's choice (neither changes a value):
// it leans a little toward a mouse that moves over it, and once, for a newcomer, it shows how it
// moves by itself and settles back (hints.js). `sway` eases both and asks for a redraw.
function sway(stage, {reach, demo, room, span = 2600, floor = -Infinity, redraw}) {
  const state = {lean: 0, target: 0, nudge: 0, start: 0, frame: 0, last: 0, get value() { return Math.max(floor, this.lean + this.nudge); }};
  const tick = now => {
    state.frame = 0;
    const dt = Math.min(64, now - (state.last || now)); state.last = now;
    state.lean += (state.target - state.lean) * (1 - Math.exp(-dt / 240));
    if (state.start) {
      const t = Math.min(1, (now - state.start) / span);
      state.nudge = demo * Math.sin(Math.PI * t) ** 2 * (1 - .25 * t);
      if (t === 1) { state.start = 0; state.nudge = 0; }
    }
    redraw();
    if (state.start || Math.abs(state.target - state.lean) > reach * .004) state.frame = requestAnimationFrame(tick);
    else { state.lean = state.target; state.last = 0; redraw(); }
  };
  const cue = () => { if (!state.frame && !still() && active === room) state.frame = requestAnimationFrame(tick); };
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    const box = stage.getBoundingClientRect();
    state.target = ((event.clientX - box.left) / box.width - .5) * reach;
    cue();
  });
  stage.addEventListener('pointerleave', () => { state.target = 0; cue(); });
  state.play = () => { if (still() || active !== room) return; state.start = performance.now(); cue(); };
  return state;
}
const found = key => document.dispatchEvent(new CustomEvent('found', {detail: key}));

function surface(canvas) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return {ctx, width, height};
}

function dragInput(stage, input) {
  let drag = null;
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button,input,a')) return;
    stage.focus({preventScroll: true});
    drag = {id: event.pointerId, x: event.clientX, value: +input.value};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    input.value = clamp(drag.value + (event.clientX - drag.x) / stage.getBoundingClientRect().width * (+input.max - +input.min) * 1.4, +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    stage.addEventListener(name, event => {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    });
  }
  stage.addEventListener('keydown', event => {
    if (event.target.closest('button,input,a') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    input.value = clamp(+input.value + (event.key === 'ArrowRight' ? 1 : -1) * (+input.max - +input.min) / 20, +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
}

// A ruled surface: every filament shares two ends, but no two take the same route.
const pathCanvas = $('#path-field'), bendInput = $('#path-bend'), pathPlay = $('#path-play');
const routes = [localize("穿过去", "Through"), localize("绕一段", "Around"), localize("停一下", "A pause")];
const routeNotes = [[5, 4, 3, 2, 1, 0], [5, 2, 4, 1, 3, 0], [5, 3, 3, 2, 1, 0]];
let route = 0, shape = 0, bend = 0, pathFrame = 0, pathLast = 0, playback = null;

function routePoint(t, variant, offset = null) {
  const envelope = Math.pow(Math.sin(Math.PI * t), .85);
  let x = (t - .5) * 2.85;
  let y = Math.sin(t * Math.PI * 2) * [.16, .53, .15][variant];
  let z = Math.sin(t * Math.PI) * [.05, -.27, .3][variant];
  y += envelope * (bend + threads.value) * Math.cos(t * Math.PI * 1.7) * .45;
  if (variant === 2) {
    x += Math.sin(t * Math.PI * 2) * .32;
    y += Math.sin(t * Math.PI * 4) * envelope * .22;
  }
  if (offset !== null) {
    const angle = offset * Math.PI * 2 + t * [2.7, 4.2, 7.7][variant] + (bend + threads.value) * t;
    const radius = envelope * [.43, .49, .41][variant];
    y += Math.cos(angle) * radius;
    z += Math.sin(angle) * radius;
  }
  return {x, y, z};
}

function pathPoint(t, offset = null) {
  const a = Math.floor(shape), b = Math.ceil(shape), fraction = shape - a;
  const p = routePoint(t, a, offset), q = routePoint(t, b, offset);
  return {x: mix(p.x, q.x, fraction), y: mix(p.y, q.y, fraction), z: mix(p.z, q.z, fraction)};
}

function drawPaths() {
  const {ctx, width, height} = surface(pathCanvas);
  const scale = Math.min(width / 3.65, height / 2.3);
  const project = point => {
    let {x, y, z} = point;
    [y, z] = [y * .92 - z * .39, y * .39 + z * .92];
    [x, y] = [x * .93 + y * .37, -x * .37 + y * .93];
    return {x: width * .51 + x * scale, y: height * .47 + y * scale, z};
  };
  ctx.save();
  ctx.translate(width * .51, height * .8);
  ctx.scale(1, .13);
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, width * .37);
  shadow.addColorStop(0, '#34372913'); shadow.addColorStop(1, '#34372900');
  ctx.fillStyle = shadow;ctx.fillRect(-width / 2, -width / 2, width, width);
  ctx.restore();

  // Order the hairlines by depth; the front strands catch more light.
  const strands = Array.from({length: 76}, (_, i) => ({i, z: pathPoint(.5, i / 76).z})).sort((a, b) => a.z - b.z);
  for (const {i, z} of strands) {
    ctx.beginPath();
    for (let j = 0; j <= 100; j++) {
      const p = project(pathPoint(j / 100, i / 76));
      if (!j) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = i % 13 === 0 ? '#a28c646b' : `rgba(61,68,52,${.2 + (z + .7) * .19})`;
    ctx.lineWidth = i % 13 === 0 ? .95 : .6;ctx.stroke();
  }
  const progress = playback ? playback.progress : 1;
  ctx.beginPath();
  for (let i = 0; i <= 130; i++) {
    const p = project(pathPoint(i / 130));
    if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = '#e83d2745';ctx.lineWidth = 1.2;ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 130; i++) {
    const p = project(pathPoint(i / 130 * progress));
    if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = red;ctx.lineWidth = 1.65;ctx.stroke();
  for (const [t, label] of [[0, localize("始 / 00", "START / 00")], [1, localize("终 / 01", "END / 01")]]) {
    const p = project(pathPoint(t));
    ctx.beginPath();ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = paper;ctx.fill();ctx.strokeStyle = '#73756b80';ctx.lineWidth = .65;ctx.stroke();
    ctx.beginPath();ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
    ctx.font = `8px ${mono}`;ctx.fillStyle = '#73756b';
    ctx.textAlign = t ? 'right' : 'left';ctx.fillText(label, p.x + (t ? -12 : 12), p.y + (t ? -18 : 24));
  }
  ctx.textAlign = 'left';
  if (playback) {
    const p = project(pathPoint(progress));
    ctx.beginPath();ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);ctx.fillStyle = '#e83d2719';ctx.fill();
    ctx.beginPath();ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
    ctx.strokeStyle = paper;ctx.lineWidth = 1.5;ctx.stroke();
  }
}

function note(index, wake = false) {
  document.dispatchEvent(new CustomEvent('roompluck', {detail: {index, strength: .52, wake}}));
}
function stopPath() {
  playback = null;
  pathPlay.setAttribute('aria-pressed', 'false');
  pathPlay.setAttribute('aria-label', localize("听这条路", "Listen to this path"));
  $('#path-play-label').textContent = localize("听这条路", "Listen to this path");
  setIcon(pathPlay, 'play');
}
function playPath(listen) {
  stopPath();
  playback = {elapsed: 0, progress: 0, lastNote: 0, listen};
  if (listen) {
    note(routeNotes[route][0], true);
    pathPlay.setAttribute('aria-pressed', 'true');pathPlay.setAttribute('aria-label', localize("停止演奏", "Stop playing"));
    $('#path-play-label').textContent = localize("这一刻，在经过", "This moment, passing through");setIcon(pathPlay, 'pause');
  }
  schedulePaths();
}
function framePaths(now) {
  pathFrame = 0;
  const dt = Math.min(64, now - (pathLast || now));pathLast = now;
  const ease = still() ? 1 : 1 - Math.exp(-dt / 140);
  shape += (route - shape) * ease;bend += (+bendInput.value / 100 - bend) * ease;
  if (Math.abs(route - shape) < .001) shape = route;
  if (playback) {
    playback.elapsed += dt;
    const duration = route === 2 ? 6500 : 4800;
    const time = clamp(playback.elapsed / duration, 0, 1);
    // The third route holds its breath in the middle, then still arrives.
    playback.progress = route === 2 ? time < .35 ? time / .35 * .46 : time < .6 ? .46 : .46 + (time - .6) / .4 * .54 : time;
    const nextNote = Math.min(5, Math.floor(playback.progress * 6));
    if (nextNote > playback.lastNote) {
      if (playback.listen) note(routeNotes[route][nextNote]);
      playback.lastNote = nextNote;
    }
    if (time === 1) {
      stopPath();$('#path-status').textContent = localize("终点相同。这一段路，是刚才的你选的。", "The same ending. You chose the way here.");
    }
  }
  drawPaths();
  if (playback || Math.abs(route - shape) > .001 || Math.abs(+bendInput.value / 100 - bend) > .001) schedulePaths();
}
function schedulePaths() {
  if (!pathFrame && !document.hidden && active === 'paths') pathFrame = requestAnimationFrame(framePaths);
}
document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => {
  route = +button.dataset.route;
  document.querySelectorAll('[data-route]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
  $('#path-measure').textContent = `0${route + 1} / ${routes[route]}`;
  $('#path-status').textContent = [localize("向前，也可以是一种选择。", "Straight ahead can be a choice, too."), localize("多经过一点，不急着抵达。", "Take the longer way. No hurry to arrive."), localize("停顿，也在这条路里面。", "A pause belongs to the path, too.")][route];
  playPath(false);
}));
pathPlay.addEventListener('click', () => playback?.listen ? stopPath() : playPath(true));
bendInput.addEventListener('input', () => {stopPath();schedulePaths();if (Math.abs(+bendInput.value) > 25) found('paths-bend');});
dragInput($('.path-instrument'), bendInput);
const threads = sway($('.path-instrument'), {reach: .2, demo: .62, room: 'paths', redraw: () => drawPaths()});
document.addEventListener('hint:threads', () => threads.play());

// An anamorphic word: separate ink fragments line up only from the front.
// Nothing is swapped when the camera turns; their depth creates the gaps.
const blindCanvas = $('#blind-field'), angleInput = $('#blind-angle');
const glyphColors = [ink, '#555747', red];
const glyphs = glyphColors.map(() => {
  const canvas = document.createElement('canvas');canvas.width = 840;canvas.height = 350;
  return canvas;
});
function paintGlyphs() {
  glyphs.forEach((canvas, i) => {
    const ctx = canvas.getContext('2d');ctx.clearRect(0, 0, 840, 350);
    ctx.font = '900 300px "Me Display", "Microsoft YaHei", sans-serif';ctx.textAlign = 'center';ctx.textBaseline = 'middle';
    ctx.fillStyle = glyphColors[i];ctx.fillText('确定', 420, 184);
  });
}
paintGlyphs();
const observations = [
  [localize("01 / 正面", "01 / THE FRONT"), localize("看起来，严丝合缝。", "It all seems to fit."), localize("那篇关于 AI 的笔记写到第八节，我开始拆掉前面自己的论证。", "By section eight of my essay on AI, I was taking apart my own argument.")],
  [localize("02 / 比较单位", "02 / THE COMPARISON"), localize("原来，天平没有放平。", "The scales weren’t level."), localize("前文拿模型的一次生成，对比人的整体能力。换成同样的比较单位，原先的对比就没那么干净了。", "I compared one model response with a person’s entire ability. Use the same unit, and the contrast is less tidy.")],
  [localize("03 / 论证的裂缝", "03 / THE CRACK"), localize("连反驳，也被写进了赞美。", "Even disagreement became praise."), localize("点头，印证了作者；没点头，又成了作者赞美的人。这样“两端通吃”的结尾，并不能证明论点。", "Agree, and the author is right. Disagree, and you become someone the author admires. A conclusion that wins either way proves nothing.")],
  [localize("04 / 保留修正", "04 / KEEP THE CORRECTION"), localize("不把裂缝偷偷抹掉。", "Leave the cracks visible."), localize("原表留着，问题也标出来。让人看见判断怎样被修正，比只留下一个整洁的结论更诚实。", "Keep the original table and mark its problems. Showing a judgment being revised is more honest than a tidy conclusion.")]
];
let viewAngle = 0, blindFrame = 0, blindLast = 0, observation = -1;

function drawBlind() {
  const {ctx, width, height} = surface(blindCanvas);
  const seen = viewAngle + glance.value, angle = seen / 180 * Math.PI;
  const scale = Math.min(width / 4.4, height / 3.15);
  const project = (x, y, z) => {
    const rx = x * Math.cos(angle) + z * Math.sin(angle);
    const rz = z * Math.cos(angle) - x * Math.sin(angle);
    return {x: width * .51 + rx * scale, y: height * .43 + (y + rz * Math.sin(angle) * .15) * scale, z: rz};
  };
  const reveal = clamp((seen - 6) / 34, 0, 1);
  const cx = width * .51, cy = height * .74, rx = Math.min(width * .36, scale * 1.75), ry = rx * .23;
  ctx.strokeStyle = '#73756b35';ctx.lineWidth = .6;
  ctx.beginPath();ctx.ellipse(cx, cy, rx, ry, -.07, 0, Math.PI * 2);ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const t = i / 60 * Math.PI * 2, outside = i % 5 ? 1.015 : 1.04;
    ctx.beginPath();ctx.moveTo(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry);
    ctx.lineTo(cx + Math.cos(t) * rx * outside, cy + Math.sin(t) * ry * outside);ctx.stroke();
  }
  const bearing = Math.PI / 2 - angle;
  ctx.beginPath();ctx.moveTo(cx, cy);ctx.lineTo(cx + Math.cos(bearing) * rx, cy + Math.sin(bearing) * ry);
  ctx.strokeStyle = '#e83d2780';ctx.stroke();
  ctx.beginPath();ctx.arc(cx + Math.cos(bearing) * rx, cy + Math.sin(bearing) * ry, 3, 0, Math.PI * 2);
  ctx.fillStyle = red;ctx.fill();

  const count = 20, sw = 840 / count, sh = 350;
  const pieces = Array.from({length: count}, (_, i) => {
    const x = (i / count - .5) * 3.65;
    const z = Math.sin(i * 1.67) * .66 + Math.cos(i * .52) * .26;
    return {i, x, z, depth: project(x, 0, z).z};
  }).sort((a, b) => a.depth - b.depth);
  function fragment(piece, depth, image, opacity = 1) {
    const a = project(piece.x, -.76, depth), b = project(piece.x + 3.65 / count, -.76, depth), c = project(piece.x, .76, depth);
    ctx.save();ctx.globalAlpha = opacity;
    ctx.transform((b.x - a.x) / sw, (b.y - a.y) / sw, (c.x - a.x) / sh, (c.y - a.y) / sh, a.x, a.y);
    ctx.drawImage(image, piece.i * sw, 0, sw, sh, 0, 0, sw + .35, sh);
    ctx.restore();
  }
  for (const piece of pieces) {
    for (let layer = 16; layer > 0; layer--) fragment(piece, piece.z - layer * .008, glyphs[1]);
    fragment(piece, piece.z, glyphs[0]);
    if ([5, 11, 15].includes(piece.i)) fragment(piece, piece.z + .002, glyphs[2], reveal * .85);
  }

  if (reveal > 0) {
    ctx.save();ctx.globalAlpha = reveal;
    const labels = [localize('比较单位', 'THE UNIT'), localize('两端通吃', 'BOTH WAYS'), localize('保留修正', 'THE REVISION')];
    [5, 11, 15].forEach((index, n) => {
      const piece = pieces.find(p => p.i === index);
      const start = project(piece.x + .1, n === 1 ? .13 : -.45, piece.z);
      const endX = width * [.12, .46, .78][n], endY = height * [ .13, .84, .16][n];
      ctx.strokeStyle = '#e83d2780';ctx.lineWidth = .6;ctx.beginPath();ctx.moveTo(start.x, start.y);
      ctx.lineTo(endX, endY + (n === 1 ? -10 : 12));ctx.lineTo(endX + 29, endY + (n === 1 ? -10 : 12));ctx.stroke();
      ctx.beginPath();ctx.arc(start.x, start.y, 2, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
      ctx.font = `${Math.max(7, Math.min(9, width / 64))}px ${mono}`;
      ctx.fillText(`0${n + 1} / ${labels[n]}`, endX, endY);
    });
    ctx.restore();
  }
  ctx.font = `8px ${mono}`;ctx.textAlign = 'center';ctx.fillStyle = '#73756b';
  ctx.fillText(seen < 8 ? 'ONE VIEW ≠ THE WHOLE' : 'THE GAPS WERE ALWAYS HERE', cx, height * .9);
  ctx.textAlign = 'left';
}

function updateObservation() {
  const index = +angleInput.value < 10 ? 0 : +angleInput.value < 30 ? 1 : +angleInput.value < 50 ? 2 : 3;
  $('#blind-degrees').textContent = `${String(Math.round(+angleInput.value)).padStart(2, '0')}°`;
  if (index === observation) return;
  observation = index;
  $('#blind-index').textContent = observations[index][0];
  $('#blind-caption-title').textContent = observations[index][1];
  $('#blind-caption-copy').textContent = observations[index][2];
  $('#blind-turn').firstChild.textContent = index === 3 ? localize("回到正面 ", "Back to the front ") : localize("换个角度 ", "Another angle ");
}
function frameBlind(now) {
  blindFrame = 0;
  const dt = Math.min(64, now - (blindLast || now));blindLast = now;
  viewAngle += (+angleInput.value - viewAngle) * (still() ? 1 : 1 - Math.exp(-dt / 145));
  if (Math.abs(+angleInput.value - viewAngle) < .03) viewAngle = +angleInput.value;
  drawBlind();
  if (viewAngle !== +angleInput.value) scheduleBlind();
}
function scheduleBlind() {
  if (!blindFrame && !document.hidden && active === 'blindspot') blindFrame = requestAnimationFrame(frameBlind);
}
angleInput.addEventListener('input', () => {updateObservation();scheduleBlind();if (+angleInput.value >= 30) found('blind-angle');});
$('#blind-turn').addEventListener('click', () => {
  angleInput.value = [20, 40, 60, 0][observation];updateObservation();scheduleBlind();
});
dragInput($('.blind-instrument'), angleInput);
// It only ever turns away from the front, so the lean follows a mouse on the right half alone.
const glance = sway($('.blind-instrument'), {reach: 9, demo: 21, room: 'blindspot', span: 3000, floor: 0, redraw: () => drawBlind()});
document.addEventListener('hint:glance', () => glance.play());

function stopFrames() {
  cancelAnimationFrame(pathFrame);cancelAnimationFrame(blindFrame);
  pathFrame = blindFrame = pathLast = blindLast = 0;
}
document.addEventListener('roomchange', event => {
  stopFrames();active = event.detail.place;
  if (active !== 'paths') stopPath();
  if (active === 'paths') schedulePaths();
  if (active === 'blindspot') scheduleBlind();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {stopFrames();stopPath();}
  else {schedulePaths();scheduleBlind();}
});
new ResizeObserver(() => {drawPaths();drawBlind();}).observe($('#room'));
document.fonts.ready.then(() => {drawPaths();drawBlind();});
document.fonts.load('900 300px "Me Display"', '确定').then(() => {
  paintGlyphs();drawBlind();
}).catch(() => {}); // The first frame already contains readable system-font glyphs.
updateObservation();drawPaths();drawBlind();
