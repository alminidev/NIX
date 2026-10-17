# NIX

Site da NIX: página única com vitrine de 5 produtos, móveis e setups para organizar e manter filamentos de impressora 3D em temperatura controlada.

**Stack:** Next.js (App Router), React e TypeScript.

> **Status:** front-end em migração de HTML/CSS/JS puro para Next.js. A integração de checkout (InfinitePay) e o banco de dados estão a cargo do programador back-end.

---

## Como rodar o projeto

**Pré-requisitos**
- Node.js `[versão a confirmar]`
- npm (já vem com o Node)

**Passo a passo**

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env.local
# (depois abra o .env.local e preencha os valores)

# 3. Rodar em modo desenvolvimento
npm run dev
```

Abra `http://localhost:3000` no navegador.

**Outros comandos**

```bash
npm run build   # gera a versão de produção
npm run start   # roda a versão de produção (depois do build)
```

---

## Estrutura de pastas

> Ajuste esta seção conforme a estrutura final do projeto.

```
app/            páginas e layout principal
components/     Header, Hero, ProductGrid, ProductCard, Footer...
data/           dados dos produtos (arquivo único)
public/         imagens, logo e fontes
```

---

## Onde mexer

| Quero... | Onde |
|---|---|
| Editar produtos, preços ou fotos | arquivo de produtos em `data/` |
| Trocar a URL do carrinho/checkout | variável `NEXT_PUBLIC_CART_URL` no `.env.local` |
| Mudar cores | variáveis `:root` no CSS global |
| Trocar a origem dos produtos (API/banco) | função `getProdutos()` |

Cada produto tem um `id`/SKU único (também presente no HTML como `data-sku`), para facilitar a ligação com o back-end.

---

## Divisão de responsabilidades

- **Front-end (design e interface):** layout, componentes, vitrine de produtos, ícone do carrinho e botões de compra.
- **Back-end (programador):** banco de dados, integração de pagamento com a InfinitePay, cálculo de frete e página de carrinho.

O ícone do carrinho e os botões "Comprar" levam à URL definida em `NEXT_PUBLIC_CART_URL`. O contador de itens do carrinho tem um ponto de entrada comentado no código para ser ligado ao back-end.

---

## Fluxo de trabalho (Git)

1. A branch `main` fica sempre estável.
2. Cada alteração é feita em uma branch própria (exemplos: `migracao-nextjs`, `feat/checkout-infinitepay`).
3. Ao terminar, abra um **Pull Request** descrevendo o que foi feito e como testar.
4. Só depois da aprovação o código entra na `main`.

**Atenção:** nunca envie chaves, tokens ou arquivos `.env` para o repositório. Somente o `.env.example` deve ser versionado.

---

## Deploy

A definir com o programador (hospedagem ainda não escolhida).

---

## Roadmap

- [ ] Fase 1: migração para Next.js com visual idêntico ao site original
- [ ] Fase 2: ampliação das fotos dos produtos ao clicar (desktop e mobile)
- [ ] Integração do checkout e do banco de dados (back-end)
- [ ] Definição de hospedagem e deploy
