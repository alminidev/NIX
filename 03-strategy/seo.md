# Estratégia de SEO — NIX 3D (Mobiliário Técnico e Dry Box)

> Documentação técnica e estratégica de Search Engine Optimization (SEO) para o site oficial da **NIX 3D** (`https://nix3d.com.br`).

---

## 🎯 1. Objetivos de SEO & Posicionamento

1. **Capturar a Demanda de Alta Intenção:** Dominar os termos de busca com maior intenção de compra sobre controle de umidade em filamentos 3D, estufas técnicas, gabinetes Dry Box e bancadas para Bambu Lab.
2. **Autoridade em Manufatura Aditiva:** Posicionar a NIX 3D como a primeira fabricante brasileira especializada em móveis técnicos com climatização hermética ativa (< 20% UR).
3. **Rich Snippets & Presença no Google:** Obter destaque direto na SERP do Google via Rich Results de Produtos (preço, parcelamento, estoque) e FAQPage (sanando dúvidas técnicas e logísticas antes do clique).
4. **SEO Local (São Paulo / Brasil):** Consolidar a visibilidade da sede em São Paulo (retirada no local) com cobertura de entrega por transportadora em território nacional.

---

## 🔍 2. Matriz de Palavras-Chave (Keyword Mapping)

### A. Palavras-Chave Primárias (Head & Top-Funnel)
| Palavra-Chave | Intenção | Localização On-Page |
| :--- | :--- | :--- |
| `dry box impressão 3d` | Transacional / Comercial | Title, H1, Meta Description, JSON-LD |
| `estufa para filamento` | Comercial / Informativa | Meta Description, Diferenciais, FAQ |
| `móvel técnico impressora 3d` | Comercial / Transacional | Title, Hero Stage, Schema Product |
| `dry box bambu lab` | Transacional | Vitrine (Cards A1 e A2L), Diferenciais |
| `nix 3d` | Navegacional / Marca | Title, Header, Footer, Organization Schema |

### B. Palavras-Chave de Cauda Longa (Long-Tail & Fundo de Funil)
| Palavra-Chave | Intenção | Localização On-Page |
| :--- | :--- | :--- |
| `dry box station bambu lab a1 combo` | Transacional Direta | Card Produto 4, Schema Product, FAQ |
| `estufa hermética para filamentos nylon petg` | Solução de Dor | Seção Diferenciais & Engenharia |
| `bancada impressora 3d antivibração` | Engenharia / Qualidade | Diferenciais (absorção 20.000 mm/s²) |
| `desumidificador filamento 3d são paulo` | Local / Compra | Logistics Card, Footer, Geo Tags |
| `armário filamento 12 24 48 rolos` | Especificação Técnica | Vitrine NIX DB-12, DB-24 e DB-48 |

---

## 🏗️ 3. Arquitetura Técnica Implementada

### A. Meta Tags de Cabeçalho (`05-build/index.html`)
- **Canonical URL:** `<link rel="canonical" href="https://nix3d.com.br/">` (evita conteúdo duplicado e parâmetros de tracking).
- **Robots Tag:** `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` (habilita snippets ricos e imagens grandes).
- **Social Graph (Open Graph & Twitter Cards):** Ativos reais apontando para `hero-showroom-oficial.png` em resolução 1920x1080 com proporção oficial para WhatsApp, Telegram, LinkedIn e Twitter/X.
- **Geo-tags (Local SEO):** Coordenadas geográficas oficiais de São Paulo - SP (`-23.550520, -46.633308`).
- **PWA & Mobile Ready:** `site.webmanifest`, ícones e `theme-color` `#0b0e14` configurados.

### B. Dados Estruturados Schema.org (JSON-LD)
O site possui um grafo unificado (`@graph`) contendo:
1. **`WebSite`**: Informações do portal e idioma `pt-BR`.
2. **`Organization` / `LocalBusiness` / `Store`**:
   - Razão/Marca: `NIX 3D`
   - Telefone de Atendimento: `+55 (11) 99292-2119`
   - Localidade: São Paulo - SP, Brasil
   - Faixa de preço: `R$ 1.190,00 - R$ 2.600,00`
   - Moeda: `BRL` (Aceita Pix e Cartão em até 3x)
3. **`BreadcrumbList`**: Hierarquia canônica Início > Catálogo Dry Box.
4. **`ItemList` & 5x `Product`**:
   - `DRY BOX 12` (SKU `NIX-DB12`) — R$ 1.190,00
   - `DRY BOX 24` (SKU `NIX-DB24`) — R$ 1.590,00
   - `DRY BOX 48` (SKU `NIX-DB48`) — R$ 2.150,00
   - `DRY BOX STATION BAMBU LAB A1 COMBO` (SKU `NIX-STATION-A1`) — R$ 2.200,00
   - `DRY BOX STATION BAMBU LAB A2L COMBO` (SKU `NIX-STATION-A2L`) — R$ 2.600,00
5. **`FAQPage`**: 4 perguntas frequentes com respostas completas prontas para rich snippets de acordeão na SERP.

### C. Fallback Semântico e Microdata Dinâmico
- **`<noscript>` enriquecido:** Mesmo que um bot não execute scripts ou o visitante esteja em conexão restrita, o catálogo completo dos 5 produtos está presente no DOM estático para indexação instantânea.
- **Microdata nos Cards (`js/main.js`):** Cada card gerado via JavaScript recebe atributos `itemscope itemtype="https://schema.org/Product"`, `itemprop="name"`, `itemprop="offers"`, `itemprop="price"`, e `itemprop="image"`.

---

## 🗺️ 4. Rastreamento e Sitemaps

1. **`robots.txt`:**
   - Permissão total para robôs de busca.
   - Bloqueio da pasta interna de `/Backup/`.
   - Permissão expressa para `Googlebot-Image` no diretório `/images/`.
   - Apontamento para o `sitemap.xml`.
2. **`sitemap.xml`:**
   - URL canônica principal com prioridade `1.0`.
   - Seções internas indexáveis (`#produtos`, `#diferenciais`, `#faq`).
   - **Google Image Sitemap:** Indexação fotográfica do estúdio showroom e dos 5 produtos com títulos e legendas descritivas.

---

## 🚀 5. Checklist de Lançamento no Google Search Console

Ao colocar o domínio `nix3d.com.br` no ar:

1. **Adicionar Propriedade no Google Search Console:**
   - Criar propriedade de Domínio (`nix3d.com.br`).
   - Validar via registro DNS TXT na hospedagem/provedor de domínio.
2. **Submeter o Sitemap:**
   - Inserir `https://nix3d.com.br/sitemap.xml` na aba **Sitemaps**.
3. **Solicitar Indexação Prioritária (URL Inspection):**
   - Inspecionar a URL `https://nix3d.com.br/` e clicar em **"Solicitar Indexação"**.
4. **Validar Rich Results no Google:**
   - Testar no [Google Rich Results Test](https://search.google.com/test/rich-results) para confirmar que os schemas de `Product`, `FAQPage`, `Organization` e `BreadcrumbList` aparecem válidos.
5. **Google Perfil de Empresa (Google Meu Negócio):**
   - Cadastrar NIX 3D em São Paulo para reforçar a busca local "Dry box são paulo" e "móvel impressora 3d são paulo".
6. **Bing Webmaster Tools:**
   - Importar as configurações diretamente do Google Search Console.

