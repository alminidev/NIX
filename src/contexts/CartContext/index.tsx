"use client";

import { ContextOutOfScopeError } from "@/app/_errors/context-out-of-scope.error";
import { getCartSummary } from "@/app/cart/actions";
import { parseCartItems } from "@/lib/cart-input";
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

export type TAddItemResult = "added" | "limit" | "unavailable" | "error";

interface ICartContextValue {
  items: ICartItem[];
  /** false até o carrinho salvo no navegador ser lido */
  isReady: boolean;
  itemCount: number;
  addItem: (productId: number) => Promise<TAddItemResult>;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
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
        item.quantity === b[index].quantity,
    )
  );
}

/**
 * CartProvider — Guarda no navegador só o id e a quantidade de cada produto.
 * Preço, estoque e totais são sempre conferidos no servidor.
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
    async (productId: number): Promise<TAddItemResult> => {
      const current = itemsRef.current;
      const existing = current.find((item) => item.productId === productId);
      const requested = existing ? existing.quantity + 1 : 1;
      const next = existing
        ? current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: requested }
              : item,
          )
        : [...current, { productId, quantity: 1 }];

      try {
        const summary = await getCartSummary(next);
        if (!summary) return "error";

        const line = summary.lines.find(
          (entry) => entry.productId === productId,
        );
        if (!line) return "unavailable";

        // Outra aba pode ter mexido no carrinho durante a conferência.
        const latest = itemsRef.current;
        const merged = summary.lines.map((entry) => ({
          productId: entry.productId,
          quantity: entry.quantity,
        }));
        commit(sameItems(latest, current) ? merged : latest);

        return line.quantity < requested ? "limit" : "added";
      } catch {
        return "error";
      }
    },
    [commit],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;

      commit(
        itemsRef.current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      );
    },
    [commit],
  );

  const removeItem = useCallback(
    (productId: number) => {
      commit(itemsRef.current.filter((item) => item.productId !== productId));
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
