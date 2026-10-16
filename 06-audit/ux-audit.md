# Auditoria de UX & Conversão — NIX

## 1. Avaliação do Fluxo de Navegação e Conversão

### A. Primeiro Impacto (0 a 5 segundos)
- **Status:** **APROVADO**. O visitante que entra vê imediatamente o logotipo da NIX, o showroom futurista e a mensagem direta: *"A evolução definitiva do seu setup de impressão 3D."* O subtítulo define sem rodeios o problema que resolve (umidade < 20% UR permanente e fim das impressões quebradiças).

### B. Vitrine dos 5 Produtos
- **Status:** **MUITO BOM**.
  - Cada card exibe a capacidade em destaque através de uma tag no topo (`12 Carretéis`, `24 Carretéis`, etc.).
  - A foto do produto tem tamanho generoso (quadrado `1:1`) e fundo transparente/branco limpo.
  - O preço em destaque e o botão "Comprar" em azul forte garantem clareza absoluta de ação.
  - O aviso de *"Frete calculado no checkout"* reduz qualquer receio de cobrança oculta.

### C. Navegação Sticky & Checkout
- **Status:** **MUITO BOM**.
  - O cabeçalho fixo mantém o botão do carrinho sempre visível.
  - Ao rolar a página, o cabeçalho adiciona a classe `.scrolled` com sombra sutil para separar do conteúdo.
  - No mobile, a navegação de links de texto foi deliberadamente ocultada para priorizar o logo e o botão de carrinho, evitando menus hambúrguer que bloqueiam a tela.

---

## 2. Oportunidades de Melhoria em UX (Para a fase /polish)

1. **Microcópia de Confiança junto ao Checkout:**
   - Adicionar no botão "Comprar" ou no rodapé do card um pequeno ícone de cadeado ou texto sutil *"Compra segura via InfinitePay"*, reforçando a credibilidade do checkout externo para novos clientes.
2. **Scroll Spy / Destaque de Seção:**
   - Adicionar indicador de estado ativo no link da navegação desktop conforme o usuário rola a página.
3. **Acessibilidade do Accordion de FAQ:**
   - Garantir que o foco por teclado no `<summary>` tenha indicador nítido de foco visual.
