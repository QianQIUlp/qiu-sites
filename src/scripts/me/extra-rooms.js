import {t as localize} from './language.js';

// The offscreen project renderer is loaded when its sculpture comes into view.

// All interaction state stays in this visit.
const $ = selector => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const still = () => document.body.dataset.motion === 'off';
const sans = getComputedStyle(document.documentElement).getPropertyValue('--sans');

function dragRange(stage, input, axis, distance) {
  let drag;
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button,a,input')) return;
    drag = {id: event.pointerId, position: event[axis], value: +input.value};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    input.value = clamp(drag.value + (event[axis] - drag.position) * distance(), +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
  const release = event => {
    if (drag?.id !== event.pointerId) return;
    drag = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('keydown', event => {
    if (event.target.closest('button,a,input')) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    input.value = clamp(+input.value + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1) * (+input.max / 20), +input.min, +input.max);
    input.dispatchEvent(new Event('input'));
  });
}

// A single continuous surface. The geometry itself supplies its reverse side.
const ribbon = $('#mobius');
const ribbonStage = $('.mobius-stage');
const ribbonContext = ribbon.getContext('2d');
const angle = $('#thought-angle');
const thoughts = [
  [localize("起初，我以为", "At first, I thought"), localize("「有条件的善意不是善意，是定价。」", "“Conditional kindness isn’t kindness. It’s a price.”"), localize("好记、锋利、适合转发。问题是它错了，至少是偷懒。", "Sharp. Catchy. Easy to share. The trouble is, it was wrong. Or at least, lazy.")],
  [localize("后来，把二分法拆开", "Then, I questioned the either/or"), localize("「真实关系几乎都是混合态。」", "“Real relationships are almost always a mixture.”"), localize("教练可能真的欣赏我练得好，同时也真想多赚这笔钱。这两件事根本不互斥。", "A coach may admire my progress and want to earn more. Both can be true.")],
  [localize("再往里，看见自己", "Further in, I found myself"), localize("「我为什么那么想追到一个让自己舒服的答案？」", "“Why was I so eager for an answer that felt comfortable?”"), localize("读信号，读结构，最后也读那个急着得出结论的自己。", "Read the signals, the situation, and the part of me rushing to a conclusion.")]
];
let ribbonFrame = 0;
let thoughtIndex = -1;
// Two small motions that are not the visitor's choice and never change the thought: the ribbon
// leans a few degrees after a mouse that moves over it, and once, for a newcomer, it turns a
// little by itself and settles back (hints.js). Both are added to the drawn angle only.
let lean = 0, leanTarget = 0, nudge = 0, nudgeStart = 0, motionFrame = 0, motionLast = 0;
function drawRibbon() {
  ribbonFrame = 0;
  const width = ribbonStage.clientWidth, height = ribbonStage.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (ribbon.width !== Math.round(width * dpr) || ribbon.height !== Math.round(height * dpr)) {
    ribbon.width = Math.round(width * dpr);
    ribbon.height = Math.round(height * dpr);
  }
  const ctx = ribbonContext;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const yaw = (+angle.value + lean + nudge) / 180 * Math.PI - .28;
  const pitch = .9, roll = -.32;
  const scale = Math.min(width / 3.45, height / 2.65);
  function project(u, v) {
    let x = (1 + v * Math.cos(u / 2)) * Math.cos(u);
    let y = (1 + v * Math.cos(u / 2)) * Math.sin(u);
    let z = v * Math.sin(u / 2);
    [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), z * Math.cos(yaw) - x * Math.sin(yaw)];
    [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];
    [x, y] = [x * Math.cos(roll) - y * Math.sin(roll), x * Math.sin(roll) + y * Math.cos(roll)];
    const perspective = 5 / (5 + z);
    return {x: width * .5 + x * scale * perspective, y: height * .48 + y * scale * perspective, z};
  }
  const pieces = [], count = 150, strips = 6;
  for (let i = 0; i < count; i++) {
    const u = i / count * Math.PI * 2, next = (i + 1) / count * Math.PI * 2;
    for (let j = 0; j < strips; j++) {
      const v = -.36 + .72 * j / strips, nextV = v + .72 / strips;
      const points = [project(u, v), project(next, v), project(next, nextV), project(u, nextV)];
      const a = points[1], b = points[0], c = points[3];
      const face = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
      const shade = Math.round(232 + 12 * Math.sin(u + yaw) + (face < 0 ? -17 : 0));
      pieces.push({points, z: points.reduce((sum, p) => sum + p.z, 0) / 4, shade, edge: j === 0 ? 0 : j === strips - 1 ? 2 : -1, u});
    }
  }
  const words = [localize("我以为", "I thought"), localize("也可能", "Perhaps"), localize("再想想", "Think again"), localize("不一定", "Not always")], labels = [];
  words.forEach((word, i) => {
    const u = .5 + i * Math.PI / 2;
    const point = project(u, 0), tangent = project(u + .015, 0), across = project(u, .02);
    labels.push({word, point, tangent, across, u});
  });
  pieces.sort((a, b) => b.z - a.z);
  for (const piece of pieces) {
    const {points, shade} = piece;
    ctx.beginPath();ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = `rgb(${shade},${shade + 1},${shade - 13})`;
    ctx.strokeStyle = ctx.fillStyle;ctx.lineWidth = .7;
    ctx.fill();ctx.stroke();
    if (piece.edge >= 0) {
      const a = points[piece.edge], b = points[piece.edge + 1];
      ctx.beginPath();ctx.moveTo(a.x, a.y);ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = piece.edge === 0 ? '#e83d27' : '#767b625e';
      ctx.lineWidth = piece.edge === 0 ? 1.9 : .8;ctx.stroke();
    }
  }
  // Print only on an exposed patch; drawing whole words avoids sliced glyphs at mesh seams.
  function covered(point) {
    return pieces.some(piece => {
      if (piece.z >= point.z - .1) return false;
      const sides = piece.points.map((a, i) => {
        const b = piece.points[(i + 1) % 4];
        return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
      });
      return sides.every(side => side >= 0) || sides.every(side => side <= 0);
    });
  }
  for (const label of labels) {
    const {point: p, tangent: t, across: a, u} = label;
    const tx = (t.x - p.x) / .015 / scale, ty = (t.y - p.y) / .015 / scale;
    let ax = (a.x - p.x) / .02 / scale, ay = (a.y - p.y) / .02 / scale;
    const face = tx * ay - ty * ax;
    if (Math.abs(face) < .22 || [-.16, 0, .16].some(offset => covered(project(u + offset, 0)))) continue;
    if (face < 0) { ax = -ax; ay = -ay; }
    ctx.save();ctx.transform(tx, ty, ax, ay, p.x, p.y);
    ctx.fillStyle = '#51573e';
    ctx.font = `${Math.max(10, scale * .085)}px ${sans}`;
    ctx.textAlign = 'center';ctx.textBaseline = 'middle';ctx.fillText(label.word, 0, 0);ctx.restore();
  }
}
function moveRibbon(now) {
  motionFrame = 0;
  const dt = Math.min(64, now - (motionLast || now)); motionLast = now;
  lean += (leanTarget - lean) * (1 - Math.exp(-dt / 260));
  if (nudgeStart) {
    // One slow breath out and back, like a hand testing whether it turns.
    const t = Math.min(1, (now - nudgeStart) / 2600);
    nudge = 46 * Math.sin(Math.PI * t) ** 2 * (1 - .25 * t);
    if (t === 1) { nudgeStart = 0; nudge = 0; }
  }
  if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon);
  if (nudgeStart || Math.abs(leanTarget - lean) > .05) motionFrame = requestAnimationFrame(moveRibbon);
  else { lean = leanTarget; motionLast = 0; }
}
const cueRibbon = () => { if (!motionFrame && !still()) motionFrame = requestAnimationFrame(moveRibbon); };
ribbonStage.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || event.buttons) return;
  const box = ribbonStage.getBoundingClientRect();
  leanTarget = ((event.clientX - box.left) / box.width - .5) * 16;
  cueRibbon();
});
ribbonStage.addEventListener('pointerleave', () => { leanTarget = 0; cueRibbon(); });
document.addEventListener('hint:ribbon', () => {
  if (still() || document.querySelector('#room').dataset.place !== 'rethink') return;
  nudgeStart = performance.now(); cueRibbon();
});
function updateRibbon() {
  const next = Math.min(2, Math.floor(+angle.value / 120));
  if (next !== thoughtIndex) {
    if (thoughtIndex >= 0 && next !== 0) document.dispatchEvent(new CustomEvent('found', {detail: 'rethink-turn'}));
    thoughtIndex = next;
    ['#thought-kicker', '#thought-quote', '#thought-after'].forEach((id, i) => $(id).textContent = thoughts[next][i]);
  }
  if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon);
}
angle.addEventListener('input', updateRibbon);
$('#turn-thought').addEventListener('click', () => {
  angle.value = ((thoughtIndex + 1) % 3) * 120;
  updateRibbon();
});
dragRange(ribbonStage, angle, 'clientX', () => 360 / ribbonStage.getBoundingClientRect().width);
new ResizeObserver(updateRibbon).observe(ribbonStage);
document.fonts.ready.then(updateRibbon);
updateRibbon();

// Real projects, opened into their motives, decisions and limits.
const projects = {
  verisilo: {
    name: 'VeriSilo', repo: 'VeriSilo',
    layers: [localize("多个网站身份，为什么要挤在同一个浏览器环境里？", "Why should different online identities share a single browser environment?"), localize("每个 Silo 使用独立的浏览器数据目录；Companion 由用户主动触发观察，把证据与解释留在本地。", "Each Silo has a separate browser data directory. You choose when Companion observes; its evidence and explanations stay local."), localize("隔离浏览器环境，不承诺绝对匿名。加密保险库保护应用元数据，不等于加密全部浏览器数据。", "Browser separation does not promise anonymity. The encrypted vault protects app metadata, not all browser data.")]
  },
  meal: {
    name: 'MealCircuit', repo: 'meal-circuit',
    layers: [localize("一餐的照片、当天的状态、后来的更正，能不能接成一段持续的记录？", "Can meal photos, daily check-ins and later corrections become one continuing record?"), localize("把本地事实整理成上下文，用结构约束检查返回结果；更正追加进历史，保留判断如何变化。", "Local records become context; returned results are checked against a schema. Corrections are appended so changes in judgment remain visible."), localize("应用不直接调用外部模型 API；同步默认关闭。记录帮助回看，不提供医学诊断。", "The app does not call external model APIs. Sync is off by default. Records support reflection, not medical diagnosis.")]
  },
  crew: {
    name: 'Crewlight', repo: 'Crewlight',
    layers: [localize("几个编码助手同时工作时，怎样知道谁正需要我的注意，而不用翻遍每个窗口？", "When several coding agents are working, how can I see who needs me without checking every window?"), localize("通过适配器汇总本地状态事件，让桌面伴随窗口、Dashboard 与 CLI 呈现同一组信号。", "Adapters collect local status events. The desktop companion, dashboard and CLI show the same signals."), localize("只读观察，不替助手执行任务；不保存提示词、对话正文或工具输入输出。", "Observation is read-only. It does not act for agents or store prompts, conversations, or tool inputs and outputs.")]
  },
  hadoop: {
    name: 'Hadoop Lab', repo: 'docker-hadoop-cluster',
    layers: [localize("一堂 Hadoop 实验，能不能从观察系统开始，而不是先消耗在安装与端口上？", "Could a Hadoop lesson start with observing the system, without losing the hour to setup and ports?"), localize("同一镜像支持单机六进程与三节点模式；七组实验串起运行、健康信号、故障与恢复。", "One image supports six daemons on one node or a three-node cluster. Seven labs connect operation, health signals, failure and recovery."), localize("面向本地教学与实验。默认端口绑定本机，不包装成具备高可用与安全认证的生产集群。", "For local teaching and experiments. Ports bind to localhost; this is not a production cluster with high availability or authentication.")]
  }
};
const spread = $('#work-spread'), sculpture = $('.work-sculpture');
let specimen = null, specimenPromise = null, workVisible = false;
async function ensureSpecimen() {
  if (!specimenPromise) specimenPromise = import('./work-specimen.js').then(({createWorkSpecimen}) => {
    specimen = createWorkSpecimen($('#work-specimen'));
    specimen.setVisible(workVisible || workActive);
    chooseProject(projectKey);
    return specimen;
  }).catch(error => {
    sculpture.classList.add('specimen-unavailable');console.error('Work specimen:',error);
    specimenPromise = null;
  });
  return specimenPromise;
}
new IntersectionObserver(entries => {
  workVisible = entries[0].isIntersecting;
  if (workVisible) ensureSpecimen();
  specimen?.setVisible(workVisible);
}, {root: $('#room')}).observe(sculpture);
const specimenNotes = {
  verisilo: ['01', 'SEPARATE BY DESIGN', localize("先有边界，再有各自的空间。", "Separate spaces begin with boundaries.")],
  meal: ['02', 'A RECORD THAT RETURNS', localize("每一次更正，都回到同一段记录。", "Every correction returns to the same record.")],
  crew: ['03', 'SIGNALS, NOT CONTROL', localize("看见各处的动静，把控制留在原处。", "See the signals. Leave control in place.")],
  hadoop: ['04', 'LEARN BY TAKING APART', localize("连起来，再从故障里理解它。", "Connect it. Learn through failure.")]
};
const depthLabels = [localize("它从一个问题开始", "It starts with a question"), localize("把判断落实成做法", "A decision becomes a method"), localize("把边界也摆在这里", "The limits belong here, too")];
let projectKey = 'verisilo', displayedWork = '';
function updateWork() {
  const value = +spread.value, depth = value < 34 ? 0 : value < 67 ? 1 : 2;
  specimen?.setDepth(value / 100);
  const reading = String(Math.round(value)).padStart(3, '0');
  if ($('#cut-reading').textContent !== reading) $('#cut-reading').textContent = reading;
  if (displayedWork === `${projectKey}:${depth}`) return;
  displayedWork = `${projectKey}:${depth}`;
  $('#work-detail-label').textContent = depthLabels[depth];
  $('#work-detail-copy').textContent = projects[projectKey].layers[depth];
  document.querySelectorAll('[data-depth]').forEach(button => button.setAttribute('aria-pressed', String(Math.round(+button.dataset.depth / 50) === depth)));
}
function chooseProject(key) {
  projectKey = key;
  const project = projects[key];
  $('#surface-name').textContent = project.name;
  const [index, figure, principle] = specimenNotes[key];
  $('#specimen-index').textContent = index;
  $('#specimen-figure').textContent = `FIG. ${index} — ${figure}`;
  $('#specimen-principle').textContent = principle;
  specimen?.setProject(key, project.name, +index);
  $('#project-source').href = `https://github.com/QianQIUlp/${project.repo}`;
  document.querySelectorAll('[data-project]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.project === key)));
  updateWork();
}
// A single, interruptible tour. Each selection restarts it; ordinary room returns do not.
const playButton = $('#work-play'), playLabel = $('#work-play-label'), playStep = $('#work-play-step');
const tour = [[0,0],[1400,0],[4100,50],[5900,50],[8600,100],[10600,100],[13000,42],[13400,42]];
const duration = tour[tour.length - 1][0];
let showState = 'ready', showFrame = 0, elapsed = 0, lastShowTime = 0, workActive = location.hash === '#work', enteredWork = false, showRequest = 0;
function playUI(state) {
  showState = state;
  const playing = state === 'playing';
  const labels = {ready:[localize("完整演示", "Full tour"),localize("播放完整演示", "Play the full tour")],playing:[localize("暂停演示", "Pause tour"),localize("暂停完整演示", "Pause the full tour")],paused:[localize("继续演示", "Resume tour"),localize("继续完整演示", "Resume the full tour")],finished:[localize("再看一遍", "Watch again"),localize("重播完整演示", "Replay the full tour")]};
  playLabel.textContent = labels[state][0];
  playButton.setAttribute('aria-label', labels[state][1]);
  playButton.setAttribute('aria-pressed', String(playing));
  playButton.dataset.state = state;
  $('#work-play-icon').setAttribute('d', playing ? 'M13 12H16V24H13ZM21 12H24V24H21Z' : 'M15 11.5 25 18 15 24.5Z');
}
function cueShow() {
  if (!showFrame && workActive && showState === 'playing' && !document.hidden) showFrame = requestAnimationFrame(tickShow);
}
function tickShow(now) {
  showFrame = 0;
  if (showState !== 'playing' || !workActive || document.hidden) return;
  if (lastShowTime) elapsed += Math.min(now - lastShowTime, 80);
  lastShowTime = now;
  const time = clamp(elapsed, 0, duration), progress = time / duration;
  let next = tour.findIndex(point => point[0] >= time);
  if (next < 1) next = 1;
  const [start, from] = tour[next - 1], [end, to] = tour[next];
  const t = clamp((time - start) / (end - start), 0, 1), ease = t * t * (3 - 2 * t);
  spread.value = from + (to - from) * ease;
  updateWork();specimen?.setPresentation(progress);
  playButton.style.setProperty('--show-progress', progress);
  const phase = time >= 10600 ? localize("收回切面", "Returning to the surface") : +spread.value < 34 ? localize("01 / 起因", "01 / WHY") : +spread.value < 67 ? localize("02 / 做法", "02 / HOW") : localize("03 / 边界", "03 / LIMITS");
  if (playStep.textContent !== phase) playStep.textContent = phase;
  if (elapsed >= duration) {
    playUI('finished');playStep.textContent = localize("已完整展示", "Tour complete");specimen?.setPresentation(null);return;
  }
  cueShow();
}
async function startShow(delay = 0) {
  const request = ++showRequest;
  await ensureSpecimen();
  if (request !== showRequest || !workActive) return;
  enteredWork = true;
  cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;elapsed = -delay;
  spread.value = 0;updateWork();specimen?.setPresentation(0);
  playButton.style.setProperty('--show-progress', 0);
  playUI('playing');playStep.textContent = localize("01 / 起因", "01 / WHY");cueShow();
}
function pauseShow() {
  if (showState !== 'playing') return;
  cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;playUI('paused');
}
function takeOver() {
  showRequest++;
  cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;elapsed = 0;
  playUI('ready');playStep.textContent = localize("起因 · 做法 · 边界", "Why · How · Limits");
  playButton.style.setProperty('--show-progress', 0);specimen?.setPresentation(null);
}
playButton.addEventListener('click', () => {
  if (showState === 'playing') pauseShow();
  else if (showState === 'paused') {lastShowTime = 0;playUI('playing');cueShow();}
  else startShow();
});
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  chooseProject(button.dataset.project);startShow();
}));
const cut = () => document.dispatchEvent(new CustomEvent('found', {detail: 'work-cut'}));
document.querySelectorAll('[data-depth]').forEach(button => button.addEventListener('click', () => {
  takeOver();spread.value = button.dataset.depth;updateWork();cut();
}));
spread.addEventListener('pointerdown', takeOver);
spread.addEventListener('input', () => {takeOver();updateWork();cut();});
sculpture.addEventListener('pointerdown', event => {if (event.button === 0 && !event.target.closest('button,a,input')) takeOver();});
sculpture.addEventListener('keydown', event => {if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) && !event.target.closest('button,a,input')) takeOver();});
document.addEventListener('roomchange', event => {
  workActive = event.detail.place === 'work';
  if (!workActive) {showRequest++;pauseShow();}
  else if (!enteredWork) startShow(500);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {cancelAnimationFrame(showFrame);showFrame = 0;lastShowTime = 0;}
  else if (workActive) cueShow();
});
dragRange(sculpture, spread, 'clientY', () => 180 / sculpture.getBoundingClientRect().height);
chooseProject(projectKey);
if (workActive) startShow(500);

// A small place where nothing needs to accumulate.
const idle = $('.idle'), hole = $('.paper-hole'), slips = [...document.querySelectorAll('[data-slip]')];
const released = new Set();
let resetVersion = 0;
function updateIdle() {
  const count = released.size;
  idle.classList.toggle('unburdened', count === slips.length);
  $('#idle-preface').textContent = [localize("我不欠资源一次使用。", "I don’t owe a resource a use."), localize("资源不能主动生成任务。", "A resource cannot invent a task for me."), localize("资源只能服务已经存在的任务。", "Resources serve work that already matters."), localize("没有事情接住它，让它过期也没关系。", "If nothing needs it, it can expire. That’s okay."), localize("我不欠资源一次使用。", "I don’t owe a resource a use.")][count];
  $('#idle-message').innerHTML = count === slips.length ? localize("什么都没做。<br><em>也很好。</em>", "Nothing done.<br><em>And that’s fine.</em>") : localize("留白，<br><em>也可以留下来。</em>", "Leave room<br><em>for nothing.</em>");
}
// Balled up, a sheet loses its corners: a lumpy outline, different every time. (A clip-path would
// cut away the slip's own cast shadow, so the lump is drawn with corner radii instead.)
function crumpled() {
  const r = () => Math.round(34 + Math.random() * 32);
  return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
}
function letGo(slip) {
  if (released.has(slip)) return;
  document.dispatchEvent(new CustomEvent('found', {detail: 'idle-letgo'}));
  const version = resetVersion, a = slip.getBoundingClientRect(), b = hole.getBoundingClientRect();
  const scale = idle.getBoundingClientRect().width / idle.clientWidth;
  const dx = (b.x + b.width / 2 - a.x - a.width / 2) / scale;
  const dy = (b.y + b.height / 2 - a.y - a.height / 2) / scale;
  const start = getComputedStyle(slip).transform;
  released.add(slip);slip.style.pointerEvents = 'none';
  // Balled up first, then tossed: it tumbles along a short arc, ticks off the rim and drops in.
  // Translate before the current matrix so a dragged slip finishes from its actual location.
  const shadow = 'drop-shadow(-10px 16px 14px rgba(58,40,20,.2))';
  const ball = crumpled(), round = slip.offsetHeight / slip.offsetWidth || 1, squeeze = n => `scale(${(n * round).toFixed(3)},${n})`, at = (k, lift = 0) => `translate(${dx * k}px,${dy * k - lift}px) ${start}`;
  slip.classList.add('crumpling');
  if (!still()) document.dispatchEvent(new CustomEvent('roomsound', {detail: 'crumple'}));
  const animation = slip.animate([
    {transform: `${start}`, borderRadius: '0%', filter: `${shadow} brightness(1)`, opacity: 1, easing: 'cubic-bezier(.3,.6,.4,1)'},
    {transform: `${at(0)} ${squeeze(.6)} rotate(-16deg)`, borderRadius: ball, filter: `${shadow} brightness(.97)`, offset: .26, easing: 'cubic-bezier(.3,0,.6,1)'},
    {transform: `${at(.08, 26)} ${squeeze(.5)} rotate(18deg)`, borderRadius: ball, offset: .36, easing: 'cubic-bezier(.2,.5,.5,1)'},
    {transform: `${at(.55, 64)} ${squeeze(.42)} rotate(170deg)`, borderRadius: ball, offset: .6, easing: 'cubic-bezier(.5,0,.9,.6)'},
    {transform: `${at(.9)} ${squeeze(.38)} rotate(290deg)`, borderRadius: ball, filter: `${shadow} brightness(.9)`, offset: .79, easing: 'cubic-bezier(.2,.6,.4,1)'},
    {transform: `${at(.95, 12)} ${squeeze(.36)} rotate(318deg)`, borderRadius: ball, opacity: 1, offset: .87, easing: 'cubic-bezier(.6,0,1,.7)'},
    {transform: `${at(1)} ${squeeze(.03)} rotate(372deg)`, borderRadius: ball, filter: `${shadow} brightness(.35)`, opacity: 0}
  ], {duration: still() ? 0 : 1250, fill: 'forwards'});
  animation.finished.then(() => {
    if (resetVersion !== version) return;
    slip.hidden = true;animation.cancel();slip.classList.remove('crumpling');updateIdle();
    if (released.size === slips.length) $('#restore-slips').focus({preventScroll: true});
  }).catch(() => {});
}
slips.forEach(slip => {
  let drag = null, suppressClick = false;
  slip.addEventListener('pointerdown', event => {
    if (event.button !== 0 || released.has(slip)) return;
    suppressClick = false;
    slip.getAnimations().forEach(animation => animation.cancel());
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, scale: idle.getBoundingClientRect().width / idle.clientWidth};
    slip.setPointerCapture(event.pointerId);slip.style.zIndex = 5;
  });
  slip.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = (event.clientX - drag.x) / drag.scale, dy = (event.clientY - drag.y) / drag.scale;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (drag.moved) slip.style.transform = `translate(${dx}px,${dy}px) rotate(var(--slip-angle))`;
  });
  function release(event, cancelled = false) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved;
    if (slip.hasPointerCapture(event.pointerId)) slip.releasePointerCapture(event.pointerId);
    const b = hole.getBoundingClientRect();
    const inside = Math.hypot((event.clientX - b.x - b.width / 2) / (b.width * .65), (event.clientY - b.y - b.height / 2) / (b.height * .7)) < 1;
    if (!cancelled && drag.moved && inside) letGo(slip);
    else if (drag.moved) {
      const start = getComputedStyle(slip).transform;
      slip.style.transform = '';
      slip.animate([{transform: start}, {transform: getComputedStyle(slip).transform}], {duration: still() ? 0 : 350, easing: 'cubic-bezier(.2,.7,.2,1)'});
    }
    slip.style.zIndex = '';drag = null;
  }
  slip.addEventListener('pointerup', event => release(event));
  slip.addEventListener('pointercancel', event => release(event, true));
  slip.addEventListener('click', event => { if (!suppressClick || event.detail === 0) letGo(slip); });
});
// The quiet tutorial (hints.js): a draft from the window catches the slip nearest the hollow; it
// lifts, slides a finger's width toward it and settles back, as if it wanted to go.
document.addEventListener('hint:breeze', () => {
  if (still() || $('#room').dataset.place !== 'idle') return;
  const b = hole.getBoundingClientRect(), centre = r => [r.x + r.width / 2, r.y + r.height / 2];
  const [hx, hy] = centre(b);
  const slip = slips.filter(s => !released.has(s) && !s.hidden).map(s => [s, Math.hypot(...centre(s.getBoundingClientRect()).map((v, i) => v - [hx, hy][i]))]).sort((a, c) => a[1] - c[1])[0]?.[0];
  if (!slip || slip.getAnimations().length) return;
  const [sx, sy] = centre(slip.getBoundingClientRect()), d = Math.hypot(hx - sx, hy - sy) || 1;
  const scale = idle.getBoundingClientRect().width / idle.clientWidth;
  const ux = (hx - sx) / d / scale, uy = (hy - sy) / d / scale, at = (k, lift = 0) => `${(ux * k).toFixed(1)}px ${(uy * k - lift).toFixed(1)}px`;
  slip.animate([
    {translate: '0px 0px', rotate: '0deg', filter: 'drop-shadow(0 0 0 rgba(58,40,20,0))'},
    {translate: at(4, 5), rotate: '-1.6deg', filter: 'drop-shadow(-6px 10px 9px rgba(58,40,20,.14))', offset: .22},
    {translate: at(15, 7), rotate: '2.4deg', filter: 'drop-shadow(-8px 13px 11px rgba(58,40,20,.16))', offset: .48},
    {translate: at(9, 2), rotate: '.6deg', filter: 'drop-shadow(-4px 7px 7px rgba(58,40,20,.1))', offset: .72},
    {translate: '0px 0px', rotate: '0deg', filter: 'drop-shadow(0 0 0 rgba(58,40,20,0))'}
  ], {duration: 2100, easing: 'cubic-bezier(.4,0,.3,1)', composite: 'add'});
});
$('#restore-slips').addEventListener('click', () => {
  resetVersion++;released.clear();
  slips.forEach(slip => { slip.getAnimations().forEach(animation => animation.cancel());slip.classList.remove('crumpling');slip.hidden = false;slip.style.transform = '';slip.style.pointerEvents = '';slip.style.zIndex = ''; });
  updateIdle();
});
