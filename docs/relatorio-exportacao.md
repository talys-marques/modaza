# Relatório da exportação do catálogo Modaza

Gerado em 26/10/2026, 09:27:53 a partir de https://modaza.com.br.

## Resumo

| Item | Total |
|---|---|
| Produtos exportados | 329 |
| Publicados (`dados/produtos.csv`) | 307 |
| Em análise, não publicados (`dados/produtos-em-analise.csv`) | 22 |
| Linhas de especificação | 5632 |
| Imagens | 1340 |
| Tamanho das imagens | 1.134,5 MB originais → 93,1 MB em WebP (1600px, qualidade 80) |

| Nomes padronizados | 328 (ver `docs/nomes-padronizados.csv`) |
| Descrições com marcação do Word removida | 35 |
| Categoria ou subcategoria inferida | 68 |
| Produtos sem link de compra | 172 |

**Por categoria:** Construir (154), Decorar (93), Iluminar (81), Proteger (1)

**Por subcategoria:** Painel Ripado (59), Porcelanato (43), Acessórios para Banheiro (31), Torneira (30), Painel de LED (28), Pendente (20), Rodapé (19), Piso Vinílico (17), Plafon (16), Vaso Sanitário (13), Cubas de Cerâmica (12), Ducha Fria (7), Piso Laminado (6), Spot LED (6), Acessórios para Decks (5), Arandela (5), Tijolo de Vidro (4), Refletor (4), Luminária (2), Lustre (2), Deck (1)

## Precisa de decisão

Os produtos destas seções (exceto os sem link de compra) foram para `dados/produtos-em-analise.csv`, com o motivo na primeira coluna, e **não são publicados** até alguém corrigir os dados e mover a linha (sem a coluna `motivo`) para `dados/produtos.csv`.

### Produtos sem SKU
As imagens foram salvas em `imagens/produtos/sem-sku-{id}/`. Cadastre o SKU e renomeie a pasta.

| id | slug | nome | pasta |
|---|---|---|---|
| 5897 | coluna-para-lavatorio-modaza-vita-branco | Coluna para Lavatório Modaza Vita, Branco | sem-sku-5897 |
| 5790 | acabamento-para-painrl-ripado-modaza-wpc-externo-6-x-290-cm-nero | Acabamento para Painel Ripado Modaza WPC Externo, 6 x 290 cm, Nero | sem-sku-5790 |
| 928 | em-breve-3 | Em Breve | sem-sku-928 |

### Produtos provisórios ("Em breve" ou sem conteúdo)
Exportados com `ativo = não`.

| id | slug | nome |
|---|---|---|
| 928 | em-breve-3 | Em Breve |

### URL (slug) de outro produto
O endereço não corresponde ao nome, o que geralmente acontece quando um produto é duplicado e renomeado sem trocar o slug. Os slugs **não foram alterados**, porque são as URLs publicadas. Para corrigir, troque o slug no CSV e crie um redirecionamento 301 do antigo para o novo.

| sku | nome | slug | sugerido |
|---|---|---|---|
| 100018378 | Piso Vinílico Click Modaza 4,5mm Truffel | piso-vinilico-click-modaza-45mm-marone-2 | piso-vinilico-click-modaza-45mm-truffel |
| 100018890 | Porcelanato Acetinado Modaza Forli, 60x120 | porcelanato-acetinado-modaza-carrara-60x120-2 | porcelanato-acetinado-modaza-forli-60x120 |
| 100028875 | Painel LED de Sobrepor Modaza, Polipropileno, Quadrado, Luz Branca 6500K, 18W, 21,8 cm | painel-led-de-embutir-modaza-polipropileno-quadrado-luz-branca-6500k-18w-218-cm-2 | painel-led-de-sobrepor-modaza-polipropileno-quadrado-luz-branca-6500k-18w-218-cm |
| 100018699 | Porcelanato Polido Modaza Verona Nero, 80x80 | anel-vedacao-modaza-fl-07-p-vaso-sanitario-7 | porcelanato-polido-modaza-verona-nero-80x80 |
| 100018477 | Porcelanato Polido Modaza Áquila, 60x120 | anel-vedacao-modaza-fl-07-p-vaso-sanitario-6 | porcelanato-polido-modaza-aquila-60x120 |
| 100018470 | Porcelanato Polido Modaza Ravena, 60x120 | anel-vedacao-modaza-fl-07-p-vaso-sanitario-5 | porcelanato-polido-modaza-ravena-60x120 |
| 100018453 | Porcelanato Polido Modaza Forli, 60x120 | anel-vedacao-modaza-fl-07-p-vaso-sanitario-4 | porcelanato-polido-modaza-forli-60x120 |
| 100023108 | Kit Vaso Sanitário Monobloco Modaza Acqua 3/6 Litros, Branco | anel-vedacao-modaza-fl-07-p-vaso-sanitario-3 | kit-vaso-sanitario-monobloco-modaza-acqua-3-6-litros-branco |
| 100023101 | Kit Vaso Sanitário Monobloco Modaza Chiare, 3/6 Litros, Branco | anel-vedacao-modaza-fl-07-p-vaso-sanitario-2 | kit-vaso-sanitario-monobloco-modaza-chiare-3-6-litros-branco |

### Possíveis duplicados (slug terminado em "-N" com original existente)
Confirme se são o mesmo produto.

| sku | nome | slug | original |
|---|---|---|---|
| 100078892 | Perfil Painel Ripado L Modaza PVC Imbuia, 285 x 2,5 cm | perfil-painel-ripado-l-modaza-pvc-imbuia-285-x-25-cm-2 | perfil-painel-ripado-l-modaza-pvc-imbuia-285-x-25-cm |

### Referência da descrição diferente do SKU
| sku | nome | referencia |
|---|---|---|
|  | Coluna para Lavatório Modaza Vita, Branco | 100064921 |
| 100028926 | Painel LED de Sobrepor Modaza, Polipropileno, Redondo, Luz Branca 6500K, 24W, 29,4 cm | 196662 |
| 100019099 | Válvula Click para Cuba Modaza, 1.1/4", Cromada | 100018995 |

### Cor da descrição diferente da cor do nome
O nome traz uma cor e a especificação, outra. Pode ser descrição copiada de outro produto.

| sku | nome | cor |
|---|---|---|
| 100078892 | Perfil Painel Ripado L Modaza PVC Imbuia, 285 x 2,5 cm | Duna |
| 100068995 | Acabamento para Painel Ripado Modaza WPC Externo, 6 x 290 cm, Gray | Nero |
| 100068988 | Painel Ripado Modaza WPC Externo Gray 21,9x290 cm | Ipê |
| 100029848 | Spot LED para Trilho Eletrificado Modaza, Preto, 6500K, 7W | Branca |
| 100018265 | Piso Vinílico Modaza LVT 2mm Marone | Salice |
| 100018213 | Piso Vinílico Modaza LVT 2mm Citrino | Canne |
| 100018699 | Porcelanato Polido Modaza Verona Nero, 80x80 | Cinza |

### Produtos externos sem link de compra
| sku | nome |
|---|---|
| 100026274 | Torneira de Parede Modaza Ora |
| 100026247 | Torneira Misturador de Parede Modaza Allegra |
| 100026988 | Torneira para Lavatório Modaza Uno |
| 100026981 | Torneira para Lavatório Modaza Slim |
| 100026974 | Torneira Eletrônica Modaza Blu com Sensor |
| 100026957 | Torneira Monocomando Lavatório Modaza Mondo, Bica Baixa |
| 100026834 | Torneira Monocomando Lavatório Modaza Quadrato, Bica Baixa |
| 100026800 | Torneira Monocomando Lavatório Modaza Sole, Bica Alta |
| 100026749 | Torneira Monocomando Lavatório Modaza Quadrato, Bica Alta |
| 100028926 | Painel LED de Sobrepor Modaza, Polipropileno, Redondo, Luz Branca 6500K, 24W, 29,4 cm |
| 100028919 | Painel LED de Sobrepor Modaza, Polipropileno, Redondo, Luz Branca 6500K, 18W, 21,9 cm |
| 100028868 | Painel LED de Embutir Modaza, Polipropileno, Redondo, Luz Branca 6500K, 24W, 29,7 cm |
| 100028844 | Painel LED de Embutir Modaza, Polipropileno, Redondo, Luz Branca 6500K, 18W, 22,3 cm |
| 100028913 | Painel LED de Sobrepor Modaza, Polipropileno, Quadrado, Luz Branca 6500K, 24W, 29,4 cm |
| 100028875 | Painel LED de Sobrepor Modaza, Polipropileno, Quadrado, Luz Branca 6500K, 18W, 21,8 cm |
| 100028827 | Painel LED de Embutir Modaza, Polipropileno, Quadrado, Luz Branca 6500K, 18W, 21,8 cm |
| 100029192 | Painel LED de Sobrepor Modaza, Alumínio, Redondo, Luz Branca 6500K, 24W, 28 cm |
| 100029155 | Painel LED de Sobrepor Modaza, Alumínio, Redondo, Luz Branca 6500K, 18W, 20,5 cm |
| 100029149 | Painel LED de Sobrepor Modaza, Alumínio, Redondo, Luz Branca 4000K, 18W, 20,5 cm |
| 100029066 | Painel LED de Sobrepor Modaza, Alumínio, Redondo, Luz Branca 4000K, 24W, 28 cm |
| 100029059 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca, 6500K, 24W, 29,5 cm |
| 100029052 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca 4000K, 24W, 29,5 cm |
| 100029015 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca 6500K, 18W, 20,5cm |
| 100029008 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca 4000K, 18W, 20,5 cm |
| 100029142 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 6500K, 24W, 28 cm |
| 100029124 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 4000K, 24W, 28 cm |
| 100029107 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 6500K, 18W, 20,5 cm |
| 100029100 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 4000K, 18W, 20,5 cm |
|  | Em Breve |

Além desses, **143 produtos do tipo "simples"** nunca tiveram link de compra no WooCommerce. A coluna `link_compra` deles está vazia.

### Produtos sem especificações reconhecidas
| sku | nome |
|---|---|
|  | Em Breve |

## Limpeza aplicada

### Categorias unificadas
| troca | ocorrencias |
|---|---|
| Acessórios de Banheiro → Acessórios para Banheiro | 3 |
| Porcelanatos → Porcelanato | 21 |
| Torneiras → Torneira | 21 |

### Categoria ou subcategoria inferida
O atributo do WooCommerce estava vazio, então o valor veio de outra fonte (indicada entre parênteses). Revise.

| sku | nome | categoria | subcategoria |
|---|---|---|---|
| 100074495 | Kit Vaso Sanitário Monobloco Modaza Puri Nero 3/6L | Decorar (categoria WooCommerce) | Vaso Sanitário (categoria WooCommerce) |
| 100074494 | Kit Vaso Sanitário Monobloco Modaza Domus Nero 3/6L | Decorar (categoria WooCommerce) | Vaso Sanitário (categoria WooCommerce) |
| 100029783 | Conector Emenda Reta para Trilho Eletrificado Modaza, Preto | Iluminar (atributo) | — (não resolvida) |
| 100029766 | Conector Emenda L 90º para Trilho Eletrificado Modaza, Preto | Iluminar (atributo) | — (não resolvida) |
| 100029199 | Plafon Modaza Sublime Quadrado, Branco | Iluminar (categoria WooCommerce) | Plafon (atributo) |
| 100018790 | Porcelanato Polido Modaza Calabria, 100x100 | Construir (categoria WooCommerce) | Porcelanato (atributo) |
| 100026988 | Torneira para Lavatório Modaza Uno | Decorar (categoria WooCommerce) | Torneira (categoria WooCommerce) |
| 100029066 | Painel LED de Sobrepor Modaza, Alumínio, Redondo, Luz Branca 4000K, 24W, 28 cm | Iluminar (categoria WooCommerce) | Painel de LED (nome do produto) |
| 100029052 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca 4000K, 24W, 29,5 cm | Iluminar (categoria WooCommerce) | Painel de LED (atributo) |
| 100029015 | Painel LED de Embutir Modaza, Alumínio, Redondo, Luz Branca 6500K, 18W, 20,5cm | Iluminar (categoria WooCommerce) | Painel de LED (atributo) |
| 100029107 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 6500K, 18W, 20,5 cm | Iluminar (categoria WooCommerce) | Painel de LED (atributo) |
| 100029084 | Painel LED de Sobrepor Modaza, Alumínio, Quadrado, Luz Branca 6500K, 12W, 16 cm | Iluminar (categoria WooCommerce) | Painel de LED (atributo) |
| 100019054 | Rodapé de Poliestireno Modaza Liso, 7 x 285 cm, Branco | Construir (categoria WooCommerce) | Rodapé (atributo) |
| 100019146 | Acabamento Deck WPC Modaza, 6 x 2,90m, Imbuia | Construir (categoria WooCommerce) | Acessórios para Decks (atributo) |
| 100026561 | Porta Toalha de Rosto Modaza Sottille | Decorar (categoria WooCommerce) | Acessórios para Banheiro (atributo) |
| 100026445 | Papeleira Modaza Prima | Decorar (categoria WooCommerce) | Acessórios para Banheiro (atributo) |
| 100026889 | Torneira Lavatório Modaza Bella, Bica Baixa | Decorar (categoria WooCommerce) | Torneira (atributo) |
| 100027022 | Ducha Fria Modaza Quadrato Nero, Preto | Decorar (categoria WooCommerce) | Ducha Fria (atributo) |
| 100026694 | Ducha Higiênica Modaza Sole, Cromado | Decorar (categoria WooCommerce) | Ducha Fria (nome do produto) |
| 100029988 | Pendente Modaza Ditta, Médio, Preto/Marrom | Iluminar (categoria WooCommerce) | Pendente (atributo) |
| 100028687 | Plafon Modaza Lumiere Redondo, 39 cm, Branco | Iluminar (categoria WooCommerce) | Plafon (atributo) |
| 100018545 | Porcelanato Polido Modaza Catanha, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018699 | Porcelanato Polido Modaza Verona Nero, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018446 | Tijolo de Vidro Modaza Tangerine | Construir (atributo) | Tijolo de Vidro (categoria WooCommerce) |
| 100018419 | Tijolo de Vidro Modaza Parallel | Construir (atributo) | Tijolo de Vidro (categoria WooCommerce) |
| 100018412 | Tijolo de Vidro Modaza Jewel | Construir (atributo) | Tijolo de Vidro (categoria WooCommerce) |
| 100018405 | Tijolo de Vidro Modaza Cloudy | Construir (atributo) | Tijolo de Vidro (categoria WooCommerce) |
| 100018692 | Porcelanato Polido Modaza Ravena, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018685 | Porcelanato Polido Modaza Novara, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018658 | Porcelanato Polido Modaza Catanha, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018651 | Porcelanato Polido Modaza Carrara, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018634 | Porcelanato Polido Modaza Calabria, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018617 | Porcelanato Polido Modaza Forli, 80x80 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018610 | Porcelanato Polido Modaza Verona Nero, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018593 | Porcelanato Polido Modaza Novara, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018586 | Porcelanato Polido Modaza Luca, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018559 | Porcelanato Polido Modaza Ferrara, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018552 | Porcelanato Polido Modaza Crema, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018511 | Porcelanato Polido Modaza Calabria, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018494 | Porcelanato Polido Modaza Bari Blu, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018477 | Porcelanato Polido Modaza Áquila, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018470 | Porcelanato Polido Modaza Ravena, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018453 | Porcelanato Polido Modaza Forli, 60x120 | Construir (atributo) | Porcelanato (categoria WooCommerce) |
| 100018953 | Ligação Flexível Inoxidável Modaza 1/2x60CM. | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100018950 | Ligação Flexível Inoxidável Modaza 1/2 x 40cm. | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100023125 | Kit Vaso Sanitário Monobloco Modaza Puri, 3/6 Litros, Branco | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100023108 | Kit Vaso Sanitário Monobloco Modaza Acqua 3/6 Litros, Branco | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100023101 | Kit Vaso Sanitário Monobloco Modaza Chiare, 3/6 Litros, Branco | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100018858 | Anel de Vedação Modaza FL-07 p/ Vaso Sanitário | Decorar (atributo) | Vaso Sanitário (categoria WooCommerce) |
| 100023421 | Cuba de Apoio Modaza Quadrada Sole com Mesa | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023404 | Cuba de Apoio Modaza Quadrada Bella Slim | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023387 | Cuba de Apoio Modaza Redonda Siena Nero Slim | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023380 | Cuba de Apoio Modaza Redonda Siena Slim | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023363 | Cuba de Apoio Modaza Redonda Turim Côncava | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023339 | Cuba de Apoio Modaza Retangular Luna com Toalheiro | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023248 | Cuba de Apoio Modaza Quadrada Bella Nero Slim | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023223 | Cuba de Apoio Modaza Redonda Turim Nero Côncava | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023206 | Cuba de Apoio Modaza Redonda Roma com Escape | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
| 100023199 | Cuba de Apoio Modaza Redonda Bari | Decorar (atributo) | Cubas de Cerâmica (categoria WooCommerce) |
|  | Em Breve | Proteger (atributo) | — (não resolvida) |
| 100026148 | Torneira de Pia Modaza Nobile Gourmet Monocomando 69 cm | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026141 | Torneira de Pia Modaza Nobile Monocomando | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026134 | Torneira de Pia Modaza Nero Gourmet Monocomando 47 cm | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026107 | Torneira de Pia Modaza Nobile Gourmet Monocomando 47 cm | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026643 | Torneira de Lavatório Modaza Nero | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026626 | Torneira de Lavatório Modaza Sottille | Decorar (atributo) | Torneira (categoria WooCommerce) |
| 100026609 | Ducha Fria Modaza Sottille Redondo | Decorar (atributo) | Ducha Fria (nome do produto) |
| 100026602 | Ducha Fria Modaza Sottille Quadrado | Decorar (atributo) | Ducha Fria (nome do produto) |

### Imagens repetidas no mesmo produto (removidas)
100019416, 100028780, 100023125, 100023421, 100023223

### Outras regras
- Nomes em formato Título, com preposições em minúsculas, siglas (LED, PVC, WPC, ABS) em maiúsculas e medidas padronizadas (`60x120`, `2,90m`, `cm`).
- Entidades HTML (`&#8243;`, `&ndash;`) convertidas em texto.
- Garantia movida para a coluna `garantia`; a "Referência" igual ao SKU foi removida das especificações.
- Tags iguais à categoria ou à subcategoria foram removidas; sinônimos unificados (Rodapés Amadeirados → Rodapé Amadeirado, Spots → Spot LED).
