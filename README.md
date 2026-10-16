# NIX 3D — Front-End Next.js (App Router + React + TypeScript)

Este projeto é a migração oficial do site da **NIX 3D** (página única de showroom e catálogo com 5 produtos) de HTML/CSS/JS vanilla para **Next.js 15+ (App Router)** com **TypeScript**, mantendo fidelidade visual e funcional absoluta de 100% com o build original.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js v18.17+ ou v20+ (testado em Node.js v24)
- npm v10+

### Instalação & Desenvolvimento
```bash
# Entrar na pasta do projeto
cd nix-nextjs

# Instalar dependências (caso clonado recentemente)
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em seu navegador: [http://localhost:3000](http://localhost:3000)

### Build de Produção
```bash
npm run build
npm run start
```

---

## 📁 Estrutura de Arquivos

```
nix-nextjs/
├── public/
│   └── images/               # 7 imagens do showroom (logo, hero, 5 produtos)
├── src/
│   ├── app/
│   │   ├── globals.css       # CSS global original integral (com bugfix L960-965)
│   │   ├── layout.tsx        # Shell HTML5, SEO Metadata, OpenGraph e Inter font
│   │   └── page.tsx          # Página principal unindo as 8 seções
│   ├── components/
│   │   ├── SkipLink.tsx      # Acessibilidade (pular para conteúdo principal)
│   │   ├── Header.tsx        # Sticky header com elevação e scrollspy ativo
│   │   ├── GlowAtmosphere.tsx# Iluminação ambiente do Hero
│   │   ├── HeroStage.tsx     # Seção Hero com imagem 16:9 e CTAs
│   │   ├── ProductCard.tsx   # Card individual com tipagem estrita de Produto
│   │   ├── ProductGrid.tsx   # Vitrine com 2 grupos editoriais (3 cols / 2 cols)
│   │   ├── LogisticsBar.tsx  # Barra comercial (frete, parcelamento, retirada)
│   │   ├── Diferenciais.tsx  # Engenharia e 4 pilares técnicos
│   │   ├── FAQ.tsx           # Accordion acessível nativo (<details>/<summary>)
│   │   ├── CtaFinal.tsx      # Banner de fechamento e conversão
│   │   └── Footer.tsx        # Rodapé institucional completo
│   ├── data/
│   │   └── produtos.ts       # PONTO DE INTEGRAÇÃO: catálogo dos 5 produtos
│   └── types/
│       └── produto.ts        # PONTO DE INTEGRAÇÃO: interface Produto
├── .env.example              # Template de variáveis de ambiente
└── README.md
```

---

## 🔌 Guia para o Programador Back-End

Este front-end foi estruturado intencionalmente para permitir integração limpa com banco de dados e APIs de pagamento sem acoplamento.

### 1. Conexão com Banco de Dados / API de Produtos
- **Contrato de Dados:** [`src/types/produto.ts`](src/types/produto.ts)  
  Define a interface estrita `Produto` (id, sku, nome, categoria, preco, precoDe, parcelamento, descricaoCurta, caracteristicas, imagem, especificacoes, status).
- **Função de Ingestão:** [`src/data/produtos.ts`](src/data/produtos.ts)  
  Atualmente expõe `getProdutos()`. Para substituir pelo banco de dados:
  - Pode tornar `getProdutos()` assíncrona (`async () => await db.produto.findMany()`)
  - No `src/components/ProductGrid.tsx`, basta usar `await getProdutos()` diretamente (pois é um Server Component no App Router).

### 2. Integração com Gateway de Pagamento (InfinitePay)
- A URL do carrinho/checkout é lida de `process.env.NEXT_PUBLIC_CART_URL` (definida em `.env.local`).
- Se cada produto tiver link de checkout único, utilize o campo `checkoutUrl` opcional na interface `Produto`.

---

## 🎨 Design System & Estilos
- O CSS em `src/app/globals.css` é idêntico ao original auditado.
- Tipografia oficial: **Inter** (Google Fonts).
- Nenhuma dependência externa pesada de UI (Zero Tailwind, Zero Bootstrap).
