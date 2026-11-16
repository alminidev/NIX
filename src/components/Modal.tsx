"use client";

import { useOverlayDialog } from "@/components/useOverlayDialog";
import { X } from "lucide-react";
import { type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

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
  /** Centralizado, sem o sheet das telas estreitas. */
  placement?: "responsive" | "center";
  size?: "default" | "wide";
  /** Fica acima do header fixo da vitrine (z-100). */
  abovePageChrome?: boolean;
  /** Outro diálogo na frente trata o teclado. */
  suspended?: boolean;
  /** A rolagem fica num filho. O painel não rola. */
  clip?: boolean;
}

function Modal({
  open,
  onClose,
  loading = false,
  className,
  elevated = false,
  labelledBy,
  placement = "responsive",
  size = "default",
  abovePageChrome = false,
  suspended = false,
  clip = false,
  children,
}: IModalProps) {
  const { panelRef, isVisible, shouldRender, requestClose } = useOverlayDialog({
    open,
    onClose,
    loading,
    suspended,
  });

  if (!shouldRender || typeof window === "undefined") {
    return null;
  }

  const centered = placement === "center";
  const modalContent = (
    <div
      className={cx(
        "fixed inset-0 flex justify-center",
        centered ? "items-center p-4" : "items-end sm:items-center",
        abovePageChrome ? "z-[120]" : elevated ? "z-[60]" : "z-50",
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
        onClick={requestClose}
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
          "relative z-20 w-full border border-border-hairline bg-surface-card text-ink-secondary shadow-card-hover outline-none",
          clip ? "overflow-hidden" : "overflow-y-auto overscroll-contain",
          centered
            ? size === "wide"
              ? "max-h-[min(88dvh,100%)] max-w-[960px] rounded-card"
              : "max-h-[min(88dvh,100%)] max-w-[440px] rounded-card"
            : "max-h-[min(92dvh,100%)] rounded-t-[16px] pb-[env(safe-area-inset-bottom)] sm:max-w-[440px] sm:rounded-card sm:pb-0",
          centered
            ? isVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-5 scale-95 opacity-0"
            : isVisible
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
