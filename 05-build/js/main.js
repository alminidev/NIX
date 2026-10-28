/**
 * SCRIPT PRINCIPAL — NIX 3D (Versão Polida)
 * Renderização dinâmica da vitrine com separação editorial de categorias,
 * reforço de segurança e controle de navegação
 * Stack: JavaScript Vanilla Puro (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  renderizarProdutos();
  inicializarCabecalho();
  configurarBotoesCheckout();
  inicializarScrollSpy();
});

/**
 * Renderiza os 5 cards da vitrine organizados por categorias editoriais
 */
function renderizarProdutos() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  if (typeof PRODUTOS_NIX === 'undefined' || !Array.isArray(PRODUTOS_NIX)) {
    console.error('Erro: Catálogo PRODUTOS_NIX não carregado.');
    return;
  }

  // Separação em dois grupos editoriais claros
  const armariosDryBox = PRODUTOS_NIX.filter(p => p.sku.startsWith('NIX-DB'));
  const estacoesSetupLab = PRODUTOS_NIX.filter(p => p.sku.startsWith('NIX-STATION') || p.categoria.includes('Station'));

  function gerarCardHtml(produto) {
    const urlCompra = `${CHECKOUT_BASE_URL}?sku=${encodeURIComponent(produto.sku)}&id=${encodeURIComponent(produto.id)}`;

    const specsHtml = produto.especificacoes && produto.especificacoes.length > 0
      ? `<ul class="card-specs">
          ${produto.especificacoes.map(spec => `<li>${spec}</li>`).join('')}
         </ul>`
      : '';

    const badgeDestaqueHtml = produto.destaque 
      ? `<span class="tag-featured">Mais Escolhido</span>` 
      : '';

    return `
      <article class="product-card" data-sku="${produto.sku}" data-id="${produto.id}">
        <div class="card-badge-top">
          <span class="tag-capacity">${produto.capacidade}</span>
          ${badgeDestaqueHtml}
        </div>

        <div class="card-media">
          <img 
            src="${produto.imagem}" 
            alt="${produto.nome} — Armazenamento com controle térmico para filamentos 3D" 
            loading="lazy"
            width="320"
            height="320"
          >
        </div>

        <div class="card-content">
          <h3 class="card-title">${produto.nome}</h3>
          <p class="card-desc">${produto.descricao}</p>
          
          <div class="card-dimensions-box">
            <span class="card-dimensions-label">Dimensões (C x L x A)</span>
            <span class="card-dimensions-val">${produto.dimensoes}</span>
          </div>

          ${specsHtml}

          <div class="card-footer">
            <div class="card-price-row">
              <div class="card-price-col">
                <span class="card-price-label">Preço à vista</span>
                <span class="card-price">${produto.precoFormatado}</span>
              </div>
              <span class="card-installment">${produto.parcelamento}</span>
            </div>

            <a 
              href="${urlCompra}" 
              class="btn-buy" 
              data-sku="${produto.sku}" 
              data-id="${produto.id}"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Comprar ${produto.nome} no checkout seguro"
            >
              Comprar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </a>

            <div class="card-security-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Ambiente Seguro InfinitePay</span>
            </div>

            <span class="card-shipping-notice">Enviamos para todo o Brasil • Frete a consultar</span>
          </div>
        </div>
      </article>
    `;
  }

  // Monta o layout editorial completo
  container.innerHTML = `
    <!-- Grupo 1: Armários Dry Box -->
    <div class="catalog-group">
      <div class="catalog-group-header">
        <span class="catalog-group-kicker">Armazenamento Ativo</span>
        <h3 class="catalog-group-title">Armários de Filamentos Dry Box</h3>
        <p class="catalog-group-desc">Estufas estanques com desumidificação ativa permanente para 12, 24 ou 48 filamentos.</p>
      </div>
      <div class="products-subgrid grid-3-cols">
        ${armariosDryBox.map(gerarCardHtml).join('')}
      </div>
    </div>

    <!-- Divisor sutil entre categorias -->
    <div class="catalog-divider" aria-hidden="true"></div>

    <!-- Grupo 2: Dry Box Station Combos -->
    <div class="catalog-group">
      <div class="catalog-group-header">
        <span class="catalog-group-kicker">Estações Integradas</span>
        <h3 class="catalog-group-title">Dry Box Station Combos</h3>
        <p class="catalog-group-desc">Soluções completas com bancada integrada antivibração e armazenamento climatizado para Bambu Lab.</p>
      </div>
      <div class="products-subgrid grid-2-cols">
        ${estacoesSetupLab.map(gerarCardHtml).join('')}
      </div>
    </div>

    <!-- Aviso Oficial de Ilustração -->
    <div class="catalog-disclaimer" role="note">
      <p><strong>Observação Importante:</strong> Imagens ilustrativas. A impressora e os filamentos não acompanham o produto.</p>
    </div>
  `;
}

/**
 * Adiciona elevação sutil ao cabeçalho ao rolar a página
 */
function inicializarCabecalho() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Vincula as URLs de checkout centralizadas
 */
function configurarBotoesCheckout() {
  const btnCart = document.getElementById('btn-header-cart');
  if (btnCart && typeof CHECKOUT_BASE_URL !== 'undefined') {
    btnCart.setAttribute('href', CHECKOUT_BASE_URL);
  }

  const btnHeroCheckout = document.getElementById('btn-hero-checkout');
  if (btnHeroCheckout && typeof CHECKOUT_BASE_URL !== 'undefined') {
    btnHeroCheckout.setAttribute('href', CHECKOUT_BASE_URL);
  }
}

/**
 * ScrollSpy de alta performance via IntersectionObserver (elimina layout thrashing no scroll)
 */
function inicializarScrollSpy() {
  const secoes = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!secoes.length || !navLinks.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    });

    secoes.forEach(secao => observer.observe(secao));
  } else {
    // Fallback defensivo com requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 120;
          secoes.forEach(secao => {
            const topo = secao.offsetTop;
            const altura = secao.offsetHeight;
            const id = secao.getAttribute('id');
            if (scrollPos >= topo && scrollPos < topo + altura) {
              navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}
