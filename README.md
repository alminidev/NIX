# NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D

> Website oficial e vitrine de alta conversão para a linha NIX de móveis técnicos e estufas estanques com controle térmico ativo (< 20% UR) para impressoras 3D e sistemas Bambu Lab (AMS).

---

## ⚡ Visão Geral do Projeto

Landing page desenvolvida sob rigorosos padrões de engenharia visual inspirados na galeria industrial *Custo*:
- **Hero Showroom Imersivo:** Fundo dark void com efeito esfumaçado de iluminação ambiente volumétrica (*Tri-Glow Mesh*).
- **Catálogo Fidedigno:** 5 produtos oficiais da linha NIX (DRY BOX 12, 24, 48 e Dry Box Station Bambu Lab A1 e A2L).
- **Checkout Integrado:** Conexão direta com gateway seguro da **InfinitePay**.
- **Canal de Atendimento:** Botão *"Fale com a Nix"* integrado via WhatsApp com mensagem pré-formatada.
- **Acessibilidade & Performance:** 100% WCAG 2.1 AA (contraste de até 18:1, touch targets $\ge 44\text{px}$, sem layout thrashing).
- **Zero Dependências:** 100% Vanilla HTML5, CSS3 Moderno e JavaScript ES6+ (0 KB de bundle externo).

---

## 📁 Estrutura de Pastas

```
├── 00-brief/       # Briefing e contrato de escopo/stack
├── 01-research/    # Pesquisa de mercado e concorrentes
├── 02-references/  # DNA criativo e referências visuais
├── 03-strategy/    # Posicionamento e arquitetura de conversão
├── 04-design/      # Design System e especificações de UI
├── 05-build/       # Pacote final compilado pronto para produção
│   ├── index.html  # Landing page oficial
│   ├── 404.html    # Página 404 personalizada
│   ├── css/        # Folhas de estilo Vanilla CSS
│   ├── js/         # Catálogo e scripts interativos
│   └── images/     # Ativos fotográficos de estúdio e logotipo
├── 06-audit/       # Auditoria de UX, código e fidelidade
├── 07-polish/      # Ajustes de acabamento e histórico
└── 08-delivery/    # Documentação de entrega, QA e handoff
```

---

## 🚀 Como Executar Localmente

Como o projeto é totalmente estático e independente de compilação:

1. Clone este repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/site-nix.git
   ```
2. Abra o arquivo `05-build/index.html` diretamente em qualquer navegador moderno.
3. Ou suba um servidor local simples:
   ```bash
   npx serve 05-build
   ```

---

## 🚢 Como Publicar (Deploy)

- **Vercel / Netlify / Cloudflare Pages:** Aponte o diretório raiz para `05-build` (sem build command).
- **GitHub Pages:** Configure para servir a partir do diretório raiz ou da pasta `05-build/`.
- **Hospedagem cPanel / Apache / Nginx:** Envie o conteúdo interno de `05-build/` para a pasta `public_html/`.

---

## 📄 Licença & Direitos

© 2026 **NIX 3D**. Todos os direitos reservados.
