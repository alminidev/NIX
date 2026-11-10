import {
  cardInstallmentsLabel,
  interestDisclosure,
  pixDiscountLabel,
} from "@/lib/payment-terms";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "@/views/HomeView/copy";

/**
 * LogisticsBar — Seção de informações comerciais e logísticas.
 */
export default function LogisticsBar() {
  return (
    <section
      className="border-y border-border-hairline bg-white py-12"
      aria-label="Informações Comerciais e Logísticas"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[640px]:gap-5 min-[992px]:grid-cols-4 min-[992px]:gap-6">
          <div>
            <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Envio para Todo o Brasil
            </h3>
            <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
              Enviamos para todo o Brasil (Frete a consultar).
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Até 3x Sem Juros
            </h3>
            <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
              {`${pixDiscountLabel()} e ${cardInstallmentsLabel()}. ${interestDisclosure()}`}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Retirada no Local
            </h3>
            <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
              Disponível para retirada no local em São Paulo.
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-base leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
              Instagram &amp; Contato
            </h3>
            <p className="text-[0.8125rem] leading-[1.4] text-ink-secondary">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-blue hover:underline"
              >
                {INSTAGRAM_HANDLE}
              </a>{" "}
              •{" "}
              <a
                href={WHATSAPP_URL}
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
    </section>
  );
}
