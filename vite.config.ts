import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Derive the GitHub Pages base path from the repo slug at build time
// (GitHub Actions sets GITHUB_REPOSITORY to `<owner>/<repo>`). Falls back
// to the original hard-coded value for local builds and forks that
// haven't set the env var.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repo ? `/${repo}/` : '/react-3d-mobile-ai/';

export default defineConfig({
  base,
  plugins: [react()],
});
