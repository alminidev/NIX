# Sistema de Cores & Superfícies — NIX

## 1. Filosofia Cromática
O sistema cromático da NIX é deliberadamente **disciplinado e quase monocromático**, reservando a cor saturada exclusivamente para o **azul oficial da NIX** nos pontos de conversão e estados interativos ativos.

Isso garante que as fotos reais dos produtos (com filamentos coloridos e mostradores digitais iluminados) se destaquem com força total, sem competir com a paleta da interface.

---

## 2. Paleta Detalhada de Cores (Tokens Hexadecimais)

| Nome do Token | Hexadecimal | Papel / Função | Nível de Contraste WCAG |
|---|---|---|---|
| `--color-brand-blue` | `#176bff` | Cor Primária NIX: Botões "Comprar", foco ativo, ícone do carrinho | 4.8:1 contra branco |
| `--color-brand-blue-hover` | `#0d57db` | Estado hover do botão de compra | 6.2:1 contra branco |
| `--color-brand-blue-subtle` | `#edf3ff` | Fundo de tags de carretéis e badges | 1.1:1 (fundo decorativo) |
| `--color-ink-primary` | `#0a0b0e` | Texto principal, títulos h1/h2/h3 | 19.5:1 contra branco (AAA) |
| `--color-ink-secondary` | `#4a4e57` | Corpo de texto, parágrafos explicativos | 8.2:1 contra branco (AAA) |
| `--color-ink-muted` | `#7c828d` | Textos secundários, avisos de frete | 4.6:1 contra branco (AA) |
| `--color-ink-inverse` | `#ffffff` | Texto branco em botões azuis e no Hero escuro | 21:1 contra #0a0b0e (AAA) |
| `--color-surface-hero-void` | `#0a0b0e` | Fundo profundo do Hero Stage | Superfície escura de abertura |
| `--color-surface-canvas-fog` | `#f4f5f7` | Fundo cinza suave das seções claras (vitrine e FAQ) | Superfície neutra para contraste |
| `--color-surface-card` | `#ffffff` | Fundo branco puro dos cards de produtos | Superfície elevada por brilho |
| `--color-surface-footer` | `#0a0b0e` | Fundo do rodapé terminal | Superfície escura de fechamento |
| `--color-border-hairline` | `#e2e4e8` | Linhas de divisão de 1px em fundos claros | Linha estrutural sutil |
| `--color-border-dark-hairline` | `#22252c` | Linhas de divisão de 1px no hero e rodapé | Linha estrutural sutil |

---

## 3. Regra de Uso de Cores (Do's and Don'ts)
- **FAZER:** Usar `#176bff` exclusivamente para direcionar a atenção do usuário ao checkout (botões de ação e carrinho).
- **FAZER:** Deixar que as fotos dos 5 produtos tragam a cor dos filamentos (vermelho, amarelo, azul, verde) de forma natural.
- **NÃO FAZER:** Não introduzir outros tons cromáticos (amarelos, laranjas, roxos) nos cards ou textos.
- **NÃO FAZER:** Não aplicar gradientes em fundos de botões ou seções. Todas as superfícies são sólidas e planas.
