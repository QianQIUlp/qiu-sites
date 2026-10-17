// Visits every room of the homepage by its #hash, does that room's main thing once, and fails on any
// console error, page error or failed request. One test per language; Playwright runs each at
// desktop and phone size (playwright.config.mjs).
import {test, expect} from '@playwright/test';

// Each room's main interaction, and how we know it happened.
const rooms = {
  home: async page => {
    await page.locator('.guitar-touch').click();
    await expect(page.locator('#guitar-closeup')).toHaveJSProperty('open', true);
    await page.locator('#close-guitar').click();
    await expect(page.locator('#guitar-closeup')).toHaveJSProperty('open', false);
  },
  papers: async page => {
    const paper = page.locator('.loose-paper').first();
    await paper.click();
    await expect(paper).toHaveAttribute('aria-pressed', 'true');
  },
  music: async page => {
    const stomp = page.locator('.pedal-gold [data-pedal]');
    await stomp.click();
    await expect(stomp).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#strum').click();
    await expect(page.locator('.audio-toggle')).toHaveAttribute('aria-pressed', 'true');
  },
  trace: async page => {
    await page.locator('#add-line').click();
    await expect(page.locator('.draw-area')).toHaveAttribute('data-lines', '1');
  },
  rethink: async page => {
    await page.locator('#turn-thought').click();
    await expect.poll(() => page.locator('#thought-angle').evaluate(input => +input.value)).toBeGreaterThan(200);
  },
  work: async page => {
    await page.locator('[data-depth="100"]').click();
    await expect(page.locator('#cut-reading')).toHaveText('100');
  },
  idle: async page => {
    await page.locator('[data-slip]').first().click();
    await expect(page.locator('[data-slip][hidden]')).toHaveCount(1);
  },
  paths: async page => {
    // The route buttons used to sit under the thread instrument at desktop size: they must be reachable.
    await page.locator('[data-route="1"]').click();
    await expect(page.locator('[data-route="1"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#path-play').click();
    await expect(page.locator('#path-play')).toHaveAttribute('aria-pressed', 'true');
  },
  blindspot: async page => {
    await page.locator('#blind-turn').click();
    await expect(page.locator('#blind-degrees')).toHaveText('20°');
    await page.locator('.eye-card').click();
    await expect(page.locator('.eye-card')).toHaveAttribute('aria-pressed', 'true');
  },
  overview: async page => {
    await expect(page.locator('.portal').first()).toBeVisible();
  },
};

// The camera eases into a room; wait until it has stopped (five frames without a change) so clicks
// land where they aim. Frames, not milliseconds: a software-rendered browser can be slow.
const settle = page => page.evaluate(() => new Promise(resolve => {
  const world = document.querySelector('#world');
  let last = '', still = 0;
  const check = () => {
    const now = getComputedStyle(world).transform;
    still = now === last ? still + 1 : 0; last = now;
    if (still >= 5) resolve(); else requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
}));

for (const [lang, path] of [['zh', '/'], ['en', '/en/']]) {
  test(`every room works (${lang})`, async ({page}) => {
    const problems = [];
    page.on('console', message => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
    page.on('pageerror', error => problems.push(`page error: ${error.message}`));
    page.on('requestfailed', request => problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`));
    page.on('response', response => { if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`); });

    await page.goto(path);
    // The home room's guitar is drawn from the 3D model, and every other room has woken.
    await page.waitForFunction(() => document.body.classList.contains('guitar-home-ready') && !document.querySelector('[data-asleep]'), null, {timeout: 60_000});
    for (const [place, act] of Object.entries(rooms)) {
      await test.step(place, async () => {
        await page.evaluate(hash => { location.hash = hash; }, place);
        await expect(page.locator('#room')).toHaveAttribute('data-place', place);
        // Arrived: the room is interactive (not inert) once the camera has settled on it.
        if (place !== 'overview') await expect(page.locator(`[data-scene="${place}"]`)).not.toHaveAttribute('inert', '');
        await settle(page);
        await act(page);
      });
    }
    expect(problems).toEqual([]);
  });
}

// The rooms answer each other (open-world step 5). Each connection goes through the room contract's ctx.
for (const [lang, path] of [['zh', '/'], ['en', '/en/']]) {
  test(`rooms answer each other (${lang})`, async ({page}) => {
    const problems = [];
    page.on('console', message => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
    page.on('pageerror', error => problems.push(`page error: ${error.message}`));
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('[data-asleep]'), null, {timeout: 60_000});
    const go = async place => {
      await page.evaluate(hash => { location.hash = hash; }, place);
      await expect(page.locator('#room')).toHaveAttribute('data-place', place);
      await settle(page);
    };

    // 1 · The board is in the house: the pedals you switch on in the strings room show in the trace room.
    await test.step('the board shows in the trace room', async () => {
      await go('music');
      await page.locator('.pedal-gold [data-pedal]').click();
      await page.locator('.pedal-echo [data-pedal]').click();
      await go('trace');
      await expect(page.locator('.trace-through')).toBeVisible();
      await expect(page.locator('.trace-through')).toContainText('Centaur · After Hours');
    });

    // 2 · A route you walked becomes a line: "Leave a line of your own" hands it to the trace room.
    await test.step('the paths route is written as a line', async () => {
      await go('trace');
      await page.locator('#clear-lines').click();
      await go('paths');
      await page.locator('[data-scene="paths"] .extra-footer [data-place="trace"]').click();
      await expect(page.locator('#room')).toHaveAttribute('data-place', 'trace');
      await expect(page.locator('.draw-area')).toHaveAttribute('data-lines', '1', {timeout: 10_000});
      await expect(page.locator('#room')).toHaveAttribute('data-links', /route/);
      await page.locator('#clear-lines').click();
      await expect(page.locator('#room')).not.toHaveAttribute('data-links', /route/);
    });

    // 3 · Things that travel: a page thrown out of its corner lies where it landed, and the overview keeps the thread.
    await test.step('a thrown page leaves a thread', async () => {
      await go('papers');
      // Throwing needs motion (reduced motion only lets pages be moved, never thrown).
      await page.locator('#motion').click();
      await expect(page.locator('body')).toHaveAttribute('data-motion', 'on');
      const paper = page.locator('.loose-paper').nth(2), box = await paper.boundingBox(), size = page.viewportSize();
      const x = box.x + box.width / 2, y = box.y + box.height / 2, reach = size.width * .9;
      await page.mouse.move(x, y); await page.mouse.down();
      for (let i = 1; i <= 14; i++) { await page.mouse.move(x + reach * i / 14, y - i * 3); await page.waitForTimeout(6); }
      await page.mouse.up();
      await expect(page.locator('.loose-paper.strayed')).toHaveCount(1, {timeout: 10_000});
      await expect(page.locator('#room')).toHaveAttribute('data-links', /page-2/, {timeout: 10_000});
      await page.locator('#motion').click();
      await page.locator('.paper-reset').click();
      await expect(page.locator('.loose-paper.strayed')).toHaveCount(0, {timeout: 10_000});
      await expect(page.locator('#room')).not.toHaveAttribute('data-links', /page-/);
    });

    // 4 · The afternoon reaches the sound: still in the idle corner it turns to evening, and the board says so.
    await test.step('evening softens the board', async () => {
      await go('idle');
      await go('music');
      await expect(page.locator('.music')).toHaveAttribute('data-evening', '');
    });
    expect(problems).toEqual([]);
  });
}
