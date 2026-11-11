"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Com Cache Components, a página anterior continua montada.
 * O estado do cliente sobrevive ao salvamento e reaparece na próxima visita.
 * Esta chave muda em cada navegação nova e permanece no voltar/avançar do navegador.
 */
export default function FreshNavigation({
  children,
}: {
  children: ReactNode;
}) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
