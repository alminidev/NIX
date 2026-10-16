# Estratégia de Conversão & UX — NIX

## 1. A Ação Principal de Conversão
O objetivo único do front-end é levar o visitante interessado ao **checkout externo integrado à InfinitePay** com o produto correto selecionado e sem dúvidas que impeçam a compra.

---

## 2. Pontos de Conversão (Touchpoints)

1. **Header Fixo (Sticky Navigation):**
   - Ícone do carrinho em alto contraste no canto direito superior.
   - Leva diretamente à URL externa do carrinho/checkout (`CHECKOUT_URL`), permitindo que visitantes que já decidiram comprem sem rolar a página toda.
2. **Hero Stage CTA:**
   - Botão pill proeminente: *"Conhecer Linha NIX"* com âncora suave para a seção `#produtos`, além de botão secundário *"Comprar Agora"*.
3. **Cards dos 5 Produtos (O Núcleo de Conversão):**
   - Cada card possui seu botão pill dedicado: **"Comprar"** no azul proprietário da NIX com texto branco em alto contraste.
   - O clique no botão "Comprar" envia o usuário para a URL de checkout com o SKU/ID correspondente do produto.
4. **Rodapé:**
   - Links diretos de suporte, contato comercial e link rápido para checkout seguro.

---

## 3. Redutores de Fricção (Friction Reducers)

| Ponto de Atrito Potencial | Solução Implementada no Front-End |
|---|---|
| **Dúvida sobre o frete de um móvel pesado** | Inclusão de um aviso visual limpo e presente em cada card: *"Frete calculado no checkout por transportadora especializada"*. |
| **Medo de incompatibilidade com carretéis** | Badge informativo direto no card: *"Compatível com bobinas padrão 1kg e 3kg"* e número exato de carretéis comportados (12, 24 ou 48). |
| **Insegurança com pagamento externo** | Microtexto de confiança junto ao CTA: *"Checkout seguro InfinitePay"*. |
| **Navegação em telas mobile** | Layout mobile-first rigoroso: cards de produtos com largura total confortável, botões com altura mínima de 48px para toque fácil e sticky header compacto. |

---

## 4. Requisitos Técnicos de Conversão para o Back-End
Para atender perfeitamente aos requisitos do briefing para o outro programador:
- **Centralização da URL de Compra:** Uma única constante em JavaScript (`const CHECKOUT_BASE_URL = '...';`) que alimenta todos os botões e o ícone do carrinho.
- **Identificação Semântica:** Cada botão e card conterá atributos `data-sku="..."` e `data-id="..."` para que o outro programador possa injetar parâmetros de URL de forma trivial (`?sku=DRY12`).
- **Renderização Dinâmica dos Produtos:** Todos os cards serão gerados a partir do array em `produtos.js`, garantindo que qualquer alteração de preço, nome ou SKU seja feita em um único ponto do código sem editar HTML manualmente.
