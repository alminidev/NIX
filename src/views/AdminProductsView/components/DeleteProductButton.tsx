"use client";

import { deleteProduct } from "@/app/admin/products/actions";
import { deleteProductInitialState } from "@/types/admin-product";
import { Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

interface IDeleteProductButtonProps {
  id: number;
  name: string;
  compact?: boolean;
}

export default function DeleteProductButton({
  id,
  name,
  compact = false,
}: IDeleteProductButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    deleteProduct,
    deleteProductInitialState,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();

    function handleClose() {
      setOpen(false);
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [open]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill border border-transparent px-3 text-sm font-semibold text-[#9b1c1c] transition-[background-color,border-color] duration-200 ease-nix hover:border-[#f0c7c7] hover:bg-[#fff1f1]"
            : "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-[#f0c7c7] bg-[#fff1f1] px-4 text-sm font-semibold text-[#9b1c1c] transition-[background-color] duration-200 ease-nix hover:bg-[#ffe4e4]"
        }
      >
        <Trash2 size={16} aria-hidden />
        Excluir
      </button>

      {open ? (
        <dialog
          ref={dialogRef}
          onClick={handleBackdropClick}
          aria-labelledby={`excluir-produto-${id}`}
          className="fixed top-1/2 left-1/2 m-0 w-[min(100%-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border-hairline bg-surface-card p-6 text-ink-secondary shadow-card-hover backdrop:bg-[rgba(10,11,14,0.45)]"
        >
          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={id} />
            <div>
              <h2
                id={`excluir-produto-${id}`}
                className="text-lg leading-[1.25] font-semibold tracking-[-0.02em] text-ink-primary"
              >
                Excluir produto
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-normal">
                <strong className="font-semibold text-ink-primary">
                  {name}
                </strong>{" "}
                sai do catálogo junto com as especificações e as imagens. Essa
                ação não pode ser desfeita.
              </p>
            </div>

            {state.status === "error" ? (
              <p
                className="rounded-input bg-[#fff1f1] px-3.5 py-3 text-sm text-[#9b1c1c]"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle disabled:cursor-progress disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center justify-center rounded-pill bg-[#9b1c1c] px-4 text-sm font-semibold text-white transition-[background-color] duration-200 ease-nix hover:bg-[#7f1616] disabled:cursor-progress disabled:opacity-70"
              >
                {pending ? "Excluindo…" : "Excluir produto"}
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </>
  );
}
