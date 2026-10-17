// The house's one sound system: the audio context, the pedal rig every room plays through, and the
// two Sound switches (the header and the strings room). Rooms reach it as `ctx.sound`. Nothing
// sounds until a visitor turns sound on or plays something that asks for it.
import {t} from './language.js';
import {setControl} from './icons.js';
import {createAudioRig, defaultRig} from './audio-engine.js';

// The four pedals in signal order: key, name, and the colour a room tints its strings with.
const pedals = [['gold', 'Centaur', '186,160,100'], ['blue', 'BD-2', '40,117,180'], ['harm', 'Harmonist', '128,140,152'], ['echo', 'After Hours', '58,122,114']];
const soundButton = document.querySelector('.audio-toggle'), localSound = document.querySelector('.sound-local');
let audio = null, rig = null, enabled = false, tailUntil = 0, wake = () => {};

export const sound = {
  // The pedal settings the rig plays with; the strings room turns them, every room hears them.
  params: {...defaultRig},
  get enabled() { return enabled; },
  get context() { return audio; },
  get rig() { return rig; },
  // Ready to make a sound right now.
  get live() { return enabled && !document.hidden && Boolean(audio) && audio.state === 'running'; },
  // Still ringing out: the scene keeps drawing (the VU needle) until the tail has gone.
  // What the strings room's pedals are doing right now, for rooms that show it: the engaged pedals'
  // names in signal order and the first one's colour (`rgb` is null with every pedal off).
  get board() {
    const on = pedals.filter(([key]) => sound.params[key]);
    return {names: on.map(pedal => pedal[1]), rgb: on[0]?.[2] ?? null, echo: sound.params.echo, harmony: sound.params.harm};
  },
  get ringing() { return enabled && Boolean(audio) && audio.currentTime < tailUntil; },
  tail(seconds) { if (audio) tailUntil = audio.currentTime + seconds; },
  apply() { if (rig) rig.set({...sound.params, volume: enabled ? sound.params.volume : 0}); },
  set,
  onChange(fn) { wake = fn; },
};

async function ensureAudio() {
  if (!audio) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw Error('Audio unavailable');
    audio = new Audio(); rig = createAudioRig(audio); rig.set({...sound.params, volume: 0}); rig.warm(window.qiuHour?.dusk || 0);
  }
  if (audio.state !== 'running') await audio.resume();
}
function soundUI() {
  soundButton.setAttribute('aria-pressed', String(enabled)); soundButton.querySelector('span').textContent = enabled ? t("声音开", "Sound on") : t("声音关", "Sound off");
  localSound.setAttribute('aria-pressed', String(enabled)); setControl(localSound, enabled ? t("声音开", "Sound on") : t("打开声音", "Sound on"), enabled ? 'southwest' : 'northeast');
}
async function set(value) {
  try { soundButton.disabled = localSound.disabled = true; await ensureAudio(); enabled = value; rig.set({volume: enabled ? sound.params.volume : 0}); soundUI(); wake(); return true; }
  catch { enabled = false; setControl(localSound, t("声音暂不可用", "Sound is unavailable"), null); soundButton.querySelector('span').textContent = t("声音暂不可用", "Sound is unavailable"); soundButton.setAttribute('aria-pressed', 'false'); localSound.setAttribute('aria-pressed', 'false'); return false; }
  finally { soundButton.disabled = localSound.disabled = false; }
}
soundButton.addEventListener('click', () => set(!enabled));
localSound.addEventListener('click', () => set(!enabled));
// Small sounds from the rooms themselves, heard only when sound is on.
document.addEventListener('roomsound', event => { if (!enabled || !rig || document.hidden) return; if (event.detail === 'lamp') rig.click(.55, .58); if (event.detail === 'crumple') rig.crumple?.(); if (event.detail === 'tick') rig.click(.16, 1.7); });
// The afternoon reaches every sound: the later it gets, the softer the house sounds (afternoon.js).
document.addEventListener('timeofday', event => rig?.warm(event.detail.dusk));
document.addEventListener('visibilitychange', () => { if (rig) rig.set({volume: !document.hidden && enabled ? sound.params.volume : 0}); });
