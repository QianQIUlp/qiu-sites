// Start the camera, navigation and sound controls before loading WebGL.
import './scene.js';
import './papers.js';
import './hints.js';
import './afternoon.js';

requestAnimationFrame(() => setTimeout(() => {
  // Explicit imports let Vite split and fingerprint each module and its assets.
  import('./guitar-model.js').catch(error => console.error('Guitar module:', error));
  import('./extra-rooms.js').catch(error => console.error('Room interactions:', error));
  import('./nine-rooms.js').catch(error => console.error('Paths and blind spots:', error));
}, 0));
