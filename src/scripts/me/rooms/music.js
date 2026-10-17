// 琴弦之间 ("Between the Strings"): a close-up of the real Rāna's strings, the four-pedal board, a
// six-second looper and the VU meter. The strings blur into a ringing string's lens-shaped envelope
// when plucked (drawn on #jam-strings); every knob is a real audio parameter of the shared rig.
import {setControl} from '../icons.js';
import {defaultRig, tones, harmonyShifts, keyNames} from '../audio-engine.js';
import {clamp} from '../room-kit.js';

let ctx, sound, t;
const pulses = Array(6).fill(0), frequencies = [329.63, 246.94, 196, 146.83, 110, 82.41];
let loopNotes = [], recording = false, looping = false, recordStart = 0, loopStart = 0, lastLoopPosition = -1;
let overdub = false, layers = 0, overdubStartCount = 0, loopTimer = null;
let scheduledPulses = [], chord = 'open', lastSecond = -1, lastMeter = -1, vu = -48;
const lastNotes = Array(6).fill(-Infinity);
const chords = {open: [0, 0, 0, 0, 0, 0], Em: [0, 0, 0, 2, 2, 0], G: [3, 3, 0, 0, 2, 3], C: [0, 1, 0, 2, 3, -1], D: [2, 3, 2, 0, -1, -1]};
const $ = selector => document.querySelector(selector);
let loopButton, loopClear, loopCaption, overdubButton, loopPanel, loopBeats, strings, loopProgress, layerLabel, meterFill, meterLabel, vuMeter;
let jamCanvas, jamCtx;
const jamLines = [[297, 293], [322, 320], [348, 345], [374, 373], [399, 401], [425, 429]], jamGauge = [.7, .85, 1.05, 1.3, 1.6, 1.9];

function drawJam(now) {
  const w = jamCanvas.clientWidth, h = jamCanvas.clientHeight; if (!w || !h) return;
  const scale = Math.min(2.5, ctx.dpr * Math.max(1, ctx.camera.z)), motion = ctx.motion;
  if (jamCanvas.width !== Math.round(w * scale) || jamCanvas.height !== Math.round(h * scale)) { jamCanvas.width = Math.round(w * scale); jamCanvas.height = Math.round(h * scale); }
  jamCtx.setTransform(scale, 0, 0, scale, 0, 0); jamCtx.clearRect(0, 0, w, h);
  const sx = w / 860, sy = h / 620, start = -40, end = 690;
  jamLines.forEach(([a, b], i) => {
    const p = pulses[i]; if (p < .012) return;
    const y = u => (a + (b - a) * (u - 320) / 350) * sy, amp = motion ? p * Math.min(11, 4 + i * 1.4) * sy : 0, phase = Math.cos(now * (.06 - i * .0055) + i);
    jamCtx.beginPath();
    for (let n = 0; n <= 48; n++) { const u = start + (end - start) * n / 48, e = Math.sin(Math.PI * n / 48); jamCtx.lineTo(u * sx, y(u) - amp * e); }
    for (let n = 48; n >= 0; n--) { const u = start + (end - start) * n / 48, e = Math.sin(Math.PI * n / 48); jamCtx.lineTo(u * sx, y(u) + amp * e); }
    jamCtx.fillStyle = `rgba(236,228,210,${Math.min(.2, p * .22)})`; jamCtx.fill();
    jamCtx.beginPath();
    for (let n = 0; n <= 48; n++) { const u = start + (end - start) * n / 48, e = Math.sin(Math.PI * n / 48); jamCtx.lineTo(u * sx, y(u) + amp * e * phase); }
    jamCtx.strokeStyle = `rgba(255,247,232,${.35 + p * .55})`; jamCtx.lineWidth = jamGauge[i] * Math.max(.7, sx); jamCtx.shadowColor = 'rgba(255,196,140,.55)'; jamCtx.shadowBlur = 6 * p; jamCtx.stroke(); jamCtx.shadowBlur = 0;
  });
}

function frequencyFor(index) { const fret = ctx.active === 'music' ? chords[chord][index] : 0; return fret < 0 ? null : frequencies[index] * 2 ** (fret / 12); }
function pluck(index, strength = 1, fromLoop = false) {
  const frequency = frequencyFor(index); if (!frequency) return;
  pulses[index] = Math.max(pulses[index], strength); ctx.schedule();
  if (!sound.live) return;
  const audio = sound.context;
  if (audio.currentTime - lastNotes[index] < .045) return; lastNotes[index] = audio.currentTime;
  if (!fromLoop && (recording || overdub)) {
    const time = recording ? audio.currentTime - recordStart : ((audio.currentTime - loopStart) % 6 + 6) % 6;
    if (time >= 0 && time < 6) loopNotes.push({time, note: index, strength, frequency});
  }
  sound.rig.play(frequency, strength); sound.tail(sound.params.echo ? 12 : 3.3);
}
const strummed = () => ctx.found('music-strings');
async function playGesture(index, strength = 1) { strummed(); if (!sound.context && !await sound.set(true)) return; pluck(index, strength); }
async function strum() {
  if (!sound.context && !await sound.set(true)) return;
  for (let n = 5; n >= 0; n--) setTimeout(() => { if (!document.hidden) pluck(n, .76 + (5 - n) * .025); }, (5 - n) * 31);
}

function refreshEffects(custom = false) {
  const params = sound.params;
  sound.apply();
  document.querySelectorAll('[data-effect]').forEach(pedal => {
    const on = params[pedal.dataset.effect]; pedal.dataset.on = String(on);
    pedal.querySelector('[data-pedal]').setAttribute('aria-pressed', String(on));
  });
  const formats = {echoTime: v => `${v} ms`, harmKey: v => keyNames[v], harmShift: v => harmonyShifts[v].label};
  document.querySelectorAll('[data-param]').forEach(input => {
    const value = params[input.dataset.param], min = Number(input.min), max = Number(input.max);
    input.value = value; input.closest('.dial-control').style.setProperty('--angle', `${-135 + (value - min) / (max - min) * 270}deg`);
    const formatted = (formats[input.dataset.param] || (v => (v / 10).toFixed(1)))(value);
    input.closest('.dial').querySelector('output').textContent = formatted; input.setAttribute('aria-valuetext', formatted);
  });
  $('#echo-readout').textContent = params.echoTime;
  // Shorter echoes run the tape faster.
  $('.pedal-echo').style.setProperty('--reel', `${(.9 + params.echoTime / 800 * 2.8).toFixed(2)}s`);
  if (custom) { document.querySelectorAll('[data-tone]').forEach(b => b.setAttribute('aria-pressed', 'false')); $('#tone-caption').textContent = t("现在，是你拧出来的声音。", "That’s your sound now."); }
  ctx.schedule();
}

function updateMeter() {
  const rms = sound.enabled && sound.rig ? sound.rig.meter() : 0, db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
  const level = clamp((db + 60) / 60, 0, 1);
  meterFill.style.setProperty('--level', `${level * 100}%`);
  // A VU needle has weight: it rises quickly and settles back slowly.
  // Calibrated so a clean strum sits near 0 VU and only a pushed Output knob or the volume swings it into the red.
  const needle = Number.isFinite(db) ? clamp((db + 22.9) / 14.35, 0, 1.1) * 96 - 48 : -48; vu += (needle - vu) * (needle > vu ? .32 : .08);
  vuMeter.style.setProperty('--vu', `${vu.toFixed(2)}deg`); vuMeter.dataset.on = String(sound.enabled);
  if (vu > 39) vuMeter.dataset.hot = 'true'; else if (vu < 33) vuMeter.dataset.hot = 'false';
  const number = Number.isFinite(db) && db > -70 ? Math.round(db) : null;
  if (lastMeter !== number) { meterLabel.textContent = number === null ? '−∞ dB' : `${number} dB`; lastMeter = number; }
  strings.forEach((button, i) => button.dataset.playing = String(pulses[i] > .15));
}
function closeOverdub() { if (overdub && loopNotes.length > overdubStartCount) layers++; overdub = false; overdubButton.setAttribute('aria-pressed', 'false'); setControl(overdubButton, t("叠一层", "Overdub"), 'plus'); }
function loopUI(state) {
  loopPanel.dataset.state = state; loopClear.disabled = !loopNotes.length && !recording; overdubButton.disabled = !looping;
  layerLabel.textContent = t(`${String(layers).padStart(2, '0')} 层`, `${String(layers).padStart(2, '0')} ${layers === 1 ? 'LAYER' : 'LAYERS'}`);
}
function pauseLoop() {
  closeOverdub(); if (recording && loopNotes.length) layers = 1; recording = false; looping = false; clearInterval(loopTimer); loopTimer = null;
  scheduledPulses = []; sound.rig?.stopLoop(); setControl(loopButton, loopNotes.length ? t("播放", "Play") : t("录一段", "Record"), loopNotes.length ? 'replay' : 'record');
  loopCaption.textContent = loopNotes.length ? t("这一小段，还在这里。", "Your little loop is still here.") : t("录 6 秒，循环着接着弹。", "Record six seconds. Play along.");
  loopUI(loopNotes.length ? 'paused' : 'empty'); ctx.schedule();
}
function scheduleLoop() {
  const audio = sound.context;
  if (!looping || !audio || audio.state !== 'running' || document.hidden) return;
  const end = audio.currentTime + .12, from = lastLoopPosition;
  for (let cycle = Math.max(0, Math.floor((from - loopStart) / 6)); cycle <= Math.floor((end - loopStart) / 6); cycle++) {
    for (const note of loopNotes) {
      const at = loopStart + cycle * 6 + note.time; if (at > from && at <= end && at >= audio.currentTime) {
        sound.rig.play(note.frequency, note.strength, at, 'loop'); scheduledPulses.push({at, note: note.note, strength: note.strength});
      }
    }
  }
  lastLoopPosition = end;
}
function playLoop() {
  recording = false; looping = true; loopStart = sound.context.currentTime + .03; lastLoopPosition = loopStart - .001;
  setControl(loopButton, t("暂停", "Pause"), 'pause'); loopCaption.textContent = t("循环着。可以换和弦，叠一层。", "Looping. Try another chord or layer.");
  loopUI('playing'); clearInterval(loopTimer); scheduleLoop(); loopTimer = setInterval(scheduleLoop, 25); ctx.schedule();
}
function runLoop() {
  if (!sound.context) return; const now = sound.context.currentTime;
  if (recording) {
    const elapsed = now - recordStart; loopProgress.style.width = `${Math.min(100, elapsed / 6 * 100)}%`;
    const seconds = Math.max(0, Math.ceil(6 - elapsed)); if (seconds !== lastSecond) { loopCaption.textContent = t(`正在录下 · ${seconds} 秒`, `Recording · ${seconds}s left`); lastSecond = seconds; }
    loopBeats.forEach((b, i) => b.classList.toggle('lit', i <= Math.floor(elapsed / .75)));
    if (elapsed >= 6) { if (loopNotes.length) { layers = 1; playLoop(); } else pauseLoop(); }
  }
  if (looping) {
    const pos = Math.max(0, (now - loopStart) % 6); loopProgress.style.width = `${pos / 6 * 100}%`;
    loopBeats.forEach((b, i) => b.classList.toggle('lit', i === Math.floor(pos / .75)));
    scheduledPulses = scheduledPulses.filter(p => { if (p.at <= now) { pulses[p.note] = Math.max(pulses[p.note], p.strength); return false; } return true; });
  }
}

function mountStrings() {
  // The quiet tutorial (hints.js): the strings shiver one after another, as if brushed, without a sound.
  document.addEventListener('hint:strings', () => { if (!ctx.motion || ctx.active !== 'music') return; for (let n = 0; n < 6; n++) setTimeout(() => { if (ctx.active !== 'music') return; pulses[n] = Math.max(pulses[n], .34 - n * .02); ctx.schedule(); }, n * 95); });
  $('#strum').addEventListener('click', strum);
  document.querySelectorAll('[data-chord]').forEach(button => button.addEventListener('click', () => {
    chord = button.dataset.chord;
    document.querySelectorAll('[data-chord]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    strings.forEach((b, i) => { b.dataset.muted = String(chords[chord][i] < 0); b.setAttribute('aria-label', chords[chord][i] < 0 ? t("这根弦在当前和弦中不发声", "This string is muted in the current chord") : t(`拨动 ${['e', 'B', 'G', 'D', 'A', 'E'][i]} 弦，${chords[chord][i]} 品，键盘 ${'ASDFGH'[i]}`, `Pluck ${['e', 'B', 'G', 'D', 'A', 'E'][i]}, fret ${chords[chord][i]}, keyboard ${'ASDFGH'[i]}`)); });
  }));
  strings.forEach(button => {
    const note = Number(button.dataset.note); let lastPointer = -Infinity;
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && sound.enabled) { lastPointer = performance.now(); pluck(note, .67); strummed(); } });
    button.addEventListener('click', event => { if (!event.detail || performance.now() - lastPointer > 110 || !sound.context) playGesture(note, 1); });
  });
  const stringBed = $('.string-bed'); let touchString = -1;
  stringBed.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return; event.preventDefault(); event.stopPropagation(); stringBed.setPointerCapture(event.pointerId);
    touchString = Number(event.target.closest('.string')?.dataset.note ?? -1); if (touchString >= 0) playGesture(touchString, .9);
  });
  stringBed.addEventListener('pointermove', event => {
    if (!stringBed.hasPointerCapture(event.pointerId)) return;
    const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest('.string'), note = hit ? Number(hit.dataset.note) : -1;
    if (note >= 0 && note !== touchString) playGesture(note, .8); touchString = note;
  });
  for (const name of ['pointerup', 'pointercancel']) stringBed.addEventListener(name, event => { touchString = -1; if (stringBed.hasPointerCapture(event.pointerId)) stringBed.releasePointerCapture(event.pointerId); });
  // A S D F G H pluck the strings and Space strums, only in this room.
  document.addEventListener('keydown', event => {
    if (ctx.active !== 'music' || $('#guitar-closeup').open) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.matches('input,textarea,[contenteditable=true]') || event.target.closest('[data-room-control]')) return;
    const note = 'asdfgh'.indexOf(event.key.toLowerCase()); if (note >= 0 && !event.repeat) { event.preventDefault(); playGesture(note, .9); return; }
    if (event.code === 'Space' && !event.repeat && !event.target.closest('button,a')) { event.preventDefault(); strum(); }
  });
}

function mountPedals() {
  const params = sound.params;
  const descriptions = {clean: t("干净的弦，留一点空气。", "Clean strings. A little room to breathe."), gold: t("温热一点，保留拨弦的棱角。", "A little warmth. Keep the edge."), blue: t("多一点沙砾，多一点冲动。", "A little grit. Follow the impulse."), harm: t("每个音，都有人轻轻和着。", "Every note gets a second voice."), night: t("弹完的音，也舍不得走。", "Let the last note linger.")};
  document.querySelectorAll('[data-pedal]').forEach(button => {
    const pedal = button.closest('.pedal'), release = () => pedal.classList.remove('stomping');
    // A footswitch engages under the foot, not on release; the click lands with the press.
    button.addEventListener('pointerdown', event => { if (event.button === 0) pedal.classList.add('stomping'); });
    for (const type of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) button.addEventListener(type, release);
    button.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') pedal.classList.add('stomping'); });
    button.addEventListener('keyup', release);
    button.addEventListener('click', () => {
      const key = button.dataset.pedal; params[key] = !params[key]; refreshEffects(true);
      if (sound.enabled && sound.rig) sound.rig.click(); navigator.vibrate?.(12);
      if (!pedal.classList.contains('stomping')) { pedal.classList.add('stomping'); setTimeout(release, 110); }
    });
  });
  document.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => {
    Object.assign(params, tones[button.dataset.tone], {volume: params.volume}); refreshEffects();
    document.querySelectorAll('[data-tone]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('#tone-caption').textContent = descriptions[button.dataset.tone];
  }));
  document.querySelectorAll('[data-param]').forEach(input => {
    const dial = input.closest('.dial'), min = Number(input.min), max = Number(input.max), step = Number(input.step) || 1;
    // Stepped knobs (KEY, SHIFT) click into each detent.
    const detented = (max - min) / step <= 12; let drag = null;
    function change(value) {
      const next = clamp(Math.round((value - min) / step) * step + min, min, max), key = input.dataset.param;
      if (next === params[key]) return;
      params[key] = next; refreshEffects(true);
      if (detented && sound.enabled && sound.rig) sound.rig.click(.35, 2.4);
    }
    const angleAt = e => { const r = input.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
    input.addEventListener('input', () => change(Number(input.value)));
    input.addEventListener('pointerdown', e => {
      if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); input.focus({preventScroll: true}); input.setPointerCapture(e.pointerId); dial.classList.add('dragging');
      const r = input.getBoundingClientRect();
      drag = {angle: Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) > r.width * .22 ? angleAt(e) : null, y: e.clientY, value: params[input.dataset.param], turned: 0};
    });
    input.addEventListener('pointermove', e => {
      if (!drag) return; e.stopPropagation();
      // Grab it like a real knob: going around the shaft turns it one to one across its 270° sweep.
      // Far from the shaft, or moving straight up and down, a vertical drag also works.
      const r = input.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      // Near the shaft the angle is meaningless, so it only counts once the pointer is out on the skirt.
      if (Math.hypot(dx, dy) > r.width * .22) {
        const angle = Math.atan2(dy, dx);
        if (drag.angle !== null) { let delta = angle - drag.angle; if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2; drag.turned += delta / (Math.PI * 1.5) * (max - min); }
        drag.angle = angle;
      } else drag.angle = null;
      const vertical = (drag.y - e.clientY) / (e.shiftKey ? 600 : 180) * (max - min);
      const value = drag.value + (Math.abs(drag.turned) > Math.abs(vertical) ? drag.turned : vertical);
      change(value);
    });
    function end(e) { drag = null; dial.classList.remove('dragging'); if (input.hasPointerCapture(e.pointerId)) input.releasePointerCapture(e.pointerId); }
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) input.addEventListener(type, end);
    input.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); change(params[input.dataset.param] - Math.sign(e.deltaY) * step); }, {passive: false});
    input.addEventListener('dblclick', () => change(defaultRig[input.dataset.param]));
  });
  const volume = $('#master-volume');
  volume.addEventListener('input', () => { params.volume = Number(volume.value); volume.nextElementSibling.value = volume.value; if (sound.rig) sound.rig.set({volume: sound.enabled ? params.volume : 0}); ctx.schedule(); });
}

function mountDeck() {
  const deck = $('.pedal-deck'); let deckDrag = null;
  const narrow = () => ctx.width <= 700;
  // The room captures touch gestures, so slide the mobile board explicitly.
  deck.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('input') || !narrow()) return;
    deckDrag = {id: event.pointerId, x: event.clientX, scroll: deck.scrollLeft, page: nearestPage(), moved: false};
  });
  deck.addEventListener('pointermove', event => {
    if (!deckDrag || deckDrag.id !== event.pointerId) return;
    const delta = event.clientX - deckDrag.x;
    if (Math.abs(delta) > 7 && !deckDrag.moved) { deckDrag.moved = true; deck.classList.add('sliding'); deck.setPointerCapture(event.pointerId); }
    if (deckDrag.moved) { event.preventDefault(); deck.scrollLeft = deckDrag.scroll - delta; }
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) deck.addEventListener(type, event => {
    if (!deckDrag || deckDrag.id !== event.pointerId) return;
    if (deckDrag.moved) { event.preventDefault(); const flick = deckDrag.scroll - deck.scrollLeft; pageTo(nearestPage() + (Math.abs(flick) > 40 && nearestPage() === deckDrag.page ? Math.sign(-flick) : 0)); }
    deckDrag = null; deck.classList.remove('sliding'); if (deck.hasPointerCapture(event.pointerId)) deck.releasePointerCapture(event.pointerId);
  });
  let wheelSnap = 0;
  deck.addEventListener('wheel', event => { if (!narrow() || event.target.closest('input')) return; event.preventDefault(); deck.scrollLeft += event.deltaX || event.deltaY; clearTimeout(wheelSnap); wheelSnap = setTimeout(() => pageTo(nearestPage()), 160); }, {passive: false});
  // On phones the board pages one pedal at a time; the tabs above it show and choose the centred pedal.
  const pages = [...deck.querySelectorAll('.pedal')], pageTabs = [...document.querySelectorAll('[data-pedal-page]')];
  const pageCentre = pedal => { const d = deck.getBoundingClientRect(), r = pedal.getBoundingClientRect(); return r.left - d.left + deck.scrollLeft + r.width / 2; };
  function nearestPage() { const mid = deck.scrollLeft + deck.clientWidth / 2; let best = 0; pages.forEach((pedal, i) => { if (Math.abs(pageCentre(pedal) - mid) < Math.abs(pageCentre(pages[best]) - mid)) best = i; }); return best; }
  function pageTo(index) { index = clamp(index, 0, pages.length - 1); deck.scrollTo({left: pageCentre(pages[index]) - deck.clientWidth / 2, behavior: ctx.motion ? 'smooth' : 'auto'}); markPage(index); }
  function markPage(index) {
    if (!narrow()) { delete deck.dataset.paged; pages.forEach(pedal => delete pedal.dataset.current); return; }
    deck.dataset.paged = ''; pages.forEach((pedal, i) => { if (i === index) pedal.dataset.current = ''; else delete pedal.dataset.current; });
    pageTabs.forEach((tab, i) => tab.setAttribute('aria-current', String(i === index)));
  }
  pageTabs.forEach((tab, i) => tab.addEventListener('click', () => pageTo(i)));
  let pageFrame = 0; deck.addEventListener('scroll', () => { cancelAnimationFrame(pageFrame); pageFrame = requestAnimationFrame(() => markPage(nearestPage())); }, {passive: true});
  // Keyboard focus on a knob or stomp brings its pedal to the middle.
  deck.addEventListener('focusin', event => { if (!narrow() || deckDrag) return; const i = pages.indexOf(event.target.closest('.pedal')); if (i >= 0 && i !== nearestPage()) pageTo(i); });
  addEventListener('resize', () => requestAnimationFrame(() => !narrow() ? markPage(0) : pageTo(nearestPage())));
  requestAnimationFrame(() => markPage(nearestPage()));
}

function mountLooper() {
  loopButton.addEventListener('click', async () => {
    if (recording || looping) { pauseLoop(); return; }
    if (!await sound.set(true)) return;
    if (loopNotes.length) playLoop();
    else { recording = true; recordStart = sound.context.currentTime; lastSecond = -1; setControl(loopButton, t("收好", "Finish"), 'stop'); loopUI('recording'); }
    ctx.schedule();
  });
  overdubButton.addEventListener('click', () => {
    if (!looping) return;
    if (overdub) { closeOverdub(); loopCaption.textContent = t("这一层收好了。继续弹吧。", "Layer saved. Keep playing."); loopUI('playing'); }
    else { overdub = true; overdubStartCount = loopNotes.length; overdubButton.setAttribute('aria-pressed', 'true'); setControl(overdubButton, t("收好这一层", "Keep layer"), 'check'); loopCaption.textContent = t("继续拨弦，新声音会加入循环。", "Keep playing. Add to the loop."); loopUI('overdub'); }
  });
  loopClear.addEventListener('click', () => { loopNotes = []; layers = 0; pauseLoop(); loopProgress.style.width = '0%'; loopBeats.forEach(b => b.classList.remove('lit')); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseLoop(); });
}

export default {
  place: 'music',
  mount(house) {
    ctx = house; sound = ctx.sound; t = ctx.t;
    loopButton = $('#loop'); loopClear = $('#loop-clear'); loopCaption = $('#loop-caption');
    overdubButton = $('#loop-overdub'); loopPanel = $('.loop-controls');
    loopBeats = [...document.querySelectorAll('.loop-beats i')]; strings = [...document.querySelectorAll('.string')];
    loopProgress = $('.loop-progress i'); layerLabel = $('#loop-layer');
    meterFill = $('.output-meter i'); meterLabel = $('#output-level'); vuMeter = $('.vu-meter');
    jamCanvas = $('#jam-strings'); jamCtx = jamCanvas.getContext('2d');
    mountStrings(); mountPedals(); mountDeck(); mountLooper();
    refreshEffects();
  },
  frame(now, dt) {
    pulses.forEach((v, i) => pulses[i] = v * Math.pow(ctx.motion ? .946 : .65, dt));
    runLoop(); updateMeter();
    return recording || looping || vu > -47.5 || pulses.some(p => p > .015);
  },
  // Not on the shared canvas: the strings have their own, laid over the photograph.
  paint(g, now) { drawJam(now); },
  // Another room's threads ring through these strings (the paths room, as open strings).
  async pluckFrom(place, index, strength = .5, wake = false) {
    if (ctx.active !== place || !Number.isInteger(index) || index < 0 || index > 5) return;
    if (wake && !await sound.set(true)) return;
    if (ctx.active === place) pluck(index, clamp(strength, 0, 1), true);
  },
};
