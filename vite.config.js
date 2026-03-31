import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Rewrite /learn/:slug and /patterns/:garment to their MPA entry points
// (mirrors the Vercel rewrites in vercel.json for local dev)
function mpaRewrites() {
  return {
    name: 'mpa-rewrites',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url.match(/^\/learn\/.+/))    req.url = '/learn.html';
        if (req.url.match(/^\/patterns\/.+/)) req.url = '/patterns.html';
        next();
      });
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [mpaRewrites()],
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
        about:     resolve(__dirname, 'about.html'),
        redeem:    resolve(__dirname, 'redeem.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
