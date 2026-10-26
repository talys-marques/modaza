// Loads and validates the catalog: dados/produtos.csv, dados/produtos-em-analise.csv,
// dados/especificacoes.csv and the image manifest written by scripts/preparar-imagens.mjs.
// Any data error stops the build with a list of file:line messages, so a broken CSV never
// reaches the site. Shared by the Astro pages and scripts/validar-dados.mjs.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseCsv } from './csv.mjs';
import { slugify, searchable, splitList } from './texto.mjs';
import { PILARES, HOME } from '../config.mjs';
import { CATALOGOS } from '../data/conteudo.mjs';
import { url } from './url.mjs';

const ROOT = process.cwd();
const FILES = {
  produtos: join('dados', 'produtos.csv'),
  emAnalise: join('dados', 'produtos-em-analise.csv'),
  especificacoes: join('dados', 'especificacoes.csv'),
  imagens: join('src', 'generated', 'imagens.json'),
};
const PRODUCT_COLUMNS = ['sku', 'slug', 'nome', 'categoria', 'subcategoria', 'tags', 'descricao_curta', 'descricao', 'garantia', 'link_compra', 'ativo'];
const SPEC_COLUMNS = ['sku', 'ordem', 'grupo', 'atributo', 'valor'];

export class CatalogError extends Error {
  constructor(errors) {
    super(`Dados do catálogo com ${errors.length} erro(s):\n  - ${errors.join('\n  - ')}`);
    this.errors = errors;
  }
}

const imageUrls = (sku, img) => ({
  src: url(`/img/produtos/${sku}/${img.n}.webp`),
  thumb: url(`/img/produtos/${sku}/${img.n}-640.webp`),
  w: img.w,
  h: img.h,
  tw: img.tw,
  th: img.th,
});

function readCsv(file, required, errors) {
  if (!existsSync(join(ROOT, file))) {
    errors.push(`${file}: arquivo não encontrado`);
    return [];
  }
  const { header, rows } = parseCsv(readFileSync(join(ROOT, file), 'utf8'));
  const missing = required.filter((c) => !header.includes(c));
  if (missing.length) errors.push(`${file}: faltam as colunas ${missing.join(', ')}`);
  return rows.map((r) => ({ ...r, file }));
}

function load() {
  const errors = [];
  if (!existsSync(join(ROOT, FILES.imagens))) {
    throw new CatalogError([`${FILES.imagens} não existe. Rode "npm run imagens" (o dev e o build já fazem isso).`]);
  }
  const manifest = JSON.parse(readFileSync(join(ROOT, FILES.imagens), 'utf8'));
  const productRows = readCsv(FILES.produtos, PRODUCT_COLUMNS, errors);
  const reviewRows = readCsv(FILES.emAnalise, ['motivo', ...PRODUCT_COLUMNS], errors);
  const specRows = readCsv(FILES.especificacoes, SPEC_COLUMNS, errors);
  const pillarByName = new Map(PILARES.map((p) => [p.nome.toLocaleLowerCase('pt-BR'), p]));

  // SKUs and slugs must be unique across both product files, so moving a row is safe
  const seenSku = new Map();
  const seenSlug = new Map();
  for (const row of [...productRows, ...reviewRows]) {
    const where = `${row.file} linha ${row.line}`;
    const { sku, slug } = row.values;
    if (sku && seenSku.has(sku)) errors.push(`${where}: SKU ${sku} repetido (já aparece em ${seenSku.get(sku)})`);
    if (slug && seenSlug.has(slug)) errors.push(`${where}: slug "${slug}" repetido (já aparece em ${seenSlug.get(slug)})`);
    seenSku.set(sku, where);
    seenSlug.set(slug, where);
  }

  const produtos = [];
  for (const row of productRows) {
    const where = `${row.file} linha ${row.line}`;
    const v = row.values;
    const fail = (msg) => errors.push(`${where} (SKU ${v.sku || '?'}): ${msg}`);

    if (!v.sku) fail('SKU vazio');
    if (!v.nome) fail('nome vazio');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)) fail(`slug "${v.slug}" inválido (use só letras minúsculas, números e hífens)`);
    const pilar = pillarByName.get(v.categoria.toLocaleLowerCase('pt-BR'));
    if (!pilar) fail(`categoria "${v.categoria}" inválida (use ${PILARES.map((p) => p.nome).join(', ')})`);
    const subcategorias = splitList(v.subcategoria);
    if (!subcategorias.length) fail('subcategoria vazia');
    const ativo = searchable(v.ativo);
    if (!['sim', 'nao'].includes(ativo)) fail(`ativo deve ser "sim" ou "não" (está "${v.ativo}")`);
    if (v.link_compra && !/^https:\/\/[^\s]+$/.test(v.link_compra)) fail(`link_compra "${v.link_compra}" não é uma URL https válida`);
    const imagens = (manifest[v.sku] ?? []).map((img) => imageUrls(v.sku, img));
    if (ativo === 'sim' && !imagens.length) fail(`nenhuma foto em imagens/produtos/${v.sku}/`);
    if (ativo !== 'sim' || !pilar) continue;

    produtos.push({
      sku: v.sku,
      slug: v.slug,
      nome: v.nome,
      url: url(`/produtos/${v.slug}/`),
      pilar,
      subcategorias: subcategorias.map((nome) => ({ nome, slug: slugify(nome), url: url(`/categoria-produto/${pilar.slug}/${slugify(nome)}/`) })),
      tags: splitList(v.tags),
      descricaoCurta: v.descricao_curta,
      descricao: v.descricao,
      garantia: v.garantia,
      linkCompra: v.link_compra,
      imagens,
      especificacoes: [],
      busca: searchable([v.nome, v.sku, v.categoria, v.subcategoria.replace(/\|/g, ' '), v.tags.replace(/\|/g, ' ')].join(' ')),
    });
  }

  const emAnalise = reviewRows.map((r) => ({ ...r.values, line: r.line }));
  const knownSkus = new Set([...productRows, ...reviewRows].map((r) => r.values.sku));
  const bySku = new Map(produtos.map((p) => [p.sku, p]));

  // Specs are grouped in file order, sorted by "ordem" within each product
  const specsBySku = new Map();
  for (const row of specRows) {
    const where = `${row.file} linha ${row.line}`;
    const v = row.values;
    if (!knownSkus.has(v.sku)) errors.push(`${where}: SKU ${v.sku} não existe em produtos.csv nem em produtos-em-analise.csv`);
    if (!v.atributo || !v.valor) errors.push(`${where} (SKU ${v.sku}): atributo e valor são obrigatórios`);
    if (!/^\d+$/.test(v.ordem)) errors.push(`${where} (SKU ${v.sku}): ordem deve ser um número`);
    if (bySku.has(v.sku)) (specsBySku.get(v.sku) ?? specsBySku.set(v.sku, []).get(v.sku)).push(v);
  }
  for (const [sku, specs] of specsBySku) {
    const groups = new Map();
    for (const s of specs.sort((a, b) => Number(a.ordem) - Number(b.ordem))) {
      const name = s.grupo || 'Informações gerais';
      (groups.get(name) ?? groups.set(name, []).get(name)).push({ atributo: s.atributo, valor: s.valor });
    }
    bySku.get(sku).especificacoes = [...groups].map(([grupo, itens]) => ({ grupo, itens }));
  }

  // Photos referenced from config.mjs and conteudo.mjs must exist
  const imageRef = (ref, where) => {
    const img = (manifest[ref.sku] ?? []).find((i) => i.n === ref.imagem);
    if (!img) {
      errors.push(`${where}: foto ${ref.imagem} do SKU ${ref.sku} não existe em imagens/produtos/${ref.sku}/`);
      return null;
    }
    return imageUrls(ref.sku, img);
  };
  const hero = HOME.hero.map((h, i) => ({ ...h, ...imageRef(h, `config.mjs HOME.hero[${i}]`) }));
  const pillarCovers = Object.fromEntries(
    Object.entries(HOME.pilares).map(([slug, ref]) => [slug, ref ? imageRef(ref, `config.mjs HOME.pilares.${slug}`) : null])
  );
  const catalogos = CATALOGOS.map((c) => ({ ...c, capaImg: imageRef(c.capa, `conteudo.mjs CATALOGOS "${c.titulo}"`) }));
  const destaques = HOME.destaques.map((sku) => {
    if (!bySku.has(sku)) errors.push(`config.mjs HOME.destaques: SKU ${sku} não está publicado em produtos.csv`);
    return bySku.get(sku);
  });

  if (errors.length) throw new CatalogError(errors);

  produtos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Category tree built from the data: only pillars/subcategories that have products
  const pilares = PILARES.map((pilar) => {
    const items = produtos.filter((p) => p.pilar.slug === pilar.slug);
    const subs = new Map();
    for (const p of items) {
      for (const s of p.subcategorias) {
        if (!subs.has(s.slug)) subs.set(s.slug, { ...s, produtos: [] });
        subs.get(s.slug).produtos.push(p);
      }
    }
    return {
      ...pilar,
      url: url(`/categoria-produto/${pilar.slug}/`),
      capa: pillarCovers[pilar.slug] ?? items[0]?.imagens[0] ?? null,
      produtos: items,
      subcategorias: [...subs.values()].sort((a, b) => b.produtos.length - a.produtos.length),
    };
  }).filter((p) => p.produtos.length);

  return {
    produtos,
    emAnalise,
    pilares,
    hero,
    catalogos,
    destaques,
    porSku: bySku,
    porSlug: new Map(produtos.map((p) => [p.slug, p])),
  };
}

let cached;
export function catalogo() {
  cached ??= load();
  return cached;
}

// Products from the same subcategory first, then from the same pillar
export function relacionados(produto, limite = 4) {
  const { produtos } = catalogo();
  const subs = new Set(produto.subcategorias.map((s) => s.slug));
  const others = produtos.filter((p) => p.sku !== produto.sku);
  const same = others.filter((p) => p.subcategorias.some((s) => subs.has(s.slug)));
  const pillar = others.filter((p) => p.pilar.slug === produto.pilar.slug && !same.includes(p));
  return [...same, ...pillar].slice(0, limite);
}
