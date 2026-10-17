// 不赶时间 ("No hurry"): a small place where nothing needs to accumulate. A few "shoulds" on paper
// slips can be balled up and tossed into the hollow. (The afternoon that passes while you are still
// lives in afternoon.js, because its hour reaches every room.)
import {t as localize} from '../language.js';
import {$, still} from '../room-kit.js';


export default {
  place: 'idle',
  mount() {
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
  },
};
