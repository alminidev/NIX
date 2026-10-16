# Lista de Correções Priorizadas — NIX

Esta lista consolida todos os pontos levantados na auditoria para direcionar a execução da etapa `/polish`.
Lembrando que nesta etapa de `/audit` nenhuma alteração é feita; apenas diagnosticamos e priorizamos.

---

## 🔴 P0 — Crítico (Bloqueia a Entrega)
*Nenhum problema P0 encontrado.*
- **Fidelidade ao Contrato:** 0 violações de stack, 0 placeholders, 0 headings ausentes, 0 cores órfãs.
- O build cumpre 100% dos requisitos contratuais de `00-brief/stack-lock.md` e `04-design/design-system.md`.

---

## 🟡 P1 — Importante (Afeta Percepção de Qualidade e Clareza)

1. **Separação Editorial de Categorias na Vitrine:**
   - **Diagnóstico:** A linha NIX é composta por 3 armários de carretéis (*Dry Box 12, 24 e 48*) e 2 estações completas de máquina (*Setup Lab A1 e A2*). Colocar todos sob o mesmo grid sem distinção pode fazer com que o usuário não entenda de imediato a diferença de proposta.
   - **Solução proposta para `/polish`:** Introduzir um divisor editorial sutil ou sub-cabeçalho visual entre os armários Dry Box e as Workstations Setup Lab dentro da vitrine, reforçando o valor de cada categoria.

2. **Reforço de Segurança no Checkout Externo:**
   - **Diagnóstico:** Como o checkout é externo (InfinitePay), alguns usuários de primeira compra podem hesitar no clique do botão "Comprar".
   - **Solução proposta para `/polish`:** Adicionar microtexto com ícone sutil de cadeado e menção *"Ambiente Seguro InfinitePay"* logo abaixo do botão de compra nos cards ou no rodapé do card.

---

## 🟢 P2 — Refinamento (Melhoria Perceptível)

1. **Fade Atmosférico na Base da Imagem do Hero:**
   - **Diagnóstico:** A imagem do showroom corta de forma reta antes do canvas claro.
   - **Solução proposta para `/polish`:** Aplicar uma sutil máscara de gradiente linear escuro na base da moldura do showroom, fazendo com que o piso da imagem se funda suavemente com o Hero Void (`#0a0b0e`).

2. **Refinamento dos Blocos de Diferenciais:**
   - **Diagnóstico:** Os 4 blocos de diferenciais utilizam fundo cinza que se aproxima de um layout padrão de cards.
   - **Solução proposta para `/polish`:** Suavizar as bordas e fundos dos blocos para uma estética mais leve e arquitetônica (hairlines finas de 1px sem fundo pesado), conforme a referência de galeria Custo.

---

## 🔵 P3 — Nice-to-Have (Polimento Secundário)

1. **Indicador de Âncora Ativa no Header:**
   - Adicionar sublinhado animado sutil nos links do menu desktop (`Produtos`, `Diferenciais`, `FAQ`) conforme o usuário navega pelas seções.
