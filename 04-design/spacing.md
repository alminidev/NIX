# Sistema de Espaçamento & Grid — NIX

## 1. Unidade Base e Escala Numérica
- **Base Unit:** `8px` (com sub-módulo de `4px` para detalhes de precisão, combinando o rigor da Custo de 4px e da DJI de 8px).

| Token | Valor em Pixels | Aplicação |
|---|---|---|
| `--space-4` | `4px` | Micro-espaçamentos, raio de tags internas |
| `--space-8` | `8px` | Espaçamento interno de badges, gap entre ícone e label |
| `--space-12` | `12px` | Padding vertical de botões pill secundários |
| `--space-16` | `16px` | Padding interno de cards em mobile, gaps compactos |
| `--space-24` | `24px` | Padding padrão de cards no desktop, gap entre elementos |
| `--space-32` | `32px` | Margem entre blocos de texto e botões |
| `--space-48` | `48px` | Gap entre colunas de features |
| `--space-64` | `64px` | Padding vertical de seções em telas mobile |
| `--space-80` | `80px` | Padding vertical de seções em tablets |
| `--space-100` | `100px` | Padding vertical de seções em desktops grandes |

---

## 2. Layout & Containers
- **Max Width Global:** `1200px`
- **Container Margins:** `margin-inline: auto`
- **Padding Lateral do Container:**
  - Desktop: `24px`
  - Mobile: `16px`

---

## 3. Grids Específicos

### Grid dos 5 Produtos (`.products-grid`)
```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  width: 100%;
}

/* Centralização harmônica dos 2 últimos cards na segunda linha no desktop */
@media (min-width: 992px) {
  .product-card:nth-child(4) {
    grid-column: 1 / 2;
    margin-left: calc(50% + 14px); /* desloca para compor 2 cards centralizados */
  }
  .product-card:nth-child(5) {
    grid-column: 2 / 3;
    margin-left: calc(50% + 14px);
  }
}

@media (max-width: 991px) and (min-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 639px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
```

### Grid de Diferenciais Técnicos (`.features-grid`)
```css
.features-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 48px;
  align-items: start;
}

.features-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 991px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .features-items {
    grid-template-columns: 1fr;
  }
}
```
