# Histórico de Versões & Changelog — NIX 3D (`/ship`)

Todas as modificações e evoluções do projeto registradas desde a concepção até a entrega final.

---

## [v1.3.0] — 2026-10-12 (Golden Master / Homologação Final)
### Adicionado
- **Efeito Esfumaçado Atmosférico (Glow Mesh):** Iluminação ambiente volumétrica na Hero com feixes difusos azuis (`.glow-container`, `.glow-blue`, `.glow-accent`), proporcionando profundidade de estúdio de alta tecnologia.
- **Página 404:** Criação de [404.html](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/404.html) personalizada de alto contraste, alinhada à identidade visual e paleta da NIX.
- **Metadados Sociais & Favicon:** Inclusão de `favicon`, tags `Open Graph` (Facebook/WhatsApp/LinkedIn) e `Twitter Card` com imagem de showroom no cabeçalho de [index.html](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/index.html).
- **Documentação de Entrega:** Geração de `final-qa.md`, `handoff.md` e `changelog.md` na pasta `08-delivery/`.

### Otimizado
- **Acessibilidade & Touch Targets:** Botões do cabeçalho (`.btn-cart` e `.btn-whatsapp`) calibrados com `min-height: 44px` e área de clique otimizada para dispositivos móveis conforme diretrizes WCAG 2.1 AA.
- **Sensibilidade a Movimento:** `@media (prefers-reduced-motion: reduce)` refatorado para eliminar deslocamentos espaciais (`transform: none`) mantendo transições instantâneas e suaves de cor e opacidade, eliminando o corte agressivo de 0.01ms.
- **Performance de Rolagem:** Substituição de listener de scroll tradicional por `IntersectionObserver` em [main.js](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/main.js), zerando leituras síncronas de layout (`offsetTop`) e eliminando qualquer risco de *layout thrashing*.
- **Score Impeccable Audit:** Elevação da nota técnica de **17/20** para **20/20 (Grau Máximo: Excellent)**.

---

## [v1.2.0] — 2026-10-12 (Fidelidade Restrita ao Briefing & Produtos)
### Modificado
- **Catálogo Fidedigno de Produtos:** Atualização integral dos 5 modelos em [produtos.js](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/produtos.js):
  - **DRY BOX 12:** 12 filamentos, 46 x 35 x 60 cm, R$ 1.190,00, Até 3x sem juros.
  - **DRY BOX 24:** 24 filamentos, 46 x 50 x 60 cm, R$ 1.590,00, Até 3x sem juros.
  - **DRY BOX 48:** 48 filamentos, 46 x 50 x 100 cm, R$ 2.150,00, Até 3x sem juros.
  - **DRY BOX STATION BAMBU LAB A1 COMBO:** 18 filamentos + 4 AMS, 46 x 50 x 100 cm, R$ 2.200,00, Até 3x sem juros.
  - **DRY BOX STATION BAMBU LAB A2L COMBO:** 24 filamentos + 4 AMS, 56 x 60 x 100 cm, R$ 2.600,00, Até 3x sem juros.
- **Substituição Terminológica:** Substituição sistemática de "Carretéis" por "Filamentos" em toda a interface e metadados.
- **Hero Stage:** Remoção do badge textual redundante e reposicionamento dos CTAs ("Ver Vitrine de Produtos" e "Ir para Checkout") para baixo da imagem de estúdio da Hero.
- **Informações Logísticas:** Seção dedicada de informações comerciais (Envio para todo o Brasil, Até 3x sem juros, Retirada em São Paulo, Instagram e WhatsApp).
- **Aviso Legal:** Inclusão do aviso obrigatório: *"Imagens ilustrativas. A impressora e os filamentos não acompanham o produto."*

---

## [v1.1.0] — 2026-10-12 (Polimento Visual & Arquitetura Custo)
### Adicionado
- **Navegação Sticky com Transição:** Implementação de cabeçalho responsivo com transição de opacidade e vidro jateado (`backdrop-filter: blur(12px)`).
- **Scroll-Padding:** Ajuste de `scroll-padding-top: 90px` garantindo que os links do menu não fiquem ocultos atrás do cabeçalho fixo.
- **Hierarquia Tipográfica Custo:** Aplicação de display monumental para `h1` e escala proporcional com fontes monoespaçadas sutis para dados técnicos.

---

## [v1.0.0] — 2026-10-12 (Construção Inicial)
### Adicionado
- Estruturação semântica HTML5 inicial em `05-build/index.html`.
- Folha de estilos `05-build/css/style.css` baseada nos tokens de `04-design/design-system.md`.
- Renderização dinâmica inicial de vitrine e catálogo em `05-build/js/produtos.js` e `05-build/js/main.js`.
- Imagens otimizadas de alta resolução em `05-build/images/`.
