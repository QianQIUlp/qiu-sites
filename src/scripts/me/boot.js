// The homepage starts with the home room alone: the camera, the room bar, the sound switch and
// the guitar's photograph. Every other room is its own module, loaded and woken (its markup
// leaves `data-asleep`, so its fonts and images load) once the page has loaded and is idle, or
// as soon as the camera heads its way, whichever comes first.
import {define, start, wakeAll} from './scene.js';
import home from './rooms/home.js';
import './hints.js';
import './afternoon.js';

define('home', async () => ({default: home}));
// Explicit imports let Vite split and fingerprint each room and its assets.
define('papers', () => import('./rooms/papers.js'));
define('music', () => import('./rooms/music.js'));
define('trace', () => import('./rooms/trace.js'));
define('rethink', () => import('./rooms/rethink.js'));
define('work', () => import('./rooms/work.js'));
define('idle', () => import('./rooms/idle.js'));
define('paths', () => import('./rooms/paths.js'));
define('blindspot', () => import('./rooms/blindspot.js'));
start();

const afterLoad = fn => document.readyState === 'complete' ? fn() : addEventListener('load', fn, {once: true});
const idle = window.requestIdleCallback || (fn => setTimeout(fn, 200));
afterLoad(() => idle(() => { wakeAll(); home.loadModel(); }, {timeout: 1500}));
