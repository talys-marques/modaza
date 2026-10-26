#!/usr/bin/env node
// Checks dados/*.csv without building the site: `npm run validar`.
// Uses the same rules as the build, so a passing check means the build will accept the data.

import { catalogo, CatalogError } from '../src/lib/catalogo.mjs';

try {
  const { produtos, emAnalise, pilares } = catalogo();
  console.log(`OK: ${produtos.length} produtos publicados, ${emAnalise.length} em análise (não publicados).`);
  for (const p of pilares) console.log(`  ${p.nome}: ${p.produtos.length} produtos em ${p.subcategorias.length} subcategorias`);
  const semLink = produtos.filter((p) => !p.linkCompra).length;
  if (semLink) console.log(`Aviso: ${semLink} produtos sem link_compra (o botão leva para "Onde encontrar").`);
} catch (err) {
  console.error(err instanceof CatalogError ? err.message : err);
  process.exit(1);
}
