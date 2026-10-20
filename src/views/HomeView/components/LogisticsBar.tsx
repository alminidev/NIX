import { Camera, CreditCard, MapPin, Truck } from "lucide-react";

/**
 * LogisticsBar — Seção de informações comerciais e logísticas.
 */
export default function LogisticsBar() {
  const whatsappUrl =
    "https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D";

  return (
    <section
      className="border-y border-border-hairline bg-white py-12"
      aria-label="Informações Comerciais e Logísticas"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[640px]:gap-5 min-[992px]:grid-cols-4 min-[992px]:gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-input bg-brand-blue-subtle text-brand-blue-hover"
              aria-hidden="true"
            >
              <Truck size={22} aria-hidden />
            </div>
            <div>
              <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Envio para Todo o Brasil
              </h3>
              <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
                Enviamos para todo o Brasil (Frete a consultar no checkout).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-input bg-brand-blue-subtle text-brand-blue-hover"
              aria-hidden="true"
            >
              <CreditCard size={22} aria-hidden />
            </div>
            <div>
              <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Até 3x Sem Juros
              </h3>
              <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
                Pagamento facilitado em até 3x sem juros no cartão de crédito.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-input bg-brand-blue-subtle text-brand-blue-hover"
              aria-hidden="true"
            >
              <MapPin size={22} aria-hidden />
            </div>
            <div>
              <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Retirada no Local
              </h3>
              <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
                Disponível para retirada no local em São Paulo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-input bg-brand-blue-subtle text-brand-blue-hover"
              aria-hidden="true"
            >
              <Camera size={22} aria-hidden />
            </div>
            <div>
              <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Instagram &amp; Contato
              </h3>
              <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
                <a
                  href="https://instagram.com/nix_impressoes3d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-blue hover:underline"
                >
                  @nix_impressoes3d
                </a>{" "}
                •{" "}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-blue hover:underline"
                >
                  Fale com a Nix
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
