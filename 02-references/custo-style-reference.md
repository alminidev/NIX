# Custo — Style Reference
> Gunmetal gallery with monolithic type. A muted gray-green showroom where a single dark object and 57px type do all the talking.

**Theme:** light

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

Custo operates as an industrial product gallery: a warm gunmetal canvas hosts the physical product while oversized display typography serves as the primary visual ornament. The system is rigorously achromatic — zero chromatic colors — letting the dark anodized mailbox and the geometric weight of a single sans-serif carry all brand personality. Every screen balances generous negative space against one monumental typographic statement, with the brand wordmark recurring as a near-architectural element. Surfaces are flat and matte; depth is implied by the product's own reflectivity rather than drop shadows or gradients.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas Gunmetal | `#9ea29f` | `--color-canvas-gunmetal` | Hero and feature-section background — the warm gray-green tint distinguishes Custo from generic white SaaS canvases and reads as architectural concrete rather than digital surface |
| Obsidian | `#000000` | `--color-obsidian` | Primary text, hairline borders, icon strokes — the highest-contrast ink in the system, used for headings and structural dividers |
| Paper White | `#ffffff` | `--color-paper-white` | Body section backgrounds, reversed text on gunmetal canvas, text on the dark product photography |
| Anodized Graphite | `#4b514d` | `--color-anodized-graphite` | Dark surface for product photography, secondary headings, and elevated text — echoes the mailbox finish so the UI and product share a material |
| Brushed Steel | `#8e9194` | `--color-brushed-steel` | Muted body text, list dividers, secondary icon strokes — sits between Paper White and Obsidian for inline metadata and subdued links |
| Linen Mist | `#a7aaad` | `--color-linen-mist` | Light border and divider color for headings and section rules — a hairline tone that never competes with Obsidian structural lines |
| Aluminum Hairline | `#d8d8d8` | `--color-aluminum-hairline` | Input field borders, footer separators, the lightest structural line — appears only where a near-invisible boundary is needed |

## Tokens — Typography

### PP Neue Montreal — Single-family type system used for everything from body copy to 57px display statements · `--font-pp-neue-montreal`
- **Substitute:** Inter, Manrope, or DM Sans at matching optical sizes
- **Weights:** 400 (Medium)
- **Sizes:** 15px, 16px, 19px, 20px, 30px, 38px, 57px
- **Line height:** 1.00–1.62 (tighter as size grows; 1.00 at 57px, 1.62 at 15–16px)
- **Letter spacing:** normal across the entire scale
- **OpenType features:** `"kern" on, "liga" on`
- **Role:** Single-family type system used for everything from body copy to 57px display statements

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 15px | 1.43 | — | `--text-caption` |
| subheading | — | — | 20px | 1.38 | — | `--text-subheading` |
| heading-sm | — | — | 30px | 1.25 | — | `--text-heading-sm` |
| heading | — | — | 38px | 1.15 | — | `--text-heading` |
| display | — | — | 57px | 1 | — | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px
**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 76 | 76px | `--spacing-76` |

### Border Radius

| Element | Value |
|---------|-------|
| cards | 8px |
| images | 8px |
| inputs | 8px |
| buttons | 31.35px (pill) for primary action; 8px for secondary |

### Layout
- **Page max-width:** 1280px
- **Section gap:** 110px
- **Card padding:** 20px
- **Element gap:** 24px

## Components & Guidelines
- Ghost pill buttons com borda de 1px e hover invertido.
- Duas colunas assimétricas com caption à esquerda (280px) e heading grande à direita.
- Rigor acromático na referência, com profundidade gerada pela alternância de planos e materiais.
