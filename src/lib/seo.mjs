import { SITE } from '../config.mjs';
import { FAQ } from '../data/conteudo.mjs';

const abs = (path) => new URL(path, SITE.url).href;

/** @param {{ label: string, href?: string }[]} items */
export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  // The current page (last item) has no href
  itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.label, ...(item.href && { item: abs(item.href) }) })),
});

// No price on purpose: the site is a catalog, sales happen at partner stores
export const productLd = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: p.nome,
  sku: p.sku,
  mpn: p.sku,
  brand: { '@type': 'Brand', name: SITE.nome },
  description: p.descricaoCurta || p.nome,
  category: [p.pilar.nome, p.subcategorias[0].nome].join(' > '),
  image: p.imagens.map((i) => abs(i.src)),
  url: abs(p.url),
});

export const faqLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.pergunta, acceptedAnswer: { '@type': 'Answer', text: f.resposta } })),
});

export const itemListLd = (produtos) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  numberOfItems: produtos.length,
  itemListElement: produtos.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(p.url), name: p.nome })),
});
