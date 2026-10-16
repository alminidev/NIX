# Especificação de Componentes — NIX

## 1. Botão Primário Pill (`.btn-primary` / `.btn-buy`)
- **Função:** Ação principal de conversão (botão "Comprar" nos cards e "Ver Produtos" no hero).
- **Estilo Visual:**
  - Fundo: `--color-brand-blue` (`#176bff`).
  - Cor do texto: `--color-ink-inverse` (`#ffffff`).
  - Peso da fonte: `500` (Medium).
  - Tamanho da fonte: `15px` (`0.9375rem`).
  - Padding: `12px 28px` (desktop) e `14px 24px` (mobile).
  - Border-radius: `9999px` (geometria pill perfeita).
  - Borda: `none`.
  - Altura mínima para toque (mobile): `48px`.
- **Estados:**
  - *Default:* Fundo `#176bff`, sem sombra.
  - *Hover:* Fundo `--color-brand-blue-hover` (`#0d57db`), `transform: translateY(-1px)`.
  - *Focus-visible:* Outline duplo de 2px no azul com offset de 2px.
  - *Active:* `transform: translateY(0)`.

---

## 2. Botão Ghost Pill (`.btn-ghost`)
- **Função:** Ação secundária no Hero Stage ("Ir para Checkout").
- **Estilo Visual:**
  - Fundo: Transparente (`rgba(255, 255, 255, 0)`).
  - Borda: `1px solid #ffffff` (em fundo escuro) ou `1px solid #0a0b0e` (em fundo claro).
  - Cor do texto: `#ffffff` ou `#0a0b0e`.
  - Padding: `12px 28px`.
  - Border-radius: `9999px`.
- **Estados:**
  - *Hover:* Fundo invertido com texto invertido (conforme referência Custo).

---

## 3. Card de Produto (`.product-card`)
- **Função:** Apresentar cada um dos 5 produtos na vitrine gerada via `produtos.js`.
- **Estrutura Interna:**
  1. `.card-media`: Container quadrado (`aspect-ratio: 1 / 1`) com fundo branco, padding de 16px e imagem contida (`object-fit: contain`).
  2. `.card-badge`: Tag sutil de capacidade (ex: *"12 Carretéis"* ou *"Setup Completo"*), fundo `#edf3ff`, texto `#176bff`, border-radius `9999px`, padding `4px 10px`, fonte `12px/600`.
  3. `.card-title`: Heading `h3`, fonte `20px/600`, cor `#0a0b0e`.
  4. `.card-desc`: Descrição curta, fonte `14px/400`, cor `#4a4e57`, line-height 1.45.
  5. `.card-price`: Preço formatado em reais, fonte `22px/700`, cor `#0a0b0e`.
  6. `.btn-buy`: Botão primário pill ocupando 100% da largura com texto *"Comprar"*.
  7. `.card-shipping`: Aviso *"Frete calculado no checkout"*, fonte `12px/500`, cor `#7c828d`, alinhamento centralizado.
- **Superfície do Card:** Fundo `--color-surface-card` (`#ffffff`), border-radius `8px`, padding interno `24px`, borda sutil `1px solid #e2e4e8`.

---

## 4. Top Navigation Bar (`.site-header`) — Referência Custo
- **Função:** Navegação persistente e atalho direto para conversão.
- **Estrutura (Top Navigation Bar - Custo Style Reference):**
  - **Posicionamento:** `position: fixed`, persistente no topo em todas as páginas (`top: 0; left: 0; width: 100%`).
  - **Comportamento Custo:**
    - *Sobre o Hero:* Totalmente **transparente** (`background-color: transparent`), com divisória sutil em hairline clara (`rgba(255, 255, 255, 0.1)`), tipografia em branco/reverso (`#ffffff`) e logo claro.
    - *Ao rolar a página (.scrolled):* Transiciona suavemente para **Paper White** (`#ffffff`), com borda inferior em hairline (`1px solid #e2e4e8`), sombra sutil de ancoragem (`0 1px 3px rgba(0, 0, 0, 0.05)`), tipografia em grafite/ink (`#4a4e57`) e logo em cores oficiais.
  - **Layout:**
    - Elemento esquerdo: Wordmark / logotipo oficial NIX (`logo-nix.png`).
    - Elemento central: Links de navegação centralizados (`Produtos`, `Diferenciais`, `Dúvidas`) em fonte `15px-16px` (Inter Medium).
    - Elemento direito: Botão pill de conversão / carrinho (*Ghost pill button* sobre o hero que inverte no scroll).
  - **Padding/Altura:** Padding vertical confortável (~20px a 24px desktop, altura total ~76px a 80px).

---

## 5. Acordeão de FAQ (`.faq-accordion`)
- **Função:** Resolução limpa de objeções técnicas e de frete.
- **Estrutura:** Tags semânticas `<details class="faq-item">` e `<summary>`.
- **Estilo:**
  - Borda inferior: `1px solid #e2e4e8`.
  - Padding: `20px 0`.
  - Pergunta no `<summary>`: Fonte `17px/600`, cor `#0a0b0e`, cursor pointer, ícone chevron SVG girando 180° quando aberto.
  - Resposta: Parágrafo em fonte `15px/400`, cor `#4a4e57`, padding superior de `12px`.
