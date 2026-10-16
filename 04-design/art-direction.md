# Direção de Arte (Art Direction) — NIX

## 1. Posicionamento Visual & Clima Geral
A direção de arte da NIX posiciona a marca na intersecção entre **Showroom de Design Industrial (estilo Custo)** e **Engenharia de Hardware de Alto Desempenho (estilo DJI)**.

O site não parece uma página de marcenaria convencional, nem uma loja genérica de gadgets chineses de plástico. O ambiente visual transmite **tolerâncias mecânicas precisas, controle térmico estanque e sofisticação de estúdio**.

- **Atmosfera:** Sóbria, técnica, minimalista e arquitetônica.
- **Sensação de Material:** Alumínio escovado, vidro temperado estanque, vedações automotivas e iluminação interna técnica fria (LED 6000K).
- **Tratamento de Contraste:** Alternância deliberada entre o Hero escuro com fotografia imersiva em iluminação de recorte e a vitrine de produtos sobre canvas neutro claro (Fog `#f4f5f7`), garantindo clareza total de leitura e foco nos produtos.

---

## 2. Personalidade da Marca
- **Arquitetônica:** Formas puras, proporções equilibradas e presença sólida.
- **Técnica:** Comunica parâmetros reais (graus Celsius, % de umidade relativa, capacidade em carretéis).
- **Sem Afobação Visual:** Respiro generoso entre blocos, zero badges piscantes, zero banners com contagens regressivas falsas.
- **Orientada a Conversão:** O azul oficial da NIX (`#176bff`) atua como a única cor saturada da página, guiando o olho diretamente para a ação de compra.

---

## 3. Paleta de Cores & Superfícies (Resumo Direcional)
- **Ink Primário:** Preto Profundo / Onyx (`#0a0b0e`) para textos principais e alto contraste.
- **Superfície Hero:** Hero Void (`#0a0b0e` a `#12141a`) para acolher a fotografia do showroom em ambiente de estúdio noturno.
- **Superfície Vitrine & Conteúdo:** Canvas Fog (`#f4f5f7`) com cards em Paper White puro (`#ffffff`), criando contraste por luminância sem depender de sombras projetadas.
- **Cor de Ação / Conversão:** NIX Signal Blue (`#176bff`) nos botões de compra "Comprar" e no ícone do carrinho no cabeçalho fixo.
- **Linhas Estruturais:** Hairlines ultrafinas de 1px em Slate Hairline (`#e2e4e8` em fundos claros e `#22252c` em fundos escuros).

---

## 4. Tipografia & Escala Visual
- **Família Tipográfica Primária:** `Inter` (com fallback para system-ui / -apple-system).
- **Tratamento Display:** Escala monumental no Hero (tamanho fluido de `40px` a `56px`, peso 600, line-height compacto de `1.08` e tracking negativo de `-0.03em`), funcionando como elemento estrutural da composição.
- **Corpo de Texto:** Altamente legível em 15px–16px, line-height 1.5 e peso 400 em cinza grafite (`#4a4e57`).

---

## 5. Estilo dos Componentes & Formas
- **Botões de Ação Principal:** Geometria em formato **Pill** (border-radius de `9999px`), preenchimento sólido no azul NIX `#176bff`, texto branco em peso 500, com transição sutil de luminosidade no hover.
- **Botões Secundários / Ghost:** Contorno em hairline de 1px, fundo transparente, raio pill de `9999px` ou raio moderado de `8px`.
- **Cards de Produtos:** Superfície branca plana (`#ffffff`), raio de borda de `8px`, sem bordas pesadas e sem sombras difusas — a separação é garantida pelo contraste contra o canvas `#f4f5f7`.
- **Fotografia:** Imagens reais de produtos com fundo tratado, enquadramentos simétricos de catálogo e foco nos mostradores digitais iluminados (`25°C` e `43%RH`).

---

## 6. O Que NÃO Fazer (Anti-Patterns Específicos da NIX)
- **NÃO usar gradientes coloridos ou estética de template SaaS genérico:** Proibidos fundos roxos, malhas de gradiente (*mesh gradients*) ou brilhos neon decorativos.
- **NÃO usar sombras pesadas ou glassmorphism borrado:** A elegância vem do acabamento plano e dos contrastes de cinza, preto e branco.
- **NÃO inventar cores de acento secundárias:** Proibido introduzir verdes, laranjas ou amarelos na interface, exceto os dígitos do próprio visor digital na foto do hardware. O azul da NIX deve reinar sozinho como cor de ação.
- **NÃO usar ilustrações 3D infantis ou vetores genéricos:** O público da NIX é técnico e exigente; valoriza fotos reais de máquinas de metal e alumínio.
- **NÃO esconder especificações técnicas:** O cliente quer saber dimensões, capacidade e compatibilidade de imediato.
