import { IDashboardMetrics } from "@/types/dashboard";
import Attention from "@/views/AdminView/components/Attention";
import OrdersByStatus from "@/views/AdminView/components/OrdersByStatus";
import {
  BookOpen,
  ChartLine,
  ChevronRight,
  CircleCheck,
  DollarSign,
  LayoutGrid,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarMoeda(valor: number | null) {
  if (valor == null) return "—";
  return moeda.format(valor);
}

interface IMetricCard {
  label: string;
  value: string;
  hint: string;
  /** Destaca o cartão (a receita) */
  featured?: boolean;
  icon:
    | "sales"
    | "paid"
    | "revenue"
    | "ticket"
    | "products"
    | "average"
    | "catalog"
    | "categories"
    | "featured";
}

interface IDashboardProps {
  metrics: IDashboardMetrics;
}

interface IMetricProps {
  card: IMetricCard;
}

interface IMetricIconProps {
  name: IMetricCard["icon"];
}

const icons: Record<IMetricCard["icon"], LucideIcon> = {
  sales: ShoppingBag,
  paid: CircleCheck,
  revenue: DollarSign,
  ticket: Ticket,
  products: Package,
  average: ChartLine,
  catalog: BookOpen,
  categories: LayoutGrid,
  featured: Star,
};

function Icon({ name }: IMetricIconProps) {
  const Glyph = icons[name];
  return <Glyph size={20} aria-hidden />;
}

export default function Dashboard({ metrics }: IDashboardProps) {
  const comercial: IMetricCard[] = [
    {
      label: "Receita",
      value: formatarMoeda(metrics.revenue),
      hint: "Pedidos pagos, em produção, prontos e enviados",
      icon: "revenue",
      featured: true,
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(metrics.averageTicket),
      hint: "Receita dividida pelos pedidos pagos",
      icon: "ticket",
    },
    {
      label: "Pedidos pagos",
      value: String(metrics.paidOrders),
      hint: "Do pagamento ao envio",
      icon: "paid",
    },
    {
      label: "Vendas",
      value: String(metrics.orders),
      hint: "Pedidos registrados, de qualquer status",
      icon: "sales",
    },
  ];

  const catalog: IMetricCard[] = [
    {
      label: "Produtos ativos",
      value: String(metrics.activeProducts),
      hint: "Publicados no catálogo",
      icon: "products",
    },
    {
      label: "Preço médio",
      value: formatarMoeda(metrics.averagePrice),
      hint: "Média da tabela atual",
      icon: "average",
    },
    {
      label: "Valor do catálogo",
      value: formatarMoeda(metrics.catalogValue),
      hint: "Soma dos preços ativos",
      icon: "catalog",
    },
    {
      label: "Categorias",
      value: String(metrics.categories),
      hint: `${metrics.featuredCount} em destaque`,
      icon: "categories",
    },
  ];

  return (
    <div className="flex w-full flex-1 flex-col gap-9">
      <header className="flex flex-col gap-4 min-[1081px]:flex-row min-[1081px]:items-end min-[1081px]:justify-between">
        <div>
          <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Visão geral
          </p>
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Dashboard
          </h1>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            Movimento comercial e posição atual do catálogo NIX.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-hairline bg-surface-card px-5 text-sm font-semibold text-ink-primary transition-[border-color,background-color,color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
          >
            Ver pedidos
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-brand-blue px-5 text-sm font-semibold text-ink-inverse transition-[background-color] duration-200 ease-nix hover:bg-brand-blue-hover"
          >
            <Plus size={16} aria-hidden />
            Novo produto
          </Link>
        </div>
      </header>

      <Attention
        awaitingPayment={metrics.awaitingPayment}
        paymentReviews={metrics.paymentReviews}
        outOfStock={metrics.outOfStock}
      />

      <section
        className="flex flex-col gap-4"
        aria-labelledby="metricas-comerciais"
      >
        <div className="flex flex-col gap-2 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between min-[640px]:gap-4">
          <div>
            <h2
              id="metricas-comerciais"
              className="text-lg leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
            >
              Comercial
            </h2>
            <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
              Pedidos feitos no site. Cancelados, expirados e ainda não pagos
              ficam fora da receita.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex min-h-10 shrink-0 items-center text-sm font-semibold text-brand-blue-hover transition-colors hover:text-brand-blue"
          >
            Ver todos os pedidos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1081px]:grid-cols-4">
          {comercial.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
        <OrdersByStatus
          orders={metrics.orders}
          ordersByStatus={metrics.ordersByStatus}
        />
      </section>

      <section
        className="flex flex-col gap-4"
        aria-labelledby="metricas-catalogo"
      >
        <div className="flex items-end justify-between gap-4">
          <h2
            id="metricas-catalogo"
            className="text-lg leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
          >
            Catálogo
          </h2>
          <Link
            href="/admin/products"
            className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-blue-hover transition-colors hover:text-brand-blue"
          >
            Gerenciar produtos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1081px]:grid-cols-4">
          {catalog.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section
        className="flex flex-col gap-4 rounded-card border border-border-hairline bg-surface-card p-5 min-[640px]:p-6"
        aria-labelledby="destaques-catalogo"
      >
        <div>
          <h2
            id="destaques-catalogo"
            className="text-lg leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
          >
            Em destaque
          </h2>
        </div>
        {metrics.featuredProducts.length === 0 ? (
          <p className="text-[0.9375rem] text-ink-muted">
            Nenhum produto marcado como destaque.
          </p>
        ) : (
          <ul className="flex list-none flex-col">
            {metrics.featuredProducts.map((product) => (
              <li
                key={product.id}
                className="border-t border-border-hairline first:border-t-0"
              >
                <Link
                  href={`/admin/products/${product.id}`}
                  className="group flex items-center justify-between gap-4 py-3.5 first:pt-1"
                >
                  <div className="min-w-0">
                    <strong className="block text-[0.9375rem] font-semibold text-ink-primary transition-colors group-hover:text-brand-blue">
                      {product.name}
                    </strong>
                    <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">
                      {product.category}
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <b className="text-[0.9375rem] font-bold tracking-[-0.02em] whitespace-nowrap text-ink-primary">
                      {formatarMoeda(product.price)}
                    </b>
                    <ChevronRight
                      size={16}
                      aria-hidden
                      className="text-ink-muted transition-colors group-hover:text-brand-blue"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ card }: IMetricProps) {
  return (
    <article
      className={`flex flex-col rounded-card border p-5 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.35)] hover:shadow-feature-hover ${
        card.featured
          ? "border-[rgba(23,107,255,0.25)] bg-brand-blue-subtle"
          : "border-border-hairline bg-surface-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-white text-brand-blue">
          <Icon name={card.icon} />
        </span>
        <p className="text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
          {card.label}
        </p>
      </div>
      <p className="mt-3 text-2xl leading-[1.2] font-bold tracking-[-0.03em] break-words text-ink-primary">
        {card.value}
      </p>
      <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{card.hint}</p>
    </article>
  );
}
