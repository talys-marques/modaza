// Site-wide settings. Product data lives in dados/*.csv; this file holds what is not a product.
import { url } from './lib/url.mjs';

// Production address. SITE_URL + BASE_PATH override it for previews (GitHub Pages workflow)
const PRODUCAO_URL = 'https://modaza.com.br';
const ORIGEM = (process.env.SITE_URL || PRODUCAO_URL).replace(/\/$/, '');

export const SITE = {
  nome: 'Modaza',
  url: (ORIGEM + url('/')).replace(/\/$/, ''),
  producao: ORIGEM === PRODUCAO_URL,
  titulo: 'Modaza | Revestimentos, Metais, Louças Sanitárias e Iluminação',
  descricao:
    'Soluções para construir ambientes com produtos de qualidade, design sofisticado e acabamentos que valorizam cada espaço.',
  empresa: 'Global Distribuição de Bens de Consumo Ltda',
  endereco: 'BR 116, km 223,5, nº 7350 · Dois Irmãos – RS · CEP 93950-000',
  email: 'contato@modaza.com.br',
  whatsapp: { numero: '5551995016168', exibicao: '(51) 99501-6168' },
};

// Loaded only in production builds
export const ANALYTICS = {
  ga4: 'G-57BS6K1GD7',
  clarity: 'y7e9o1n1aw',
};

// Base URL for the catalog PDFs (25–60 MB each, too big for Git and for Cloudflare Pages).
// Upload them to object storage and set PUBLIC_ARQUIVOS_URL, e.g. https://arquivos.modaza.com.br
export const ARQUIVOS_URL = (import.meta.env?.PUBLIC_ARQUIVOS_URL || process.env.PUBLIC_ARQUIVOS_URL || url('/arquivos')).replace(/\/$/, '');

// Contact form → Emarsys, same mechanism as the NPS survey (register.php).
// The CRM team must create the form in Emarsys and fill formId and the field ids below.
// While formId is empty the form falls back to opening an e-mail to SITE.email.
export const EMARSYS_CONTATO = {
  action: 'https://link.taqi.com.br/u/register.php',
  cid: '1091684449',
  formId: '',
  campos: {
    nome: 'inp_1',
    email: 'inp_3',
    telefone: '',
    tipo: '',
    mensagem: '',
  },
};

export const TIPOS_ATENDIMENTO = [
  'Dúvida',
  'Reclamação',
  'Sugestão',
  'Assistência técnica',
  'Quero ser uma assistência técnica autorizada',
  'Quero ser um distribuidor/representante',
];

// Where to buy. link: null hides the button (KZA Decor's WhatsApp on the old site,
// wa.me/5195134834, has no country code and opens a number in Peru; confirm the right one).
export const REVENDAS = [
  { nome: 'taQi', logo: url('/revendas/taqi.webp'), link: 'https://www.taqi.com.br/nossas-lojas', acao: 'Ver lojas', tipo: 'Lojas físicas e on-line' },
  { nome: 'Ponto Casa Acabamentos', logo: url('/revendas/ponto-casa.webp'), link: 'https://wa.me/message/WX64WGTFYQ6MG1', acao: 'Chamar no WhatsApp', tipo: 'Revenda autorizada' },
  { nome: 'Madeireira Presidente', logo: url('/revendas/madeireira-presidente.webp'), link: 'https://wa.me/5551980258694', acao: 'Chamar no WhatsApp', tipo: 'Revenda autorizada' },
  { nome: 'KZA Decor', logo: url('/revendas/kza-decor.webp'), link: null, acao: 'Chamar no WhatsApp', tipo: 'Revenda autorizada' },
];

// Photos taken from the catalog: { sku, imagem } points to imagens/produtos/{sku}/{imagem}.*
export const HOME = {
  hero: [
    { sku: '100030032', imagem: 1, alt: 'Cozinha com pendentes Modaza sobre a bancada' },
    { sku: '100023223', imagem: 3, alt: 'Cuba de apoio preta Modaza em bancada escura' },
    { sku: '100019146', imagem: 2, alt: 'Deck Modaza ao redor de piscina' },
  ],
  pilares: {
    construir: { sku: '100019146', imagem: 2 },
    decorar: { sku: '100023404', imagem: 4 },
    iluminar: { sku: '100030121', imagem: 2 },
    proteger: null,
  },
  destaques: ['100030032', '100018733', '100023223', '100026134', '100029923', '100018230', '100023404', '100030121'],
};

export const PILARES = [
  {
    nome: 'Construir',
    slug: 'construir',
    resumo: 'Pisos e revestimentos que garantem originalidade em qualquer ambiente.',
  },
  {
    nome: 'Decorar',
    slug: 'decorar',
    resumo: 'Metais, cubas e louças que trazem personalidade e tendência para cada espaço.',
  },
  {
    nome: 'Iluminar',
    slug: 'iluminar',
    resumo: 'Do clássico ao moderno, o que há de melhor para valorizar ambientes e composições.',
  },
  {
    nome: 'Proteger',
    slug: 'proteger',
    resumo: 'Produtos que preservam e asseguram soluções de extrema qualidade.',
  },
];
