// A quiet tutorial, in every room. Nothing explains itself up front: once a newcomer has been
// still for a moment, an object first shows what it can do (a page stirs, the strings shiver, the
// ribbon turns a little on its own), then a pencil note in Qiu's hand appears beside it. Doing the
// thing once erases the note, for good on this device, and the room's next lesson (if any) waits
// its turn. Rooms play their demonstrations on `hint:*` events and report discoveries with `found`.
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
  // The next lesson in this room starts its own patient wait.
  arrive(room.dataset.place);
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

// What each room shows a newcomer, in order: how long it waits for stillness, the demonstration,
// and the note that follows it. `when` holds a lesson back until it makes sense (a line to pluck).
const lessons = {
  home: [{key: 'wander', after: 5200, demo: 'hint:nudge', note: 'wander', write: 1900}],
  papers: [{key: 'papers-light', after: 1700, demo: 'hint:stir', note: 'papers-light', write: 1500}],
  music: [{key: 'music-strings', after: 2600, demo: 'hint:strings', note: 'music-strings', write: 1300}],
  trace: [
    {key: 'trace-line', after: 1900, demo: 'hint:sketch', note: 'trace-line', write: 2300},
    {key: 'trace-pluck', after: 2200, demo: 'hint:quiver', note: 'trace-pluck', write: 900, when: () => document.querySelector('.draw-area.has-lines')},
    {key: 'trace-loop', after: 2600, demo: 'hint:ring', note: 'trace-loop', write: 2200, when: () => document.querySelector('.draw-area.has-lines')},
    {key: 'trace-cross', after: 3200, note: 'trace-cross', write: 0, when: () => +document.querySelector('.draw-area')?.dataset.lines >= 2},
  ],
  rethink: [
    {key: 'rethink-walk', after: 2200, demo: 'hint:ribbon', note: 'rethink-walk', write: 2000},
    {key: 'rethink-cut', after: 1800, demo: 'hint:snip', note: 'rethink-cut', write: 900, when: () => document.querySelector('.mobius-stage[data-complete="true"]')},
  ],
  // The sculpture already gives its own guided tour on arrival; the note waits for it to finish.
  work: [{key: 'work-cut', after: 14800, note: 'work-cut', write: 0}],
  idle: [
    {key: 'idle-still', after: 2400, note: 'idle-still', write: 0},
    {key: 'idle-letgo', after: 2200, demo: 'hint:breeze', note: 'idle-letgo', write: 1500, when: () => document.querySelector('[data-slip]:not([hidden])')},
  ],
  paths: [{key: 'paths-bend', after: 2200, demo: 'hint:threads', note: 'paths-bend', write: 1700}],
  blindspot: [{key: 'blind-angle', after: 2200, demo: 'hint:glance', note: 'blind-angle', write: 1900}],
};
const current = place => (lessons[place] || []).find(lesson => !known.has(lesson.key) && (!lesson.when || lesson.when()));

let timer = 0, followUp = 0;
function arrive(place) {
  clearTimeout(timer); clearTimeout(followUp);
  const lesson = current(place);
  if (!lesson) return;
  timer = setTimeout(() => {
    if (room.dataset.place !== place || current(place) !== lesson) return;
    // Each demonstration plays once per visit; the note stays until the thing is done.
    if (lesson.demo && !shown.has(lesson.key) && !still()) { shown.add(lesson.key); document.dispatchEvent(new Event(lesson.demo)); }
    if (lesson.note) followUp = setTimeout(() => room.dataset.place === place && write(lesson.note), still() ? 0 : lesson.write);
  }, lesson.after);
}
// Any movement restarts the room's patience: a newcomer who is busy is never interrupted.
function patience() {
  const place = room.dataset.place, lesson = current(place);
  if (!lesson) return;
  if (lesson.note ? !note(lesson.note)?.classList.contains('written') : !shown.has(lesson.key)) arrive(place);
}
for (const type of ['pointerdown', 'pointermove', 'wheel', 'keydown']) room.addEventListener(type, patience, {passive: true});
document.addEventListener('roomchange', event => arrive(event.detail.place));
document.addEventListener('hint:recheck', () => patience());
arrive(room.dataset.place);
