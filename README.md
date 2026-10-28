# NIX 3D — Guia do Desenvolvedor & Manual do Projeto (Next.js)

> Website oficial e vitrine de showroom da **NIX 3D** desenvolvido em **Next.js 15+ (App Router)** com **React** e **TypeScript**, unindo máxima fidelidade visual ao design industrial, alta performance estática e acessibilidade universal (WCAG 2.1 AA).

---

## 📋 Sumário

1. [Pré-requisitos do Sistema](#-1-pré-requisitos-do-sistema)
2. [Instalação e Comandos Rápidos](#-2-instalação-e-comandos-rápidos-passo-a-passo-para-iniciantes)
3. [Estrutura de Pastas e Arquivos](#-3-estrutura-de-pastas-e-arquivos)
4. [Onde Editar Produtos, Preços e Galeria](#-4-onde-editar-produtos-preços-e-galeria)
5. [Carrinho, Frete e Checkout](#-5-carrinho-frete-e-checkout)
6. [Guia para o Programador Back-End (Banco de Dados & APIs)](#-6-guia-para-o-programador-back-end-banco-de-dados--apis)
7. [Fase 2: Componente de Lightbox (Ampliação de Imagens)](#-7-fase-2-componente-de-lightbox-ampliação-de-imagens)
8. [Deploy e Hospedagem (A Definir)](#-8-deploy-e-hospedagem-a-definir)

---

## ⚡ 1. Pré-requisitos do Sistema

Antes de iniciar, certifique-se de ter instalado em seu computador:

- **Node.js:** Versão `v18.17+` ou `v20+` (LTS recomendada; testado com sucesso no Node.js v24).
- **npm:** Versão `v10+` (já acompanha a instalação do Node.js).
- **Git:** Para controle de versão e download do repositório.

Para verificar se estão instalados, abra o terminal e digite:

```bash
node -v
npm -v
```

---

## 🚀 2. Instalação e Comandos Rápidos (Passo a Passo para Iniciantes)

### Passo 1: Entrar na pasta do projeto

```bash
cd nix-nextjs
```

### Passo 2: Instalar as dependências

Baixa e configura todos os pacotes necessários listados no `package.json`:

```bash
npm install
```

### Passo 3: Configurar o arquivo de ambiente local

Copie o template de exemplo para criar o seu arquivo de ambiente local:

```bash
# No Windows (PowerShell):
Copy-Item .env.example .env.local

# No Linux / macOS:
cp .env.example .env.local
```

### Passo 4: Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Abra o navegador no endereço: **[http://localhost:3000](http://localhost:3000)**. O site recarrega automaticamente ao salvar alterações nos arquivos.

### Passo 5: Gerar o build de produção (para publicar)

Para testar a compilação final otimizada antes do deploy:

```bash
# Compila e valida todos os tipos TypeScript
npm run build

# Executa o servidor de produção localmente
npm run start
```

---

## 📁 3. Estrutura de Pastas e Arquivos

```
nix-nextjs/
├── public/
│   └── images/                    # Imagens otimizadas (logo, showroom e produtos)
│       ├── logo-nix.png
│       ├── hero-showroom.jpg
│       ├── dry-box-12.jpg
│       ├── dry-box-24.jpg
│       ├── dry-box-48.png
│       ├── setup-lab-a1.png
│       └── setup-lab-a2.png
├── src/
│   ├── app/
│   │   ├── globals.css            # Design System completo, tokens CSS e estilos do Lightbox
│   │   ├── layout.tsx             # Shell HTML5, SEO Metadata, OpenGraph e fonte Inter
│   │   └── page.tsx               # Página principal montando todas as seções
│   ├── components/
│   │   ├── Header.tsx             # Cabeçalho sticky com elevação e scrollspy ativo
│   │   ├── GlowAtmosphere.tsx     # Efeito volumétrico de luz (Tri-Glow) do Hero
│   │   ├── HeroStage.tsx          # Seção Hero com showroom e chamadas de ação
│   │   ├── LogisticsBar.tsx       # Barra de frete, pagamento sem juros e retirada
│   │   ├── ProductGrid.tsx        # Vitrine com grupos editoriais e controle do Lightbox
│   │   ├── ProductCard.tsx        # Card individual com cursor zoom-in e botão Comprar
│   │   ├── ProductLightbox.tsx    # MODAL FASE 2: visualização ampliada, swipe e pinça
│   │   ├── Diferenciais.tsx       # Engenharia e 4 pilares técnicos NIX
│   │   ├── FAQ.tsx                # Accordion acessível (<details>/<summary>)
│   │   ├── CtaFinal.tsx           # Banner de fechamento e conversão
│   │   ├── Footer.tsx             # Rodapé institucional completo
│   │   └── SkipLink.tsx           # Acessibilidade (pular navegação via teclado)
│   ├── data/
│   │   └── produtos.ts            # PONTO CENTRAL: catálogo de produtos e URL do carrinho
│   └── types/
│       └── produto.ts             # CONTRATO DE DADOS: interface TypeScript Produto
├── .env.example                   # Template documentado de variáveis de ambiente
├── .env.local                     # Variáveis locais (ignorado no Git por segurança)
├── package.json                   # Dependências e scripts do projeto
├── tsconfig.json                  # Configuração estrita do TypeScript
└── README.md                      # Este manual
```

---

## 📦 4. Onde Editar Produtos, Preços e Galeria

O catálogo persistido é semeado a partir de:  
👉 **`prisma/catalog.ts`**

### Como alterar um preço ou descrição

Abra `prisma/catalog.ts` e localize o produto no array `PRODUCTS`. Exemplo:

```ts
{
  sku: 'NIX-DB12',
  name: 'DRY BOX 12',
  categorySlug: 'armarios',
  capacity: '12 filamentos',
  dimensions: { length: 46, width: 35, height: 60 }, // cm
  price: '1190.00',
  installments: 'Até 3x sem juros',
  description: 'Compacta e eficiente para o seu dia a dia.',
  specifications: [
    'Capacidade: 12 filamentos',
    'Dimensões (C x L x A): 46 x 35 x 60 cm',
    'Controle térmico ativo permanente < 20% UR',
    'Display digital de temperatura e umidade',
  ],
  images: [{ url: '/images/dry-box-12.jpg', isPrimary: true }],
  featured: false,
  sortOrder: 1,
}
```

---

## 🛒 5. Carrinho, Frete e Checkout

O carrinho fica em **`/cart`**. O navegador guarda apenas `productId` e `quantity` (`localStorage`, chave `nix-cart`); preço, estoque e totais são sempre lidos do banco pelo servidor.

| Arquivo | Papel |
| --- | --- |
| `src/contexts/CartContext/index.tsx` | Estado do carrinho no navegador (adicionar, alterar, remover) |
| `src/app/cart/actions.ts` | Server actions: `getCartSummary` (valida itens e estoque) e `quoteShipping` (frete) e `lookupAddress` (endereço pelo CEP) |
| `src/lib/cart.ts` | Lê produtos no banco e monta o resumo |
| `src/lib/cart-calculation.ts` | Regras puras: limite por estoque, subtotal e total em centavos |
| `src/lib/cart-input.ts` | Validação da entrada vinda do navegador e do CEP |
| `src/lib/viacep.ts` | `lookupPostalCode`: consulta o CEP na ViaCEP (nunca lança; devolve `IPostalCodeLookup`) |
| `src/lib/shipping.ts` | **Ponto de integração do frete** (`calculateShipping`) |
| `src/lib/orders.ts` | `createOrder`: cria o pedido e baixa o estoque numa transação |
| `src/lib/order-input.ts` | Validação do formulário de entrega (nome, e-mail, telefone, endereço) |
| `src/lib/order-expiration.ts` | Prazo do pedido: `ORDER_EXPIRATION_MINUTES` (padrão 60) |
| `src/app/api/orders/expire/route.ts` | Rota de cron que expira pedidos vencidos (protegida por `CRON_SECRET`) |
| `src/lib/admin-orders.ts` | `getAdminOrders` (lista com filtros e paginação) e `getAdminOrder` (um pedido completo) |
| `src/lib/admin-order-filters.ts` | Leitura dos `searchParams` da lista de pedidos e links de paginação |
| `src/lib/order-status.ts` | Status do pedido: rótulos, quais contam como receita e as mudanças manuais permitidas |
| `src/lib/admin-order-input.ts` | Leitura e validação do formulário de mudança de status (status e código de rastreio) |
| `src/app/admin/orders/actions.ts` | Server action `updateOrderStatus` (muda o status do pedido, somente admin) |
| `src/types/postal-code.ts` | Tipos da ViaCEP (`IViaCepResponse`, `IPostalCodeAddress`, `IPostalCodeLookup`) |
| `src/types/order.ts` | Tipos do pedido (`IOrderInput`, `IOrderCreated`, `ICheckoutFormState`) |

- **Estoque:** a quantidade nunca passa do estoque cadastrado nem de 99 por produto. A conferência acontece ao adicionar, ao abrir o carrinho, ao alterar a quantidade e antes de seguir para o checkout.
- **CEP e endereço:** o CEP é pedido no formulário de entrega (`CheckoutForm`). O botão _"Calcular"_ (ou Enter no campo) chama `lookupAddress` e `quoteShipping`: a primeira consulta `https://viacep.com.br/ws/{cep}/json/` no servidor (timeout de 5 s) e preenche rua, bairro, cidade e UF; a segunda atualiza o frete. Enquanto o CEP não for consultado com sucesso, os campos de endereço e o botão _"Ir para o checkout"_ ficam desabilitados; mudar o CEP desfaz o preenchimento. Os campos continuam editáveis depois da consulta (ex.: CEP geral de cidade pequena, que vem sem rua). Erros tratados: CEP inválido (`invalid`), CEP inexistente (`erro` da ViaCEP, `not-found`) e ViaCEP fora do ar, lenta ou com resposta inesperada (`unavailable`). No servidor, `placeOrder` confere o formato do CEP e os campos obrigatórios e depois consulta a ViaCEP de novo (`checkAddressPostalCode`): CEP inexistente, ou cidade/UF diferentes das do CEP (comparadas sem acento e sem diferença de maiúsculas), recusam o pedido com uma mensagem e destacam o campo. Se a ViaCEP falhar (rede, timeout, resposta inválida) o endereço é aceito como veio, para que uma queda dela não impeça pedidos. Rua e bairro não são comparados, porque o CEP de cidades pequenas não traz rua.
- **Frete (Melhor Envio):** `calculateShipping` em `src/lib/shipping.ts` devolve uma cotação pendente. A cotação de frete é feita só pelo Melhor Envio, e a integração deve ser feita nessa função; o restante já usa o contrato `IShippingQuote`.
- **Pedidos:** o botão _"Ir para o checkout"_ envia os dados de entrega e chama a server action `placeOrder`, que confere o carrinho no servidor e grava `Order` e `OrderItem` (status `AWAITING_PAYMENT`, origem `SITE`) numa única transação. Cada item guarda o preço unitário do momento do pedido. O estoque é baixado na mesma transação com `UPDATE ... WHERE stock >= quantidade`, então nunca fica negativo, nem com compras simultâneas; se faltar estoque, nada é gravado e a mensagem diz qual produto. Pedidos feitos pelo WhatsApp ou Instagram usam `OrderSource` (`WHATSAPP`, `INSTAGRAM`). O frete fica vazio (`null`) até a cotação existir.
- **Expiração:** todo pedido nasce com `expiresAt` (agora + `ORDER_EXPIRATION_MINUTES`, padrão 60). Passado o prazo sem pagamento, ele vira `EXPIRED` e o estoque volta. `cancelOrder` (pedido aguardando pagamento ou pago, ainda sem produção) também devolve o estoque e deixa o pedido `CANCELLED`. Expirar e cancelar são idempotentes: a troca de status é um `updateMany` condicional na mesma transação da devolução, e só quem de fato mudou o pedido devolve o estoque (chamadas repetidas ou simultâneas não devolvem duas vezes). Variáveis, agendamento e funcionamento estão em [Expiração de pedidos](#expiração-de-pedidos).
- **Checkout (InfinitePay):** depois que o pedido é criado, o carrinho é esvaziado e o navegador segue para `NEXT_PUBLIC_CART_URL` (veja `.env.example`; padrão em `src/data/produtos.ts`). A integração real entra no `useEffect` de `src/views/CartView/CartContent.tsx` que trata o pedido criado.

- **Painel de pedidos:** `/admin/orders` (somente admin, link _"Pedidos"_ no menu) lista os pedidos do mais novo ao mais antigo, 20 por página, com número, status, cliente, data, total e quantidade de itens. Busca e filtros vão nos `searchParams` da página (formulário GET, então os links são compartilháveis): `q` (nome, e-mail ou número do pedido, com ou sem `#`), `status` (um dos status do pedido), `from` e `to` (datas `AAAA-MM-DD`, inclusive, no horário de Brasília) e `page`. Valores inválidos são ignorados e uma página acima do fim volta para a última. A leitura dos parâmetros está em `src/lib/admin-order-filters.ts` e a consulta em `getAdminOrders` (`src/lib/admin-orders.ts`).
- **Pedido (`/admin/orders/[id]`):** cada linha da lista abre a página do pedido (somente admin; id inexistente ou inválido cai na página 404). Ela mostra os itens (foto, nome, SKU, quantidade, preço unitário do momento do pedido e total da linha), subtotal, frete (_"Não cotado"_ quando não houve cotação) e total, o cliente (e-mail e telefone clicáveis), o endereço de entrega, a origem (`SITE`, `WHATSAPP` ou `INSTAGRAM`) e as datas de criação, última atualização e prazo de pagamento. A leitura está em `getAdminOrder` (`src/lib/admin-orders.ts`).
- **Mudança manual de status:** o cartão _Status_ da página do pedido oferece só as mudanças permitidas para o status atual (`getNextOrderStatuses` em `src/lib/order-status.ts`): aguardando pagamento → pago → em produção → pronto → enviado, cada passo com volta para corrigir um clique errado. Cancelar só vale em aguardando pagamento ou pago, passa por `cancelOrder` e devolve o estoque. Cancelado e expirado são finais (expirar só acontece pelo prazo) e nenhum status volta para aguardando pagamento. Ao marcar como enviado dá para informar o código de rastreio (`trackingCode`, opcional, até 40 caracteres). A mudança é um `updateMany` condicional em `changeOrderStatus` (`src/lib/orders.ts`): se o pedido mudou em outra aba, nada é alterado e o painel avisa.
- **Dashboard (`/admin`):** o topo traz os atalhos _Ver pedidos_ e _Novo produto_ e o bloco _Precisa de atenção_ (pedidos aguardando pagamento e produtos sem estoque, cada um com link para a lista ou o estoque; sem nada pendente aparece _"Tudo em dia"_). A seção _Comercial_ lê os pedidos do banco (`getDashboardMetrics` em `src/lib/dashboard.ts`): receita, ticket médio, pedidos pagos, total de pedidos e o bloco _Pedidos por status_ (barra proporcional e um cartão por status, com a quantidade e o percentual, que leva a `/admin/orders?status=...`; as cores ficam em `src/views/AdminView/components/status-colors.ts`). Os produtos em destaque do final abrem a página de edição do produto. **Receita** é a soma do `total` (já com frete) dos pedidos de status `PAID`, `IN_PRODUCTION`, `READY` e `SHIPPED`, ou seja, do pagamento em diante (`paidOrderStatuses` em `src/lib/order-status.ts`). Ficam de fora `AWAITING_PAYMENT` (ainda não pagou) e `CANCELLED` e `EXPIRED` (o dinheiro não entrou ou foi devolvido). O **ticket médio** é a receita dividida pelo número desses pedidos pagos.

### Expiração de pedidos

Um pedido aguardando pagamento segura o estoque até o prazo acabar. Depois disso ele expira e o estoque volta para a vitrine.

**Variáveis de ambiente** (modelo em `.env.example`; em desenvolvimento ficam no `.env.local`, em produção no painel da hospedagem):

| Variável | Para que serve | Padrão |
| --- | --- | --- |
| `ORDER_EXPIRATION_MINUTES` | Minutos que um pedido aguardando pagamento segura o estoque. Deve ser um número inteiro maior que 0; valor ausente ou inválido usa o padrão. Vale para os pedidos criados depois da mudança (cada pedido guarda o próprio `expiresAt`). | `60` |
| `CRON_SECRET` | Segredo que autoriza a chamada de `GET /api/orders/expire`. Fica só no servidor (nunca use o prefixo `NEXT_PUBLIC_`). Gere com `openssl rand -base64 32`. **Sem ele a rota recusa qualquer chamada com 401.** | _(sem padrão, obrigatório para o cron)_ |

**Quando um pedido vencido expira**

1. **Ao criar um pedido:** cada `placeOrder` expira os pedidos vencidos antes de conferir o carrinho. Esse é o único gatilho automático, sem nenhuma configuração.
2. **Pela rota de cron** `GET /api/orders/expire`, que precisa ser agendada (veja abaixo).

> **Atenção:** se a rota não for agendada, os pedidos vencidos **só expiram quando um novo pedido é feito**. Enquanto ninguém comprar, o estoque deles continua reservado e a vitrine mostra esse estoque como indisponível. Em produção, agende a rota.

**A rota** exige o cabeçalho `Authorization: Bearer <CRON_SECRET>` e responde `{ "expired": <quantidade> }` (`401` se o cabeçalho faltar ou estiver errado). É segura para chamar quantas vezes quiser: chamadas repetidas ou simultâneas não devolvem o estoque duas vezes. Teste manualmente:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-DOMINIO/api/orders/expire
# {"expired":0}
```

**Opção A: cron da Vercel.** Defina `CRON_SECRET` nas variáveis de ambiente do projeto na Vercel (a Vercel envia sozinha o cabeçalho `Authorization: Bearer <CRON_SECRET>` nas chamadas de cron) e crie o arquivo `vercel.json` na raiz do projeto:

```json
{
  "crons": [{ "path": "/api/orders/expire", "schedule": "*/15 * * * *" }]
}
```

O exemplo roda a cada 15 minutos (horário UTC). O plano gratuito (Hobby) limita os crons a uma execução por dia; para rodar com mais frequência é preciso um plano pago ou a opção B.

**Opção B: cron externo** (cron-job.org, GitHub Actions agendado, `crontab` de um servidor etc.). Qualquer agendador que faça uma requisição `GET` com o cabeçalho serve. Exemplo de `crontab` a cada 15 minutos:

```bash
*/15 * * * * curl -fsS -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU-DOMINIO/api/orders/expire
```

No cron-job.org: crie um job com a URL `https://SEU-DOMINIO/api/orders/expire`, método `GET`, intervalo de 15 minutos, e em _Advanced → Headers_ adicione `Authorization` com o valor `Bearer SEU_CRON_SECRET`.

Use um intervalo menor ou igual a `ORDER_EXPIRATION_MINUTES` para que o estoque não fique preso muito além do prazo.

### Testes

```bash
npm test
```

Executa os testes de `tests/` (Node test runner) sobre as regras do carrinho, CEP e ViaCEP, dimensões, leitura dos formulários, criação de pedidos, lista e página de pedidos do painel (incluindo a mudança de status) e métricas do dashboard. Os arquivos rodam um de cada vez (`--test-concurrency=1`) porque compartilham o banco. Os testes de pedido usam o banco de `DATABASE_URL` (lido do `.env`): criam produtos próprios e removem tudo no final. Sem `DATABASE_URL` eles são ignorados.

---

## 🔌 6. Guia para o Programador Back-End (Banco de Dados & APIs)

Este front-end foi projetado para desacoplar a camada de apresentação do armazenamento de dados.

### 1. Contrato da Interface de Dados

Localizado em **`src/types/product.ts`**:

```ts
export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  capacity: string;
  dimensions: { width: number; height: number; length: number }; // cm
  price: number;
  formattedPrice: string;
  installments: string;
  description: string;
  specifications: string[];
  image: string;
  images?: string[];
  featured: boolean;
}
```

### 2. Conectando com Banco de Dados (ex: Prisma, PostgreSQL, MongoDB)

A leitura do catálogo fica em **`src/lib/products.ts`**, na função `getProducts()`:

```ts
export async function getProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}
```

Como a página utiliza o modelo de componentes do Next.js App Router, a integração é direta.

---

## 🔍 7. Fase 2: Componente de Lightbox (Ampliação de Imagens)

O componente **`src/components/ProductLightbox.tsx`** é responsável pela experiência imersiva de visualização dos produtos.

### Comportamento e Funcionalidades

- **No Card de Produto (Repouso):** A aparência visual do card permanece 100% idêntica ao baseline original. A única diferença intencional é o cursor `zoom-in` sobre a foto, indicando que ela pode ser ampliada.
- **No Desktop:**
  - Overlay escuro e neutro com efeito de vidro (`rgba(10, 11, 14, 0.94)` + `backdrop-filter`).
  - Imagem centralizada ocupando até 75% da altura da tela sem distorção (`object-fit: contain`).
  - Navegação entre fotos por setas no teclado (`←` e `→`) e botões chevrons na lateral.
  - Fechamento flexível: botão **X**, tecla **Esc** ou clique no fundo escuro fora da imagem.
  - Zoom de detalhes via duplo clique (1.8x) com cursor interativo de arrasto (`grab`).
- **No Mobile:**
  - Ocupação em tela cheia com alvos de toque generosos.
  - **Swipe horizontal:** Deslize o dedo para a esquerda ou direita para trocar de foto.
  - **Pinça (Pinch-to-zoom):** Use dois dedos para aproximar a imagem de 1x até 2.5x (com limite de nitidez para evitar pixelização).
  - **Botão de Fechar:** Dimensões mínimas de **44x44px**, posicionado de forma acessível para acionamento confortável com o polegar.
- **Acessibilidade Universal (WCAG 2.1 AA):**
  - Marcação semântica com `role="dialog"` e `aria-modal="true"`.
  - **Focus Trap:** A tecla `Tab` circula apenas entre os botões do modal enquanto ele estiver aberto.
  - **Restauração de Foco:** Ao fechar, o foco do teclado retorna exatamente para o card que o usuário clicou.
  - **Trava de Rolagem:** O `body` é bloqueado com `overflow: hidden` para impedir que a página role no fundo.
  - **Suporte a `prefers-reduced-motion`:** Se o usuário tiver desativado animações no sistema operacional, as transições visuais são desligadas instantaneamente.
- **Desempenho (Zero Layout Shift):** A foto ampliada é renderizada sob demanda (lazy) via Portal React diretamente no `document.body`, não alterando a geometria dos cards.

---

## 🚢 8. Deploy e Hospedagem (A Definir)

> **Status:** O método de publicação final pode ser definido de acordo com a preferência da equipe e do cliente. Abaixo estão as opções recomendadas prontas para uso:

### Opção A: Vercel (Recomendada pela infraestrutura Next.js)

1. Crie uma conta em [vercel.com](https://vercel.com) e importe o repositório.
2. Defina o **Root Directory** como `nix-nextjs`.
3. Adicione a variável de ambiente `NEXT_PUBLIC_CART_URL` nas configurações do projeto.
4. Clique em **Deploy**. A Vercel executará `npm run build` e configurará CDN global e SSL automaticamente.

### Opção B: Netlify

1. Conecte o repositório no painel da [Netlify](https://netlify.com).
2. Configure o Base Directory: `nix-nextjs`, Build command: `npm run build`, Publish directory: `.next`.
3. Instale o plugin oficial `@netlify/plugin-nextjs`.

### Opção C: Cloudflare Pages / Servidor Node.js Próprio (VPS / Docker)

Caso opte por hospedar em VPS Linux própria (Ubuntu / Debian com Docker ou PM2):

```bash
npm run build
npm run start
```

\*Desempenho (Zero Layout Shift):\*\* A foto ampliada é renderizada sob demanda (lazy) via Portal React diretamente no `document.body`, não alterando a geometria dos cards.

---

## 🚢 8. Deploy e Hospedagem (A Definir)

> **Status:** O método de publicação final pode ser definido de acordo com a preferência da equipe e do cliente. Abaixo estão as opções recomendadas prontas para uso:

### Opção A: Vercel (Recomendada pela infraestrutura Next.js)

1. Crie uma conta em [vercel.com](https://vercel.com) e importe o repositório.
2. Defina o **Root Directory** como `nix-nextjs`.
3. Adicione a variável de ambiente `NEXT_PUBLIC_CART_URL` nas configurações do projeto.
4. Clique em **Deploy**. A Vercel executará `npm run build` e configurará CDN global e SSL automaticamente.

### Opção B: Netlify

1. Conecte o repositório no painel da [Netlify](https://netlify.com).
2. Configure o Base Directory: `nix-nextjs`, Build command: `npm run build`, Publish directory: `.next`.
3. Instale o plugin oficial `@netlify/plugin-nextjs`.

### Opção C: Cloudflare Pages / Servidor Node.js Próprio (VPS / Docker)

Caso opte por hospedar em VPS Linux própria (Ubuntu / Debian com Docker ou PM2):

```bash
npm run build
npm run start
```

Configure um proxy reverso no Nginx apontando para a porta `3000` com certificado SSL gratuito do Let's Encrypt.
