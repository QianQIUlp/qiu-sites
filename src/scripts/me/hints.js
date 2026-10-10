// A quiet tutorial. Nothing explains itself up front: an object first shows what it can do
// (a page stirs, the room breathes toward the next corner), then a pencil note in Qiu's hand
// appears beside it. Doing the thing once erases the note, for good on this device.
const room = document.querySelector('#room');
const still = () => document.body.dataset.motion === 'off';
const KEY = 'me-found';

let known = new Set();
try { known = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
const shown = new Set();

export const isFound = key => known.has(key);
function found(key) {
  if (known.has(key)) return;
  known.add(key);
  try { localStorage.setItem(KEY, JSON.stringify([...known])); } catch {}
  erase(key);
}
document.addEventListener('found', event => found(event.detail));

function note(key) { return document.querySelector(`[data-note="${key}"]`); }
function write(key) {
  const el = note(key);
  if (!el || known.has(key) || el.classList.contains('written')) return;
  el.classList.toggle('instant', still());
  el.classList.add('written');
}
function erase(key) {
  const el = note(key);
  if (!el?.classList.contains('written')) return;
  el.classList.add('erased');
}

// What each room shows a newcomer, after how long, and which note follows.
const lessons = {
  home: {after: 5200, key: 'wander', demo: 'hint:nudge'},
  papers: {after: 1700, key: 'papers-light', demo: 'hint:stir', note: 'papers-light', write: 1500},
  idle: {after: 2400, key: 'idle-still', note: 'idle-still', write: 0},
};
let timer = 0, followUp = 0;
function arrive(place) {
  clearTimeout(timer); clearTimeout(followUp);
  const lesson = lessons[place];
  if (!lesson || known.has(lesson.key)) return;
  timer = setTimeout(() => {
    if (room.dataset.place !== place) return;
    // Each demonstration plays once per visit; the note stays until the thing is done.
    if (lesson.demo && !shown.has(place) && !still()) { shown.add(place); document.dispatchEvent(new Event(lesson.demo)); }
    if (lesson.note) followUp = setTimeout(() => room.dataset.place === place && write(lesson.note), still() ? 0 : lesson.write);
  }, lesson.after);
}
// Any movement restarts the room's patience: a newcomer who is busy is never interrupted.
function patience() {
  const place = room.dataset.place, lesson = lessons[place];
  if (!lesson || known.has(lesson.key)) return;
  if (lesson.note ? !note(lesson.note)?.classList.contains('written') : !shown.has(place)) arrive(place);
}
for (const type of ['pointerdown', 'pointermove', 'wheel', 'keydown']) room.addEventListener(type, patience, {passive: true});
document.addEventListener('roomchange', event => arrive(event.detail.place));
arrive(room.dataset.place);
