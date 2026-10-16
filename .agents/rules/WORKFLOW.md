# WORKFLOW — Pipeline com Gates

## O fluxo completo

```
BRIEFING
   ↓
[BRIEF GATE]
   ↓
RESEARCH
   ↓
[RESEARCH GATE]
   ↓
REFERENCES
   ↓
[CREATIVE GATE]
   ↓
STRATEGY
   ↓
[STRATEGY GATE]
   ↓
DESIGN (art direction + UX + design system)
   ↓
[DESIGN GATE]
   ↓
BUILD
   ↓
[AUDIT GATE]
   ↓
AUDIT
   ↓
POLISH
   ↓
[SHIP GATE]
   ↓
SHIP
```

**Ferramentas opcionais, fora da sequência fixa**:
- `/extract-design` pode ser rodado a qualquer momento antes do `/design` (normalmente logo depois do `/references`) para extrair padrões estruturais reais (grid, espaçamento, timing de animação) de um site OU de uma imagem de referência, em vez do `/design` ter que inventar valores do zero.
- A skill **Impeccable** (se instalada — ver `IMPECCABLE-INTEGRATION.md`) reforça o julgamento visual em várias etapas (`/design`, `/build`, `/audit`, `/polish`).

## Regra dos gates

Um gate não é burocracia — é o ponto onde o sistema verifica se a etapa anterior está sólida o bastante para sustentar a próxima. Se não está, o sistema **sinaliza o problema e não avança sozinho.**

| Gate | Pergunta que precisa ser respondida antes de passar |
|---|---|
| BRIEF GATE | O negócio, público e objetivo estão claros? Há hipóteses não confirmadas que precisam de resposta do cliente? |
| RESEARCH GATE | Mercado, concorrentes e público foram investigados com fontes reais (não achismo)? |
| CREATIVE GATE | O CREATIVE DNA foi definido e é específico o suficiente pra este projeto (não genérico)? |
| STRATEGY GATE | Posicionamento, mensagem e proposta de conversão estão definidos? |
| DESIGN GATE | Art direction, UX e design system estão documentados e coerentes com o Creative DNA — antes de qualquer código? |
| AUDIT GATE | O build passou pela autocrítica do `QUALITY-BAR.md` (e do Impeccable, se instalado) com nota registrada em cada dimensão? |
| SHIP GATE | Checklist técnico final (build, links, forms, responsivo, acessibilidade, SEO, performance) está 100%? |

## Correspondência com pastas de projeto

```
projects/<cliente>/
├── 00-brief/
├── 01-research/
├── 02-references/
├── 03-strategy/
├── 04-design/
├── 05-build/
├── 06-audit/
├── 07-polish/
└── 08-delivery/
```

## Correspondência com comandos

`/new-project` → `/research` → `/references` → (`/extract-design`, opcional) → `/strategy` → `/design` → `/build` → `/audit` → `/polish` → `/ship`

Ver `.agents/workflows/` para o prompt exato de cada etapa.

## Regra prática

Não pule etapas mesmo quando o projeto parecer simples. Etapas podem ser resumidas (uma linha em vez de um documento longo), mas não puladas — pular é o que produz o resultado genérico que este sistema existe para evitar.
