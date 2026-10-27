import { formatDimensions } from "@/lib/product-dimensions";
import type { ICartLine } from "@/types/cart";
import { Minus, Plus, Trash2 } from "lucide-react";

interface ICartLineItemProps {
  line: ICartLine;
  onChangeQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

const controlClass =
  "inline-flex size-11 cursor-pointer items-center justify-center text-ink-primary transition-colors hover:bg-brand-blue-subtle disabled:cursor-not-allowed disabled:text-ink-muted disabled:opacity-50 disabled:hover:bg-transparent";

export default function CartLineItem({
  line,
  onChangeQuantity,
  onRemove,
}: ICartLineItemProps) {
  const atLimit = line.quantity >= line.maxQuantity;

  return (
    <li
      className="flex flex-col gap-4 rounded-card border border-border-hairline bg-surface-card p-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:p-5"
      data-sku={line.sku}
    >
      <div className="flex aspect-square w-24 shrink-0 items-center justify-center overflow-hidden rounded-input border border-black/[0.03] bg-white p-2 max-[640px]:w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={line.image}
          alt=""
          loading="lazy"
          width={96}
          height={96}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
          {line.name}
        </h2>
        <p className="text-[0.8125rem] text-ink-muted">
          {line.capacity} · {formatDimensions(line.dimensions)}
        </p>
        <p className="text-[0.9375rem] text-ink-secondary">
          {line.formattedUnitPrice} cada
        </p>
        {atLimit ? (
          <p className="text-xs font-medium text-ink-muted">
            Máximo disponível em estoque.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 min-[640px]:flex-col min-[640px]:items-end">
        <div
          className="inline-flex items-center overflow-hidden rounded-pill border border-border-hairline bg-white"
          role="group"
          aria-label={`Quantidade de ${line.name}`}
        >
          <button
            type="button"
            className={controlClass}
            onClick={() => onChangeQuantity(line.productId, line.quantity - 1)}
            disabled={line.quantity <= 1}
            aria-label={`Diminuir quantidade de ${line.name}`}
          >
            <Minus size={16} aria-hidden />
          </button>
          <span
            className="min-w-8 text-center text-[0.9375rem] font-semibold text-ink-primary"
            aria-live="polite"
          >
            {line.quantity}
          </span>
          <button
            type="button"
            className={controlClass}
            onClick={() => onChangeQuantity(line.productId, line.quantity + 1)}
            disabled={atLimit}
            aria-label={`Aumentar quantidade de ${line.name}`}
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>

        <p className="text-[1.125rem] font-bold tracking-[-0.02em] text-ink-primary">
          {line.formattedLineTotal}
        </p>

        <button
          type="button"
          onClick={() => onRemove(line.productId)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-secondary transition-colors hover:text-[#9b1c1c]"
          aria-label={`Remover ${line.name} do carrinho`}
        >
          <Trash2 size={16} aria-hidden />
          Remover
        </button>
      </div>
    </li>
  );
}
