/**
 * Footer — Rodapé da NIX 3D.
 */
export default function Footer() {
  const whatsappUrl =
    "https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D";

  return (
    <footer
      id="site-footer"
      className="border-t border-border-dark-hairline bg-surface-footer pt-16 pb-8 text-sm text-white/60"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="mb-12 flex flex-col flex-wrap items-start justify-between gap-8 min-[640px]:flex-row min-[640px]:gap-12">
          <div className="max-w-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-nix.png"
              alt="Logotipo NIX"
              width={100}
              height={30}
              className="mb-4 h-7 w-auto brightness-0 invert"
            />
            <p className="leading-[1.6]">
              Mobiliário técnico e soluções inteligentes com controle térmico
              para a comunidade de manufatura aditiva e impressão 3D.
            </p>
            <div className="mt-4 text-xs leading-[1.4] text-white/60">
              ⚠️ <strong>Observação Importante:</strong> Imagens ilustrativas. A
              impressora e os filamentos não acompanham o produto.
            </div>
          </div>

          <div className="flex flex-col flex-wrap gap-6 min-[640px]:flex-row min-[640px]:gap-12">
            <div className="[&_a:hover]:text-ink-inverse">
              <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-ink-inverse uppercase">
                Navegação
              </h4>
              <ul>
                <li className="mb-2.5">
                  <a href="#hero">Início</a>
                </li>
                <li className="mb-2.5">
                  <a href="#produtos">Produtos</a>
                </li>
                <li className="mb-2.5">
                  <a href="#diferenciais">Diferenciais</a>
                </li>
                <li className="mb-2.5">
                  <a href="#faq">Dúvidas Frequentes</a>
                </li>
              </ul>
            </div>

            <div className="[&_a:hover]:text-ink-inverse">
              <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-ink-inverse uppercase">
                Atendimento &amp; Social
              </h4>
              <ul>
                <li className="mb-2.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fale com a Nix (WhatsApp)
                  </a>
                </li>
                <li className="mb-2.5">
                  <a
                    href="https://instagram.com/nix_impressoes3d"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram @nix_impressoes3d
                  </a>
                </li>
                <li className="mb-2.5">
                  <span>Retirada no local em São Paulo</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-[0.05em] text-ink-inverse uppercase">
                Condições
              </h4>
              <ul>
                <li className="mb-2.5">
                  <span>Até 3x sem juros</span>
                </li>
                <li className="mb-2.5">
                  <span>Envio para todo o Brasil</span>
                </li>
                <li className="mb-2.5">
                  <span>Checkout Seguro InfinitePay</span>
                </li>
                <li className="mb-2.5">
                  <span>Garantia de Fábrica</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-wrap items-start justify-between gap-4 border-t border-border-dark-hairline pt-8 text-xs text-white/70 min-[640px]:flex-row min-[640px]:items-center [&_strong]:text-white/80">
          <p>
            © 2026 <strong>NIX 3D</strong>. Todos os direitos reservados. nix3d.
          </p>
          <p>
            Frete a consultar no checkout de acordo com o CEP de destino.
            Retirada disponível no local em São Paulo.
          </p>
        </div>
      </div>
    </footer>
  );
}
