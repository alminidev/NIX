import type { DashboardMetrics } from "@/lib/dashboard";
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

type MetricCard = {
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
};

const icons: Record<MetricCard["icon"], LucideIcon> = {
  sales: ShoppingBag,
  revenue: DollarSign,
  ticket: Ticket,
  products: Package,
  average: ChartLine,
  catalog: BookOpen,
  categories: LayoutGrid,
  featured: Star,
};

function Icon({ name }: { name: MetricCard["icon"] }) {
  const Glyph = icons[name];
  return <Glyph size={20} aria-hidden />;
}

export default function Dashboard({ metrics }: { metrics: DashboardMetrics }) {
  const comercial: MetricCard[] = [
    {
      label: "Vendas",
      value: String(metrics.pedidos),
      hint: "Pedidos registrados",
      icon: "sales",
    },
    {
      label: "Receita",
      value: formatarMoeda(metrics.receita),
      hint: "Soma dos pedidos",
      icon: "revenue",
    },
    {
      label: "Ticket médio",
      value: formatarMoeda(metrics.ticketMedio),
      hint: "Receita dividida pelas vendas",
      icon: "ticket",
    },
  ];

  const catalogo: MetricCard[] = [
    {
      label: "Produtos ativos",
      value: String(metrics.produtosAtivos),
      hint: "Publicados no catálogo",
      icon: "products",
    },
    {
      label: "Preço médio",
      value: formatarMoeda(metrics.precoMedio),
      hint: "Média da tabela atual",
      icon: "average",
    },
    {
      label: "Valor do catálogo",
      value: formatarMoeda(metrics.valorCatalogo),
      hint: "Soma dos preços ativos",
      icon: "catalog",
    },
    {
      label: "Categorias",
      value: String(metrics.categorias),
      hint: `${metrics.destaques} em destaque`,
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
          {catalogo.map((card) => (
            <Metric key={card.label} card={card} />
          ))}
        </div>
      </section>

      <section className="admin-panel" aria-labelledby="destaques-catalogo">
        <div className="admin-group-heading">
          <h2 id="destaques-catalogo">Em destaque</h2>
        </div>
        {metrics.produtosDestaque.length === 0 ? (
          <p className="admin-empty">Nenhum produto marcado como destaque.</p>
        ) : (
          <ul className="admin-product-list">
            {metrics.produtosDestaque.map((produto) => (
              <li key={produto.nome}>
                <div>
                  <strong>{produto.nome}</strong>
                  <span>{produto.categoria}</span>
                </div>
                <b>{formatarMoeda(produto.preco)}</b>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Metric({ card }: { card: MetricCard }) {
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
