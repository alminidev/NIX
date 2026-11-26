"use client";

import PaymentTerms from "@/components/PaymentTerms";
import { useCartContext, type TAddItemResult } from "@/contexts/CartContext";
import {
  formatItemLabel,
  productVoltages,
  voltageLabels,
  type TProductVoltage,
} from "@/lib/voltage";
import type { IProduct } from "@/types/product";
import { Lock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

interface IProductPurchaseActionsProps {
  product: IProduct;
  /** Conteúdo entre o preço e o botão, usado no detalhe. */
  between?: ReactNode;
  /** `actions` omite o preço. O modal desenha o preço no cabeçalho. */
  chrome?: "full" | "actions";
}

/**
 * Preço, condições e adicionar ao carrinho.
 * O card e o detalhe usam o mesmo fluxo de compra.
 */
export default function ProductPurchaseActions({
  product,
  between,
  chrome = "full",
}: IProductPurchaseActionsProps) {
  const { addItem } = useCartContext();
  const [adding, setAdding] = useState(false);
  const [result, setResult] = useState<TAddItemResult | null>(null);
  const [voltage, setVoltage] = useState<TProductVoltage | null>(null);
  const [trackedId, setTrackedId] = useState(product.id);

  if (trackedId !== product.id) {
    setTrackedId(product.id);
    setVoltage(null);
    setResult(null);
  }

  const needsVoltage = product.requiresVoltage && !voltage;

  async function handleAdd() {
    if (needsVoltage) {
      setResult("voltage");
      return;
    }

    setAdding(true);
    setResult(await addItem(product.id, product.requiresVoltage ? voltage : null));
    setAdding(false);
  }

  const feedback: Record<TAddItemResult, string> = {
    added: "Produto adicionado ao carrinho.",
    limit: "Você já tem todas as unidades disponíveis no carrinho.",
    unavailable: "Este produto está indisponível no momento.",
    voltage: "Escolha a voltagem (110V ou 220V).",
    error: "Não foi possível adicionar. Tente novamente.",
  };

  const purchase = (
    <>
      {product.requiresVoltage ? (
        <fieldset className="mb-3.5 min-w-0">
          <legend className="mb-2 text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
            Voltagem
          </legend>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            {productVoltages.map((value) => {
              const selected = voltage === value;
              return (
                <label
                  key={value}
                  className={`flex min-h-11 min-w-0 cursor-pointer items-center justify-center rounded-input border text-sm font-semibold whitespace-nowrap transition-colors ${
                    selected
                      ? "border-brand-blue bg-brand-blue-subtle text-brand-blue-hover"
                      : "border-border-hairline bg-white text-ink-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name={`voltage-${product.id}`}
                    value={value}
                    checked={selected}
                    onChange={() => {
                      setVoltage(value);
                      setResult(null);
                    }}
                    className="sr-only"
                  />
                  {voltageLabels[value]}
                </label>
              );
            })}
          </div>
          {needsVoltage ? (
            <p className="mt-2 text-xs font-medium text-ink-secondary">
              Escolha a voltagem (110V ou 220V).
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <PaymentTerms className="mb-3.5" />

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock || adding || needsVoltage}
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-button bg-brand-blue px-6 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        data-sku={product.sku}
        data-id={product.id}
        aria-label={
          !product.inStock
            ? `${product.name} indisponível`
            : needsVoltage
              ? `Escolha a voltagem de ${product.name} antes de adicionar ao carrinho`
              : `Adicionar ${formatItemLabel(product.name, voltage)} ao carrinho`
        }
      >
        {product.inStock ? "Adicionar ao carrinho" : "Indisponível"}
        <ShoppingCart size={16} aria-hidden />
      </button>

      <p
        className="text-center text-xs font-medium text-ink-secondary empty:hidden [&:not(:empty)]:mt-2"
        role="status"
      >
        {result ? feedback[result] : null}
        {result === "added" || result === "limit" ? (
          <>
            {" "}
            <Link
              href="/cart"
              className="font-semibold text-brand-blue-hover underline"
            >
              Ver carrinho
            </Link>
          </>
        ) : null}
      </p>

      <div
        className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.6875rem] font-medium text-ink-muted"
        aria-hidden="true"
      >
        <Lock size={12} className="text-brand-blue" aria-hidden />
        <span>Ambiente Seguro InfinitePay</span>
      </div>

      <span className="mt-1.5 block text-center text-xs font-medium text-ink-muted">
        Enviamos para todo o Brasil • Frete a consultar
      </span>
    </>
  );

  if (chrome === "actions") {
    return <div>{purchase}</div>;
  }

  return (
    <div className="mt-auto">
      <div className="mb-3.5 flex items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-ink-muted uppercase">
            Preço à vista
          </span>
          <span className="text-[1.375rem] font-bold tracking-[-0.02em] text-ink-primary">
            {product.formattedPrice}
          </span>
        </div>
        <span className="rounded-pill bg-brand-blue-subtle px-2 py-1 text-xs font-semibold whitespace-nowrap text-brand-blue-hover">
          {product.installments}
        </span>
      </div>

      {between ? <div className="mb-5 flex flex-col gap-5">{between}</div> : null}

      {purchase}
    </div>
  );
}
