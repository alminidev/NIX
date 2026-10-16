---
description: Cria art direction, UX e design system (sem código ainda)
---

# /design

Leia, nesta ordem: `.agents/rules/MASTER-RULES.md` → `00-brief/` → `01-research/` → `02-references/creative-dna.md` → `03-strategy/`.

**Não escreva código nesta etapa.** Isso é intencional — o objetivo é decidir antes de construir.

## Fase 1 — Art Direction (atue como Creative Director)

Defina: posicionamento visual, personalidade da marca, paleta de cores, tipografia, escala tipográfica, grid, espaçamento, tratamento de imagens, composição do hero/abertura, estilo dos CTAs, estilo dos componentes, bordas, sombras, iconografia, motion design, comportamento de hover, comportamento mobile.

Crie também uma seção "O que NÃO fazer" com escolhas visuais que deixariam o projeto genérico — específicas pra este projeto, não a lista genérica do `ANTI-GENERIC.md`.

Se houver problemas ou contradições no brief/estratégia, questione-os aqui em vez de seguir em frente.

## Fase 2 — UX (atue como UX Designer sênior)

Com base no brief e na art direction, projete a arquitetura de informação. Defina a sequência das seções/telas e, para cada uma: objetivo, mensagem principal, conteúdo necessário, hierarquia, CTA (quando houver), comportamento desktop e mobile.

Analise especialmente os primeiros 5 segundos: o usuário entende o que é oferecido, pra quem, qual benefício, por que continuar, qual ação tomar?

Evite adicionar seções só porque "são comuns nesse tipo de projeto". Cada seção precisa de função.

## Fase 3 — Design System (Visual Blueprint — leia `.agents/rules/DECISION-CONTRACT.md`)

**Antes de definir qualquer valor**, verifique se `02-references/extracted-patterns.md` existe (gerado por `/extract-design`, se o usuário rodou esse comando). Se existir, use os valores reais extraídos de lá como base pra grid, espaçamento, tipografia e motion — adaptando à personalidade do `creative-dna.md` deste projeto, nunca copiando a marca de origem. Cor nunca vem desse arquivo (ver regra em `/extract-design`) — defina cor diretamente com base no que já foi combinado com o cliente ou pergunte agora se ainda não foi definido.

Transforme tudo em regras objetivas e reutilizáveis: cores (com códigos), tipografia (famílias, pesos, escala), espaçamento (unidade base), grid, componentes, motion (durações, easings).

**Regra obrigatória**: nenhuma decisão de composição pode ficar só em adjetivo. Toda vez que a Fase 1 usar uma palavra como "assimétrico", "monumental", "sobreposto", "editorial", "generoso", "sofisticado" — o `design-system.md` precisa converter isso num valor verificável antes da etapa ser considerada completa:

- Tipografia: tamanho exato ou `clamp()`, peso, line-height, largura relativa ao container/viewport — não só "grande" ou "monumental"
- Grid/composição: proporções exatas de colunas (ex: `2fr 5fr 1fr`, não "assimétrico" sozinho), breakpoints onde a composição muda
- Sobreposição de elementos: valores de `z-index` e offset em `rem`/`%`, não só "elementos sobrepostos"
- Espaçamento: valores específicos de padding/margin, não "espaçamento generoso"
- Imagens: proporção exata e ponto focal, nunca assumir 16:9 por padrão a menos que seja a decisão deliberada

Se você (Designer) não conseguir converter um adjetivo em valor concreto, isso é sinal de que a decisão ainda não está madura — refine antes de passar pro `/build`, não deixe a tradução pro Engineer decidir sozinho.

## Fase 4 — Checagem cruzada com Impeccable (se instalado)

Se a skill Impeccable estiver instalada no projeto (ver `.agents/rules/IMPECCABLE-INTEGRATION.md`), rode `/impeccable document` depois de montar o `design-system.md`. Ele gera um `DESIGN.md` próprio com tokens reais. Compare os dois: se divergirem (cores, tipografia, espaçamento), resolva a divergência antes de prosseguir — não ignore. Se o Impeccable não estiver instalado, pule esta fase sem bloquear o pipeline.

## Saída

```
04-design/
├── art-direction.md
├── ux.md
├── information-architecture.md
├── design-system.md   ← contém o Visual Blueprint (valores numéricos), não só descrição
├── typography.md
├── colors.md
├── spacing.md
├── components.md
└── motion.md
```

## Gate de saída (DESIGN GATE) — checklist obrigatória, não pergunta retórica

Antes de declarar esta etapa concluída, confirme item por item, explicitamente (não apenas "sim, está tudo ok"):

- [ ] `design-system.md` tem cores com códigos hex/rgb definidos (não deixe pro `/build` inventar)
- [ ] `design-system.md` tem tipografia com `clamp()` ou tamanho exato, peso e line-height para CADA nível de heading que vai existir na página (h1, h2, h3 conforme a UX definida) — não só "tipografia grande"
- [ ] `design-system.md` tem grid com proporções exatas e breakpoints
- [ ] `design-system.md` tem espaçamento com valores específicos
- [ ] Todo adjetivo de composição em `art-direction.md` (assimétrico, monumental, sobreposto, editorial, generoso, sofisticado) tem um valor numérico correspondente
- [ ] `ux.md`/`information-architecture.md` definem o CONTEÚDO real esperado de cada seção (headline de verdade, texto de proposta, não só "seção hero com título")

Se qualquer item da lista não estiver marcado, a etapa NÃO está completa — não libere `/build` ainda. Rode a fase que falta de novo até fechar tudo.
