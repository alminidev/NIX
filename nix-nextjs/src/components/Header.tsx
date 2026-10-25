'use client';

import { useEffect, useRef, useState } from 'react';
import { CART_URL } from '@/data/produtos';

/**
 * Header — Cabeçalho fixo (sticky) da NIX 3D.
 *
 * Comportamentos migrados do JS vanilla:
 * 1. inicializarCabecalho(): adiciona classe "scrolled" quando scrollY > 20
 *    → useEffect + useState + window.scroll (passive listener)
 * 2. inicializarScrollSpy(): destaca o nav-link da seção visível
 *    → useEffect + IntersectionObserver com os mesmos parâmetros do original
 *    rootMargin: '-20% 0px -65% 0px'
 *
 * URL do carrinho:
 *    Centralizada em @/data/produtos (lê process.env.NEXT_PUBLIC_CART_URL).
 *
 * PONTO DE INTEGRAÇÃO (programador back-end):
 *    Contador do ícone do carrinho — veja o comentário TODO abaixo.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // URL de checkout centralizada — altere em @/data/produtos ou .env.local
  const cartUrl = CART_URL;
  const whatsappUrl =
    'https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  // Elevação do header ao rolar (equivalente a inicializarCabecalho())
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // executa imediatamente para estado inicial correto
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ScrollSpy via IntersectionObserver (equivalente a inicializarScrollSpy())
  useEffect(() => {
    const secoes = document.querySelectorAll<HTMLElement>('section[id]');
    if (!secoes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('id') ?? '');
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      }
    );

    secoes.forEach((secao) => observer.observe(secao));
    return () => observer.disconnect();
  }, []);

  const navItems = [
    { href: '#produtos', label: 'Produtos' },
    { href: '#diferenciais', label: 'Diferenciais' },
    { href: '#faq', label: 'Dúvidas' },
  ];

  return (
    <header id="site-header" className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-container">
        <a href="#hero" className="brand-logo" aria-label="NIX 3D — Página Inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-nix.png" alt="Logotipo NIX" width={110} height={32} />
        </a>

        <nav className="nav-desktop" aria-label="Navegação Principal">
          <ul className="nav-links">
            {navItems.map(({ href, label }) => {
              const sectionId = href.slice(1); // remove o '#'
              return (
                <li key={href}>
                  <a
                    href={href}
                    className={`nav-link${activeSection === sectionId ? ' active' : ''}`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <a
            id="btn-header-cart"
            href={cartUrl}
            className="btn-cart"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir para o carrinho de compras seguro"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Carrinho</span>
            {/*
              TODO (programador back-end):
              Conecte aqui a quantidade de itens do carrinho para exibir o badge.
              Exemplo: <span className="cart-badge">{cartCount}</span>
              O CSS do badge deve ser adicionado ao globals.css.
            */}
          </a>
        </div>
      </div>
    </header>
  );
}
