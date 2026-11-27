import { orderPdfDenial, orderPdfFilename } from "@/lib/order-pdf";
import type { OrderStatus } from "@/generated/prisma/enums";

interface IOrderPdfLinkProps {
  orderId: number;
  status: OrderStatus;
}

const enabledClass =
  "inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-6 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

const disabledClass =
  "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-pill bg-brand-blue px-6 text-sm font-semibold text-ink-inverse opacity-60";

export default function OrderPdfLink({ orderId, status }: IOrderPdfLinkProps) {
  const denial = orderPdfDenial(status);

  if (denial) {
    return (
      <div className="flex max-w-sm flex-col items-start gap-2">
        <button
          type="button"
          disabled
          className={disabledClass}
          aria-describedby="pdf-pedido-motivo"
        >
          Gerar PDF do pedido
        </button>
        <p id="pdf-pedido-motivo" className="text-sm text-ink-secondary">
          {denial}
        </p>
      </div>
    );
  }

  return (
    <a
      href={`/admin/orders/${orderId}/pdf`}
      className={enabledClass}
      download={orderPdfFilename(orderId)}
    >
      Gerar PDF do pedido
    </a>
  );
}
