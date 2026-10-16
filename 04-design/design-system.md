# Design System & Visual Blueprint — NIX

> **CONTRATO INVIOLÁVEL DE CONSTRUÇÃO (DECISION CONTRACT)**  
> Este documento é uma especificação técnica determinística. Todos os valores numéricos, tokens de CSS, proporções de grid e medidas aqui descritos são obrigatórios para a fase `/build`. O agente de engenharia não tem autorização para alterar ou simplificar nenhum valor aqui estabelecido.

---

## 1. Tokens de Cores (CSS Custom Properties)

```css
:root {
  /* --- CORES PRINCIPAIS --- */
  --color-brand-blue: #176bff;         /* Azul Oficial NIX do logotipo (Primary CTA / Active) */
  --color-brand-blue-hover: #0d57db;   /* Hover do botão de compra */
  --color-brand-blue-subtle: #edf3ff;  /* Fundo de tags e badges de capacidade */

  /* --- INK & TEXTO --- */
  --color-ink-primary: #0a0b0e;        /* Headings e títulos de alto contraste */
  --color-ink-secondary: #4a4e57;      /* Corpo de texto e descrições */
  --color-ink-muted: #5c636e;          /* Legendas e meta text WCAG AA (legado: #7c828d) */
  --color-ink-inverse: #ffffff;        /* Texto reverso sobre fundos escuros e botões */

  /* --- SUPERFÍCIES & PLANOS --- */
  --color-surface-hero-void: #0a0b0e;  /* Fundo escuro imersivo do Hero Stage */
  --color-surface-canvas-fog: #f4f5f7; /* Canvas neutro das seções claras */
  --color-surface-card: #ffffff;       /* Cartões de produtos e containers */
  --color-surface-footer: #0a0b0e;     /* Fundo do rodapé terminal */

  /* --- BORDAS & LINHAS ESTRUTURAIS --- */
  --color-border-hairline: #e2e4e8;    /* Divisórias em seções claras (1px) */
  --color-border-dark-hairline: #22252c;/* Divisórias em seções escuras (1px) */
  --color-border-focus: #176bff;       /* Contorno de foco acessível */
}
```

---

## 2. Tipografia & Escala Numérica (Visual Blueprint)

A família padrão obrigatória é `Inter`, com fontes do sistema como fallback:
`--font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`

| Papel Semântico | Tamanho CSS (`clamp` ou exato) | Peso | Line-Height | Letter-Spacing | Aplicação Obrigatória |
|---|---|---|---|---|---|
| **Display Monumental (h1)** | `clamp(2.25rem, 5vw + 1rem, 3.5rem)` (36px a 56px) | 600 (SemiBold) | 1.08 | `-0.03em` | Título do Hero Stage |
| **Heading Grande (h2)** | `clamp(1.75rem, 3vw + 0.5rem, 2.5rem)` (28px a 40px) | 600 (SemiBold) | 1.15 | `-0.02em` | Títulos das seções principais |
| **Heading Médio (h3)** | `1.25rem` (20px) | 600 (SemiBold) | 1.25 | `-0.01em` | Nome dos produtos nos cards e títulos de features |
| **Kicker / Eyebrow** | `0.75rem` (12px) | 700 (Bold) | 1.4 | `+0.08em` | Tags em caixa-alta antes das headlines |
| **Lead / Subhead** | `clamp(1.0625rem, 1.2vw + 0.5rem, 1.25rem)` (17px a 20px) | 400 (Regular) | 1.5 | `normal` | Subtexto do Hero |
| **Body (Corpo)** | `1rem` (16px) | 400 (Regular) | 1.5 | `normal` | Textos gerais e parágrafos explicativos |
| **Body Small** | `0.875rem` (14px) | 400 (Regular) | 1.45 | `normal` | Descrições dos cards e avisos |
| **Price Display** | `1.375rem` (22px) | 700 (Bold) | 1.1 | `-0.02em` | Preço em destaque nos cards |
| **Caption / Fineprint** | `0.75rem` (12px) | 500 (Medium) | 1.4 | `normal` | Aviso de "Frete calculado no checkout" |

---

## 3. Grid, Layout & Proporções Estruturais

- **Largura Máxima do Container (`max-width`):** `1200px` (centralizado com `margin: 0 auto`).
- **Padding Horizontal do Container:** `24px` (desktop) e `16px` (mobile).
- **Espaçamento Entre Seções (`section-gap`):**
  - Desktop (>= 1024px): `100px` vertical.
  - Tablet (768px - 1023px): `80px` vertical.
  - Mobile (< 768px): `64px` vertical.

### Proporções Exatas de Grid:
1. **Grid da Vitrine de Produtos (`.products-grid`):**
   - **Desktop (>= 992px):** `grid-template-columns: repeat(3, 1fr)` com `gap: 28px`.  
     *Nota para os 5 produtos:* Os primeiros 3 cards ocupam a linha 1; os 2 cards seguintes (estações de trabalho Setup Lab A1 e A2) ocupam a linha 2, centralizados com `grid-column: span 1` e offset ou grid de 6 colunas proporcionais (2 colunas de `3fr` cada).
   - **Tablet (640px a 991px):** `grid-template-columns: repeat(2, 1fr)` com `gap: 20px`.
   - **Mobile (< 640px):** `grid-template-columns: 1fr` com `gap: 20px`.

2. **Grid de Diferenciais Técnicos (`.features-grid`):**
   - **Desktop (>= 992px):** `grid-template-columns: 360px 1fr` com `gap: 48px`. O container direito divide-se em `grid-template-columns: repeat(2, 1fr)` com `gap: 24px`.
   - **Mobile (< 992px):** `grid-template-columns: 1fr` com `gap: 24px`.

---

## 4. Geometria, Raios & Superfícies

- **Raios de Borda (`border-radius`):**
  - `--radius-pill`: `9999px` (obrigatório para botões de ação e tags arredondadas).
  - `--radius-card`: `8px` (para cards de produtos, containers de conteúdo e imagens).
  - `--radius-input`: `6px` (para campos de formulário e accordions).
- **Elevação & Sombras:**
  - O sistema é deliberadamente **livre de sombras difusas pesadas** (conforme a referência Custo/DJI).
  - `--shadow-sticky-nav`: `0 1px 3px rgba(0, 0, 0, 0.05)` (apenas para ancorar o header ao rolar).
  - `--shadow-card-hover`: `0 8px 24px rgba(0, 0, 0, 0.06)` (microinteração sutil de hover nos cards).

---

## 5. Proporções e Ponto Focal de Imagens

| Elemento | Proporção Exata (`aspect-ratio`) | Ponto Focal / Tratamento |
|---|---|---|
| **Hero Showroom** | `16 / 9` (desktop) e `4 / 3` (mobile) | `object-fit: cover; object-position: center bottom;` |
| **Cards de Produtos (1 a 5)** | `1 / 1` (quadrado puro) | `object-fit: contain; object-position: center; background: #ffffff; padding: 16px;` |
| **Logotipo NIX (Header)** | Largura fixa: `110px`; Altura proporcional | `object-fit: contain; object-position: left center;` |

---

## 6. Motion & Microinterações (Tokens de Animação)

- **Duração Padrão de Hover:** `200ms`.
- **Easing Obrigatório:** `cubic-bezier(0.16, 1, 0.3, 1)` (resposta mecânica precisa e ágil).
- **Transição de Botão Pill:**
  - `transform: translateY(-1px)` no hover.
  - Mudança de cor de fundo de `--color-brand-blue` (`#176bff`) para `--color-brand-blue-hover` (`#0d57db`).
- **Acessibilidade:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
