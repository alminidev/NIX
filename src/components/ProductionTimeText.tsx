interface IProductionTimeTextProps {
  text: string | null | undefined;
  className?: string;
}

/** Frase de tempo de produção. Não renderiza quando o helper devolve null. */
export default function ProductionTimeText({
  text,
  className = "",
}: IProductionTimeTextProps) {
  if (!text) return null;

  return (
    <p
      className={`text-[0.8125rem] leading-[1.45] text-ink-secondary ${className}`.trim()}
    >
      {text}
    </p>
  );
}
