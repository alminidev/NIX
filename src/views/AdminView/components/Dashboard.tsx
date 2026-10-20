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
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <p className="kicker">Visão geral</p>
        <h1>Dashboard</h1>
        <p>Movimento comercial e posição atual do catálogo NIX.</p>
      </header>

      <section
        className="admin-metric-group"
        aria-labelledby="metricas-comerciais"
      >
        <div className="admin-group-heading">
          <h2 id="metricas-comerciais">Comercial</h2>
          <p>
            Pedidos ainda não entram neste painel. Os valores ficam zerados até
            a integração de checkout.
          </p>
        </div>
        <div className="admin-metrics admin-metrics-3">
          {comercial.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section
        className="admin-metric-group"
        aria-labelledby="metricas-catalogo"
      >
        <div className="admin-group-heading">
          <h2 id="metricas-catalogo">Catálogo</h2>
        </div>
        <div className="admin-metrics admin-metrics-4">
          {catalog.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section className="admin-panel" aria-labelledby="destaques-catalogo">
        <div className="admin-group-heading">
          <h2 id="destaques-catalogo">Em destaque</h2>
        </div>
        {metrics.featuredProducts.length === 0 ? (
          <p className="admin-empty">Nenhum produto marcado como destaque.</p>
        ) : (
          <ul className="admin-product-list">
            {metrics.featuredProducts.map((product) => (
              <li key={product.name}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>
                <b>{formatarMoeda(product.price)}</b>
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
    <article className="admin-metric">
      <span className="admin-metric-icon">
        <Icon name={card.icon} />
      </span>
      <p className="admin-metric-label">{card.label}</p>
      <p className="admin-metric-value">{card.value}</p>
      <p className="admin-metric-hint">{card.hint}</p>
    </article>
  );
}
