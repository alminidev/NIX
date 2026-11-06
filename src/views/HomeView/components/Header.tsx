'use client';

import { useEffect, useState } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Header — Cabeçalho fixo (sticky) da NIX 3D.
 *
 * Comportamentos:
 * 1. Elevação ao rolar
 * 2. ScrollSpy via IntersectionObserver
 * 3. Menu hambúrguer acessível no mobile e no tablet
 *
 * Carrinho:
 *    O botão leva a /cart e mostra a quantidade de itens guardada no navegador.
 *
 * Em outras páginas (ex: /cart), passe homePath="/" para que os links de
 * seção voltem para a página inicial.
 */
export default function Header({ homePath = '' }: { homePath?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { itemCount, isReady } = useCartContext();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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
    <header
      id="site-header"
      className={`sticky top-0 z-[100] h-16 w-full border-b border-border-hairline bg-white transition-shadow duration-200 ease-nix max-[640px]:h-14 ${scrolled ? 'shadow-sticky-nav' : ''}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4 min-[640px]:px-6">
        <a href={`${homePath}#hero`} className="flex items-center" aria-label="NIX 3D — Página Inicial">
          <Image
            src="/images/logo-nix.png"
            alt="Logotipo NIX"
            width={110}
            height={32}
            className="h-8 w-auto object-contain"
            style={{ width: "auto", height: "2rem" }}
          />
        </a>

        <nav aria-label="Navegação Principal">
          <ul className="hidden items-center gap-8 min-[992px]:flex">
            {navItems.map(({ href, label }) => {
              const sectionId = href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <li key={href}>
                  <a
                    href={`${homePath}${href}`}
                    className={`text-sm font-medium transition-colors hover:text-brand-blue ${isActive ? 'text-brand-blue' : 'text-ink-secondary'}`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 min-[640px]:gap-4">
          <Link
            id="btn-header-cart"
            href="/cart"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 bg-transparent p-1.5 transition-opacity duration-200 ease-nix hover:opacity-70 active:opacity-50"
            title="Carrinho de Compras"
            aria-label={
              isReady && itemCount > 0
                ? `Ir para o carrinho de compras, ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`
                : 'Ir para o carrinho de compras'
            }
          >
            <Image
              src="/images/carrinho_vetorizado.svg"
              alt=""
              width={21}
              height={17}
              className="block h-[17px] w-[21px] object-contain"
            />
            {isReady && itemCount > 0 ? (
              <span className="rounded-pill bg-brand-blue px-1.5 text-xs text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            id="btn-mobile-menu"
            className="flex size-10 flex-col items-center justify-center gap-[5px] rounded-button p-2 text-ink-primary transition-colors hover:bg-surface-canvas-fog min-[992px]:hidden"
            type="button"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span
              className={`block h-0.5 w-5 rounded-sm bg-current transition-[transform,opacity] duration-200 ${mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-sm bg-current transition-[transform,opacity] duration-200 ${mobileMenuOpen ? 'scale-x-0 opacity-0' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-sm bg-current transition-[transform,opacity] duration-200 ${mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`absolute top-full left-0 z-[99] w-full overflow-hidden border-b border-border-hairline bg-white shadow-[0_16px_36px_rgba(0,0,0,0.1)] transition-[max-height,opacity] duration-300 ease-nix min-[992px]:hidden ${
          mobileMenuOpen
            ? 'max-h-60 pointer-events-auto opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        }`}
        aria-label="Navegação Mobile"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex flex-col gap-5 px-4 py-5 min-[640px]:px-6">
          <ul className="flex flex-col gap-2">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={`${homePath}${href}`}
                  className="block py-2 text-[1.0625rem] font-semibold text-ink-primary transition-colors hover:text-brand-blue"
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
