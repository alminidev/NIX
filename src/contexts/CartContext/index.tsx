"use client";

import { ContextOutOfScopeError } from "@/app/_errors/context-out-of-scope.error";
import { getCartSummary } from "@/app/cart/actions";
import { toStoredCartItems } from "@/lib/cart-calculation";
import { parseCartItems } from "@/lib/cart-input";
import { sameCartVoltage, type TProductVoltage } from "@/lib/voltage";
import type { ICartItem } from "@/types/cart";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const storageKey = "nix-cart";

export type TAddItemResult =
  | "added"
  | "limit"
  | "unavailable"
  | "voltage"
  | "error";

interface ICartContextValue {
  items: ICartItem[];
  /** false até o carrinho salvo no navegador ser lido */
  isReady: boolean;
  itemCount: number;
  addItem: (
    productId: number,
    voltage?: TProductVoltage | null,
  ) => Promise<TAddItemResult>;
  setQuantity: (
    productId: number,
    quantity: number,
    voltage?: TProductVoltage | null,
  ) => void;
  removeItem: (productId: number, voltage?: TProductVoltage | null) => void;
  /** Troca os itens pelos já validados pelo servidor */
  replaceItems: (items: ICartItem[]) => void;
}

const CartContext = createContext<ICartContextValue | null>(null);

function readStoredItems(): ICartItem[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return (raw ? parseCartItems(JSON.parse(raw)) : null) ?? [];
  } catch {
    return [];
  }
}

function sameItems(a: ICartItem[], b: ICartItem[]) {
  return (
    a.length === b.length &&
    a.every(
      (item, index) =>
        item.productId === b[index].productId &&
        item.quantity === b[index].quantity &&
        sameCartVoltage(item.voltage, b[index].voltage),
    )
  );
}

/**
 * CartProvider — Guarda no navegador o id, a quantidade e, quando houver,
 * a voltagem de cada linha. Preço, estoque e totais vêm do servidor.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const itemsRef = useRef<ICartItem[]>([]);

  const commit = useCallback((next: ICartItem[]) => {
    itemsRef.current = next;
    setItems(next);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Armazenamento bloqueado: o carrinho vale só para esta aba.
    }
  }, []);

  useEffect(() => {
    const stored = readStoredItems();
    itemsRef.current = stored;
    setItems(stored);
    setIsReady(true);

    function onStorage(event: StorageEvent) {
      if (event.key !== storageKey) return;
      const next = readStoredItems();
      itemsRef.current = next;
      setItems(next);
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback(
    async (
      productId: number,
      voltage?: TProductVoltage | null,
    ): Promise<TAddItemResult> => {
      const selected = voltage ?? null;
      const current = itemsRef.current;
      const existing = current.find(
        (item) =>
          item.productId === productId && sameCartVoltage(item.voltage, selected),
      );
      const requested = existing ? existing.quantity + 1 : 1;
      const next = existing
        ? current.map((item) =>
            item.productId === productId &&
            sameCartVoltage(item.voltage, selected)
              ? { ...item, quantity: requested }
              : item,
          )
        : [
            ...current,
            selected
              ? { productId, quantity: 1, voltage: selected }
              : { productId, quantity: 1 },
          ];

      try {
        const summary = await getCartSummary(next);
        if (!summary) return "error";

        const line = summary.lines.find(
          (entry) =>
            entry.productId === productId &&
            sameCartVoltage(entry.voltage, selected),
        );
        if (!line) {
          const needsVoltage = summary.notices.some(
            (notice) =>
              notice.code === "VOLTAGE_REQUIRED" ||
              notice.code === "VOLTAGE_INVALID",
          );
          return needsVoltage ? "voltage" : "unavailable";
        }

        // Outra aba pode ter mexido no carrinho durante a conferência.
        const latest = itemsRef.current;
        const merged = toStoredCartItems(summary.lines);
        commit(sameItems(latest, current) ? merged : latest);

        return line.quantity < requested ? "limit" : "added";
      } catch {
        return "error";
      }
    },
    [commit],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number, voltage?: TProductVoltage | null) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;

      const selected = voltage ?? null;
      commit(
        itemsRef.current.map((item) =>
          item.productId === productId && sameCartVoltage(item.voltage, selected)
            ? { ...item, quantity }
            : item,
        ),
      );
    },
    [commit],
  );

  const removeItem = useCallback(
    (productId: number, voltage?: TProductVoltage | null) => {
      const selected = voltage ?? null;
      commit(
        itemsRef.current.filter(
          (item) =>
            !(
              item.productId === productId &&
              sameCartVoltage(item.voltage, selected)
            ),
        ),
      );
    },
    [commit],
  );

  const replaceItems = useCallback(
    (next: ICartItem[]) => {
      if (!sameItems(itemsRef.current, next)) commit(next);
    },
    [commit],
  );

  const value = useMemo<ICartContextValue>(
    () => ({
      items,
      isReady,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      replaceItems,
    }),
    [items, isReady, addItem, setQuantity, removeItem, replaceItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new ContextOutOfScopeError("CartContext");
  }

  return context;
}
