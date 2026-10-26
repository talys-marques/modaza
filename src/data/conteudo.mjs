// Editorial content that is not product data: catalogs, warranty and FAQ.
import { ARQUIVOS_URL } from '../config.mjs';
import { url } from '../lib/url.mjs';

// `legado` lists the old WordPress paths, redirected to the current file
export const CATALOGOS = [
  {
    titulo: 'Porcelanatos',
    ano: 2026,
    arquivo: 'MODAZA_Catalogo-Porcelanatos_2026.pdf',
    tamanhoMB: 44.9,
    capa: { sku: '100018733', imagem: 2 },
    legado: ['/wp-content/uploads/2026/04/MODAZA_Catalogo-Porcelanatos_2026.pdf', '/wp-content/uploads/2025/04/AF_MODAZA_Catalogo-Porcelanatos_web.pdf'],
  },
  {
    titulo: 'Painéis, decks e rodapés',
    ano: 2026,
    arquivo: 'MODAZA_Catalogo-PaineisDecksRodapes_2026_V3-1.pdf',
    tamanhoMB: 53.5,
    capa: { sku: '100019112', imagem: 1 },
    legado: ['/wp-content/uploads/2026/08/MODAZA_Catalogo-PaineisDecksRodapes_2026_V3-1.pdf', '/wp-content/uploads/2026/04/MODAZA_Catalogo-PaineisDecksRodapes_2026.pdf'],
  },
  {
    titulo: 'Pisos vinílicos e laminados',
    ano: 2025,
    arquivo: 'MODAZA_Catalogo-PisosVinilicos_web2025.pdf',
    tamanhoMB: 46.6,
    capa: { sku: '100018173', imagem: 2 },
    legado: ['/wp-content/uploads/2025/03/MODAZA_Catalogo-PisosVinilicos_web2025.pdf', '/wp-content/uploads/2024/07/CATALOGO-PISOS-VINILICOS.pdf'],
  },
  {
    titulo: 'Louças sanitárias',
    ano: 2026,
    arquivo: 'MODAZA_Catalogo-LoucasSanitarias-2026-4.pdf',
    tamanhoMB: 25.8,
    capa: { sku: '100023404', imagem: 4 },
    legado: ['/wp-content/uploads/2026/03/MODAZA_Catalogo-LoucasSanitarias-2026-4.pdf'],
  },
  {
    titulo: 'Metais',
    ano: 2024,
    arquivo: 'MODAZA_Catalogo-Metais_web-1.pdf',
    tamanhoMB: 48.5,
    capa: { sku: '100026134', imagem: 3 },
    legado: ['/wp-content/uploads/2024/07/MODAZA_Catalogo-Metais_web-1.pdf'],
  },
  {
    titulo: 'Iluminação',
    ano: 2026,
    arquivo: 'MODAZA_Catalogo-Iluminacao_2026-1.pdf',
    tamanhoMB: 58.1,
    capa: { sku: '100029947', imagem: 5 },
    legado: ['/wp-content/uploads/2026/04/MODAZA_Catalogo-Iluminacao_2026-1.pdf', '/wp-content/uploads/2024/07/CATALOGO-ILUMINACAO.pdf'],
  },
].map((c) => ({ ...c, url: `${ARQUIVOS_URL}/catalogos/${c.arquivo}` }));

export const GARANTIA = [
  {
    linha: 'Revestimentos',
    produtos: 'Decks, porcelanatos, painéis ripados, rodapés, pisos vinílicos e tijolos de vidro',
    texto:
      'Os revestimentos Modaza são projetados com foco em estética, funcionalidade e durabilidade, seguindo padrões avançados de qualidade. Todos têm garantia contra defeitos de fabricação a partir da data da compra, comprovada pela nota fiscal.',
    certificado: null,
  },
  {
    linha: 'Metais e louças sanitárias',
    produtos: 'Torneiras, duchas, acessórios de banheiro, cubas e vasos sanitários',
    texto:
      'Os metais e louças Modaza são pensados para a experiência de uso, com tecnologia e qualidade. Têm garantia de 5 anos contra defeitos de fabricação a partir da data da compra, comprovada pela nota fiscal.',
    certificado: { titulo: 'Certificado de garantia — Metais', url: url('/arquivos/garantia/certificado-de-garantia-metais.pdf'), legado: '/wp-content/uploads/2023/04/Certificado-De-Garantia-Modaza-Metais.pdf' },
  },
  {
    linha: 'Iluminação',
    produtos: 'Pendentes, plafons, painéis de LED, spots, arandelas e refletores',
    texto:
      'Os produtos de iluminação Modaza são projetados com foco em estética, funcionalidade e durabilidade. Têm garantia contra defeitos de fabricação a partir da data da compra, comprovada pela nota fiscal.',
    certificado: { titulo: 'Política de garantia — Iluminação', url: url('/arquivos/garantia/politica-de-garantia-iluminacao.pdf'), legado: '/wp-content/uploads/2024/09/Politica-de-Garantia-Iluminacao.pdf' },
  },
];

export const FAQ = [
  {
    pergunta: 'Consigo comprar os produtos Modaza em loja física?',
    resposta: 'Sim. Os produtos Modaza são vendidos em lojas e revendas autorizadas. Veja a mais próxima em “Onde encontrar”.',
  },
  {
    pergunta: 'Por que sou direcionado para outro site na hora da compra?',
    resposta:
      'O site da Modaza é um catálogo: aqui você conhece os produtos e, quando quiser comprar, é levado ao site de um parceiro autorizado.',
  },
  {
    pergunta: 'Esses sites são confiáveis?',
    resposta: 'Sim. Todos os parceiros são autorizados a vender produtos Modaza e usam conexão segura (certificado SSL).',
  },
  {
    pergunta: 'Como instalar os produtos Modaza?',
    resposta:
      'Cada embalagem traz um manual com as orientações de instalação. Recomendamos que a instalação seja feita por um profissional especializado.',
  },
  {
    pergunta: 'Qual é o prazo de garantia e como sei se meu produto está coberto?',
    resposta:
      'O prazo aparece na página de cada produto e no verso da embalagem. Os critérios de cada linha estão na seção de garantia do Atendimento ao Cliente.',
  },
  {
    pergunta: 'Como acionar a garantia ou a assistência técnica?',
    resposta:
      'Leve o produto à loja onde ele foi comprado, com um vídeo mostrando o defeito, um documento do titular da compra e a nota ou cupom fiscal. Se a compra foi on-line, procure a loja física mais próxima do parceiro ou escreva para contato@modaza.com.br. A assistência técnica autorizada tem até 30 dias corridos, a partir do recebimento do produto, para resolver.',
  },
];
