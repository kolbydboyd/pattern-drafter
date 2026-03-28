import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        faq:     resolve(__dirname, 'faq.html'),
        terms:   resolve(__dirname, 'terms.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        '404':     resolve(__dirname, '404.html'),
        success:   resolve(__dirname, 'success.html'),
        patterns:  resolve(__dirname, 'patterns.html'),
        learn:     resolve(__dirname, 'learn.html'),
        pricing:   resolve(__dirname, 'pricing.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
