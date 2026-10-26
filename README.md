# Site Modaza

Site estático do catálogo Modaza ([modaza.com.br](https://modaza.com.br)), feito em [Astro](https://astro.build). Não tem banco de dados: os produtos vêm de planilhas CSV versionadas no Git, e cada alteração publicada gera o site de novo.

## Rodar no computador

Requer Node.js 22.23 ou mais novo.

```bash
npm install
npm run dev        # site em http://localhost:4321, atualiza ao salvar
npm run build      # gera o site final em dist/
npm run preview    # serve o dist/ para conferir antes de publicar
npm run verificar  # depois do build: procura links internos quebrados
```

## Atualizar o catálogo

Tudo o que é produto está em `dados/` e `imagens/`. Edite, faça commit e o deploy publica sozinho.

| Arquivo | O que é |
|---|---|
| `dados/produtos.csv` | Produtos publicados no site |
| `dados/produtos-em-analise.csv` | Produtos com dados em conflito, **não publicados**. A coluna `motivo` diz o que corrigir |
| `dados/especificacoes.csv` | Ficha técnica: uma linha por atributo (`sku; ordem; grupo; atributo; valor`) |
| `dados/redirecionamentos.csv` | Endereços antigos que devem apontar para novos (`de; para; observacao`) |
| `imagens/produtos/{sku}/` | Fotos do produto: `1.jpg`, `2.jpg`... na ordem de exibição (jpg, png ou webp) |

Os CSVs usam `;` como separador e abrem direto no Excel em português.

### Colunas de `produtos.csv`

| Coluna | Regra |
|---|---|
| `sku` | Obrigatório e único. É também o nome da pasta de fotos |
| `slug` | Final do endereço (`/produtos/{slug}/`). Só minúsculas, números e hífens. **Não mude sem criar um redirecionamento** |
| `nome` | Obrigatório |
| `categoria` | `Construir`, `Decorar`, `Iluminar` ou `Proteger` |
| `subcategoria` | Obrigatória. Mais de uma separada por `\|`. Uma subcategoria nova vira página automaticamente |
| `tags` | Opcional, separadas por `\|`. Entram na busca |
| `descricao_curta` | Texto de abertura da página do produto |
| `descricao` | Texto longo opcional ("Sobre o produto") |
| `garantia` | Ex.: `60 meses sobre defeitos de fabricação` |
| `link_compra` | Endereço `https://` da loja parceira. Vazio: o botão vira "Onde encontrar" |
| `ativo` | `sim` ou `não` |

### Tarefas comuns

- **Novo produto:** adicione a linha em `produtos.csv`, as linhas da ficha em `especificacoes.csv` e as fotos em `imagens/produtos/{sku}/`. As fotos podem ser JPG grandes: o build converte para WebP e redimensiona.
- **Tirar do ar:** mude `ativo` para `não`.
- **Liberar um produto em análise:** corrija o dado indicado em `motivo`, apague a coluna `motivo` dessa linha e mova a linha para `produtos.csv`. Se trocou o slug, adicione o endereço antigo em `redirecionamentos.csv`.
- **Trocar o endereço de um produto:** altere o `slug` e adicione `"/produtos/slug-antigo/;/produtos/slug-novo/"` em `redirecionamentos.csv`.

### Validação

O build **para com erro** se os dados tiverem problema (SKU repetido, categoria inválida, produto ativo sem foto, link sem https etc.) e mostra o arquivo e a linha. Para conferir sem gerar o site:

```bash
npm run validar
```

## Outros conteúdos

| O quê | Onde |
|---|---|
| Contatos, revendas, fotos da home, destaques, analytics | `src/config.mjs` |
| Catálogos em PDF, garantia e perguntas frequentes | `src/data/conteudo.mjs` |
| Pesquisa de satisfação (NPS da Emarsys) | `src/data/nps-emarsys.html` |
| Visual (cores, fontes, espaçamentos) | `src/styles/global.css`, seguindo o manual de marca em `design_book/` |
| Logo, formas, frases e estampas da marca | `src/assets/marca/` (inline, via `Marca.astro` e `Forma.astro`) e `public/marca/` |

A fonte institucional é a **Stolzl** (paga). Enquanto não houver licença de webfont, o site usa a Urbanist, que é parecida. Para ativar a Stolzl, adicione os arquivos `.woff2` licenciados com um `@font-face` de nome `Stolzl` no `global.css`: ela já é a primeira da lista de fontes.

## Publicação (Cloudflare Pages ou Netlify)

- Comando de build: `npm run build`
- Pasta publicada: `dist`
- Variáveis: `NODE_VERSION=22.23.4` e `PUBLIC_ARQUIVOS_URL` (endereço onde estão os PDFs dos catálogos)

O build gera `dist/_redirects`, que os dois serviços leem: endereços antigos do WordPress, produtos em análise (302 para a categoria), PDFs antigos e `dados/redirecionamentos.csv`.

**Os PDFs dos catálogos não ficam no repositório:** têm de 25 a 60 MB cada, acima do limite de 25 MB por arquivo do Cloudflare Pages. Hospede-os num armazenamento de arquivos (ex.: Cloudflare R2 em `arquivos.modaza.com.br`), em `/catalogos/{arquivo}`, e configure `PUBLIC_ARQUIVOS_URL`.

## Publicação no GitHub Pages

O workflow `.github/workflows/pages.yml` gera e publica o site a cada push na `main` (também dá para rodar à mão em **Actions › Deploy no GitHub Pages › Run workflow**). Em **Settings › Pages**, a origem precisa estar como **GitHub Actions**.

- Endereço: https://talys-marques.github.io/modaza/. Como o site fica numa subpasta, todo link interno passa por `url()` de `src/lib/url.mjs`, que adiciona o prefixo `BASE_PATH` (`/modaza`). **Ao criar links ou caminhos de imagem novos, use `url('/caminho/')`** em vez de `'/caminho/'`; no CSS, `url('/marca/...')` já é ajustado pelo build.
- Domínio próprio: configure em **Settings › Pages › Custom domain**. O workflow passa a gerar o site na raiz, sem mudar código.
- O GitHub Pages não lê `_redirects`: com `GITHUB_PAGES=true` o build cria páginas HTML que redirecionam os endereços antigos com barra no final (os PDFs antigos do `/wp-content/` ficam sem redirecionamento).
- GA4 e Clarity só carregam quando o endereço é `https://modaza.com.br`, para a prévia não sujar as métricas.
- `PUBLIC_ARQUIVOS_URL` (PDFs dos catálogos) vem da variável de repositório de mesmo nome, em **Settings › Secrets and variables › Actions › Variables**.

Para gerar localmente como no GitHub Pages:

```bash
SITE_URL=https://talys-marques.github.io BASE_PATH=/modaza GITHUB_PAGES=true npm run build
BASE_PATH=/modaza npm run verificar
```

## Pendências antes de publicar

- [ ] Hospedar os PDFs dos catálogos e definir `PUBLIC_ARQUIVOS_URL`
- [ ] Time de CRM criar o formulário de contato na Emarsys e preencher `EMARSYS_CONTATO` em `src/config.mjs` (até lá, o formulário abre um e-mail para contato@modaza.com.br)
- [ ] Confirmar o WhatsApp da KZA Decor (o do site antigo, `wa.me/5195134834`, não tem o código do país)
- [ ] Revisar os 22 produtos de `dados/produtos-em-analise.csv`
- [ ] Linha Proteger: não há produto publicado, por isso ela não aparece no site

## Migração do WordPress (feita uma vez)

`scripts/exportar-catalogo.mjs` exportou os produtos da API do WooCommerce, limpou os dados e baixou as fotos. Ele não sobrescreve `dados/` sem `--sobrescrever`. O que foi limpo e o que ficou pendente está em `docs/relatorio-exportacao.md`.
