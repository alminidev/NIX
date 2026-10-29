import type { IThankYouState } from "@/lib/payments";
import Footer from "@/views/HomeView/components/Footer";
import Header from "@/views/HomeView/components/Header";
import SkipLink from "@/views/HomeView/components/SkipLink";
import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import PaymentRefresh from "./PaymentRefresh";

interface IThankYouViewProps {
  state: IThankYouState;
}

const copy = {
  paid: {
    title: "Pagamento confirmado",
    body: "Recebemos o pagamento. A loja segue com o pedido.",
  },
  pending: {
    title: "Aguardando confirmação",
    body: "O pagamento ainda não foi confirmado. Esta página atualiza sozinha.",
  },
  expired: {
    title: "Pedido expirado",
    body: "O prazo para pagar este pedido acabou.",
  },
  review: {
    title: "Pagamento em revisão",
    body: "Recebemos o pagamento, mas ele precisa de uma conferência da loja.",
  },
  error: {
    title: "Não foi possível confirmar o pagamento",
    body: "Se você acabou de pagar, tente de novo em instantes.",
  },
} as const;

export function ThankYouView({ state }: IThankYouViewProps) {
  const text = copy[state.status];
  const Icon =
    state.status === "paid"
      ? CircleCheck
      : state.status === "pending"
        ? Clock
        : TriangleAlert;

  return (
    <>
      <SkipLink />
      <Header homePath="/" />
      <main
        id="main-content"
        className="flex flex-1 items-center bg-surface-canvas-fog py-10 min-[992px]:py-16"
      >
        <div className="mx-auto w-full max-w-[640px] px-4 min-[640px]:px-6">
          <section
            className="rounded-card border border-border-hairline bg-surface-card px-6 py-12 text-center min-[640px]:px-10"
            role="status"
          >
            <Icon
              size={32}
              className="mx-auto mb-4 text-brand-blue"
              aria-hidden
            />
            <h1 className="text-[clamp(1.5rem,2vw+0.5rem,2rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
              {text.title}
            </h1>
            {state.orderId ? (
              <p className="mt-3 text-[1.0625rem] font-semibold text-ink-primary">
                Pedido nº {state.orderId}
              </p>
            ) : null}
            <p className="mx-auto mt-3 max-w-[420px] text-[0.9375rem] leading-[1.6] text-ink-secondary">
              {text.body}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              {state.status === "paid" && state.receiptUrl ? (
                <a
                  href={state.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-pill bg-brand-blue px-8 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover"
                >
                  Ver comprovante
                </a>
              ) : null}
              {state.status === "pending" || state.status === "error" ? (
                <PaymentRefresh auto={state.refresh} />
              ) : null}
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center px-4 text-sm font-semibold text-brand-blue-hover"
              >
                Voltar à loja
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
