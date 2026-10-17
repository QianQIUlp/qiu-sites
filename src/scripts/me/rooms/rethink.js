// 另一面: a Möbius strip, one surface pretending to have two. A red dot (a thought) can be pushed
// along its middle and leaves a pencil line. After one lap the line runs "behind" where it began,
// seen faintly through the paper; after two it is on both sides at once, because there is only one.
// Then the dot becomes a pair of scissors: cut along the line and the strip does not fall into two
// halves. It opens into one loop, twice as long, with two full twists.
import {t as localize} from '../language.js';
import {$, clamp, still} from '../room-kit.js';

const sans = getComputedStyle(document.documentElement).getPropertyValue('--sans');

export default {
  place: 'rethink',
  mount() {
    const ribbon = $('#mobius');
    const ribbonStage = $('.mobius-stage');
    const ribbonSection = ribbonStage.closest('.place');
    const ribbonContext = ribbon.getContext('2d');
    const travelInput = $('#thought-angle');
    const LAP = 720, HALF = .36, GAP = .028, STAGES = [0, 240, 480, LAP];
    // Where the dot starts: the front of the lowest stretch of strip, as first seen.
    const START = 2.4;
    const thoughts = [
      [localize("起初，我以为", "At first, I thought"), localize("「有条件的善意不是善意，是定价。」", "“Conditional kindness isn’t kindness. It’s a price.”"), localize("好记、锋利、适合转发。问题是它错了，至少是偷懒。", "Sharp. Catchy. Easy to share. The trouble is, it was wrong. Or at least, lazy.")],
      [localize("后来，把二分法拆开", "Then, I questioned the either/or"), localize("「真实关系几乎都是混合态。」", "“Real relationships are almost always a mixture.”"), localize("教练可能真的欣赏我练得好，同时也真想多赚这笔钱。这两件事根本不互斥。", "A coach may admire my progress and want to earn more. Both can be true.")],
      [localize("再往里，看见自己", "Further in, I found myself"), localize("「我为什么那么想追到一个让自己舒服的答案？」", "“Why was I so eager for an answer that felt comfortable?”"), localize("读信号，读结构，最后也读那个急着得出结论的自己。", "Read the signals, the situation, and the part of me rushing to a conclusion.")],
      [localize("沿着中线剪开", "Cut down the middle"), localize("「它没有分成两半，变成了更大的一圈。」", "“It didn’t fall into two halves. It became one bigger loop.”"), localize("把一件事劈成“对”和“错”，往往也是这样。", "Split a judgement into right and wrong, and it often goes the same way.")]
    ];
    const ease = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    const mobius = (u, v) => { const c = Math.cos(u / 2); return [(1 + v * c) * Math.cos(u), (1 + v * c) * Math.sin(u), v * Math.sin(u / 2)]; };
    // The cut strip, u over two laps and s across what is left of one half; it relaxes into a loop
    // with two full twists. Both are closed bands on the same grid, so one can become the other.
    function opened(u, s, k) {
      const a = mobius(u, GAP + s * (HALF - GAP));
      if (!k) return a;
      const o = (s - .5) * .46, r = 1.42 + o * Math.cos(u), b = [r * Math.cos(u / 2), r * Math.sin(u / 2), o * Math.sin(u)];
      return a.map((x, i) => x + (b[i] - x) * k);
    }

    let travel = 0, yaw = 0, thoughtIndex = -1, ribbonFrame = 0, view = null, bead = null;
    // Motions that are not the visitor's own and never move the thought: the ribbon leans after a mouse,
    // and for a newcomer the dot takes a few steps by itself and walks back, or the scissors snip the
    // air (hints.js). They are added to what is drawn only.
    let lean = 0, leanTarget = 0, walk = 0, walkStart = 0, snipStart = 0, motionFrame = 0, motionLast = 0;
    let sliced = 0, slicing = 0, open = 0, openTarget = 0, tween = null;
    const whole = () => !sliced && !slicing;

    function drawRibbon() {
      ribbonFrame = 0;
      const width = ribbonStage.clientWidth, height = ribbonStage.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (ribbon.width !== Math.round(width * dpr) || ribbon.height !== Math.round(height * dpr)) {
        ribbon.width = Math.round(width * dpr);
        ribbon.height = Math.round(height * dpr);
      }
      const ctx = ribbonContext;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const k = ease(open), turn = (yaw + lean) / 180 * Math.PI - .28, pitch = .9, roll = -.32;
      const scale = Math.min(width / 3.45, height / 2.65) * (1 - .27 * k);
      const project = ([x, y, z]) => {
        [x, z] = [x * Math.cos(turn) + z * Math.sin(turn), z * Math.cos(turn) - x * Math.sin(turn)];
        [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];
        [x, y] = [x * Math.cos(roll) - y * Math.sin(roll), x * Math.sin(roll) + y * Math.cos(roll)];
        const perspective = 5 / (5 + z);
        return {x: width * .5 + x * scale * perspective, y: height * .48 + y * scale * perspective, z};
      };
      view = project;
      const pieces = [];
      const surface = (count, strips, lapU, at) => {
        for (let i = 0; i < count; i++) {
          const u = i / count * lapU, next = (i + 1) / count * lapU;
          for (let j = 0; j < strips; j++) {
            const points = [at(u, j / strips), at(next, j / strips), at(next, (j + 1) / strips), at(u, (j + 1) / strips)].map(project);
            const a = points[1], b = points[0], c = points[3];
            const face = (a.x - b.x) * (c.y - b.y) - (a.y - b.y) * (c.x - b.x);
            const shade = Math.round(232 + 12 * Math.sin(u + turn) + (face < 0 ? -17 : 0));
            const z = points.reduce((sum, p) => sum + p.z, 0) / 4;
            pieces.push({points, z, shade});
            // Edges go on top of every patch at their depth, so neighbouring patches never nick them.
            if (j === 0) pieces.push({edge: [points[0], points[1]], raw: strips === 3, z: z - .08});
            if (j === strips - 1) pieces.push({edge: [points[2], points[3]], z: z - .08});
          }
        }
      };
      if (sliced < 1) surface(150, 6, Math.PI * 2, (u, s) => mobius(u, -HALF + 2 * HALF * s));
      else surface(300, 3, Math.PI * 4, (u, s) => opened(u, s, k));

      // The pencil line along the middle, on whichever side it was drawn. Where that side faces away,
      // it shows through the paper, faint.
      const sideOf = u => {
        const p = project(mobius(u, 0)), a = project(mobius(u + .01, 0)), b = project(mobius(u, .01));
        return {p, facing: (a.x - p.x) * (b.y - p.y) - (a.y - p.y) * (b.x - p.x) > 0, tangent: Math.atan2(a.y - p.y, a.x - p.x)};
      };
      const shown = sliced < 1 ? Math.min(LAP, travel + walk) / 180 * Math.PI : 0, slit = slicing ? sliced * Math.PI * 4 : 0;
      for (let u = 0, du = Math.PI * 4 / 300; u < Math.max(shown, slit) - 1e-6; u += du) {
        const end = Math.min(u + du, Math.max(shown, slit)), a = sideOf(START + u), b = project(mobius(START + end, 0));
        pieces.push({line: [a.p, b], facing: a.facing, slit: u < slit, z: (a.p.z + b.z) / 2 - .003});
      }
      bead = null;
      if (whole() || slicing && sliced < 1) {
        const u = slicing ? slit : Math.min(LAP, travel + walk) / 180 * Math.PI, side = sideOf(START + u);
        bead = {...side, scissors: travel >= LAP - 1 || slicing};
      }
      pieces.sort((a, b) => b.z - a.z);
      for (const piece of pieces) {
        if (piece.line) {
          const [a, b] = piece.line;
          ctx.beginPath();ctx.moveTo(a.x, a.y);ctx.lineTo(b.x, b.y);ctx.lineCap = 'round';
          if (piece.slit) { ctx.strokeStyle = 'rgba(38,34,30,.9)';ctx.lineWidth = 1.7; }
          else { ctx.strokeStyle = piece.facing ? 'rgba(44,46,40,.86)' : 'rgba(44,46,40,.24)';ctx.lineWidth = piece.facing ? 1.7 : 1.2; }
          ctx.stroke();ctx.lineCap = 'butt';
          continue;
        }
        if (piece.edge) {
          // A Möbius strip has a single edge, red all the way round. Cut, it gains a raw pencil one.
          const [a, b] = piece.edge;
          ctx.beginPath();ctx.moveTo(a.x, a.y);ctx.lineTo(b.x, b.y);ctx.lineCap = 'round';
          ctx.strokeStyle = piece.raw ? 'rgba(58,60,54,.6)' : '#e83d27';ctx.lineWidth = piece.raw ? .9 : 1.6;ctx.stroke();ctx.lineCap = 'butt';
          continue;
        }
        const {points, shade} = piece;
        ctx.beginPath();ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fillStyle = `rgb(${shade},${shade + 1},${shade - 13})`;
        ctx.strokeStyle = ctx.fillStyle;ctx.lineWidth = .7;
        ctx.fill();ctx.stroke();
      }
      // The dot is drawn last; where a nearer stretch of strip hides it, it only shows through.
      if (bead) drawBead(ctx, {...bead, facing: bead.facing && !hidden(pieces, bead.p)}, scale);
      if (sliced < 1 && !open) printWords(ctx, pieces, project, scale);
      placeNotes();
    }
    function drawBead(ctx, {p, facing, tangent, scissors}, scale) {
      ctx.save();ctx.translate(p.x, p.y);ctx.scale(scale / 150, scale / 150);
      if (!scissors) {
        if (facing) { ctx.shadowColor = 'rgba(70,30,20,.35)';ctx.shadowBlur = 5;ctx.shadowOffsetY = 2; }
        ctx.beginPath();ctx.arc(0, 0, facing ? 7 : 6, 0, Math.PI * 2);
        ctx.fillStyle = facing ? '#e83d27' : 'rgba(232,61,39,.3)';ctx.fill();ctx.shadowColor = 'transparent';
        if (facing) { ctx.strokeStyle = 'rgba(255,250,240,.92)';ctx.lineWidth = 1.6;ctx.stroke(); }
      } else {
        // Small tailor's scissors lying along the line, blades forward; they snip as they sliced.
        const now = performance.now(), snipping = slicing ? (now / 90) % (Math.PI * 2) : snipStart ? (now - snipStart) / 110 : 0;
        const gape = .14 + .2 * Math.abs(Math.sin(snipping));
        const ink = facing ? '#2f302b' : 'rgba(47,48,43,.4)';
        ctx.rotate(tangent);ctx.scale(1.5, 1.5);ctx.strokeStyle = ink;ctx.fillStyle = ink;ctx.lineWidth = 1.1;ctx.lineCap = 'round';
        if (facing) { ctx.shadowColor = 'rgba(40,30,20,.3)';ctx.shadowBlur = 3;ctx.shadowOffsetY = 1.5; }
        [-1, 1].forEach(side => {
          ctx.save();ctx.rotate(side * gape);
          // A long tapering blade ahead of the pivot; behind it, a shank and an oval finger loop.
          ctx.beginPath();ctx.moveTo(-2, side * -.2);ctx.lineTo(4, side * -1.6);ctx.lineTo(18, side * -.15);ctx.lineTo(18, 0);ctx.lineTo(-2, side * .9);ctx.closePath();ctx.fill();
          ctx.beginPath();ctx.moveTo(-1.5, side * .6);ctx.lineTo(-6, side * 2.2);ctx.stroke();
          ctx.beginPath();ctx.ellipse(-9.6, side * 3.3, 3.9, 2.5, side * .35, 0, Math.PI * 2);ctx.stroke();
          ctx.restore();
        });
        ctx.shadowColor = 'transparent';
        ctx.beginPath();ctx.arc(0, 0, 1.25, 0, Math.PI * 2);ctx.fillStyle = '#e83d27';ctx.fill();
      }
      ctx.restore();
    }
    // Whether a nearer patch of strip lies over a point.
    const hidden = (pieces, point) => pieces.some(piece => {
      if (!piece.points || piece.z >= point.z - .1) return false;
      const sides = piece.points.map((a, i) => {
        const b = piece.points[(i + 1) % 4];
        return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
      });
      return sides.every(side => side >= 0) || sides.every(side => side <= 0);
    });
    // Print only on an exposed patch; drawing whole words avoids sliced glyphs at mesh seams.
    function printWords(ctx, pieces, project, scale) {
      const covered = point => hidden(pieces, point);
      [localize("我以为", "I thought"), localize("也可能", "Perhaps"), localize("再想想", "Think again"), localize("不一定", "Not always")].forEach((word, i) => {
        const u = .5 + i * Math.PI / 2, v = .2;
        const p = project(mobius(u, v)), t = project(mobius(u + .015, v)), a = project(mobius(u, v + .02));
        const tx = (t.x - p.x) / .015 / scale, ty = (t.y - p.y) / .015 / scale;
        let ax = (a.x - p.x) / .02 / scale, ay = (a.y - p.y) / .02 / scale;
        const face = tx * ay - ty * ax;
        if (Math.abs(face) < .22 || [-.16, 0, .16].some(offset => covered(project(mobius(u + offset, v))))) return;
        if (face < 0) { ax = -ax; ay = -ay; }
        ctx.save();ctx.transform(tx, ty, ax, ay, p.x, p.y);
        ctx.fillStyle = '#51573e';
        ctx.font = `${Math.max(10, scale * .075)}px ${sans}`;
        ctx.textAlign = 'center';ctx.textBaseline = 'middle';ctx.fillText(word, 0, 0);ctx.restore();
      });
    }
    // The two pencil notes follow the dot, wherever the visitor has turned the ribbon.
    function placeNotes() {
      if (!bead) return;
      const stage = ribbonStage.getBoundingClientRect(), room = ribbonSection.getBoundingClientRect();
      const x = stage.left - room.left + bead.p.x, y = stage.top - room.top + bead.p.y;
      ribbonSection.querySelectorAll('[data-note^="rethink-"]').forEach(note => {
        note.style.left = `${clamp(x - note.offsetWidth - 10, 8, room.width - note.offsetWidth - 8)}px`;
        note.style.top = `${y - note.offsetHeight - 12}px`;
      });
    }

    function tick(now) {
      motionFrame = 0;
      const dt = Math.min(64, now - (motionLast || now)); motionLast = now;
      lean += (leanTarget - lean) * (1 - Math.exp(-dt / 260));
      if (walkStart) {
        // A few steps forward along the middle and back, as if testing the way.
        const t = Math.min(1, (now - walkStart) / 2800);
        walk = 64 * Math.sin(Math.PI * t) ** 2;
        if (t === 1) { walkStart = 0; walk = 0; }
      }
      if (snipStart && now - snipStart > 1400) snipStart = 0;
      if (tween) {
        const t = Math.min(1, (now - tween.start) / tween.duration);
        setTravel(tween.from + (tween.to - tween.from) * ease(t));
        if (t === 1) tween = null;
      }
      if (slicing && sliced < 1) {
        sliced = Math.min(1, (now - slicing) / 1900);
        if (sliced === 1) { slicing = 0; openTarget = 1; showThought(); }
      }
      if (open !== openTarget) {
        open = openTarget > open ? Math.min(openTarget, open + dt / 1500) : Math.max(openTarget, open - dt / 1100);
        // Taped back together: the line is rubbed out with it.
        if (!open && !openTarget) { sliced = 0; setTravel(0); }
      }
      if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon);
      if (walkStart || snipStart || tween || slicing || open !== openTarget || Math.abs(leanTarget - lean) > .05) motionFrame = requestAnimationFrame(tick);
      else { lean = leanTarget; motionLast = 0; }
    }
    const cue = () => { if (!motionFrame) motionFrame = requestAnimationFrame(tick); };
    const turnLabel = $('#turn-thought').firstChild, turnText = turnLabel.textContent;
    function showThought() {
      turnLabel.textContent = sliced === 1 ? localize('粘回去 ', 'Tape it back ') : turnText;
      const next = sliced === 1 ? 3 : travel < STAGES[1] ? 0 : travel < STAGES[2] ? 1 : 2;
      if (next === thoughtIndex) return;
      thoughtIndex = next;
      ['#thought-kicker', '#thought-quote', '#thought-after'].forEach((id, i) => $(id).textContent = thoughts[next][i]);
    }
    function setTravel(value) {
      const before = travel;
      travel = clamp(value, 0, LAP);travelInput.value = travel;
      if (travel >= 90 && before < 90 && !tween?.quiet) document.dispatchEvent(new CustomEvent('found', {detail: 'rethink-walk'}));
      const complete = travel >= LAP - 1;
      if (complete !== (ribbonStage.dataset.complete === 'true')) {
        ribbonStage.dataset.complete = complete;
        if (complete) document.dispatchEvent(new Event('hint:recheck'));
      }
      showThought();
      if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon);
    }
    function travelTo(to, quiet = false) {
      if (still()) { setTravel(to); return; }
      tween = {from: travel, to, start: performance.now(), duration: 500 + Math.abs(to - travel) * 2.2, quiet};cue();
    }
    function startSlice() {
      if (!whole()) return;
      document.dispatchEvent(new CustomEvent('found', {detail: 'rethink-cut'}));
      if (still()) { sliced = 1; open = openTarget = 1; showThought(); if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon); return; }
      slicing = performance.now();cue();
    }

    // Drag the dot to push the thought along; drag anywhere else to turn the ribbon.
    let drag = null;
    const local = event => { const box = ribbonStage.getBoundingClientRect(); return {x: event.clientX - box.left, y: event.clientY - box.top}; };
    const onBead = point => bead && Math.hypot(point.x - bead.p.x, point.y - bead.p.y) < 22;
    ribbonStage.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button,a,input')) return;
      ribbonStage.setPointerCapture(event.pointerId);
      const point = local(event);
      if (whole() && onBead(point)) {
        if (travel >= LAP - 1) { startSlice(); return; }
        tween = null;drag = {id: event.pointerId, bead: true};
      } else drag = {id: event.pointerId, x: event.clientX, yaw};
      ribbonStage.classList.add('held');
    });
    ribbonStage.addEventListener('pointermove', event => {
      const point = local(event);
      if (!drag) {
        ribbonStage.classList.toggle('over-bead', onBead(point));
        if (event.pointerType === 'mouse') { leanTarget = (point.x / ribbonStage.clientWidth - .5) * 16; cue(); }
        return;
      }
      if (drag.id !== event.pointerId) return;
      if (!drag.bead) { yaw = drag.yaw + (event.clientX - drag.x) * 360 / ribbonStage.clientWidth;if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon);return; }
      // The dot follows the finger along the middle line, never jumping across where the strip overlaps.
      let best = travel, distance = Infinity;
      for (let d = -34; d <= 34; d += 1.5) {
        const at = clamp(travel + d, 0, LAP), p = view(mobius(START + at / 180 * Math.PI, 0)), gap = Math.hypot(p.x - point.x, p.y - point.y);
        if (gap < distance) { distance = gap; best = at; }
      }
      setTravel(best);
    });
    const letGoRibbon = event => {
      if (drag?.id !== event.pointerId) return;
      drag = null;ribbonStage.classList.remove('held');
      if (ribbonStage.hasPointerCapture(event.pointerId)) ribbonStage.releasePointerCapture(event.pointerId);
    };
    ribbonStage.addEventListener('pointerup', letGoRibbon);
    ribbonStage.addEventListener('pointercancel', letGoRibbon);
    ribbonStage.addEventListener('pointerleave', () => { leanTarget = 0; cue(); });
    ribbonStage.addEventListener('keydown', event => {
      if (event.target.closest('button,a,input')) return;
      if (['Enter', ' '].includes(event.key) && travel >= LAP - 1) { event.preventDefault(); startSlice(); return; }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (whole()) setTravel(travel + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 24 : -24));
    });
    travelInput.addEventListener('input', () => { if (whole()) { tween = null; setTravel(+travelInput.value); } else travelInput.value = LAP; });
    $('#turn-thought').addEventListener('click', () => {
      if (!whole()) { if (!slicing) { openTarget = 0; cue(); if (still()) { open = 0; sliced = 0; setTravel(0); } } return; }
      travelTo(travel >= LAP - 1 ? 0 : STAGES.find(stage => stage > travel + 1));
    });
    document.addEventListener('hint:ribbon', () => {
      if (still() || document.querySelector('#room').dataset.place !== 'rethink' || !whole()) return;
      walkStart = performance.now(); cue();
    });
    document.addEventListener('hint:snip', () => {
      if (still() || document.querySelector('#room').dataset.place !== 'rethink' || !whole()) return;
      snipStart = performance.now(); cue();
    });
    new ResizeObserver(() => { if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon); }).observe(ribbonStage);
    document.fonts.ready.then(() => { if (!ribbonFrame) ribbonFrame = requestAnimationFrame(drawRibbon); });
    setTravel(0);
  },
};
