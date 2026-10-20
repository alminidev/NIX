'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { CART_URL } from '@/data/produtos';

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
    <header
      id="site-header"
      className={`sticky top-0 z-[100] h-16 w-full border-b border-border-hairline bg-white transition-shadow duration-200 ease-nix max-[640px]:h-14 ${scrolled ? 'shadow-sticky-nav' : ''}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4 min-[640px]:px-6">
        <a href="#hero" className="flex items-center" aria-label="NIX 3D — Página Inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-nix.png"
            alt="Logotipo NIX"
            width={110}
            height={32}
            className="h-8 w-auto object-contain"
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
                    href={href}
                    className={`text-sm font-medium transition-colors hover:text-brand-blue ${isActive ? 'text-brand-blue' : 'text-ink-secondary'}`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={whatsappUrl}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-hairline bg-transparent px-4 py-2.5 text-sm font-medium text-ink-secondary transition-all duration-200 ease-nix hover:-translate-y-px hover:border-brand-blue hover:text-brand-blue"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fale com a Nix pelo WhatsApp"
          >
            <MessageCircle size={16} aria-hidden />
            <span>Fale com a Nix</span>
          </a>

          <a
            id="btn-header-cart"
            href={cartUrl}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-[rgba(23,107,255,0.2)] bg-brand-blue-subtle px-[18px] py-2.5 text-sm font-semibold text-brand-blue-hover transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue hover:text-ink-inverse"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir para o carrinho de compras seguro"
          >
            <ShoppingCart size={18} aria-hidden />
            <span>Carrinho</span>
            {/*
              TODO (programador back-end):
              Conecte aqui a quantidade de itens do carrinho para exibir o badge.
              Exemplo: <span className="rounded-pill bg-brand-blue px-1.5 text-xs text-white">{cartCount}</span>
            */}
          </a>
        </div>
      </div>
    </header>
  );
}
