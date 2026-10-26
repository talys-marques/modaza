// Same shape as the WordPress slugs the old site used: "Rodapé 2,5 cm" -> "rodape-25-cm"
export const slugify = (s) =>
  String(s)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/(\d)[,.](?=\d)/g, '$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Lowercase without accents, so "valvula" finds "Válvula"
export const searchable = (s) =>
  String(s)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const splitList = (s) =>
  String(s ?? '')
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean);
