# Arquitetura de Informação (IA) — NIX

## 1. Estrutura Linear da Página (DOM Tree & Heading Hierarchy)

Como a landing page opera como uma página única (one-page), a estrutura de headings segue uma hierarquia semântica estrita para SEO e acessibilidade (apenas um `h1` global, seguido por `h2` para cada seção principal e `h3` para os componentes filhos).

```
<header id="site-header">
  ├── Logotipo NIX (link para #hero com tag <img> e alt="NIX 3D")
  ├── Navegação Primária:
  │   ├── a[href="#produtos"] ("Produtos")
  │   ├── a[href="#diferenciais"] ("Diferenciais")
  │   ├── a[href="#faq"] ("Dúvidas")
  │   └── a[href="#contato"] ("Contato")
  └── Ação Externa:
      └── a.btn-cart[href=CHECKOUT_URL] (Ícone SVG de Carrinho + Texto "Comprar")

<main id="main-content">
  ├── <section id="hero" class="hero-stage">
  │   ├── Badge / Kicker: "MOBILIÁRIO TÉCNICO PARA IMPRESSÃO 3D"
  │   ├── <h1>: "A evolução definitiva do seu setup de impressão 3D."
  │   ├── <p class="hero-desc">: "Controle térmico ativo e desumidificação permanente..."
  │   ├── <div class="hero-actions">:
  │   │   ├── a.btn-primary[href="#produtos"] ("Explorar Linha Dry Box")
  │   │   └── a.btn-ghost[href=CHECKOUT_URL] ("Ir para Checkout")
  │   └── <div class="hero-media">:
  │       └── <img src="00-brief/assets/hero-showroom.jpg" alt="Showroom NIX">
  │
  ├── <section id="produtos" class="section-products">
  │   ├── <header class="section-header">:
  │   │   ├── Kicker: "CATÁLOGO OFICIAL"
  │   │   ├── <h2>: "Linha NIX Dry Box & Setup Lab"
  │   │   └── <p>: "5 soluções de alta precisão para armazenar..."
  │   └── <div id="products-grid" class="products-grid">
  │       <!-- Gerado via produtos.js -->
  │       ├── <article class="product-card" data-sku="NIX-DB12" data-id="1">
  │       │   ├── <div class="card-media"><img src="..." alt="..."></div>
  │       │   ├── <span class="card-badge">12 Carretéis</span>
  │       │   ├── <h3>Dry Box 12</h3>
  │       │   ├── <p class="card-desc">Armário compacto com controle térmico...</p>
  │       │   ├── <div class="card-price">R$ 1.890,00</div>
  │       │   ├── <a class="btn-buy" href="...">Comprar</a>
  │       │   └── <span class="card-shipping-notice">Frete calculado no checkout</span>
  │       ├── <article class="product-card" data-sku="NIX-DB24" data-id="2"> ... </article>
  │       ├── <article class="product-card" data-sku="NIX-DB48" data-id="3"> ... </article>
  │       ├── <article class="product-card" data-sku="NIX-LAB-A1" data-id="4"> ... </article>
  │       └── <article class="product-card" data-sku="NIX-LAB-A2" data-id="5"> ... </article>
  │
  ├── <section id="diferenciais" class="section-features">
  │   ├── <header class="section-header">:
  │   │   ├── Kicker: "ENGENHARIA & PRECISÃO"
  │   │   ├── <h2>: "Desenvolvido para eliminar falhas antes que elas aconteçam."
  │   │   └── <p>: "Diga adeus ao filamento quebradiço e delaminação..."
  │   └── <div class="features-grid">:
  │       ├── <div class="feature-card">
  │       │   ├── <div class="feature-icon"><svg>...</svg></div>
  │       │   ├── <h3>Controle Térmico Ativo & Display Digital</h3>
  │       │   └── <p>...</p>
  │       ├── <div class="feature-card">
  │       │   ├── <div class="feature-icon"><svg>...</svg></div>
  │       │   ├── <h3>Vedação Estanque Automotiva</h3>
  │       │   └── <p>...</p>
  │       ├── <div class="feature-card">
  │       │   ├── <div class="feature-icon"><svg>...</svg></div>
  │       │   ├── <h3>Passagem Técnica para Tubos PTFE</h3>
  │       │   └── <p>...</p>
  │       └── <div class="feature-card">
  │       │   ├── <div class="feature-icon"><svg>...</svg></div>
  │       │   ├── <h3>Estrutura Rígida em MDF</h3>
  │       │   └── <p>...</p>
  │
  ├── <section id="faq" class="section-faq">
  │   ├── <header class="section-header">:
  │   │   ├── Kicker: "DÚVIDAS FREQUENTES"
  │   │   └── <h2>: "Tudo o que você precisa saber antes de pedir o seu."
  │   └── <div class="faq-accordion">:
  │       ├── <details class="faq-item"><summary>Como funciona a entrega por transportadora?</summary><p>...</p></details>
  │       ├── <details class="faq-item"><summary>Quais tipos e marcas de filamentos cabem?</summary><p>...</p></details>
  │       ├── <details class="faq-item"><summary>Qual o consumo elétrico do sistema?</summary><p>...</p></details>
  │       └── <details class="faq-item"><summary>Como é feita a compra e o pagamento?</summary><p>...</p></details>
  │
  └── <section id="cta-final" class="section-cta-final">
      ├── <h2>: "Pronto para elevar o nível do seu estúdio 3D?"
      ├── <p>: "Garanta sua Dry Box com frete calculado e checkout seguro."
      └── a.btn-primary[href="#produtos"] ("Escolher Meu Modelo")

<footer id="site-footer">
  ├── Logotipo NIX e Descrição Institucional
  ├── Links rápidos de navegação
  ├── Aviso de Checkout InfinitePay
  └── Copyright e Informações de Contato
```
