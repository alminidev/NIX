"use client";

import { useEffect } from "react";

interface IPaymentRefreshProps {
  /** Recarrega sozinha enquanto a InfinitePay ainda não confirmou */
  auto: boolean;
}

export default function PaymentRefresh({ auto }: IPaymentRefreshProps) {
  useEffect(() => {
    if (!auto) return;

    const timeout = window.setTimeout(() => {
      window.location.reload();
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [auto]);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-pill bg-brand-blue px-8 py-3 text-[0.9375rem] font-semibold text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover"
    >
      Verificar novamente
    </button>
  );
}
