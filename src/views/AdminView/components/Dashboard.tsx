import { IDashboardMetrics } from "@/types/dashboard";
import {
  BookOpen,
  ChartLine,
  DollarSign,
  LayoutGrid,
  Package,
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
  icon:
    | "sales"
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
      label: "Vendas",
      value: String(metrics.orders),
      hint: "Pedidos registrados",
      icon: "sales",
    },
    {
      label: "Receita",
      value: formatarMoeda(metrics.revenue),
      hint: "Soma dos pedidos",
      icon: "revenue",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(metrics.averageTicket),
      hint: "Receita dividida pelas vendas",
      icon: "ticket",
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
      <header>
        <p className="mb-2 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
          Visão geral
        </p>
        <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
          Dashboard
        </h1>
        <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
          Movimento comercial e posição atual do catálogo NIX.
        </p>
      </header>

      <section
        className="flex flex-col gap-4"
        aria-labelledby="metricas-comerciais"
      >
        <div>
          <h2
            id="metricas-comerciais"
            className="text-lg leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
          >
            Comercial
          </h2>
          <p className="mt-2 max-w-140 text-[0.9375rem] text-ink-secondary">
            Pedidos ainda não entram neste painel. Os valores ficam zerados até
            a integração de checkout.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[861px]:grid-cols-3">
          {comercial.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
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
            className="text-sm font-semibold text-brand-blue-hover"
          >
            Gerenciar produtos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[861px]:grid-cols-2 min-[1081px]:grid-cols-4">
          {catalog.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section
        className="flex flex-col gap-4 rounded-card border border-border-hairline bg-surface-card p-6"
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
                key={product.name}
                className="flex items-center justify-between gap-4 border-t border-border-hairline py-3.5 first:border-t-0 first:pt-1"
              >
                <div>
                  <strong className="block text-[0.9375rem] font-semibold text-ink-primary">
                    {product.name}
                  </strong>
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">
                    {product.category}
                  </span>
                </div>
                <b className="text-[0.9375rem] font-bold tracking-[-0.02em] whitespace-nowrap text-ink-primary">
                  {formatarMoeda(product.price)}
                </b>
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
    <article className="rounded-card border border-border-hairline bg-surface-card p-5 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.35)] hover:shadow-feature-hover">
      <span className="mb-4 grid size-10 place-items-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue">
        <Icon name={card.icon} />
      </span>
      <p className="text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
        {card.label}
      </p>
      <p className="mt-1.5 text-2xl leading-[1.2] font-bold tracking-[-0.03em] text-ink-primary">
        {card.value}
      </p>
      <p className="mt-2 text-[0.8125rem] text-ink-muted">{card.hint}</p>
    </article>
  );
}
