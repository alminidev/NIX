# Sistema Tipográfico — NIX

## 1. Escolha da Fonte & Princípio
- **Família:** `Inter` (Google Fonts / CDN / System fallbacks).
- **Justificativa:** Sem serifa neo-grotesca com métricas ópticas refinadas e excelente legibilidade técnica. Quando aplicada em pesos médios/semi-bold com tracking negativo, evoca o mesmo rigor geométrico da *PP Neue Montreal* (da referência Custo) e a neutralidade da *Open Sans* (da referência DJI), sem necessidade de dependências complexas.

## 2. Escala Tipográfica Completa (Valores Numéricos)

| Token | Tamanho em px / rem | Line-Height | Peso (Weight) | Letter-Spacing | Caso de Uso |
|---|---|---|---|---|---|
| `--text-display` | `clamp(2.25rem, 5vw + 1rem, 3.5rem)` (36px a 56px) | 1.08 | 600 (SemiBold) | `-0.03em` | Headline principal do Hero |
| `--text-h2` | `clamp(1.75rem, 3vw + 0.5rem, 2.5rem)` (28px a 40px) | 1.15 | 600 (SemiBold) | `-0.02em` | Títulos das seções da landing |
| `--text-h3` | `1.25rem` (20px) | 1.25 | 600 (SemiBold) | `-0.01em` | Nome dos 5 produtos nos cards |
| `--text-subhead` | `clamp(1.0625rem, 1.2vw + 0.5rem, 1.25rem)` (17px a 20px) | 1.5 | 400 (Regular) | `normal` | Subtítulo explicativo no Hero |
| `--text-body` | `1rem` (16px) | 1.5 | 400 (Regular) | `normal` | Corpo de texto principal |
| `--text-body-sm` | `0.875rem` (14px) | 1.45 | 400 (Regular) | `normal` | Descrições dos cards e itens de FAQ |
| `--text-price` | `1.375rem` (22px) | 1.1 | 700 (Bold) | `-0.02em` | Preço nos cards de produto |
| `--text-kicker` | `0.75rem` (12px) | 1.4 | 700 (Bold) | `+0.08em` | Eyebrow text em caixa-alta acima dos títulos |
| `--text-caption` | `0.75rem` (12px) | 1.4 | 500 (Medium) | `normal` | Aviso de frete e notas legais |

## 3. Regras de Aplicação
- Títulos de grande porte (`h1` e `h2`) devem obrigatoriamente usar letter-spacing negativo para criar o efeito de bloco arquitetônico.
- Textos em caixas de produtos e especificações devem priorizar alto contraste (`#0a0b0e` para títulos e `#4a4e57` para corpo).
- Proibido o uso de itálico decorativo.
