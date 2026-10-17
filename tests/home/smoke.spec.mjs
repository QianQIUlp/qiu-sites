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
    // (The route buttons are covered by the thread instrument at desktop size: a step-5 fix.)
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
