// Small helpers several rooms share. Nothing here knows about any one room.
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const mix = (a, b, t) => a + (b - a) * t;
// Motion is off when the visitor (or their system) asked for a calm house.
export const still = () => document.body.dataset.motion === 'off';
export const found = key => document.dispatchEvent(new CustomEvent('found', {detail: key}));
export const $ = selector => document.querySelector(selector);

// A crisp 2D canvas at the device's pixel ratio, cleared and ready to draw in CSS pixels.
export function surface(canvas) {
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

// Two motions that belong to the object, not to the visitor's choice (neither changes a value):
// it leans a little toward a mouse that moves over it, and once, for a newcomer, it shows how it
// moves by itself and settles back (hints.js). `sway` eases both and asks for a redraw.
export function sway(stage, {reach, demo, here, span = 2600, floor = -Infinity, redraw}) {
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
  const cue = () => { if (!state.frame && !still() && here()) state.frame = requestAnimationFrame(tick); };
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || event.buttons) return;
    const box = stage.getBoundingClientRect();
    state.target = ((event.clientX - box.left) / box.width - .5) * reach;
    cue();
  });
  stage.addEventListener('pointerleave', () => { state.target = 0; cue(); });
  state.play = () => { if (still() || !here()) return; state.start = performance.now(); cue(); };
  return state;
}

// Dragging across a stage sets a range input, as if the stage itself were the slider.
export function dragInput(stage, input) {
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
