# DJI — Style Reference (NIX Visual Reference)
> aerospace black canvas with a single electric blue thrust

**Theme:** mixed

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

DJI presents its products like aviation reveal footage: the hero is a near-black void where the device emerges from shadow, then the rest of the site opens into a clean, light-gray editorial grid of product cards. The palette is deliberately restrained — nearly monochromatic — with one vivid blue (#0070d5) that does the work of brand recognition, active state, and the one persistent call to action. Typography is Open Sans in a wide weight range (300–600) with tight negative tracking on display sizes, giving headlines a engineered, technical feel without serif warmth. Components are minimal: pill-shaped buttons at 64px radius, flat product cards with no decorative borders, ghost links with chevrons, and an almost shadowless surface system that lets the product photography carry all visual weight.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Onyx | `#000000` | `--color-onyx` | Primary text, icons, dark hero backgrounds, footer — the dominant ink color across all UI |
| Paper | `#ffffff` | `--color-paper` | Card surfaces, nav bar, product detail panels, input fields — the lightest surface in the stack |
| Fog | `#ededed` | `--color-fog` | Page canvas behind card grids and product sections — slightly cool, lower than pure white so product imagery pops |
| Slate | `#6c7073` | `--color-slate` | Muted helper text, disabled states, secondary button borders, input placeholder |
| Graphite | `#595959` | `--color-graphite` | Body copy, secondary nav text, descriptions — the workhorse text gray that sits between headlines and helper text |
| Iron | `#303233` | `--color-iron` | Primary nav item text, section headings on light backgrounds — darker than body to anchor hierarchy |
| Ash | `#8c8c8c` | `--color-ash` | Tertiary captions, meta text, fine print |
| Carbon | `#272727` | `--color-carbon` | Footer background, dark panels — deep neutral for terminal/closing sections |
| Signal Blue | `#0070d5` | `--color-signal-blue` | Blue supporting accent for decorative details and low-frequency emphasis. |
| Indigo Steel | `#3b63a9` | `--color-indigo-steel` | Secondary link state, hover or visited variant of Signal Blue — a muted counterpart that reads as the same brand without competing for attention |

## Tokens — Typography

### Open Sans — Primary UI and content typeface across nav, body, headings, and buttons
- **Substitute:** Inter, Source Sans 3, Noto Sans
- **Weights:** 300, 400, 500, 600
- **Sizes:** 12, 14, 16, 18, 20, 24, 32, 40
- **Line height:** 1.20, 1.33, 1.43, 1.50, 2.00
- **Letter spacing:** -0.03em at 40px, -0.02em at 24–32px, normal at 12–18px
- **Role:** Primary UI and content typeface across nav, body, headings, and buttons

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | Open Sans | 400 | 12px | 1.5 | 0px | `--text-caption` |
| body-sm | Open Sans | 400 | 14px | 1.5 | 0px | `--text-body-sm` |
| body | Open Sans | 400 | 16px | 1.5 | 0px | `--text-body` |
| subheading | Open Sans | 500 | 20px | 1.43 | -0.02px | `--text-subheading` |
| heading-sm | Open Sans | 600 | 24px | 1.33 | -0.02px | `--text-heading-sm` |
| heading | Open Sans | 600 | 32px | 1.25 | -0.02px | `--text-heading` |
| display | Open Sans | 300 | 40px | 1.2 | -0.03px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 8px
**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 8 | 8px | `--spacing-8` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 88 | 88px | `--spacing-88` |
| 112 | 112px | `--spacing-112` |

### Border Radius

| Element | Value |
|---------|-------|
| nav | 4px |
| tags | 99px |
| cards | 4px |
| inputs | 4px |
| buttons | 64px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| md | `rgba(0, 0, 0, 0.1) 0px 16px 16px 0px` | `--shadow-md` |
| md-2 | `rgba(0, 0, 0, 0.1) 0px 8px 16px 0px` | `--shadow-md-2` |

### Layout
- **Page max-width:** 1200px
- **Section gap:** 48px
- **Card padding:** 24px
- **Element gap:** 8px
