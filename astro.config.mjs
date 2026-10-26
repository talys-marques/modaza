import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFile, mkdir, access } from 'node:fs/promises';
import { redirecionamentos, formatRedirects } from './src/lib/redirecionamentos.mjs';

// Previews such as GitHub Pages set SITE_URL (https://talys-marques.github.io) and BASE_PATH (/modaza)
const site = process.env.SITE_URL || 'https://modaza.com.br';
const base = process.env.BASE_PATH || '/';
const githubPages = process.env.GITHUB_PAGES === 'true';

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const redirectPage = (to) =>
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Redirecionando…</title>` +
  `<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${escapeAttr(to)}">` +
  `</head><body><a href="${escapeAttr(to)}">Continuar</a></body></html>\n`;

// Writes dist/_redirects (Cloudflare Pages / Netlify format) after every build.
// GitHub Pages ignores that file, so there each old folder-style URL also gets an HTML redirect page.
const redirectsFile = {
  name: 'modaza-redirects',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const list = redirecionamentos();
      await writeFile(new URL('_redirects', dir), formatRedirects(list));
      logger.info(`_redirects com ${list.length} regras`);
      if (!githubPages) return;

      let pages = 0;
      for (const r of list.filter((r) => r.de.endsWith('/'))) {
        const folder = new URL(`.${r.de}`, dir);
        const file = new URL('index.html', folder);
        // Never overwrite a real page
        if (await access(file).then(() => true, () => false)) continue;
        await mkdir(folder, { recursive: true });
        await writeFile(file, redirectPage(r.para));
        pages++;
      }
      logger.info(`${pages} páginas de redirecionamento para o GitHub Pages`);
    },
  },
};

export default defineConfig({
  site,
  base,
  // Same URL shape as the old WordPress site (/produtos/slug/)
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/satisfacao/') }), redirectsFile],
});
