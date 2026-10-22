"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

interface IModalFooterProps extends PropsWithChildren {
  className?: string;
}

function ModalFooter({ children, className }: IModalFooterProps) {
  return (
    <div
      className={cx(
        "border-t border-border-hairline px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface IModalTitleProps extends PropsWithChildren {
  id?: string;
  className?: string;
}

function ModalTitle({ children, id, className }: IModalTitleProps) {
  return (
    <h2
      id={id}
      className={cx(
        "text-lg leading-[1.25] font-semibold tracking-[-0.02em] text-ink-primary",
        className,
      )}
    >
      {children}
    </h2>
  );
}

interface IModalDescriptionProps extends PropsWithChildren {
  className?: string;
}

function ModalDescription({ children, className }: IModalDescriptionProps) {
  return (
    <p className={cx("text-sm leading-snug text-ink-muted", className)}>
      {children}
    </p>
  );
}

interface IModalCloseProps {
  onClose: () => void;
  showOnMobile?: boolean;
  disabled?: boolean;
  className?: string;
}

function ModalClose({
  onClose,
  showOnMobile = false,
  disabled = false,
  className,
}: IModalCloseProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      disabled={disabled}
      aria-label="Fechar"
      className={cx(
        showOnMobile ? "inline-flex" : "hidden sm:inline-flex",
        "size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 ease-nix hover:bg-surface-canvas-fog hover:text-ink-primary disabled:cursor-progress disabled:opacity-70",
        className,
      )}
    >
      <X size={16} aria-hidden />
    </button>
  );
}

interface IModalHeaderProps extends PropsWithChildren {
  className?: string;
}

function ModalHeader({ children, className }: IModalHeaderProps) {
  return (
    <div
      className={cx(
        "border-b border-border-hairline px-6 py-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface IModalContentProps extends PropsWithChildren {
  className?: string;
}

function ModalContent({ children, className }: IModalContentProps) {
  return (
    <div className={cx("grid grid-rows-[min-content_1fr]", className)}>
      {children}
    </div>
  );
}

interface IModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  className?: string;
  elevated?: boolean;
  labelledBy?: string;
}

function Modal({
  open,
  onClose,
  loading = false,
  className,
  elevated = false,
  labelledBy,
  children,
}: IModalProps) {
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
    if (!open || !shouldRender) return;

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const preferred = panel.querySelector<HTMLElement>(
        "[data-autofocus]",
      );
      const fallback = panel.querySelector<HTMLElement>(focusableSelector);
      (preferred ?? fallback ?? panel).focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose, loading]);

  function handleClose() {
    if (loading) return;
    onClose();
  }

  if (!shouldRender || typeof window === "undefined") {
    return null;
  }

  const modalContent = (
    <div
      className={cx(
        "fixed inset-0 flex items-end justify-center sm:items-center",
        elevated ? "z-[60]" : "z-50",
      )}
    >
      {open ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 backdrop-blur-sm"
        />
      ) : null}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className={cx(
          "absolute inset-0 z-10 bg-[rgba(10,11,14,0.45)]",
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
          "relative z-20 w-full overflow-y-auto border border-border-hairline bg-surface-card text-ink-secondary shadow-card-hover outline-none",
          "max-h-[min(92dvh,100%)] pb-[env(safe-area-inset-bottom)]",
          "rounded-t-[16px] sm:max-w-[440px] sm:rounded-card sm:pb-0",
          isVisible
            ? "translate-y-0 sm:scale-100 sm:opacity-100"
            : "translate-y-full sm:translate-y-5 sm:scale-95 sm:opacity-0",
          className,
        )}
        style={{
          transitionProperty: "opacity, translate, scale",
          transitionDuration: isVisible ? "300ms" : "120ms, 300ms, 300ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;
Modal.Close = ModalClose;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;

export { Modal };
