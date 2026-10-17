// Homepage smoke test (`npm run test:home`): every room, zh and en, desktop and phone, against a
// production build served by `astro preview`. See tests/home/smoke.spec.mjs.
import {defineConfig} from '@playwright/test';

const port = 4323;
export default defineConfig({
  testDir: 'tests/home',
  testMatch: '*.spec.mjs',
  timeout: 90_000,
  fullyParallel: true,
  workers: 2,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    // The installed Chrome; set PW_CHANNEL=chromium to use Playwright's own build instead.
    channel: process.env.PW_CHANNEL || 'chrome',
    // Reduced motion makes the camera jump instead of ease: software rendering (no GPU) is too slow
    // for eased travel, and every room's interactions still run the same code.
    contextOptions: {reducedMotion: 'reduce'},
    launchOptions: {args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']},
  },
  projects: [
    {name: 'desktop', use: {viewport: {width: 1280, height: 800}}},
    {name: 'phone', use: {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}},
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {ASTRO_TELEMETRY_DISABLED: '1'},
  },
});
