// 未走之路 ("Paths untaken"): a ruled surface. Every filament shares two ends, but no two take the
// same route. Brushed, the threads ring like harp strings; clicked, one becomes your path.
import {t as localize} from '../language.js';
import {setIcon} from '../icons.js';
import {$, clamp, mix, still, found, surface, sway, dragInput} from '../room-kit.js';

const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono');
const red = '#e83d27', paper = '#eeede7';

const room = {
  place: 'paths',
  mount(ctx) {
    const pathCanvas = $('#path-field'), bendInput = $('#path-bend'), pathPlay = $('#path-play');
    const routes = [localize("穿过去", "Through"), localize("绕一段", "Around"), localize("停一下", "A pause")];
    const routeNotes = [[5, 4, 3, 2, 1, 0], [5, 2, 4, 1, 3, 0], [5, 3, 3, 2, 1, 0]];
    let route = 0, shape = 0, bend = 0, pathFrame = 0, pathLast = 0, playback = null;
    // Every thread is a way through. Brushed, they ring like harp strings (when sound is on); clicked,
    // one becomes your path, and the red route and the listening follow it. `chosen` is its offset.
    const STRANDS = 76, glow = new Float32Array(STRANDS);
    let chosen = null, strandLines = [];

    function routePoint(t, variant, offset = null) {
      const envelope = Math.pow(Math.sin(Math.PI * t), .85);
      let x = (t - .5) * 2.85;
      let y = Math.sin(t * Math.PI * 2) * [.16, .53, .15][variant];
      let z = Math.sin(t * Math.PI) * [.05, -.27, .3][variant];
      y += envelope * (bend + threads.value) * Math.cos(t * Math.PI * 1.7) * .45;
      if (variant === 2) {
        x += Math.sin(t * Math.PI * 2) * .32;
        y += Math.sin(t * Math.PI * 4) * envelope * .22;
      }
      if (offset !== null) {
        const angle = offset * Math.PI * 2 + t * [2.7, 4.2, 7.7][variant] + (bend + threads.value) * t;
        const radius = envelope * [.43, .49, .41][variant];
        y += Math.cos(angle) * radius;
        z += Math.sin(angle) * radius;
      }
      return {x, y, z};
    }

    function pathPoint(t, offset = null) {
      const a = Math.floor(shape), b = Math.ceil(shape), fraction = shape - a;
      const p = routePoint(t, a, offset), q = routePoint(t, b, offset);
      return {x: mix(p.x, q.x, fraction), y: mix(p.y, q.y, fraction), z: mix(p.z, q.z, fraction)};
    }

    function drawPaths() {
      const {ctx, width, height} = surface(pathCanvas);
      const scale = Math.min(width / 3.65, height / 2.3);
      const project = point => {
        let {x, y, z} = point;
        [y, z] = [y * .92 - z * .39, y * .39 + z * .92];
        [x, y] = [x * .93 + y * .37, -x * .37 + y * .93];
        return {x: width * .51 + x * scale, y: height * .47 + y * scale, z};
      };
      ctx.save();
      ctx.translate(width * .51, height * .8);
      ctx.scale(1, .13);
      const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, width * .37);
      shadow.addColorStop(0, '#34372913'); shadow.addColorStop(1, '#34372900');
      ctx.fillStyle = shadow;ctx.fillRect(-width / 2, -width / 2, width, width);
      ctx.restore();

      // Order the hairlines by depth; the front strands catch more light.
      const strands = Array.from({length: STRANDS}, (_, i) => ({i, z: pathPoint(.5, i / STRANDS).z})).sort((a, b) => a.z - b.z);
      strandLines = [];
      for (const {i, z} of strands) {
        ctx.beginPath();
        const line = [];
        for (let j = 0; j <= 100; j++) {
          const p = project(pathPoint(j / 100, i / STRANDS));
          line.push(p);
          if (!j) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        strandLines[i] = line;
        ctx.strokeStyle = i % 13 === 0 ? '#a28c646b' : `rgba(61,68,52,${.2 + (z + .7) * .19})`;
        ctx.lineWidth = i % 13 === 0 ? .95 : .6;ctx.stroke();
        if (glow[i] > .02) { ctx.strokeStyle = `rgba(232,61,39,${.25 + glow[i] * .7})`;ctx.lineWidth = .7 + glow[i] * 1.3;ctx.stroke(); }
      }
      const progress = playback ? playback.progress : 1;
      ctx.beginPath();
      for (let i = 0; i <= 130; i++) {
        const p = project(pathPoint(i / 130, chosen));
        if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#e83d2745';ctx.lineWidth = 1.2;ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= 130; i++) {
        const p = project(pathPoint(i / 130 * progress, chosen));
        if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = red;ctx.lineWidth = 1.65;ctx.stroke();
      for (const [t, label] of [[0, localize("始 / 00", "START / 00")], [1, localize("终 / 01", "END / 01")]]) {
        const p = project(pathPoint(t));
        ctx.beginPath();ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = paper;ctx.fill();ctx.strokeStyle = '#73756b80';ctx.lineWidth = .65;ctx.stroke();
        ctx.beginPath();ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
        ctx.font = `8px ${mono}`;ctx.fillStyle = '#73756b';
        ctx.textAlign = t ? 'right' : 'left';ctx.fillText(label, p.x + (t ? -12 : 12), p.y + (t ? -18 : 24));
      }
      ctx.textAlign = 'left';
      if (playback) {
        const p = project(pathPoint(progress, chosen));
        ctx.beginPath();ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);ctx.fillStyle = '#e83d2719';ctx.fill();
        ctx.beginPath();ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
        ctx.strokeStyle = paper;ctx.lineWidth = 1.5;ctx.stroke();
      }
    }

    // The threads sound through the strings room's open strings (when sound is on).
    const pluck = (index, strength, wake = false) => ctx.use('music').then(music => music?.pluckFrom('paths', index, strength, wake));
    const note = (index, wake = false) => pluck(index, .52, wake);
    function stopPath() {
      playback = null;
      pathPlay.setAttribute('aria-pressed', 'false');
      pathPlay.setAttribute('aria-label', localize("听这条路", "Listen to this path"));
      $('#path-play-label').textContent = localize("听这条路", "Listen to this path");
      setIcon(pathPlay, 'play');
    }
    function playPath(listen) {
      stopPath();
      playback = {elapsed: 0, progress: 0, lastNote: 0, listen};
      if (listen) {
        note(routeNotes[route][0], true);
        pathPlay.setAttribute('aria-pressed', 'true');pathPlay.setAttribute('aria-label', localize("停止演奏", "Stop playing"));
        $('#path-play-label').textContent = localize("这一刻，在经过", "This moment, passing through");setIcon(pathPlay, 'pause');
      }
      schedulePaths();
    }
    function framePaths(now) {
      pathFrame = 0;
      const dt = Math.min(64, now - (pathLast || now));pathLast = now;
      const ease = still() ? 1 : 1 - Math.exp(-dt / 140);
      shape += (route - shape) * ease;bend += (+bendInput.value / 100 - bend) * ease;
      if (Math.abs(route - shape) < .001) shape = route;
      if (playback) {
        playback.elapsed += dt;
        const duration = route === 2 ? 6500 : 4800;
        const time = clamp(playback.elapsed / duration, 0, 1);
        // The third route holds its breath in the middle, then still arrives.
        playback.progress = route === 2 ? time < .35 ? time / .35 * .46 : time < .6 ? .46 : .46 + (time - .6) / .4 * .54 : time;
        const nextNote = Math.min(5, Math.floor(playback.progress * 6));
        if (nextNote > playback.lastNote) {
          if (playback.listen) note(routeNotes[route][nextNote]);
          playback.lastNote = nextNote;
        }
        if (time === 1) {
          stopPath();$('#path-status').textContent = localize("终点相同。这一段路，是刚才的你选的。", "The same ending. You chose the way here.");
        }
      }
      let ringing = false;
      glow.forEach((value, i) => { glow[i] = value > .02 ? value * Math.pow(.965, dt / 16) : 0; ringing ||= glow[i] > 0; });
      drawPaths();
      if (playback || ringing || Math.abs(route - shape) > .001 || Math.abs(+bendInput.value / 100 - bend) > .001) schedulePaths();
    }
    function schedulePaths() {
      if (!pathFrame && !document.hidden && ctx.active === 'paths') pathFrame = requestAnimationFrame(framePaths);
    }
    document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => {
      route = +button.dataset.route;chosen = null;
      document.querySelectorAll('[data-route]').forEach(node => node.setAttribute('aria-pressed', String(node === button)));
      $('#path-measure').textContent = `0${route + 1} / ${routes[route]}`;
      $('#path-status').textContent = [localize("向前，也可以是一种选择。", "Straight ahead can be a choice, too."), localize("多经过一点，不急着抵达。", "Take the longer way. No hurry to arrive."), localize("停顿，也在这条路里面。", "A pause belongs to the path, too.")][route];
      playPath(false);
    }));
    pathPlay.addEventListener('click', () => playback?.listen ? stopPath() : playPath(true));
    bendInput.addEventListener('input', () => {stopPath();schedulePaths();if (Math.abs(+bendInput.value) > 25) found('paths-bend');});
    dragInput($('.path-instrument'), bendInput);
    const pathStage = $('.path-instrument');
    function strandAt(event, reach = 9) {
      const box = pathCanvas.getBoundingClientRect(), x = event.clientX - box.left, y = event.clientY - box.top;
      let hit = -1, best = reach;
      strandLines.forEach((line, i) => {
        for (let j = 4; j < line.length - 4; j++) { const d = Math.hypot(line[j].x - x, line[j].y - y); if (d < best) { best = d; hit = i; } }
      });
      return hit;
    }
    // Lower threads sound lower: six strings' worth of pitch spread across the bundle.
    const ring = (i, wake = false) => { glow[i] = 1;pluck(5 - Math.min(5, Math.floor(i / STRANDS * 6)), .34, wake);schedulePaths(); };
    let lastStrand = -1, pathPress = null;
    pathStage.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || event.buttons) return;
      const i = strandAt(event);
      if (i >= 0 && i !== lastStrand) ring(i);
      lastStrand = i;
    });
    pathStage.addEventListener('pointerleave', () => { lastStrand = -1; });
    pathStage.addEventListener('pointerdown', event => { pathPress = {x: event.clientX, y: event.clientY}; });
    pathStage.addEventListener('pointerup', event => {
      if (!pathPress || Math.hypot(event.clientX - pathPress.x, event.clientY - pathPress.y) > 6) return;
      pathPress = null;
      const i = strandAt(event, 14);
      if (i < 0) return;
      // The chosen thread becomes the red route; choosing it again lets it go.
      chosen = chosen === i / STRANDS ? null : i / STRANDS;
      ring(i, true);stopPath();
      $('#path-status').textContent = chosen === null ? localize("还没有走过的路，都在这里。", "The paths you haven’t taken are still here.") : localize(`第 ${i + 1} 条路，共 ${STRANDS} 条。终点一样。`, `Way ${i + 1} of ${STRANDS}. The same ending.`);
      found('paths-pick');
      schedulePaths();
    });
    document.addEventListener('hint:shimmer', () => {
      if (still() || ctx.active !== 'paths') return;
      for (let i = 0; i < STRANDS; i += 2) setTimeout(() => { glow[i] = Math.max(glow[i], .55);schedulePaths(); }, i * 16);
    });
    const threads = sway($('.path-instrument'), {reach: .2, demo: .62, here: () => ctx.active === 'paths', redraw: () => drawPaths()});
    document.addEventListener('hint:threads', () => threads.play());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {cancelAnimationFrame(pathFrame);pathFrame = pathLast = 0;stopPath();}
      else schedulePaths();
    });
    new ResizeObserver(() => drawPaths()).observe(ctx.room);
    document.fonts.ready.then(() => drawPaths());
    drawPaths();
    room.enter = () => schedulePaths();
    room.leave = () => {cancelAnimationFrame(pathFrame);pathFrame = pathLast = 0;stopPath();};
  },
};
export default room;
