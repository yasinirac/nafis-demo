import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site under /<repo-name>/. In GitHub Actions the repo
// name comes from GITHUB_REPOSITORY ("owner/name"); locally it falls back to
// the same name so dev, preview and tests use identical URLs.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'nafis-demo';

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
