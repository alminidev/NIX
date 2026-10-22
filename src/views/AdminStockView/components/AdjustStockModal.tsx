"use client";

import { Modal } from "@/components/Modal";
import type { IAdjustStockState, IStockProduct } from "@/types/admin-stock";
import { Minus, Plus } from "lucide-react";
import {
  stockTone,
  unitsFormat,
  type TStockDirection,
} from "@/views/AdminStockView/components/stock-display";

interface IAdjustStockModalProps {
  open: boolean;
  product: IStockProduct;
  titleId: string;
  inputId: string;
  direction: TStockDirection;
  quantity: string;
  pending: boolean;
  submitted: boolean;
  state: IAdjustStockState;
  action: (formData: FormData) => void;
  onDirection: (direction: TStockDirection) => void;
  onQuantity: (quantity: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function AdjustStockModal({
  open,
  product,
  titleId,
  inputId,
  direction,
  quantity,
  pending,
  submitted,
  state,
  action,
  onDirection,
  onQuantity,
  onSubmit,
  onClose,
}: IAdjustStockModalProps) {
  const tone = stockTone(product.stock);

  return (
    <Modal
      open={open}
      onClose={onClose}
      loading={pending}
      labelledBy={titleId}
    >
      <form action={action} onSubmit={onSubmit} className="flex flex-col">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="direction" value={direction} />

        <Modal.Header>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Modal.Title id={titleId}>{product.name}</Modal.Title>
              <p className="mt-2 text-[0.9375rem]">
                Estoque atual:{" "}
                <strong
                  className="font-semibold text-ink-primary tabular-nums"
                  style={tone}
                >
                  {unitsFormat.format(product.stock)}
                </strong>
              </p>
            </div>
            <Modal.Close onClose={onClose} showOnMobile disabled={pending} />
          </div>
        </Modal.Header>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div
            role="tablist"
            aria-label="Tipo de movimento"
            className="grid grid-cols-2 gap-1 rounded-pill border border-border-hairline bg-surface-canvas-fog p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={direction === "in"}
              onClick={() => onDirection("in")}
              disabled={pending}
              className={
                direction === "in"
                  ? "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill bg-brand-blue px-3 text-sm font-semibold text-ink-inverse"
                  : "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill px-3 text-sm font-semibold text-ink-secondary"
              }
            >
              <Plus size={16} aria-hidden />
              Adicionar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={direction === "out"}
              onClick={() => onDirection("out")}
              disabled={pending}
              className={
                direction === "out"
                  ? "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill bg-ink-primary px-3 text-sm font-semibold text-ink-inverse"
                  : "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill px-3 text-sm font-semibold text-ink-secondary"
              }
            >
              <Minus size={16} aria-hidden />
              Diminuir
            </button>
          </div>

          <label
            className="flex flex-col gap-2 text-sm font-medium text-ink-primary"
            htmlFor={inputId}
          >
            <span>Quantidade</span>
            <input
              id={inputId}
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={9999}
              step={1}
              value={quantity}
              onChange={(event) => onQuantity(event.target.value)}
              data-autofocus=""
              autoFocus
              required
              disabled={pending}
              className="min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 text-base font-normal text-ink-primary tabular-nums focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-progress disabled:opacity-70"
            />
          </label>

          {submitted && state.status === "error" ? (
            <p
              className="rounded-input bg-[#fff1f1] px-3.5 py-3 text-sm text-[#9b1c1c]"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}
        </div>

        <Modal.Footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle disabled:cursor-progress disabled:opacity-70 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-brand-blue px-4 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70 sm:w-auto"
          >
            {pending ? "Salvando…" : "Confirmar"}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
