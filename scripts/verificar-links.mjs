#!/usr/bin/env node
// Checks the built site (dist/) for internal links and images that point nowhere.
// Run after `npm run build`: `npm run verificar` (with the same BASE_PATH as the build).
// Links covered by dist/_redirects count as valid.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { stripBase } from '../src/lib/url.mjs';

const DIST = 'dist';
const pages = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (path.endsWith('.html')) pages.push(path);
  }
})(DIST);

const redirects = new Set(
  readFileSync(join(DIST, '_redirects'), 'utf8')
    .split('\n')
    .map((line) => line.split(' ')[0])
    .filter(Boolean)
);

// Catalog PDFs live outside the site (PUBLIC_ARQUIVOS_URL), so they are not checked here
const isExternalFile = (path) => path.startsWith('/arquivos/catalogos/');

const resolves = (url) => {
  const full = decodeURIComponent(url.split('#')[0].split('?')[0]);
  const path = stripBase(full);
  if (path === '/' || redirects.has(full) || isExternalFile(path)) return true;
  const file = join(DIST, path);
  return (existsSync(file) && statSync(file).isFile()) || existsSync(join(file, 'index.html'));
};

const broken = new Map();
let total = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    total++;
    if (!resolves(url)) broken.set(url, [...(broken.get(url) ?? []), page]);
  }
}

console.log(`${pages.length} páginas, ${total} links internos, ${broken.size} quebrados`);
for (const [url, where] of broken) console.log(`  ${url}  (em ${where.length} página(s), ex.: ${where[0]})`);
process.exit(broken.size ? 1 : 0);
