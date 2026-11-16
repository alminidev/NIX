"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useOverlayDialog } from "@/components/useOverlayDialog";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const closeDistance = 96;
const flickDistance = 48;
const flickVelocity = 0.7;

interface ISheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  suspended?: boolean;
  children: ReactNode;
}

/**
 * Sheet — painel que sobe da base da tela.
 * Fecha no X, no toque fora, no Escape e ao arrastar a alça para baixo.
 * A rolagem fica no painel; a página atrás permanece travada.
 */
export function Sheet({
  open,
  onClose,
  labelledBy,
  suspended = false,
  children,
}: ISheetProps) {
  const { panelRef, isVisible, shouldRender, requestClose } = useOverlayDialog({
    open,
    onClose,
    suspended,
  });
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const offsetRef = useRef(0);
  const originRef = useRef({ y: 0, time: 0 });
  const onCloseRef = useRef(onClose);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOffset(0);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!dragging) return;

    function onMove(event: PointerEvent) {
      const next = Math.max(0, event.clientY - originRef.current.y);
      offsetRef.current = next;
      setOffset(next);
    }

    function onUp(event: PointerEvent) {
      const next = Math.max(0, event.clientY - originRef.current.y);
      const elapsed = event.timeStamp - originRef.current.time;
      const velocity = next / Math.max(elapsed, 1);
      setDragging(false);
      if (next >= closeDistance || (next >= flickDistance && velocity >= flickVelocity)) {
        onCloseRef.current();
        return;
      }
      offsetRef.current = 0;
      setOffset(0);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (suspended || !isVisible || event.button !== 0) return;
    originRef.current = { y: event.clientY, time: event.timeStamp };
    offsetRef.current = 0;
    setDragging(true);
  }

  if (!shouldRender || typeof window === "undefined") {
    return null;
  }

  const sheet = (
    <div className="fixed inset-0 z-[120] flex items-end justify-center">
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={cx(
          "absolute inset-0 bg-[rgba(10,11,14,0.45)]",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        style={{
          transitionProperty: "opacity",
          transitionDuration: isVisible ? "300ms" : "120ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cx(
          "relative z-20 w-full overflow-y-auto overscroll-contain border border-border-hairline bg-surface-card text-ink-secondary shadow-card-hover outline-none",
          "max-h-[min(92dvh,100%)] rounded-t-[16px] pb-[env(safe-area-inset-bottom)]",
          isVisible ? "translate-y-0" : "translate-y-full",
        )}
        style={{
          transform: `translateY(${offset}px)`,
          transitionProperty: dragging ? "none" : "opacity, translate, transform",
          transitionDuration: dragging ? "0ms" : isVisible ? "300ms" : "280ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className="sticky top-0 z-30 flex min-h-11 cursor-grab touch-none items-center justify-center bg-surface-card select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          aria-hidden="true"
        >
          <span className="h-1.5 w-10 rounded-full bg-border-hairline" />
        </div>
        {children}
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
