import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed at https://<user>.github.io/react-3d-mobile-ai/
export default defineConfig({
  base: '/react-3d-mobile-ai/',
  plugins: [react()],
});
