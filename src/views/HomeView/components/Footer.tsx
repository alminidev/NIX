import {
  cardInstallmentsLabel,
  pixDiscountLabel,
} from "@/lib/payment-terms";
import {
  footerBrandText,
  footerCreditLabel,
  footerCreditUrl,
  footerDisclaimer,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_URL,
} from "@/views/HomeView/copy";

/**
 * Footer — Rodapé da NIX 3D.
 */
export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-border-dark-hairline bg-surface-footer pt-16 pb-8 text-sm text-white/60"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="mb-12 flex flex-col flex-wrap items-start justify-between gap-8 min-[640px]:flex-row min-[640px]:gap-12">
          <div className="max-w-[360px]">
            <strong className="mb-4 block text-[2rem] leading-none font-extrabold tracking-[0.06em] text-ink-inverse uppercase">
              NIX
            </strong>
            <p className="leading-[1.6]">{footerBrandText}</p>
            <div className="mt-4 text-xs leading-[1.4] text-white/60">
              <strong>Aviso:</strong> {footerDisclaimer}
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
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fale com a Nix (WhatsApp)
                  </a>
                </li>
                <li className="mb-2.5">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram {INSTAGRAM_HANDLE}
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
                  <span>{pixDiscountLabel()}</span>
                </li>
                <li className="mb-2.5">
                  <span>{cardInstallmentsLabel()}</span>
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

        <div className="flex flex-col flex-wrap items-start justify-between gap-4 border-t border-border-dark-hairline pt-8 text-xs text-white/70 min-[640px]:flex-row min-[640px]:items-center [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-ink-inverse [&_strong]:text-white/80">
          <p>
            © 2026 <strong>NIX 3D</strong>. Todos os direitos reservados.
          </p>
          <p>
            Frete a consultar no checkout de acordo com o CEP de destino.
            Retirada disponível no local em São Paulo.
          </p>
          <p>
            DESIGN &amp; CODE BY{" "}
            <a href={footerCreditUrl} target="_blank" rel="noopener noreferrer">
              {footerCreditLabel}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
