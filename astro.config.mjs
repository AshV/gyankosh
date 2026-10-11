// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Integration to ensure all static redirect pages in /gyankosh/
 * execute an immediate cross-domain JavaScript and meta refresh redirect
 * to https://gyankosh.app preserves exact path, query, and hash.
 */
function legacyRedirectEnhancer() {
  return {
    name: 'legacy-redirect-enhancer',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const { fileURLToPath } = await import('node:url');

        const distPath = fileURLToPath(dir);
        const gyankoshDir = path.join(distPath, 'gyankosh');

        if (!fs.existsSync(gyankoshDir)) return;

        function processDir(currentDir) {
          const entries = fs.readdirSync(currentDir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
              processDir(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
              let html = fs.readFileSync(fullPath, 'utf-8');
              html = html.replace(/content="0;url=\//g, 'content="0;url=https://gyankosh.app/');
              html = html.replace(/href="\//g, 'href="https://gyankosh.app/');
              const redirectScript = `<script>(function(){try{var p=window.location.pathname.replace(/^\\/gyankosh(?:\\/|$)/,'/');if(!p.startsWith('/'))p='/'+p;window.location.replace('https://gyankosh.app'+p+window.location.search+window.location.hash);}catch(e){}})();</script>`;
              if (html.includes('<head>')) {
                html = html.replace('<head>', '<head>' + redirectScript);
              } else {
                html = html.replace('<!doctype html>', '<!doctype html>' + redirectScript);
              }
              fs.writeFileSync(fullPath, html, 'utf-8');
            }
          }
        }

        processDir(gyankoshDir);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // Custom domain deployment URL and repository base path
  site: 'https://gyankosh.app',
  base: '/',

  output: 'static',
  compressHTML: true,

  redirects: {
    '/gyankosh': '/',
    '/gyankosh/read/[slug]': '/read/[slug]',
    '/gyankosh/category/[category]': '/category/[category]',
    '/gyankosh/tag/[tag]': '/tag/[tag]',
    '/gyankosh/parichay': '/parichay',
  },

  integrations: [
    legacyRedirectEnhancer(),
    sitemap({
      filter: (page) => !page.includes('/404') && !page.endsWith('.json'),
      changefreq: 'weekly',
      lastmod: new Date(),
      priority: 0.7,
      serialize(item) {
        // Homepage gets highest priority
        if (item.url === 'https://gyankosh.app/' || item.url === 'https://gyankosh.app') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        }
        // Reader pages
        else if (item.url.includes('/read/')) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
        }
        // Parichay (About & Authority) page
        else if (item.url.includes('/parichay')) {
          item.changefreq = 'monthly';
          item.priority = 0.9;
        }
        // Category pages
        else if (item.url.includes('/category/')) {
          item.changefreq = 'weekly';
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],

  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
