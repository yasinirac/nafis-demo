import { defineConfig } from '@playwright/test';

const port = 4173;
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'nafis-demo';

/**
 * Smoke and accessibility tests run against the production build
 * (vite preview), at desktop (1440) and phone (390) widths.
 */
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}/${repoName}/`,
    trace: 'off',
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}/${repoName}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
