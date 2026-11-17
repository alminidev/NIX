"use client";

import { useEffect, useRef, useState } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

interface IUseOverlayDialogOptions {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  /** Outro diálogo na frente trata o teclado. Este não rouba o foco. */
  suspended?: boolean;
}

/**
 * Comportamento compartilhado do Modal e do Sheet:
 * animação de entrada, trava da página, foco preso e Escape.
 */
export function useOverlayDialog({
  open,
  onClose,
  loading = false,
  suspended = false,
}: IUseOverlayDialogOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!open) return;
    }

    if (open) {
      setShouldRender(true);
      const openTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsVisible(true);
          });
        });
      }, 0);
      return () => window.clearTimeout(openTimer);
    }

    setIsVisible(false);
    const closeTimer = window.setTimeout(() => {
      setShouldRender(false);
    }, 300);
    return () => window.clearTimeout(closeTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    previousFocus.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      if (previousFocus.current?.isConnected) {
        previousFocus.current.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !shouldRender || suspended) return;

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const active = document.activeElement;
      if (active instanceof Node && panel.contains(active) && active !== panel) {
        return;
      }
      const preferred = panel.querySelector<HTMLElement>("[data-autofocus]");
      const fallback = panel.querySelector<HTMLElement>(focusableSelector);
      (preferred ?? fallback ?? panel).focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, shouldRender, suspended]);

  useEffect(() => {
    if (!open || suspended) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (loading) return;
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, loading, suspended]);

  function requestClose() {
    if (loading) return;
    onClose();
  }

  return { panelRef, isVisible, shouldRender, requestClose };
}
