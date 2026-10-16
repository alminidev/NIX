# Experiência do Usuário (UX Design) — NIX

## 1. O Teste dos Primeiros 5 Segundos (Above the Fold)
Ao abrir a página no desktop ou mobile, o visitante responde instantaneamente a 5 perguntas inconscientes:
1. **O que é isso?** Um ecossistema de mobiliário técnico com controle térmico para impressoras 3D e filamentos.
2. **Para quem é?** Para donos de impressoras 3D que buscam precisão e organização profissional.
3. **Qual o benefício imediato?** Elimina a umidade que estraga impressões e transforma a bagunça em um estúdio impecável.
4. **Por que continuar rolando?** Para ver os 5 modelos da linha, suas capacidades e preços.
5. **Qual ação tomar agora?** Clicar em *"Ver Produtos"* ou no atalho direto do carrinho de compras.

---

## 2. Sequência Estruturada das Seções (One-Page Flow)

### Seção 1: Cabeçalho Fixo (Sticky Header)
- **Objetivo:** Identidade de marca perene, navegação rápida por âncoras e acesso imediato ao checkout.
- **Conteúdo:** Logotipo NIX à esquerda (`logo-nix.png`), links de âncora centrais (*Produtos*, *Diferenciais*, *FAQ*, *Contato*), e ícone do Carrinho com badge de alto contraste à direita.
- **Comportamento Desktop:** Altura de `64px`, fundo translúcido fosco (`rgba(255, 255, 255, 0.9)` com `backdrop-filter: blur(12px)` e hairline inferior de `1px`).
- **Comportamento Mobile:** Logotipo à esquerda e ícone do carrinho à direita com botão direto para compras (altura de `56px`), sem poluição visual.

### Seção 2: Hero Stage (O Showroom NIX)
- **Objetivo:** Impacto emocional, ambição de estúdio e apresentação do portfólio completo.
- **Mensagem:** *"A evolução definitiva do seu setup de impressão 3D."*
- **Conteúdo:**
  - Headline monumental em branco de alto contraste.
  - Subtexto explicativo destacando o controle térmico ativo (<20% UR) e o fim das falhas por filamento úmido.
  - Fotografia real do showroom (`hero-showroom.jpg`) com iluminação cinematográfica de estúdio.
  - CTAs: Botão primário pill *"Ver Vitrine de Produtos"* (âncora `#produtos`) e botão ghost *"Comprar Agora"*.
- **Comportamento Desktop:** Layout com container de `1200px`, padding vertical de `96px 0`, imagem em largura total dentro da grade com bordas sutis.
- **Comportamento Mobile:** Headline adaptada para 32px, botões empilhados verticalmente com largura total (100%) e altura confortável de 48px para toque.

### Seção 3: Vitrine de Produtos (Os 5 Cards Oficiais)
- **Objetivo:** Apresentação clara do catálogo com foco total em conversão rápida.
- **Mensagem:** *"Linha NIX Dry Box & Setup Lab"* — Escolha a capacidade ideal para sua produção.
- **Conteúdo dos 5 Cards (gerados dinamicamente via `produtos.js`):**
  1. **Dry Box 12** — Capacidade: 12 carretéis | Uso: Compacto para bancadas
  2. **Dry Box 24** — Capacidade: 24 carretéis | Uso: Estúdios e alta variedade de cores
  3. **Dry Box 48** — Capacidade: 48 carretéis | Uso: Fazendas de impressão e produção contínua
  4. **Setup Lab A1** — Estação completa com suporte para máquina e AMS integrado
  5. **Setup Lab A2** — Estação ampliada com suporte para máquina e armazenamento duplo
- **Hierarquia interna do Card:** Foto nítida do produto -> Tag de capacidade -> Nome do produto em negrito (`20px`) -> Especificações em texto cinza -> Preço destacado -> Botão pill *"Comprar"* no azul NIX -> Aviso: *"Frete calculado no checkout"*.
- **Comportamento Desktop:** Grid responsivo de 3 colunas (linha 1: 3 cards; linha 2: 2 cards centralizados de estações completas) com gap de `28px`.
- **Comportamento Mobile:** Coluna única (1 card por linha) com fotos em proporção limpa e botões de toque largo.

### Seção 4: Diferenciais Técnicos & Engenharia (Showroom Grid)
- **Objetivo:** Justificar o valor percebido e afastar qualquer comparação com móveis baratos ou potes de sílica.
- **Mensagem:** *"Engenharia de precisão onde cada detalhe garante a peça perfeita."*
- **Conteúdo em 4 Pilares:**
  1. *Controle Térmico Ativo:* Display digital com monitoramento contínuo de temperatura e umidade relativa (<20% UR permanente).
  2. *Alimentação Direta sem Atrito:* Passagens técnicas com conectores pneumáticos para tubos PTFE, alimentando a máquina direto da Dry Box.
  3. *Estrutura em Alumínio e Vedação Estanque:* Suporta a inércia e acelerações violentas de impressoras CoreXY modernas sem vibrar a bancada.
  4. *Iluminação e Visibilidade Total:* Fita LED interna de 6000K e portas transparentes com fechos magnéticos.
- **Comportamento Desktop:** Composição de 2 colunas assimétricas (coluna esquerda de 380px com texto manifesto e coluna direita com grid 2x2 de blocos técnicos).
- **Comportamento Mobile:** Sequência vertical com ícones em linha e textos concisos.

### Seção 5: Como Funciona & Resolução de Objeções (FAQ)
- **Objetivo:** Destravar o cliente hesitante antes do clique final.
- **Perguntas Respondidas:**
  - *Como o móvel é entregue e qual o prazo de envio?* (Entrega segura via transportadora especializada com rastreamento).
  - *Quais carretéis e bobinas são compatíveis?* (Compatível com carretéis universais padrão de 1kg e carretéis industriais de 3kg).
  - *Qual o consumo de energia do controle térmico?* (Consumo ultraeficiente comparável a uma lâmpada LED residencial).
  - *Como funciona a compra e o cálculo de frete?* (Ao clicar em comprar, o usuário é direcionado para a página de checkout da InfinitePay onde insere o CEP e escolhe a forma de pagamento).
- **Comportamento Desktop & Mobile:** Accordions limpos com abertura e fechamento suave via JavaScript puro.

### Seção 6: Rodapé Institucional (Footer)
- **Objetivo:** Transparência legal, dados de contato e link de retorno ao carrinho.
- **Conteúdo:** Logotipo NIX, resumo institucional da marca, e-mail/WhatsApp de contato, aviso de checkout seguro InfinitePay e copyright.
