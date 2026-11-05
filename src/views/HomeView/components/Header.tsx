'use client';

import { useEffect, useState } from 'react';
import { useCartContext } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Header — Cabeçalho fixo (sticky) da NIX 3D.
 *
 * Comportamentos migrados do JS vanilla:
 * 1. inicializarCabecalho(): sombra quando scrollY > 20
 *    → useEffect + useState + window.scroll (passive listener)
 * 2. inicializarScrollSpy(): destaca o link da seção visível
 *    → useEffect + IntersectionObserver
 *    rootMargin: '-20% 0px -65% 0px'
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

  const { itemCount, isReady } = useCartContext();

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
              const sectionId = href.slice(1); // remove o '#'
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
        </div>
      </div>
    </header>
  );
}
