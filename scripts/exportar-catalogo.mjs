#!/usr/bin/env node
// ONE-TIME MIGRATION: exports the Modaza catalog from the old WooCommerce Store API
// into the CSVs the static site reads, cleans the data, downloads images by SKU
// and converts them to resized WebP. After the migration the CSVs are edited by
// hand (via Git), so this script refuses to overwrite them unless asked to.
//
// Usage (from the project root):
//   node scripts/exportar-catalogo.mjs                  # full export, images included
//   node scripts/exportar-catalogo.mjs --sem-imagens    # CSVs and report only
//   node scripts/exportar-catalogo.mjs --sobrescrever   # overwrite existing dados/*.csv
//   node scripts/exportar-catalogo.mjs --tamanho 1600   # longest image side in px (default: 1600)
//   node scripts/exportar-catalogo.mjs --qualidade 80   # WebP quality 1-100 (default: 80)
//
// Output:
//   dados/produtos.csv              products published on the site
//   dados/produtos-em-analise.csv   products with data conflicts, NOT published
//   dados/especificacoes.csv        specs for both files above
//   imagens/produtos/{sku}/1.webp   source images used by the site build
//   docs/relatorio-exportacao.md    what was cleaned and what needs a decision
//   .cache/originais/{sku}/1.jpg    download cache, never published
//
// Requires Node 20+.

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE = 'https://modaza.com.br';
const args = process.argv.slice(2);
const argValue = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const SKIP_IMAGES = args.includes('--sem-imagens');
const OVERWRITE = args.includes('--sobrescrever');
const DATA_DIR = 'dados';
const IMAGES_DIR = join('imagens', 'produtos');
const CACHE_DIR = join('.cache', 'originais');
const DOCS_DIR = 'docs';
const MAX_SIDE = Number(argValue('--tamanho', 1600));
const WEBP_QUALITY = Number(argValue('--qualidade', 80));
const IMG_CONCURRENCY = 6;

// ─── Normalization tables ────────────────────────────────────────────────────

const PILLARS = ['Construir', 'Decorar', 'Iluminar', 'Proteger'];

// Duplicated or inconsistent terms found in pa_subcategoria / product_cat / tags
const SUBCATEGORY_ALIASES = {
  'Acessórios de Banheiro': 'Acessórios para Banheiro',
  'Porcelanatos': 'Porcelanato',
  'Torneiras': 'Torneira',
  'Spots': 'Spot LED',
  'Torneira Monocomando': 'Torneira',
};

// product_cat terms that are groupings, not subcategories
const IGNORED_CATEGORIES = new Set(['Metais', 'Sem categoria', ...PILLARS]);

// Color words that mean the same thing in names vs. spec values
const COLOR_SYNONYMS = {
  gray: 'cinza', grey: 'cinza', nero: 'preto', preta: 'preto', bianco: 'branco', branca: 'branco',
  cromada: 'cromado', dourada: 'dourado', ipe: 'ipê',
};

const TAG_ALIASES = {
  'Rodapés Amadeirados': 'Rodapé Amadeirado',
  'Spots': 'Spot LED',
};

// Last-resort subcategory inference from the product name (checked in order)
const NAME_RULES = [
  [/PAINEL RIPADO|CANTONEIRA PARA PAINEL|PERFIL PAINEL/i, 'Painel Ripado'],
  [/PAINEL (DE )?LED/i, 'Painel de LED'],
  [/PLAFON/i, 'Plafon'],
  [/PENDENTE/i, 'Pendente'],
  [/LUSTRE/i, 'Lustre'],
  [/ARANDELA/i, 'Arandela'],
  [/REFLETOR/i, 'Refletor'],
  [/\bSPOT/i, 'Spot LED'],
  [/LUMIN[ÁA]RIA/i, 'Luminária'],
  [/DUCHA/i, 'Ducha Fria'],
  [/TORNEIRA/i, 'Torneira'],
  [/CUBA/i, 'Cubas de Cerâmica'],
  [/VASO SANIT|ANEL DE VEDA/i, 'Vaso Sanitário'],
  [/PORCELANATO/i, 'Porcelanato'],
  [/ROD[AÁ]P[EÉ]/i, 'Rodapé'],
  [/DECK/i, 'Acessórios para Decks'],
  [/PISO VIN[IÍ]LICO/i, 'Piso Vinílico'],
  [/PISO LAMINADO/i, 'Piso Laminado'],
  [/TIJOLO/i, 'Tijolo de Vidro'],
  [/PAPELEIRA|PORTA TOALHA|SABONETEIRA|CABIDE|TOALHEIRO|KIT ACESS|V[ÁA]LVULA|ACABAMENTO DE REGISTRO/i, 'Acessórios para Banheiro'],
];

// ─── Text helpers ────────────────────────────────────────────────────────────

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', ldquo: '"', rdquo: '"', lsquo: "'", rsquo: "'",
  hellip: '…', deg: '°', ordm: 'º', ordf: 'ª', times: '×', sup2: '²', sup3: '³',
};

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => NAMED_ENTITIES[n.toLowerCase()] ?? m)
    .replace(/[″“”]/g, '"')
    .replace(/[‘’]/g, "'");
}

const cleanSpaces = (s) => s.replace(/[ ​\t ]+/g, ' ').trim();

// Strips HTML (including Word/Office "TextRun" span soup) into plain paragraphs
function htmlToText(html) {
  const text = decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  );
  return text.split('\n').map(cleanSpaces).filter(Boolean).join('\n');
}

const SMALL_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'para', 'com', 'e', 'em', 'a', 'o', 'na', 'no', 'sem', 'por', 'ao']);
const ACRONYMS = new Set(['LED', 'PVC', 'WPC', 'ABS', 'MDF', 'UV', 'RGB', 'USB', 'HG', 'PS', 'PP', 'IP', 'LVT', 'SPC', 'LVP', 'SMD', 'COB', 'G9', 'E27', 'GU10', 'MR16', 'AR70', 'AR111', 'PAR20', 'PAR30', 'V1V']);
const UNIT_SUFFIX = /^([\d.,/]+)(CM|MM|M|KG|G|ML|L)$/i;

const lower = (s) => s.toLocaleLowerCase('pt-BR');
const capitalize = (s) => (s ? s.charAt(0).toLocaleUpperCase('pt-BR') + lower(s.slice(1)) : s);

function formatWord(word, isFirst) {
  if (/^p\/$/i.test(word)) return 'p/';
  if (ACRONYMS.has(word.toUpperCase())) return word.toUpperCase();
  if (/^x$/i.test(word)) return 'x';
  if (/^(cm|mm|m|kg|ml)$/i.test(word)) return lower(word);
  if (/\d/.test(word)) {
    // 60X120 -> 60x120, 6X -> 6x, 2,90M -> 2,90m; keep 24W, 4000K, C40, 3/6L as they are
    return word
      .toUpperCase()
      .replace(/(\d)X(?=\d|$)/g, '$1x')
      .replace(UNIT_SUFFIX, (_, n, u) => (u === 'L' ? n + u : n + lower(u)));
  }
  if (!isFirst && SMALL_WORDS.has(lower(word))) return lower(word);
  // Capitalize each part of compound words: PRETO/MARROM, AUTO-LIMPANTE
  return word.split(/([/-])/).map((part) => (/[/-]/.test(part) ? part : capitalize(part))).join('');
}

// "TORNEIRA DE PAREDE MODAZA ORA" -> "Torneira de Parede Modaza Ora"
function standardizeName(name) {
  const words = cleanSpaces(decodeEntities(name))
    .replace(/(\d)\s*×\s*(\d)/g, '$1x$2')
    .replace(/\bP\/(?=\S)/gi, 'p/ ')
    .split(' ');
  return words
    .map((w, i) => {
      // Keep surrounding punctuation ("(", ",", ")") out of the word logic
      const [, open, core, close] = w.match(/^([("']*)(.*?)([,;:.)"']*)$/);
      return open + formatWord(core, i === 0) + close;
    })
    .join(' ');
}

// Fixes ALL-CAPS spec values ("BRANCO" -> "Branco"); mixed-case values are left alone
function standardizeValue(value) {
  const letters = value.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length <= 3 || value !== value.toLocaleUpperCase('pt-BR')) return value;
  return standardizeName(value);
}

// "Tamanho do Produto (AxLxP)" and "Tamanho do produto (AxLxP)" -> same key
function normalizeKey(key) {
  const k = cleanSpaces(key.replace(/^[•·*–-]\s*/, '')).replace(/\s*\/\s*/g, ' / ').replace(/^Ref\.?$/i, 'Referência');
  let inParens = false;
  return k
    .split(' ')
    .map((w, i) => {
      // Keep "(C x L x A)" and "(AxLxP)" untouched
      if (w.startsWith('(')) inParens = true;
      const keep = inParens || ACRONYMS.has(w.replace(/[^A-Za-z0-9]/g, '').toUpperCase());
      if (w.endsWith(')')) inParens = false;
      if (keep) return w;
      return i === 0 ? capitalize(w) : lower(w);
    })
    .join(' ');
}

// ─── Specification parsing ───────────────────────────────────────────────────
// Descriptions come in three shapes:
//   A) <p><strong>Label</strong><br>Value</p>            (one field per block)
//   B) <h5>Group</h5><p>Key: Value<br>Key: Value</p>     (grouped key/values)
//   C) <p><b>Group</b></p><p>Key: Value</p>              (same as B with bold paragraphs)
//   D) <h3>PRODUCT NAME</h3><p>marketing text</p>        (prose, goes to the descricao column)
// Everything is flattened into lines, with headings marked by a sentinel.
// A short line ending in ":" ("Diferenciais do produto:") also opens a group.

const H = '\u0000H\u0000';
const GENERAL_GROUP = 'Informações gerais';

function descriptionToLines(html) {
  const marked = html
    // Unwrap Office/Word spans first, so <b><span>Label</span></b><span>&nbsp;</span> reads as <b>Label</b>
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/&nbsp;| /g, ' ')
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, inner) => `\n${H}${inner.replace(/<[^>]+>/g, '')}\n`)
    .replace(/<p[^>]*>\s*<(strong|b)>([\s\S]*?)<\/\1>\s*<\/p>/gi, (_, __, inner) => `\n${H}${inner.replace(/<[^>]+>/g, '')}\n`)
    .replace(/<(strong|b)>([^<]*)<\/\1>\s*<br\s*\/?>/gi, (_, __, inner) => `\n${H}${inner}\n`);
  return htmlToText(marked.replace(/\u0000/g, '\u0001'))
    .split('\n')
    .map((line) => {
      const raw = cleanSpaces(line.replace(/\u0001H\u0001/g, '').replace(/^[•·*]\s*/, ''));
      const isHeading = line.startsWith('\u0001H\u0001') || (/:$/.test(raw) && raw.length <= 60);
      return { isHeading, text: raw.replace(/:$/, '').trim() };
    })
    .filter((l) => l.text);
}

function splitKeyValue(line, allowDash) {
  let m = line.match(/^([^:]{2,60}):\s*(.+)$/);
  if (!m && allowDash) m = line.match(/^([^–:]{2,40}?)\s+[–-]\s+(.+)$/);
  if (!m) return null;
  let [, key, value] = m;
  // "Tamanho da Embalagem: (AxLxP): 30 x 26 x 11 cm" -> key keeps the "(AxLxP)"
  const unitHint = value.match(/^(\([^)]*\)):\s*(.+)$/);
  if (unitHint) { key = `${key} ${unitHint[1]}`; value = unitHint[2]; }
  return { key: normalizeKey(key), value: standardizeValue(cleanSpaces(value)) };
}

// Product-title headings ("PORCELANATO POLIDO MODAZA CATANHA, 60X120") introduce prose
const isTitleHeading = (heading) => heading.length > 40 || /modaza/i.test(heading);

function parseSpecs(html) {
  const lines = descriptionToLines(html);
  const specs = [];
  const prose = [];
  let i = 0;
  // Lines before the first heading: key/values go to the general group, the rest is prose
  while (i < lines.length && !lines[i].isHeading) {
    const kv = splitKeyValue(lines[i].text, false);
    if (kv) specs.push({ grupo: GENERAL_GROUP, atributo: kv.key, valor: kv.value });
    else prose.push(lines[i].text);
    i++;
  }
  while (i < lines.length) {
    const heading = lines[i++].text;
    const body = [];
    while (i < lines.length && !lines[i].isHeading) body.push(lines[i++].text);
    if (!body.length) continue;
    const pairs = body.map((t) => splitKeyValue(t, false));
    const group = normalizeKey(heading);
    if (pairs.some(Boolean)) {
      // Grouped section: "Especificações" -> Material: X, Pressão: Y...
      body.forEach((t, idx) => {
        const kv = pairs[idx] ?? splitKeyValue(t, true);
        if (kv) specs.push({ grupo: group, atributo: kv.key, valor: kv.value });
        else specs.push({ grupo: group, atributo: 'Destaque', valor: t });
      });
    } else if (isTitleHeading(heading)) {
      prose.push(...body);
    } else if (body.length > 1 && /diferencia|destaque|benef|vantage|atributo/i.test(heading)) {
      // Bullet list section: "Diferenciais do produto" -> one Destaque per line
      body.forEach((t) => specs.push({ grupo: group, atributo: 'Destaque', valor: t }));
    } else {
      // Single-field section: "Garantia" -> 60 meses
      specs.push({ grupo: GENERAL_GROUP, atributo: group, valor: standardizeValue(body.join('; ')) });
    }
  }
  return { specs, prose: prose.join('\n') };
}

// ─── Data access ─────────────────────────────────────────────────────────────

async function fetchJson(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function fetchAllProducts() {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await fetchJson(`${BASE}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

// ─── Transformation ──────────────────────────────────────────────────────────

const attrTerms = (p, taxonomy) => (p.attributes.find((a) => a.taxonomy === taxonomy)?.terms ?? []).map((t) => decodeEntities(t.name));
const normalizeSub = (s) => SUBCATEGORY_ALIASES[s] ?? s;
const unique = (arr) => [...new Set(arr.filter(Boolean))];

function resolveSubcategories(p) {
  const fromAttr = unique(attrTerms(p, 'pa_subcategoria').map(normalizeSub));
  if (fromAttr.length) return { values: fromAttr, source: 'atributo' };
  const fromCat = unique(p.categories.map((c) => decodeEntities(c.name)).filter((c) => !IGNORED_CATEGORIES.has(c)).map(normalizeSub));
  if (fromCat.length) return { values: fromCat, source: 'categoria WooCommerce' };
  const rule = NAME_RULES.find(([re]) => re.test(p.name));
  if (rule) return { values: [rule[1]], source: 'nome do produto' };
  return { values: [], source: 'não resolvida' };
}

function resolvePillar(p, subcategories, pillarBySub) {
  const fromAttr = attrTerms(p, 'pa_categoria').find((c) => PILLARS.includes(c));
  if (fromAttr) return { value: fromAttr, source: 'atributo' };
  const fromCat = p.categories.map((c) => decodeEntities(c.name)).find((c) => PILLARS.includes(c));
  if (fromCat) return { value: fromCat, source: 'categoria WooCommerce' };
  const fromSub = subcategories.map((s) => pillarBySub[s]).find(Boolean);
  if (fromSub) return { value: fromSub, source: 'subcategoria' };
  return { value: '', source: 'não resolvida' };
}

// Most common pillar per subcategory, learned from products that have both
function learnPillarBySubcategory(products) {
  const votes = {};
  for (const p of products) {
    const pillar = attrTerms(p, 'pa_categoria').find((c) => PILLARS.includes(c));
    if (!pillar) continue;
    for (const sub of resolveSubcategories(p).values) {
      votes[sub] ??= {};
      votes[sub][pillar] = (votes[sub][pillar] ?? 0) + 1;
    }
  }
  return Object.fromEntries(Object.entries(votes).map(([sub, v]) => [sub, Object.entries(v).sort((a, b) => b[1] - a[1])[0][0]]));
}

function normalizeTags(p, categoria, subcategorias) {
  const redundant = new Set([categoria, ...subcategorias].map(lower));
  return unique(
    p.tags
      .map((t) => cleanSpaces(decodeEntities(t.name)))
      .map((t) => TAG_ALIASES[t] ?? t)
      .map((t) => t.split(' ').map((w, i) => formatWord(w, i === 0)).join(' '))
      .filter((t) => !redundant.has(lower(t)) && !PILLARS.map(lower).includes(lower(t)))
  );
}

const colorKey = (s) => COLOR_SYNONYMS[lower(s)] ?? lower(s);
const words = (s) => lower(s).split(/[^a-z0-9à-ÿ]+/).filter(Boolean);

// Flags only real conflicts: the name carries a known color that differs from the spec color
function colorConflict(name, specColor, palette) {
  const inName = words(name).map(colorKey).filter((w) => palette.has(w));
  if (!inName.length) return false;
  const inSpec = words(specColor).map(colorKey);
  return !inSpec.some((c) => inName.includes(c));
}

// Same shape as WordPress slugs: "2,5 cm" -> "25-cm"
const slugify = (s) =>
  lower(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(\d)[,.](?=\d)/g, '$1').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Share of slug words found in the name; low values mean the slug came from another product
function slugMatchesName(slug, name) {
  const slugWords = slug.replace(/-\d+$/, '').split('-').filter((w) => w.length > 2);
  const nameWords = new Set(slugify(name).split('-'));
  if (!slugWords.length) return true;
  return slugWords.filter((w) => nameWords.has(w)).length / slugWords.length >= 0.5;
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
// Semicolon + UTF-8 BOM: opens correctly in Excel with pt-BR locale, where commas are decimals.

function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [columns.join(';'), ...rows.map((r) => columns.map((c) => esc(r[c])).join(';'))].join('\r\n') + '\r\n';
}

// ─── Images ──────────────────────────────────────────────────────────────────

const fileInfo = (path) => stat(path).then((s) => s, () => null);

// Downloads each original once (cached in originais/), then writes a resized WebP.
// Reruns skip downloads that exist and conversions newer than their original.
async function processImages(jobs) {
  const failures = [];
  const totals = { originalBytes: 0, webpBytes: 0, downloaded: 0, converted: 0 };
  let done = 0;
  const queue = [...jobs];
  async function worker() {
    while (queue.length) {
      const job = queue.shift();
      let stage = 'download';
      try {
        let original = await fileInfo(job.original);
        if (!original) {
          const res = await fetch(job.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          await writeFile(job.original, Buffer.from(await res.arrayBuffer()));
          original = await fileInfo(job.original);
          totals.downloaded++;
        }
        stage = 'conversão';
        let webp = await fileInfo(job.dest);
        if (!webp || webp.mtimeMs < original.mtimeMs) {
          // animated keeps GIF animations; fit inside never upscales small images
          await sharp(job.original, { animated: true })
            .autoOrient()
            .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, effort: 5 })
            .toFile(job.dest);
          webp = await fileInfo(job.dest);
          totals.converted++;
        }
        totals.originalBytes += original.size;
        totals.webpBytes += webp.size;
      } catch (err) {
        failures.push({ sku: job.sku, url: job.url, error: `${stage}: ${err.message}` });
      }
      done++;
      if (done % 50 === 0 || done === jobs.length) process.stdout.write(`\r  imagens: ${done}/${jobs.length}`);
    }
  }
  await Promise.all(Array.from({ length: IMG_CONCURRENCY }, worker));
  process.stdout.write('\n');
  return { failures, totals };
}

const formatMB = (bytes) => `${(bytes / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!OVERWRITE && (await fileInfo(join(DATA_DIR, 'produtos.csv')))) {
    throw new Error(`${join(DATA_DIR, 'produtos.csv')} já existe e pode ter edições manuais. Use --sobrescrever para substituir.`);
  }
  console.log(`Lendo produtos de ${BASE}...`);
  const raw = await fetchAllProducts();
  console.log(`  ${raw.length} produtos`);

  const pillarBySub = learnPillarBySubcategory(raw);
  const palette = new Set(
    raw.flatMap((p) => parseSpecs(p.description).specs.filter((s) => /^cor$/i.test(s.atributo)).flatMap((s) => words(s.valor).map(colorKey)))
  );
  const report = {
    renamed: [], inferred: [], noSku: [], placeholders: [], possibleDuplicates: [], slugMismatch: [],
    officeMarkup: [], missingBuyLink: [], noBuyLinkSimple: 0, refMismatch: [], colorMismatch: [],
    noSpecs: [], duplicateImages: [], categoryAliases: {},
  };

  const slugs = new Set(raw.map((p) => p.slug));
  const produtos = [];
  const especificacoes = [];
  const imageJobs = [];
  // Reasons why a product goes to produtos-em-analise.csv instead of being published
  const conflicts = new Map();
  const flag = (folder, reason) => conflicts.set(folder, [...(conflicts.get(folder) ?? []), reason]);

  for (const p of raw) {
    const sku = cleanSpaces(p.sku);
    const originalName = cleanSpaces(decodeEntities(p.name));
    const nome = standardizeName(originalName);
    if (nome !== originalName) report.renamed.push({ sku, antes: originalName, depois: nome });

    const folder = sku || `sem-sku-${p.id}`;
    if (!sku) {
      report.noSku.push({ id: p.id, slug: p.slug, nome, pasta: folder });
      flag(folder, 'Sem SKU');
    }
    const isPlaceholder = /^em breve$/i.test(originalName) || (!sku && !p.description.trim());
    if (isPlaceholder) {
      report.placeholders.push({ id: p.id, slug: p.slug, nome });
      flag(folder, 'Produto provisório ("Em breve")');
    }

    // A "-N" slug next to an existing base is a duplicate only if the name still produces that base;
    // otherwise the product was copied and renamed, keeping someone else's URL
    const base = p.slug.replace(/-\d+$/, '');
    const isNumbered = base !== p.slug && slugs.has(base);
    if (isNumbered && slugify(originalName) === base) {
      report.possibleDuplicates.push({ sku, nome, slug: p.slug, original: base });
      flag(folder, `Possível duplicado de /produtos/${base}/`);
    } else if (isNumbered || !slugMatchesName(p.slug, originalName)) {
      report.slugMismatch.push({ sku, nome, slug: p.slug, sugerido: slugify(nome) });
      flag(folder, `URL de outro produto (sugerido: ${slugify(nome)})`);
    }

    if (/SCXW|NormalTextRun|TextRun|data-ccp/.test(p.short_description + p.description)) report.officeMarkup.push(sku || p.slug);

    const sub = resolveSubcategories(p);
    const pillar = resolvePillar(p, sub.values, pillarBySub);
    if (sub.source !== 'atributo' || pillar.source !== 'atributo') {
      report.inferred.push({ sku, nome, categoria: `${pillar.value || '—'} (${pillar.source})`, subcategoria: `${sub.values.join(' | ') || '—'} (${sub.source})` });
    }
    if (!pillar.value) flag(folder, 'Sem categoria');
    if (!sub.values.length) flag(folder, 'Sem subcategoria');
    for (const t of [...attrTerms(p, 'pa_subcategoria'), ...p.categories.map((c) => decodeEntities(c.name))]) {
      if (SUBCATEGORY_ALIASES[t]) report.categoryAliases[`${t} → ${SUBCATEGORY_ALIASES[t]}`] = (report.categoryAliases[`${t} → ${SUBCATEGORY_ALIASES[t]}`] ?? 0) + 1;
    }

    const { specs, prose } = parseSpecs(p.description);
    if (!specs.length) report.noSpecs.push({ sku, nome });

    // Warranty gets its own column; "Referência" equal to the SKU is redundant
    let garantia = '';
    const kept = [];
    for (const s of specs) {
      if (/^garantia$/i.test(s.atributo) && !garantia) { garantia = s.valor; continue; }
      if (/^refer[êe]ncia$/i.test(s.atributo)) {
        if (s.valor.replace(/\D/g, '') === sku) continue;
        report.refMismatch.push({ sku, nome, referencia: s.valor });
        flag(folder, `Referência na descrição (${s.valor}) diferente do SKU`);
      }
      if (/^cor$/i.test(s.atributo) && colorConflict(originalName, s.valor, palette)) {
        report.colorMismatch.push({ sku, nome, cor: s.valor });
        flag(folder, `Cor na descrição (${s.valor}) diferente da cor do nome`);
      }
      kept.push(s);
    }
    kept.forEach((s, idx) => especificacoes.push({ sku: folder, ordem: idx + 1, ...s }));

    const linkCompra = p.type === 'external' ? p.add_to_cart.url : '';
    if (p.type === 'external' && !linkCompra) report.missingBuyLink.push({ sku, nome });
    if (p.type !== 'external') report.noBuyLinkSimple++;

    const imageIds = new Set();
    const images = p.images.filter((img) => (imageIds.has(img.id) ? false : imageIds.add(img.id)));
    if (images.length !== p.images.length) report.duplicateImages.push(sku || p.slug);
    if (images.length && !SKIP_IMAGES) {
      await mkdir(join(CACHE_DIR, folder), { recursive: true });
      await mkdir(join(IMAGES_DIR, folder), { recursive: true });
    }
    images.forEach((img, idx) => {
      const ext = (img.src.split('?')[0].split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg');
      imageJobs.push({
        sku: folder,
        url: img.src,
        original: join(CACHE_DIR, folder, `${idx + 1}.${ext}`),
        dest: join(IMAGES_DIR, folder, `${idx + 1}.webp`),
      });
    });

    produtos.push({
      sku: folder,
      slug: p.slug,
      nome,
      categoria: pillar.value,
      subcategoria: sub.values.join('|'),
      tags: normalizeTags(p, pillar.value, sub.values).join('|'),
      descricao_curta: htmlToText(p.short_description),
      descricao: prose,
      garantia,
      link_compra: linkCompra,
      ativo: isPlaceholder ? 'não' : 'sim',
    });
  }

  produtos.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.subcategoria.localeCompare(b.subcategoria) || a.nome.localeCompare(b.nome));
  const published = produtos.filter((p) => !conflicts.has(p.sku));
  const inReview = produtos.filter((p) => conflicts.has(p.sku)).map((p) => ({ motivo: conflicts.get(p.sku).join(' | '), ...p }));

  const productColumns = ['sku', 'slug', 'nome', 'categoria', 'subcategoria', 'tags', 'descricao_curta', 'descricao', 'garantia', 'link_compra', 'ativo'];
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(DOCS_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, 'produtos.csv'), toCsv(published, productColumns));
  await writeFile(join(DATA_DIR, 'produtos-em-analise.csv'), toCsv(inReview, ['motivo', ...productColumns]));
  await writeFile(join(DATA_DIR, 'especificacoes.csv'), toCsv(especificacoes, ['sku', 'ordem', 'grupo', 'atributo', 'valor']));
  await writeFile(join(DOCS_DIR, 'nomes-padronizados.csv'), toCsv(report.renamed, ['sku', 'antes', 'depois']));
  console.log(`  produtos.csv (${published.length}), produtos-em-analise.csv (${inReview.length}), especificacoes.csv (${especificacoes.length} linhas)`);

  let imageResult = { failures: [], totals: null };
  if (SKIP_IMAGES) console.log('  imagens: ignoradas (--sem-imagens)');
  else {
    imageResult = await processImages(imageJobs);
    const { originalBytes, webpBytes, downloaded, converted } = imageResult.totals;
    console.log(`  ${downloaded} baixadas, ${converted} convertidas para WebP (${MAX_SIDE}px, qualidade ${WEBP_QUALITY})`);
    console.log(`  tamanho: ${formatMB(originalBytes)} → ${formatMB(webpBytes)} (-${Math.round((1 - webpBytes / originalBytes) * 100)}%)`);
  }

  const reportPath = join(DOCS_DIR, 'relatorio-exportacao.md');
  await writeFile(reportPath, buildReport({ produtos, published, inReview, especificacoes, report, imageJobs, imageResult }));
  console.log(`Pronto. Veja ${reportPath}`);
}

// ─── Report ──────────────────────────────────────────────────────────────────

function table(rows, columns) {
  if (!rows.length) return '_Nenhum._\n';
  const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [`| ${columns.join(' | ')} |`, `|${columns.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${columns.map((c) => cell(r[c])).join(' | ')} |`)].join('\n') + '\n';
}

function buildReport({ produtos, published, inReview, especificacoes, report, imageJobs, imageResult }) {
  const byPillar = produtos.reduce((m, p) => ((m[p.categoria || '(sem categoria)'] = (m[p.categoria || '(sem categoria)'] ?? 0) + 1), m), {});
  const bySub = produtos.flatMap((p) => p.subcategoria.split('|').filter(Boolean)).reduce((m, s) => ((m[s] = (m[s] ?? 0) + 1), m), {});
  const r = report;
  return `# Relatório da exportação do catálogo Modaza

Gerado em ${new Date().toLocaleString('pt-BR')} a partir de ${BASE}.

## Resumo

| Item | Total |
|---|---|
| Produtos exportados | ${produtos.length} |
| Publicados (\`dados/produtos.csv\`) | ${published.length} |
| Em análise, não publicados (\`dados/produtos-em-analise.csv\`) | ${inReview.length} |
| Linhas de especificação | ${especificacoes.length} |
| Imagens | ${imageJobs.length}${imageResult.failures.length ? ` (${imageResult.failures.length} falharam)` : ''} |
${imageResult.totals ? `| Tamanho das imagens | ${formatMB(imageResult.totals.originalBytes)} originais → ${formatMB(imageResult.totals.webpBytes)} em WebP (${MAX_SIDE}px, qualidade ${WEBP_QUALITY}) |\n` : ''}
| Nomes padronizados | ${r.renamed.length} (ver \`docs/nomes-padronizados.csv\`) |
| Descrições com marcação do Word removida | ${r.officeMarkup.length} |
| Categoria ou subcategoria inferida | ${r.inferred.length} |
| Produtos sem link de compra | ${r.missingBuyLink.length + r.noBuyLinkSimple} |

**Por categoria:** ${Object.entries(byPillar).map(([k, v]) => `${k} (${v})`).join(', ')}

**Por subcategoria:** ${Object.entries(bySub).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ')}

## Precisa de decisão

Os produtos destas seções (exceto os sem link de compra) foram para \`dados/produtos-em-analise.csv\`, com o motivo na primeira coluna, e **não são publicados** até alguém corrigir os dados e mover a linha (sem a coluna \`motivo\`) para \`dados/produtos.csv\`.

### Produtos sem SKU
As imagens foram salvas em \`imagens/produtos/sem-sku-{id}/\`. Cadastre o SKU e renomeie a pasta.

${table(r.noSku, ['id', 'slug', 'nome', 'pasta'])}
### Produtos provisórios ("Em breve" ou sem conteúdo)
Exportados com \`ativo = não\`.

${table(r.placeholders, ['id', 'slug', 'nome'])}
### URL (slug) de outro produto
O endereço não corresponde ao nome, o que geralmente acontece quando um produto é duplicado e renomeado sem trocar o slug. Os slugs **não foram alterados**, porque são as URLs publicadas. Para corrigir, troque o slug no CSV e crie um redirecionamento 301 do antigo para o novo.

${table(r.slugMismatch, ['sku', 'nome', 'slug', 'sugerido'])}
### Possíveis duplicados (slug terminado em "-N" com original existente)
Confirme se são o mesmo produto.

${table(r.possibleDuplicates, ['sku', 'nome', 'slug', 'original'])}
### Referência da descrição diferente do SKU
${table(r.refMismatch, ['sku', 'nome', 'referencia'])}
### Cor da descrição diferente da cor do nome
O nome traz uma cor e a especificação, outra. Pode ser descrição copiada de outro produto.

${table(r.colorMismatch, ['sku', 'nome', 'cor'])}
### Produtos externos sem link de compra
${table(r.missingBuyLink, ['sku', 'nome'])}
Além desses, **${r.noBuyLinkSimple} produtos do tipo "simples"** nunca tiveram link de compra no WooCommerce. A coluna \`link_compra\` deles está vazia.

### Produtos sem especificações reconhecidas
${table(r.noSpecs, ['sku', 'nome'])}
## Limpeza aplicada

### Categorias unificadas
${table(Object.entries(r.categoryAliases).map(([k, v]) => ({ troca: k, ocorrencias: v })), ['troca', 'ocorrencias'])}
### Categoria ou subcategoria inferida
O atributo do WooCommerce estava vazio, então o valor veio de outra fonte (indicada entre parênteses). Revise.

${table(r.inferred, ['sku', 'nome', 'categoria', 'subcategoria'])}
### Imagens repetidas no mesmo produto (removidas)
${r.duplicateImages.length ? r.duplicateImages.join(', ') : '_Nenhuma._'}

### Outras regras
- Nomes em formato Título, com preposições em minúsculas, siglas (LED, PVC, WPC, ABS) em maiúsculas e medidas padronizadas (\`60x120\`, \`2,90m\`, \`cm\`).
- Entidades HTML (\`&#8243;\`, \`&ndash;\`) convertidas em texto.
- Garantia movida para a coluna \`garantia\`; a "Referência" igual ao SKU foi removida das especificações.
- Tags iguais à categoria ou à subcategoria foram removidas; sinônimos unificados (${Object.entries(TAG_ALIASES).map(([a, b]) => `${a} → ${b}`).join(', ')}).
${imageResult.failures.length ? `\n## Falhas nas imagens\n\n${table(imageResult.failures, ['sku', 'url', 'error'])}` : ''}`;
}

main().catch((err) => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
