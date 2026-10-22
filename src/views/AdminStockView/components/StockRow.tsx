"use client";

import { adjustStock } from "@/app/admin/stock/actions";
import {
  adjustStockInitialState,
  type IStockProduct,
} from "@/types/admin-stock";
import { AdjustStockModal } from "@/views/AdminStockView/components/AdjustStockModal";
import {
  stockTone,
  unitsFormat,
  type TStockDirection,
} from "@/views/AdminStockView/components/stock-display";
import { Minus, Plus } from "lucide-react";
import { useActionState, useCallback, useEffect, useState } from "react";

interface IStockRowProps {
  product: IStockProduct;
}

export function StockRow({ product }: IStockRowProps) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<TStockDirection>("in");
  const [quantity, setQuantity] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [state, action, pending] = useActionState(
    adjustStock,
    adjustStockInitialState,
  );
  const tone = stockTone(product.stock);
  const inputId = `quantidade-${product.id}`;
  const titleId = `ajustar-estoque-${product.id}`;

  const closeModal = useCallback(() => {
    if (pending) return;
    setOpen(false);
  }, [pending]);

  useEffect(() => {
    if (state.status !== "success") return;
    setOpen(false);
  }, [state]);

  function openAdjust(next: TStockDirection) {
    setDirection(next);
    setQuantity("1");
    setSubmitted(false);
    setOpen(true);
  }

  function changeDirection(next: TStockDirection) {
    setDirection(next);
    setSubmitted(false);
  }

  return (
    <li className="flex flex-col gap-4 border-t border-border-hairline px-4 py-4 first:border-t-0 min-[980px]:flex-row min-[980px]:items-center min-[980px]:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-input border border-black/4 bg-white">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt=""
              width={64}
              height={64}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-[0.6875rem] text-ink-muted">Sem foto</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[0.9375rem] leading-snug font-semibold text-ink-primary">
              {product.name}
            </strong>
            <span
              className={
                product.active
                  ? "rounded-pill bg-brand-blue-subtle px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover uppercase"
                  : "rounded-pill bg-surface-canvas-fog px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-muted uppercase"
              }
            >
              {product.active ? "Ativo" : "Inativo"}
            </span>
          </div>
          <p className="mt-1 truncate text-[0.8125rem] text-ink-muted">
            {product.sku} · {product.category} · {product.capacity}
          </p>
        </div>
      </div>

      <p
        className="w-fit rounded-input px-3 py-2 min-[980px]:text-right"
        style={tone}
      >
        <span
          className={
            tone
              ? "block text-2xl leading-none font-bold tracking-[-0.03em] text-inherit tabular-nums"
              : "block text-2xl leading-none font-bold tracking-[-0.03em] text-ink-primary tabular-nums"
          }
        >
          {unitsFormat.format(product.stock)}
        </span>
        <span
          className={
            tone
              ? "mt-1 block text-[0.6875rem] font-semibold tracking-[0.04em] text-inherit uppercase"
              : "mt-1 block text-[0.6875rem] font-semibold tracking-[0.04em] text-ink-muted uppercase"
          }
        >
          {product.stock === 0
            ? "Sem estoque"
            : product.stock === 1
              ? "unidade"
              : "unidades"}
        </span>
      </p>

      <div className="flex flex-col items-start gap-2 min-[980px]:items-end">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openAdjust("in")}
            aria-label={`Adicionar estoque de ${product.name}`}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill bg-brand-blue px-3 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover"
          >
            <Plus size={16} aria-hidden />
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => openAdjust("out")}
            aria-label={`Diminuir estoque de ${product.name}`}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill border border-border-hairline bg-surface-card px-3 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
          >
            <Minus size={16} aria-hidden />
            Diminuir
          </button>
        </div>
        {!open && state.status === "success" ? (
          <p className="max-w-80 text-sm text-ink-secondary" role="status">
            {state.message}
          </p>
        ) : null}
      </div>

      <AdjustStockModal
        open={open}
        product={product}
        titleId={titleId}
        inputId={inputId}
        direction={direction}
        quantity={quantity}
        pending={pending}
        submitted={submitted}
        state={state}
        action={action}
        onDirection={changeDirection}
        onQuantity={setQuantity}
        onSubmit={() => setSubmitted(true)}
        onClose={closeModal}
      />
    </li>
  );
}
