import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Rewrite /learn/:slug and /patterns/:garment to their MPA entry points
// (mirrors the Cloudflare Pages _redirects rules for local dev)
function mpaRewrites() {
  return {
    name: 'mpa-rewrites',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url.match(/^\/learn\/.+/))    req.url = '/learn.html';
        if (req.url.match(/^\/patterns\/.+/)) req.url = '/patterns.html';
        if (req.url === '/affiliate')          req.url = '/affiliate.html';
        if (req.url === '/submit-make')       req.url = '/submit-make.html';
        if (req.url.match(/^\/feedback(\?|$)/)) req.url = '/feedback.html';
        if (req.url.match(/^\/checkout(\?|$)/)) req.url = '/checkout.html';
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
    // The garments-misc chunk bundles the catch-all garment modules and
    // sits ~505 kB minified. That's genuine content, not a packaging bug,
    // so nudge the warning threshold just past it.
    chunkSizeWarningLimit: 600,
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
        admin:     resolve(__dirname, 'admin.html'),
        redeem:    resolve(__dirname, 'redeem.html'),
        tester:    resolve(__dirname, 'tester.html'),
        'pin-preview': resolve(__dirname, 'pin-preview.html'),
        affiliate: resolve(__dirname, 'affiliate.html'),
        'submit-make': resolve(__dirname, 'submit-make.html'),
        feedback:      resolve(__dirname, 'feedback.html'),
        checkout:      resolve(__dirname, 'checkout.html'),
      },
      output: {
        // Split content-heavy modules into their own chunks so no single
        // bundle exceeds Vite's default 500 kB warning threshold and browsers
        // can cache each section independently.
        manualChunks(id) {
          if (id.includes('/src/content/articles-')) {
            // articles-getting-started.js, articles-fit.js, etc. each in own chunk
            const match = id.match(/articles-([a-z-]+)\.js/);
            if (match) return `articles-${match[1]}`;
          }
          if (id.includes('/src/garments/seo-descriptions')) {
            return 'garments-seo';
          }
          if (id.includes('/src/garments/')) {
            // Split garment modules by body-area category so no single chunk
            // balloons past the warning limit. Each category groups roughly
            // a dozen garments of ~20-40 kB source each.
            const file = id.split('/src/garments/').pop();
            if (/(^|\/)(.*-)?dress([-.]|$)/.test(file))     return 'garments-dress';
            if (/(^|\/)(.*-)?skirt([-.]|$)/.test(file))     return 'garments-skirt';
            if (/(^|\/)(jeans|chinos|trouser|pants|shorts|trunks|leggings|joggers|sweatpants)/.test(file)) return 'garments-lower';
            if (/(^|\/)(tee|shirt|polo|top|tank|blouse|hoodie|sweater|cardigan|jacket|coat|turtleneck|henley|vest|crewneck)/.test(file)) return 'garments-upper';
            return 'garments-misc';
          }
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/posthog-js')) return 'vendor-posthog';
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
