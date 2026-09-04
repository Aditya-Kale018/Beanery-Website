import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Images are large webp data extracted from the design; keep them as real
  // files rather than inlining them back into the JS bundle.
  build: { assetsInlineLimit: 0 },
});
