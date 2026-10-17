// 小屋中央 ("At home"): Qiu's real guitar, large and tilted, turning to follow the mouse. Clicking it
// picks it up into the 3D close-up (body, neck, headstock). The guitar never makes a sound here.
// Until the 3D model (guitar-model.js, with Three.js and its textures) has loaded, the photograph
// `guitar-home.webp` stands in at exactly the same place; the model loads once the page is idle or
// the visitor reaches for the guitar, whichever comes first.
let ctx, tilt = {x: 0, y: 0}, pointer = {x: 0, y: 0}, guitarInteraction = true;
const closeup = document.querySelector('#guitar-closeup'), guitarStage = document.querySelector('.guitar-stage');
let detailViews;

let modelRequested = false;
function loadModel() {
  if (modelRequested) return;
  modelRequested = true;
  import('../guitar-model.js').catch(error => console.error('Guitar module:', error));
}

function drawGuitar(g) {
  if (closeup.open && window.qiuGuitar) return;
  if (!window.qiuGuitar) return;
  const {width, height} = ctx, size = Math.min(height * .91, width * (width < 680 ? 1.3 : .83));
  const follow = ctx.motion ? 1 : .3;
  g.save(); g.translate(width * .505 + tilt.x * 7 * follow, height * .475 + tilt.y * 4 * follow);
  g.rotate(.32 + tilt.x * .025 * follow);
  window.qiuGuitar.drawHome(tilt.x * follow, tilt.y * follow);
  // Like everything else in the room, it casts away from the window: a long soft shadow, then a close one.
  g.shadowColor = 'rgba(74,50,26,.24)'; g.shadowBlur = size * .032; g.shadowOffsetX = -size * .03; g.shadowOffsetY = size * .04;
  g.drawImage(window.qiuGuitar.canvas, -size / 2, -size / 2, size, size);
  g.shadowColor = 'rgba(46,28,12,.26)'; g.shadowBlur = size * .006; g.shadowOffsetX = -size * .006; g.shadowOffsetY = size * .009;
  g.drawImage(window.qiuGuitar.canvas, -size / 2, -size / 2, size, size);
  document.body.classList.add('guitar-home-ready');
  g.restore();
}

function showDetail(name) {
  const [center, zoom, caption] = detailViews[name];
  const size = Math.min(guitarStage.clientHeight, guitarStage.clientWidth * 2.3) * zoom;
  guitarStage.style.setProperty('--photo-size', `${size}px`);
  guitarStage.style.setProperty('--photo-top', `${guitarStage.clientHeight / 2 - center * size}px`);
  guitarStage.style.setProperty('--photo-pivot', `${center * 100}%`);
  guitarStage.dataset.view = name;
  if (window.qiuGuitar) window.qiuGuitar.setDetail(name);
  document.querySelector('#guitar-status').textContent = caption;
  document.querySelectorAll('[data-guitar-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.guitarView === name)));
}

export default {
  place: 'home',
  mount(house) {
    ctx = house;
    const {t, room} = ctx;
    const guitarPhoto = document.querySelector('#guitar-photo');
    guitarPhoto.addEventListener('load', ctx.schedule);
    window.addEventListener('guitar-model-ready', ctx.schedule);
    guitarPhoto.addEventListener('error', () => { document.querySelector('#guitar-status').textContent = t("照片未能载入，请刷新页面。", "The photograph couldn’t load. Please refresh."); });
    detailViews = {body: [.79, 2.12, t("SH-1n / SH-16\n换成了自己的声音。", "SH-1n / SH-16\nA little closer to my own sound.")], neck: [.395, 2.55, t("枫木指板，二十二品。", "Maple fingerboard. Twenty-two frets.")], head: [.084, 4.8, t("BanG Dream!\n乐奈的那把。", "BanG Dream!\nRāna’s guitar.")], whole: [.5, .94, t("乐奈同款。也是我的这一把。", "Rāna’s model. My own guitar.")]};
    document.querySelectorAll('[data-open-guitar]').forEach(button => button.addEventListener('click', () => { loadModel(); closeup.showModal(); showDetail('body'); }));
    document.querySelector('#close-guitar').addEventListener('click', () => closeup.close());
    document.querySelectorAll('[data-guitar-view]').forEach(button => button.addEventListener('click', () => showDetail(button.dataset.guitarView)));
    new ResizeObserver(() => { if (closeup.open) showDetail(guitarStage.dataset.view || 'body'); }).observe(guitarStage);

    room.addEventListener('pointermove', event => {
      if (!ctx.motion || !guitarInteraction || ctx.active !== 'home' || event.pointerType !== 'mouse') return;
      const bounds = room.getBoundingClientRect();
      pointer.x = Math.min(1, Math.max(-1, ((event.clientX - bounds.left) / ctx.width - .505) * 3));
      pointer.y = Math.min(1, Math.max(-1, ((event.clientY - bounds.top) / ctx.height - .475) * 2));
      ctx.schedule();
    });
    room.addEventListener('pointerleave', () => { pointer = {x: 0, y: 0}; ctx.schedule(); });
    ctx.on('motion', (on, byButton) => { if (byButton) guitarInteraction = on; if (!on) pointer = {x: 0, y: 0}; });
    // Reaching for the guitar (any first touch or move in the room) starts the model at once.
    for (const type of ['pointermove', 'pointerdown', 'keydown']) room.addEventListener(type, loadModel, {once: true, passive: true});
  },
  leave() { pointer = {x: 0, y: 0}; },
  frame(now, dt, ease) {
    const follow = ctx.motion && guitarInteraction && ctx.active === 'home', tx = follow ? pointer.x : 0, ty = follow ? pointer.y : 0;
    tilt.x += (tx - tilt.x) * ease; tilt.y += (ty - tilt.y) * ease;
    return Math.abs(tilt.x - tx) > .004 || Math.abs(tilt.y - ty) > .004;
  },
  paint: g => drawGuitar(g),
  loadModel,
};
