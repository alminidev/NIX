"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Largura em que a vitrine deixa de ser mobile.
 * É o mesmo corte do breakpoint `sm` do Tailwind e do Modal.
 */
export const desktopMediaQuery = "(min-width: 640px)";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
