import type { DashboardMetrics } from "@/lib/dashboard";

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

function Icon({ name }: { name: MetricCard["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "sales") {
    return (
      <svg {...common}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }

  if (name === "revenue") {
    return (
      <svg {...common}>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }

  if (name === "ticket") {
    return (
      <svg {...common}>
        <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
        <path d="M12 6v12" />
      </svg>
    );
  }

  if (name === "products") {
    return (
      <svg {...common}>
        <path d="M21 8 12 3 3 8l9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "average") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 5-6" />
      </svg>
    );
  }

  if (name === "catalog") {
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    );
  }

  if (name === "categories") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m12 2 2.4 6.8H22l-6 4.4 2.3 6.8L12 16.8 5.7 20l2.3-6.8-6-4.4h7.6Z" />
    </svg>
  );
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
