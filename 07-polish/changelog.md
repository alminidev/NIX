# Registro de Modificações (Changelog) — Etapa /polish

Todas as correções foram aplicadas estritamente com base nos apontamentos priorizados em `06-audit/priority-fixes.md`, mantendo conformidade total com o contrato de tecnologia (`00-brief/stack-lock.md`) e com o Visual Blueprint (`04-design/design-system.md`).

---

## 1. Correções Aplicadas

### 🟡 P1.1 — Separação Editorial de Categorias na Vitrine
- **O que foi alterado:** Em `05-build/js/main.js` e `05-build/css/style.css`, a vitrine de produtos foi organizada em dois grupos editoriais distintos:
  1. **Armários de Filamentos Dry Box** (Dry Box 12, 24 e 48) — grid de 3 colunas focado em armazenamento térmico ativo.
  2. **Workstations Integradas Setup Lab** (Setup Lab A1 e A2) — grid dedicado de 2 colunas focado em bancadas completas com suporte à impressora CoreXY e módulo inferior.
- **Por que foi feito:** Elimina a confusão entre produtos de estocagem pura e estações completas de máquinas, melhorando drasticamente a hierarquia e o ritmo visual da vitrine.

### 🟡 P1.2 — Reforço de Confiança no Checkout Externo
- **O que foi alterado:** Adicionado em cada card de produto o badge visual:
  `<div class="card-security-badge"><svg>...</svg> <span>Ambiente Seguro InfinitePay</span></div>`
- **Por que foi feito:** Diminui a fricção psicológica do cliente ao clicar no botão "Comprar" sabendo com antecedência que será direcionado a um gateway confiável e criptografado.

### 🟢 P2.1 — Fade Atmosférico no Hero Stage
- **O que foi alterado:** Adicionado pseudo-elemento `.hero-media-wrapper::after` em `style.css` com gradiente suave linear que funde o piso da imagem do showroom com o fundo escuro Hero Void (`#0a0b0e`).
- **Por que foi feito:** Remove a quebra geométrica dura entre a imagem e o container escuro, gerando uma sensação cinematográfica de revelação contínua.

### 🟢 P2.2 — Refinamento dos Blocos de Diferenciais
- **O que foi alterado:** O fundo de `.feature-box` foi alterado para branco puro (`#ffffff`), com padding ampliado (`32px 28px`), bordas hairlines e ícones com fundo sutil azul NIX (`var(--color-brand-blue-subtle)`), além de sutil microinteração de elevação no hover.
- **Por que foi feito:** Aproxima a seção da estética de galeria de arquitetura (referência Custo), evitando o aspecto de "cards genéricos de template".

### 🔵 P3.1 — ScrollSpy & Estado Ativo no Menu Desktop
- **O que foi alterado:** Implementada função `inicializarScrollSpy()` em `main.js` que adiciona a classe `.nav-link.active` no link correspondente à seção visível na tela no momento da rolagem.
- **Por que foi feito:** Oferece feedback visual contínuo ao usuário sobre sua posição no documento.

---

## 2. Verificação Pós-Polimento (Mini-Auditoria)

- **Sintaxe JS (`node -c`):** 100% válida.
- **Fidelidade Mecânica (`check-fidelity.js`):**
  - Violações de Stack: `0`
  - Textos de Placeholder: `0`
  - Headings Ausentes: `0`
  - Cores Órfãs: `0`
- **Responsividade:** Subgrades adaptadas com fluidez para tablet (2 colunas) e mobile (1 coluna).

---

## 3. Atualização de Dados de Produtos & Nomenclatura (Diretriz do Cliente)

### 📌 Substituição de "Carretéis" por "Filamentos"
- Substituída toda e qualquer menção a "Carretéis" por "Filamentos" na vitrine, nas especificações técnicas, na seção de engenharia, no FAQ e nos rodapés.

### 📌 Especificações, Dimensões e Preços Oficiais Atualizados (`js/produtos.js` & `js/main.js`):
1. **DRY BOX 12:**
   - Descrição: *Compacta e eficiente para o seu dia a dia.*
   - Capacidade: 12 filamentos
   - Dimensões (C x L x A): 46 x 35 x 60 cm
   - Preço: R$ 1.190,00 | Até 3x sem juros
2. **DRY BOX 24:**
   - Descrição: *Mais espaço para seus projetos.*
   - Capacidade: 24 filamentos
   - Dimensões (C x L x A): 46 x 50 x 60 cm
   - Preço: R$ 1.590,00 | Até 3x sem juros
3. **DRY BOX 48:**
   - Descrição: *Alta capacidade para grandes demandas.*
   - Capacidade: 48 filamentos
   - Dimensões (C x L x A): 46 x 50 x 100 cm
   - Preço: R$ 2.150,00 | Até 3x sem juros
4. **DRY BOX STATION BAMBU LAB A1 COMBO:**
   - Descrição: *Solução completa para a sua Bambu Lab A1.*
   - Capacidade: 18 filamentos + 4 AMS
   - Dimensões (C x L x A): 46 x 50 x 100 cm
   - Preço: R$ 2.200,00 | Até 3x sem juros
5. **DRY BOX STATION BAMBU LAB A2L COMBO:**
   - Descrição: *Mais capacidade para o seu setup.*
   - Capacidade: 24 filamentos + 4 AMS
   - Dimensões (C x L x A): 56 x 60 x 100 cm
   - Preço: R$ 2.600,00 | Até 3x sem juros

### 🚚 Informações Comerciais e Logísticas Integradas:
- **Envio:** Enviamos para todo o Brasil (Frete a consultar no checkout).
- **Pagamento:** Até 3x sem juros destacado em cada card e nas informações comerciais.
- **Retirada:** Disponível no local em São Paulo.
- **Redes Sociais:** Instagram [@nix_impressoes3d](https://instagram.com/nix_impressoes3d).
- **Contato Direto:** Botão e link "Fale com a Nix" (WhatsApp oficial).
- **Observação Importante:** Badge e aviso explícito de *“Imagens ilustrativas. A impressora e os filamentos não acompanham o produto.”* no rodapé da vitrine e no rodapé geral.

### 🎯 Ajuste no Hero Stage:
- Removido o badge superior *"Mobiliário Técnico para Impressão 3D"*.
- Posicionados os botões principais de ação (**"Ver Vitrine de Produtos"** e **"Ir para Checkout"**) logo abaixo da imagem do Showroom da NIX, criando um fluxo visual de apresentação do produto seguido do convite à ação.

### 🏛️ Aplicação Fiel da Top Navigation Bar (Referência Custo):
- **Cabeçalho Fixo & Transparente na Hero:** O header agora é fixo no topo (`position: fixed; height: 80px`), iniciando **100% transparente** sobre a tela escura do Hero Stage, com hairline sutil (`rgba(255, 255, 255, 0.1)`), tipografia em branco/reverso e logotipo NIX com filtro invertido para perfeita visibilidade.
- **Transição para Paper White ao Rolar:** Ao iniciar a rolagem (`.site-header.scrolled`), o fundo transiciona suavemente para **Paper White** (`#ffffff`), a borda inferior passa a ser a hairline neutra (`#e2e4e8`), a tipografia retorna ao ink grafite e o logotipo exibe suas cores originais.
- **Grid de 3 Zonas Balanceado:** Logotipo alinhado à esquerda (`justify-self: start`), links de navegação rigorosamente centralizados (`justify-self: center`) e botões de ação/carrinho à direita (`justify-self: end`).
- **Botões Pill com Inversão de Estado:** Botões de ação em formato ghost pill no Hero (borda branca sobre transparente) que invertem para o estilo de alto contraste e azul oficial NIX ao rolar.

---

## 4. Refinamentos do Impeccable Critique (Opção C)

### ♿ Acessibilidade Semântica de Cabeçalhos:
- **Correção de Salto `h2` $\rightarrow$ `h4`:** Títulos da seção de informações comerciais e logísticas elevados para `<h3>` (`.logistics-content h3`), restabelecendo uma árvore semântica rigorosa para acessibilidade (leitores de tela) e SEO.

### 🎨 Calibração de Contraste WCAG AA ($\ge 4.5:1$):
- **Tags de Capacidade e Parcelamento:** Texto alterado para `--color-brand-blue-hover` (`#0d57db`), alcançando contraste de **5.49:1** sobre `#edf3ff`.
- **Kickers e Subtítulos:** Tokens de apoio calibrados para `#0d57db` sobre os planos claros.
- **Legendas e Microcópia Muted:** Token `--color-ink-muted` atualizado para `#5c636e`, atingindo contraste de **5.3:1** sobre `#f4f5f7`.
- **Rodapé Escuro:** Contraste do texto legal elevado para `rgba(255, 255, 255, 0.7)` sobre o fundo `#0a0b0e`.

### 📐 Ritmo Tipográfico e Navegação:
- **Títulos dos Cards:** Elevados para `1.25rem` (20px), reforçando o passo modular em relação ao corpo de texto (`0.9375rem` / 15px).
- **Âncoras de Navegação:** Adicionado `scroll-padding-top: 90px` no elemento `html`, garantindo que links do menu não fiquem encobertos pela barra fixa ao rolar.
