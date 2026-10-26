// Builds the redirect list written to dist/_redirects (format read by Cloudflare Pages and Netlify)
// and, on GitHub Pages, to HTML redirect pages. "de" is relative to the site root; "para" already
// carries the base path (see url.mjs).
// Sources: old WordPress URLs that changed, products under review, legacy PDF paths and the
// hand-maintained dados/redirecionamentos.csv.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseCsv } from './csv.mjs';
import { slugify } from './texto.mjs';
import { catalogo, CatalogError } from './catalogo.mjs';
import { GARANTIA } from '../data/conteudo.mjs';
import { url } from './url.mjs';

const MANUAL_FILE = join('dados', 'redirecionamentos.csv');

// Category and tag URLs indexed by Google on the old site (Yoast sitemaps, Oct/2026)
const OLD_TAXONOMY_URLS = [
  '/categoria-produto/sem-categoria/', '/categoria-produto/decorar/acessorios-para-banheiro/', '/categoria-produto/construir/',
  '/categoria-produto/cubas-de-ceramica/', '/categoria-produto/cubas-de-vidro/', '/categoria-produto/construir/deck/',
  '/categoria-produto/decorar/', '/categoria-produto/iluminar/', '/categoria-produto/metais/', '/categoria-produto/construir/painel-ripado/',
  '/categoria-produto/construir/piso-laminado/', '/categoria-produto/piso-vinilico/', '/categoria-produto/construir/porcelanato/',
  '/categoria-produto/porcelanatos/', '/categoria-produto/proteger/', '/categoria-produto/construir/rodape/',
  '/categoria-produto/tijolo-de-vidro/', '/categoria-produto/decorar/torneiras/', '/categoria-produto/vaso-sanitario/',
  '/produto-tag/acabamento-de-registro/', '/produto-tag/acessorios-para-banheiro/', '/produto-tag/arandela/', '/produto-tag/comercial/',
  '/produto-tag/construir/', '/produto-tag/cuba-de-apoio/', '/produto-tag/deck/', '/produto-tag/decorar/', '/produto-tag/ducha-fria/',
  '/produto-tag/lavatorio/', '/produto-tag/luminaria/', '/produto-tag/painel-de-led/', '/produto-tag/painel-ripado/',
  '/produto-tag/painel-ripado-externo/', '/produto-tag/pendente/', '/produto-tag/piso-laminado/', '/produto-tag/piso-vinilico/',
  '/produto-tag/plafon/', '/produto-tag/porcelanato-acetinado/', '/produto-tag/porcelanato-polido/', '/produto-tag/refletor/',
  '/produto-tag/rodape/', '/produto-tag/rodape-amadeirado/', '/produto-tag/rodapes-amadeirados/', '/produto-tag/spots/',
  '/produto-tag/tijolo-de-vidro/', '/produto-tag/torneira/', '/produto-tag/torneira-monocomando/', '/produto-tag/valvula-click/',
  '/produto-tag/vaso-sanitario/',
];

// Old terms whose slug differs from the new subcategory
const TERM_ALIASES = {
  porcelanatos: 'porcelanato',
  torneiras: 'torneira',
  spots: 'spot-led',
  'rodapes-amadeirados': 'rodape',
  'rodape-amadeirado': 'rodape',
  'cubas-de-vidro': 'cubas-de-ceramica',
  'cuba-de-apoio': 'cubas-de-ceramica',
  lavatorio: 'cubas-de-ceramica',
  'valvula-click': 'acessorios-para-banheiro',
  'acabamento-de-registro': 'acessorios-para-banheiro',
  metais: 'decorar',
};

function readManual(errors) {
  if (!existsSync(MANUAL_FILE)) return [];
  const { rows } = parseCsv(readFileSync(MANUAL_FILE, 'utf8'));
  return rows.flatMap(({ line, values }) => {
    const { de, para } = values;
    if (!de?.startsWith('/') || !(para?.startsWith('/') || para?.startsWith('https://'))) {
      errors.push(`${MANUAL_FILE} linha ${line}: "de" deve começar com / e "para" com / ou https://`);
      return [];
    }
    return [{ de, para: url(para), status: 301 }];
  });
}

export function redirecionamentos() {
  const { pilares, porSlug, emAnalise, catalogos } = catalogo();
  const errors = [];
  const list = [];
  const add = (de, para, status = 301) => list.push({ de, para, status });

  // Every live URL of the new site, so nothing redirects away from a real page
  const live = new Set([url('/'), url('/produtos/'), ...[...porSlug.values()].map((p) => p.url)]);
  const byTerm = new Map();
  for (const pilar of pilares) {
    live.add(pilar.url);
    byTerm.set(pilar.slug, pilar.url);
    for (const sub of pilar.subcategorias) {
      live.add(sub.url);
      // When a subcategory exists in two pillars, the bigger one wins
      const current = byTerm.get(sub.slug);
      if (!current || current.count < sub.produtos.length) byTerm.set(sub.slug, { url: sub.url, count: sub.produtos.length });
    }
  }
  const termUrl = (term) => {
    const hit = byTerm.get(TERM_ALIASES[term] ?? term);
    return typeof hit === 'string' ? hit : hit?.url;
  };

  add('/produtos-novo/', url('/produtos/'));
  add('/shop/', url('/produtos/'));
  add('/garantia/', url('/atendimento-ao-cliente/#garantia'));

  for (const path of OLD_TAXONOMY_URLS) {
    if (live.has(url(path))) continue;
    const term = path.split('/').filter(Boolean).pop();
    const target = termUrl(term);
    if (target) add(path, target);
    else if (path.startsWith('/produto-tag/')) add(path, url(`/produtos/?busca=${encodeURIComponent(term.replace(/-/g, ' '))}`));
    else add(path, url('/produtos/'));
  }

  // Products under review are temporarily off the site: 302 to their category
  for (const p of emAnalise) {
    if (!p.slug) continue;
    const pilar = pilares.find((x) => x.nome.toLocaleLowerCase('pt-BR') === String(p.categoria).toLocaleLowerCase('pt-BR'));
    const sub = pilar?.subcategorias.find((s) => s.slug === slugify(String(p.subcategoria).split('|')[0]));
    add(`/produtos/${p.slug}/`, sub?.url ?? pilar?.url ?? url('/produtos/'), 302);
  }

  for (const c of catalogos) for (const old of c.legado) add(old, c.url);
  for (const g of GARANTIA) if (g.certificado?.legado) add(g.certificado.legado, g.certificado.url);

  list.push(...readManual(errors));
  if (errors.length) throw new CatalogError(errors);

  // Also match the path without its trailing slash; later entries (manual) win over generated ones
  const byFrom = new Map();
  for (const r of list) {
    byFrom.set(r.de, r);
    if (r.de.endsWith('/') && r.de.length > 1) byFrom.set(r.de.slice(0, -1), { ...r, de: r.de.slice(0, -1) });
  }
  return [...byFrom.values()].filter((r) => url(r.de) !== r.para);
}

export const formatRedirects = (list) => list.map((r) => `${url(r.de)} ${r.para} ${r.status}`).join('\n') + '\n';
