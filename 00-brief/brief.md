# Brief do Projeto — NIX

## 1. Identificação
- **Projeto:** NIX
- **Cliente:** NIX (móveis/setups com controle de temperatura para organizar rolos de filamento de impressora 3D; linha Dry Box. Domínio: nix3d)
- **Tipo de projeto:** Site (página única / one-page com vitrine de 5 produtos)
- **Prazo:** Imediato

## 2. Negócio e Objetivos
- **O que a marca faz:** Fabricação de móveis e setups especializados para impressoras 3D com controle térmico e de umidade para armazenamento e proteção de rolos de filamento (linha Dry Box).
- **Objetivo do site:** Apresentar a marca NIX com alto padrão visual e converter visitantes em vendas dos 5 produtos da linha.
- **Mecanismo de conversão:** Botões "Comprar" e ícone do carrinho direcionam para URL externa de carrinho/checkout integrado à InfinitePay.

## 3. Público-Alvo
- **Segmento:** Classes A e B — proprietários e entusiastas de impressoras 3D (uma ou mais máquinas).
- **Necessidades e Dores:** Organização do ambiente de trabalho/maker, proteção contra umidade/degradação de filamentos, estética premium para o setup de impressão.

## 4. Escopo Técnico e Arquitetura
- **Front-end exclusivo:** Apenas desenvolvimento front-end em página única (one-page), responsivo e mobile-first.
- **Integração com outro programador:**
  - Produtos centralizados em arquivo de dados único (`produtos.js` ou `produtos.json`), com HTML dos cards gerado dinamicamente.
  - Cada produto com atributos `data-sku` e `data-id`.
  - URL do carrinho e botões de compra definida em constante centralizada única para fácil manutenção.
  - Aviso visível: "Frete calculado no checkout".
  - README didático para entrega técnica ao programador do backend.
- **Fora do escopo:** Backend, carrinho dinâmico no front, cálculo de frete, pagamento, login, APIs, autenticação, chaves ou tokens.

## 5. Direção Visual e Referências
- **Referências Visuais Estéticas:** 
  - **DJI:** Aerospace dark void, revelação com iluminação de recorte, cards brancos limpos sobre canvas claro, botão pill de conversão em azul vibrante.
  - **Custo:** Tipografia monumental em escala arquitetônica, rigor de showroom industrial, hairlines ultrafinas de 1px, respiro generoso entre seções.
- **Identidade Visual NIX Oficial:**
  - Fundo predominante branco `#ffffff` e canvas claro.
  - Detalhes/divisórias em cinza claro e hairlines de 1px.
  - Azul oficial NIX (`#176BFF` / `#0066FF`) extraído do logo nos botões "Comprar" e acentos de conversão.
  - Textos em preto de alto contraste (`#000000` / `#1A1A1A`).
  - **Ativos Reais Confirmados em `00-brief/assets/`:**
    - Logo oficial: `logo-nix.png`
    - Hero Showroom: `hero-showroom.jpg` (lineup completo de produtos no estúdio da NIX)
    - 5 Produtos da Vitrine:
      1. `dry-box-12.jpg` — DRY BOX 12 (12 filamentos, 46 x 35 x 60 cm, R$ 1.190,00)
      2. `dry-box-24.jpg` — DRY BOX 24 (24 filamentos, 46 x 50 x 60 cm, R$ 1.590,00)
      3. `dry-box-48.png` — DRY BOX 48 (48 filamentos, 46 x 50 x 100 cm, R$ 2.150,00)
      4. `setup-lab-a1.png` — DRY BOX STATION BAMBU LAB A1 COMBO (18 filamentos + 4 AMS, 46 x 50 x 100 cm, R$ 2.200,00)
      5. `setup-lab-a2.png` — DRY BOX STATION BAMBU LAB A2L COMBO (24 filamentos + 4 AMS, 56 x 60 x 100 cm, R$ 2.600,00)

## 6. Seções Planejadas da One-Page
1. **Cabeçalho fixo:** Logo oficial NIX + links de navegação + Botão "Fale com a Nix" + Ícone do carrinho em alto contraste
2. **Hero Stage:** Showroom de impacto da NIX com lineup completo, headline de escala monumental e CTA principal
3. **Vitrine de Produtos:** Grid com os 5 cards reais da linha (Dry Box 12, 24, 48 e Dry Box Station Combos A1, A2L) gerados dinamicamente a partir de `produtos.js`
4. **Informações Comerciais & Logísticas:** Envio todo o Brasil, Até 3x sem juros, Retirada em SP, Instagram @nix_impressoes3d e WhatsApp
5. **Diferenciais / Engenharia:** Controle térmico ativo, vedação estanque, redução de umidade < 20% UR e eliminação de falhas de impressão
6. **Como Funciona / FAQ:** Resolução de dúvidas técnicas, compatibilidade com filamentos e aviso de frete seguro
7. **Rodapé:** Links institucionais, redes sociais, WhatsApp e aviso de imagens ilustrativas
