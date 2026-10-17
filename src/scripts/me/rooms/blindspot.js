// 盲点 ("Blind spots"): an anamorphic word. Separate ink fragments line up only from the front;
// nothing is swapped when the camera turns, their depth creates the gaps. Brushed, the slices
// clatter like a window blind; a test card finds the visitor's own blind spot.
import {t as localize} from '../language.js';
import {$, clamp, still, found, surface, sway, dragInput} from '../room-kit.js';

const mono = getComputedStyle(document.documentElement).getPropertyValue('--mono');
const ink = '#252825', red = '#e83d27';

const room = {
  place: 'blindspot',
  mount(ctx) {
    const blindCanvas = $('#blind-field'), angleInput = $('#blind-angle');
    const glyphColors = [ink, '#555747', red];
    const glyphs = glyphColors.map(() => {
      const canvas = document.createElement('canvas');canvas.width = 840;canvas.height = 350;
      return canvas;
    });
    function paintGlyphs() {
      glyphs.forEach((canvas, i) => {
        const ctx = canvas.getContext('2d');ctx.clearRect(0, 0, 840, 350);
        ctx.font = '900 300px "Me Display", "Microsoft YaHei", sans-serif';ctx.textAlign = 'center';ctx.textBaseline = 'middle';
        ctx.fillStyle = glyphColors[i];ctx.fillText('确定', 420, 184);
      });
    }
    paintGlyphs();
    const observations = [
      [localize("01 / 正面", "01 / THE FRONT"), localize("看起来，严丝合缝。", "It all seems to fit."), localize("那篇关于 AI 的笔记写到第八节，我开始拆掉前面自己的论证。", "By section eight of my essay on AI, I was taking apart my own argument.")],
      [localize("02 / 比较单位", "02 / THE COMPARISON"), localize("原来，天平没有放平。", "The scales weren’t level."), localize("前文拿模型的一次生成，对比人的整体能力。换成同样的比较单位，原先的对比就没那么干净了。", "I compared one model response with a person’s entire ability. Use the same unit, and the contrast is less tidy.")],
      [localize("03 / 论证的裂缝", "03 / THE CRACK"), localize("连反驳，也被写进了赞美。", "Even disagreement became praise."), localize("点头，印证了作者；没点头，又成了作者赞美的人。这样“两端通吃”的结尾，并不能证明论点。", "Agree, and the author is right. Disagree, and you become someone the author admires. A conclusion that wins either way proves nothing.")],
      [localize("04 / 保留修正", "04 / KEEP THE CORRECTION"), localize("不把裂缝偷偷抹掉。", "Leave the cracks visible."), localize("原表留着，问题也标出来。让人看见判断怎样被修正，比只留下一个整洁的结论更诚实。", "Keep the original table and mark its problems. Showing a judgment being revised is more honest than a tidy conclusion.")]
    ];
    let viewAngle = 0, blindFrame = 0, blindLast = 0, observation = -1, blindView = null;
    // Brushed like a window blind, the slices knock against each other and swing back: even from the
    // front, the word turns out to be fragments. A mouse brushing across does it, and so does a tap.
    const slats = Array.from({length: 20}, () => ({y: 0, v: 0}));
    let lastTick = 0, brushCount = 0;
    function knock(index, force, quiet = false) {
      const slat = slats[index];
      if (!slat || still()) return;
      slat.v += force;
      if (!quiet && performance.now() - lastTick > 34) { lastTick = performance.now(); document.dispatchEvent(new CustomEvent('roomsound', {detail: 'tick'})); }
      scheduleBlind();
    }
    function swing(dt) {
      let busy = false;
      for (const slat of slats) {
        slat.v += (-slat.y * .02 - slat.v * .085) * dt / 16;
        slat.y = clamp(slat.y + slat.v * dt / 16, -.22, .22);
        if (Math.abs(slat.y) > .0015 || Math.abs(slat.v) > .0015) busy = true; else slat.y = slat.v = 0;
      }
      return busy;
    }
    function slatAt(event) {
      if (!blindView) return -1;
      const box = blindCanvas.getBoundingClientRect(), {width, height, scale, angle} = blindView;
      const x = event.clientX - box.left, y = event.clientY - box.top;
      if (Math.abs(y - height * .43) > scale * .8) return -1;
      const index = Math.floor(((x - width * .51) / (scale * Math.cos(angle)) / 3.65 + .5) * 20);
      return index >= 0 && index < 20 ? index : -1;
    }

    function drawBlind() {
      const {ctx, width, height} = surface(blindCanvas);
      const seen = viewAngle + glance.value, angle = seen / 180 * Math.PI;
      const scale = Math.min(width / 4.4, height / 3.15);
      blindView = {width, height, scale, angle};
      const project = (x, y, z) => {
        const rx = x * Math.cos(angle) + z * Math.sin(angle);
        const rz = z * Math.cos(angle) - x * Math.sin(angle);
        return {x: width * .51 + rx * scale, y: height * .43 + (y + rz * Math.sin(angle) * .15) * scale, z: rz};
      };
      const reveal = clamp((seen - 6) / 34, 0, 1);
      const cx = width * .51, cy = height * .74, rx = Math.min(width * .36, scale * 1.75), ry = rx * .23;
      ctx.strokeStyle = '#73756b35';ctx.lineWidth = .6;
      ctx.beginPath();ctx.ellipse(cx, cy, rx, ry, -.07, 0, Math.PI * 2);ctx.stroke();
      for (let i = 0; i < 60; i++) {
        const t = i / 60 * Math.PI * 2, outside = i % 5 ? 1.015 : 1.04;
        ctx.beginPath();ctx.moveTo(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry);
        ctx.lineTo(cx + Math.cos(t) * rx * outside, cy + Math.sin(t) * ry * outside);ctx.stroke();
      }
      const bearing = Math.PI / 2 - angle;
      ctx.beginPath();ctx.moveTo(cx, cy);ctx.lineTo(cx + Math.cos(bearing) * rx, cy + Math.sin(bearing) * ry);
      ctx.strokeStyle = '#e83d2780';ctx.stroke();
      ctx.beginPath();ctx.arc(cx + Math.cos(bearing) * rx, cy + Math.sin(bearing) * ry, 3, 0, Math.PI * 2);
      ctx.fillStyle = red;ctx.fill();

      const count = 20, sw = 840 / count, sh = 350;
      const pieces = Array.from({length: count}, (_, i) => {
        const x = (i / count - .5) * 3.65;
        const z = Math.sin(i * 1.67) * .66 + Math.cos(i * .52) * .26;
        return {i, x, z, depth: project(x, 0, z).z};
      }).sort((a, b) => a.depth - b.depth);
      function fragment(piece, depth, image, opacity = 1) {
        const drop = slats[piece.i].y, a = project(piece.x, -.76 + drop, depth), b = project(piece.x + 3.65 / count, -.76 + drop, depth), c = project(piece.x, .76 + drop, depth);
        ctx.save();ctx.globalAlpha = opacity;
        ctx.transform((b.x - a.x) / sw, (b.y - a.y) / sw, (c.x - a.x) / sh, (c.y - a.y) / sh, a.x, a.y);
        ctx.drawImage(image, piece.i * sw, 0, sw, sh, 0, 0, sw + .35, sh);
        ctx.restore();
      }
      for (const piece of pieces) {
        for (let layer = 16; layer > 0; layer--) fragment(piece, piece.z - layer * .008, glyphs[1]);
        fragment(piece, piece.z, glyphs[0]);
        if ([5, 11, 15].includes(piece.i)) fragment(piece, piece.z + .002, glyphs[2], reveal * .85);
      }

      if (reveal > 0) {
        ctx.save();ctx.globalAlpha = reveal;
        const labels = [localize('比较单位', 'THE UNIT'), localize('两端通吃', 'BOTH WAYS'), localize('保留修正', 'THE REVISION')];
        [5, 11, 15].forEach((index, n) => {
          const piece = pieces.find(p => p.i === index);
          const start = project(piece.x + .1, n === 1 ? .13 : -.45, piece.z);
          const endX = width * [.12, .46, .78][n], endY = height * [ .13, .84, .16][n];
          ctx.strokeStyle = '#e83d2780';ctx.lineWidth = .6;ctx.beginPath();ctx.moveTo(start.x, start.y);
          ctx.lineTo(endX, endY + (n === 1 ? -10 : 12));ctx.lineTo(endX + 29, endY + (n === 1 ? -10 : 12));ctx.stroke();
          ctx.beginPath();ctx.arc(start.x, start.y, 2, 0, Math.PI * 2);ctx.fillStyle = red;ctx.fill();
          ctx.font = `${Math.max(7, Math.min(9, width / 64))}px ${mono}`;
          ctx.fillText(`0${n + 1} / ${labels[n]}`, endX, endY);
        });
        ctx.restore();
      }
      ctx.font = `8px ${mono}`;ctx.textAlign = 'center';ctx.fillStyle = '#73756b';
      ctx.fillText(seen < 8 ? 'ONE VIEW ≠ THE WHOLE' : 'THE GAPS WERE ALWAYS HERE', cx, height * .9);
      ctx.textAlign = 'left';
    }

    function updateObservation() {
      const index = +angleInput.value < 10 ? 0 : +angleInput.value < 30 ? 1 : +angleInput.value < 50 ? 2 : 3;
      $('#blind-degrees').textContent = `${String(Math.round(+angleInput.value)).padStart(2, '0')}°`;
      if (index === observation) return;
      observation = index;
      $('#blind-index').textContent = observations[index][0];
      $('#blind-caption-title').textContent = observations[index][1];
      $('#blind-caption-copy').textContent = observations[index][2];
      $('#blind-turn').firstChild.textContent = index === 3 ? localize("回到正面 ", "Back to the front ") : localize("换个角度 ", "Another angle ");
    }
    function frameBlind(now) {
      blindFrame = 0;
      const dt = Math.min(64, now - (blindLast || now));blindLast = now;
      viewAngle += (+angleInput.value - viewAngle) * (still() ? 1 : 1 - Math.exp(-dt / 145));
      if (Math.abs(+angleInput.value - viewAngle) < .03) viewAngle = +angleInput.value;
      const swinging = swing(dt || 16);
      drawBlind();
      if (viewAngle !== +angleInput.value || swinging) scheduleBlind();
    }
    function scheduleBlind() {
      if (!blindFrame && !document.hidden && ctx.active === 'blindspot') blindFrame = requestAnimationFrame(frameBlind);
    }
    angleInput.addEventListener('input', () => {updateObservation();scheduleBlind();if (+angleInput.value >= 30) found('blind-angle');});
    $('#blind-turn').addEventListener('click', () => {
      angleInput.value = [20, 40, 60, 0][observation];updateObservation();scheduleBlind();
    });
    dragInput($('.blind-instrument'), angleInput);
    // It only ever turns away from the front, so the lean follows a mouse on the right half alone.
    const glance = sway($('.blind-instrument'), {reach: 9, demo: 21, here: () => ctx.active === 'blindspot', span: 3000, floor: 0, redraw: () => drawBlind()});
    document.addEventListener('hint:glance', () => glance.play());
    const blindStage = $('.blind-instrument');
    let brushFrom = -1, pressed = null;
    blindStage.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || event.buttons) return;
      const index = slatAt(event);
      if (index < 0) { brushFrom = -1; brushCount = 0; return; }
      if (brushFrom >= 0 && index !== brushFrom) {
        // Every slat the hand passed over, even in a quick sweep, gets its knock.
        const step = index > brushFrom ? 1 : -1, force = clamp(Math.abs(event.movementX) * .004, .02, .07) * (event.movementY < 0 ? -1 : 1);
        for (let i = brushFrom + step; i !== index + step; i += step) knock(i, force);
        if ((brushCount += Math.abs(index - brushFrom)) >= 4) found('blind-brush');
      }
      brushFrom = index;
    });
    blindStage.addEventListener('pointerleave', () => { brushFrom = -1; brushCount = 0; });
    blindStage.addEventListener('pointerdown', event => { pressed = {x: event.clientX, y: event.clientY}; });
    blindStage.addEventListener('pointerup', event => {
      // A tap knocks one slat; the knock runs outward to its neighbours.
      if (!pressed || Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 6) return;
      pressed = null;
      const index = slatAt(event);
      if (index < 0) return;
      for (let k = 0; k < 6; k++) setTimeout(() => { knock(index + k, .075 * (1 - k / 6), k > 0); if (k) knock(index - k, .075 * (1 - k / 6), true); }, k * 38);
      found('blind-brush');
    });
    document.addEventListener('hint:brush', () => {
      if (still() || ctx.active !== 'blindspot') return;
      slats.forEach((_, i) => setTimeout(() => knock(i, .034, true), i * 42));
    });
    // A real blind spot: a test card. With the left eye shut, staring at the cross from close enough,
    // the dot falls into the right eye's blind spot and disappears. The back says why.
    const eyeCard = $('.eye-card');
    eyeCard.addEventListener('click', () => {
      eyeCard.classList.toggle('turned');
      eyeCard.setAttribute('aria-pressed', eyeCard.classList.contains('turned'));
      found('blind-eye');
    });
    document.addEventListener('hint:blink', () => {
      if (still() || ctx.active !== 'blindspot') return;
      eyeCard.querySelector('.eye-dot').animate([{opacity: 1}, {opacity: 1, offset: .2}, {opacity: 0, offset: .38}, {opacity: 0, offset: .66}, {opacity: 1, offset: .84}, {opacity: 1}], {duration: 2600, easing: 'ease-in-out'});
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {cancelAnimationFrame(blindFrame);blindFrame = blindLast = 0;}
      else scheduleBlind();
    });
    new ResizeObserver(() => drawBlind()).observe(ctx.room);
    document.fonts.ready.then(() => drawBlind());
    document.fonts.load('900 300px "Me Display"', '确定').then(() => {
      paintGlyphs();drawBlind();
    }).catch(() => {}); // The first frame already contains readable system-font glyphs.
    updateObservation();drawBlind();
    room.enter = () => scheduleBlind();
    room.leave = () => {cancelAnimationFrame(blindFrame);blindFrame = blindLast = 0;};
  },
};
export default room;
