"use client";

import { getCartSummary, placeOrder } from "@/app/cart/actions";
import { CART_URL } from "@/data/produtos";
import { useCartContext } from "@/contexts/CartContext";
import type { ICartSummary, IShippingQuote } from "@/types/cart";
import { checkoutFormInitialState } from "@/types/order";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import CartLineItem from "./components/CartLineItem";
import CheckoutForm from "./components/CheckoutForm";
import OrderSummary from "./components/OrderSummary";

/**
 * CartContent — Conteúdo do carrinho. Os itens ficam no navegador, mas toda
 * exibição de preço, estoque e total vem da conferência feita no servidor.
 */
export default function CartContent() {
  const { items, isReady, setQuantity, removeItem, replaceItems } =
    useCartContext();
  const [summary, setSummary] = useState<ICartSummary | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [shipping, setShipping] = useState<IShippingQuote | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [addressReady, setAddressReady] = useState(false);
  const [checkoutState, checkoutAction, isPlacingOrder] = useActionState(
    placeOrder,
    checkoutFormInitialState,
  );
  const orderPlaced = checkoutState.status === "success";

  // Pedido criado: esvazia o carrinho e segue para o checkout.
  useEffect(() => {
    if (!orderPlaced) return;

    replaceItems([]);
    // TODO: o checkout da InfinitePay entra aqui. Por enquanto segue para a
    // URL de checkout já configurada em NEXT_PUBLIC_CART_URL.
    window.location.assign(CART_URL);
  }, [orderPlaced, replaceItems]);

  useEffect(() => {
    if (!isReady || orderPlaced) return;

    let cancelled = false;

    getCartSummary(items)
      .then((next) => {
        if (cancelled) return;

        if (!next) {
          setFailed(true);
          return;
        }

        setFailed(false);
        setSummary(next);
        if (next.notices.length > 0) setNotices(next.notices);
        replaceItems(
          next.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [items, isReady, orderPlaced, replaceItems]);

  // A cotação depende dos itens: qualquer mudança exige calcular de novo.
  useEffect(() => {
    setShipping(null);
    setSelectedServiceId(null);
  }, [items]);

  function applyShipping(quote: IShippingQuote | null) {
    setShipping(quote);
    setSelectedServiceId(quote?.status === "quoted" ? quote.serviceId : null);
  }

  const isLoading = !isReady || (items.length > 0 && summary === null);
  const lines = summary?.lines ?? [];
  const isEmpty = isReady && items.length === 0 && !orderPlaced;

  function changeQuantity(productId: number, quantity: number) {
    setNotices([]);
    setQuantity(productId, quantity);
  }

  function remove(productId: number) {
    setNotices([]);
    removeItem(productId);
  }

  return (
    <main
      id="main-content"
      className="flex-1 bg-surface-canvas-fog py-10 min-[992px]:py-16"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <header className="mb-8">
          <Link
            href="/#produtos"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-brand-blue"
          >
            <ArrowLeft size={16} aria-hidden />
            Continuar comprando
          </Link>
          <h1 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Seu carrinho
          </h1>
        </header>

        {notices.length > 0 ? (
          <div
            className="mb-6 rounded-card border border-border-hairline bg-white px-5 py-3.5 text-[0.8125rem] text-ink-secondary"
            role="status"
          >
            {notices.map((notice) => (
              <p key={notice}>{notice}</p>
            ))}
          </div>
        ) : null}

        {failed ? (
          <div
            className="mb-6 rounded-card border border-[#e8b4b4] bg-white px-5 py-3.5 text-[0.8125rem] text-[#9b1c1c]"
            role="alert"
          >
            Não foi possível conferir o carrinho agora. Tente novamente em
            instantes.
          </div>
        ) : null}

        {orderPlaced ? (
          <div
            className="rounded-card border border-border-hairline bg-surface-card px-6 py-16 text-center"
            role="status"
          >
            <p className="mb-2 text-[1.0625rem] font-semibold text-ink-primary">
              Pedido nº {checkoutState.orderId} criado.
            </p>
            <p className="text-[0.9375rem] text-ink-secondary">
              Levando você para o checkout…
            </p>
          </div>
        ) : isEmpty ? (
          <div className="rounded-card border border-border-hairline bg-surface-card px-6 py-16 text-center">
            <ShoppingCart
              size={32}
              className="mx-auto mb-4 text-ink-muted"
              aria-hidden
            />
            <p className="mb-6 text-[1.0625rem] text-ink-secondary">
              Seu carrinho está vazio.
            </p>
            <Link
              href="/#produtos"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-brand-blue px-8 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 items-start gap-8 min-[992px]:grid-cols-[minmax(0,1fr)_380px]"
            aria-busy={isLoading}
          >
            <section aria-label="Itens do carrinho">
              {isLoading ? (
                <p className="rounded-card border border-border-hairline bg-surface-card px-6 py-10 text-center text-[0.9375rem] text-ink-muted">
                  Carregando carrinho…
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {lines.map((line) => (
                    <CartLineItem
                      key={line.productId}
                      line={line}
                      onChangeQuantity={changeQuantity}
                      onRemove={remove}
                    />
                  ))}
                </ul>
              )}

              {!isLoading && lines.length > 0 ? (
                <CheckoutForm
                  items={items}
                  action={checkoutAction}
                  errors={checkoutState.fieldErrors}
                  disabled={isPlacingOrder}
                  onShippingChange={applyShipping}
                  shipping={shipping}
                  selectedServiceId={selectedServiceId}
                  onSelectService={setSelectedServiceId}
                  onAddressReadyChange={setAddressReady}
                />
              ) : null}
            </section>

            <OrderSummary
              summary={summary}
              shipping={shipping}
              selectedServiceId={selectedServiceId}
              addressReady={addressReady}
              checkoutMessage={
                checkoutState.status === "error" ? checkoutState.message : ""
              }
              isPlacingOrder={isPlacingOrder}
              disabled={isLoading || failed || lines.length === 0}
            />
          </div>
        )}
      </div>
    </main>
  );
}
