// The house's one sound system: the audio context, the pedal rig every room plays through, and the
// two Sound switches (the header and the strings room). Rooms reach it as `ctx.sound`. Nothing
// sounds until a visitor turns sound on or plays something that asks for it.
import {t} from './language.js';
import {setControl} from './icons.js';
import {createAudioRig, defaultRig} from './audio-engine.js';

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
    audio = new Audio(); rig = createAudioRig(audio); rig.set({...sound.params, volume: 0});
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
document.addEventListener('visibilitychange', () => { if (rig) rig.set({volume: !document.hidden && enabled ? sound.params.volume : 0}); });
