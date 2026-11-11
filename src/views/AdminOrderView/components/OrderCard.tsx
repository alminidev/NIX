interface IOrderCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

/** Cartão de uma seção da página do pedido. */
export default function OrderCard({ id, title, children }: IOrderCardProps) {
  return (
    <section
      className="rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6"
      aria-labelledby={id}
    >
      <h2
        id={id}
        className="mb-4 text-[0.9375rem] leading-[1.15] font-semibold text-ink-primary"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
