'use client';

import { useEffect, useState } from 'react';
import { CART_URL } from '@/data/produtos';

/**
 * Header — Cabeçalho fixo (sticky) da NIX 3D com navegação desktop e menu hambúrguer mobile.
 *
 * Comportamentos:
 * 1. Elevação ao rolar (scrolled)
 * 2. ScrollSpy via IntersectionObserver
 * 3. Menu hambúrguer acessível para mobile/tablet
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // URL de checkout centralizada — altere em @/data/produtos ou .env.local
  const cartUrl = CART_URL;
  const whatsappUrl =
    'https://wa.me/5511941692023?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  // Elevação do header ao rolar
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fechar menu mobile com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // ScrollSpy via IntersectionObserver
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
              const sectionId = href.slice(1);
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
            title="Carrinho de Compras"
          >
            <img src="/images/carrinho_vetorizado.svg" alt="Carrinho de compras" width={21} height={17} />
          </a>

          {/* Botão Menu Hambúrguer (Mobile) */}
          <button
            id="btn-mobile-menu"
            className={`btn-hamburger${mobileMenuOpen ? ' active' : ''}`}
            type="button"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Gaveta / Dropdown Menu Mobile */}
      <nav
        id="mobile-nav"
        className={`mobile-nav${mobileMenuOpen ? ' open' : ''}`}
        aria-label="Navegação Mobile"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="container mobile-nav-container">
          <ul className="mobile-nav-links">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
