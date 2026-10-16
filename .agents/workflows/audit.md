---
description: Auditoria crítica do resultado — não faz alterações, só diagnostica
---

# /audit

Leia `.agents/rules/QUALITY-BAR.md`, `.agents/rules/ANTI-GENERIC.md` e `.agents/rules/DECISION-CONTRACT.md` antes de começar.

## Papel

Você é o diretor de criação mal-humorado. Não elogie o próprio trabalho — tente encontrar defeitos nele, como se fosse avaliar o trabalho de uma agência antes de apresentar ao cliente.

## Fase 0 — Fidelidade ao contrato (fazer ANTES de tudo, e separado do resto)

Esta fase não é sobre "isso ficou bonito?" — é sobre "isso é o que foi decidido?". São perguntas diferentes e não podem se misturar.

**Passo mecânico primeiro**: use a skill `fidelity-check` (rode `node .agents/skills/fidelity-check/scripts/check-fidelity.js <raiz-do-projeto>`) antes de fazer qualquer julgamento manual. Ela verifica objetivamente, sem interpretação do agente: violação de stack, texto placeholder, headings ausentes e cores usadas no CSS que não constam no `design-system.md`. Copie o resultado sem suavizar.

**Depois, complemente com verificação manual** do que o script não cobre (valores estruturais de grid/tipografia/espaçamento — comparação numérica exige leitura, não é uma checagem mecânica simples):

1. Abra `00-brief/stack-lock.md`. Verifique, arquivo por arquivo em `05-build/`, se alguma tecnologia usada não está na lista "Permitido" (verifique `package.json` se existir, imports, arquivos de configuração de framework). Qualquer tecnologia fora da lista é uma violação de contrato.

2. Abra `04-design/design-system.md`. Para cada valor numérico do Visual Blueprint (grid, tipografia, espaçamento, offsets, proporção de imagem), confira se o CSS/código implementado bate com o valor especificado — não "aproximadamente", o valor exato ou funcionalmente equivalente. Registre cada divergência encontrada.

3. Abra o HTML implementado e procure por texto de placeholder genérico ("Header", "Main Content", "Side", "Lorem ipsum", "Título aqui", "Seção X" ou qualquer rótulo estrutural que não seja conteúdo real do projeto). Se encontrar, isso é uma violação — a página não está de fato implementada, é um esqueleto.

4. Verifique se todo heading que deveria existir conforme a escala tipográfica do blueprint usa tags semânticas reais (`<h1>`-`<h6>`) — se a regra de CSS pra heading existe mas nenhuma tag heading é usada no HTML, isso é uma violação.

5. Verifique se algum valor no código (cor, tamanho, espaçamento) aparece sem correspondência em `design-system.md` — isso é sinal de que o Engineer inventou uma decisão de design que não tinha autoridade pra tomar. Registre cada valor "órfão" encontrado.

6. Verifique se algum arquivo de imagem em `05-build/` tem o mesmo nome ou hash de algum arquivo em `02-references/` — isso indicaria que uma imagem de referência de estilo (não autorizada para uso final) vazou pro build em vez de só o que está em `00-brief/assets/`.

7. Todo item encontrado nas checagens 1 a 6 é **P0 automaticamente**, sem exceção, independente de "ainda ficou bonito" ou "funciona bem assim". Fidelidade ao contrato não é negociável pela qualidade percebida do resultado.

## Fase 1 — Julgamento de design (Impeccable, se instalado)

Se a skill Impeccable estiver instalada (ver `.agents/rules/IMPECCABLE-INTEGRATION.md`), rode agora `/impeccable audit` e/ou `/impeccable critique`. Ela cobre os 61 padrões de "cara de IA genérica" que o `fidelity-check` não verifica (gradiente roxo, excesso de Inter, cards dentro de cards, texto cinza em fundo colorido, easing de quique, etc.). Registre cada achado em `priority-fixes.md` com severidade a seu critério (não é automaticamente P0 como as violações da Fase 0 — julgamento de design tem mais nuance que fidelidade a um valor numérico).

Se o Impeccable NÃO estiver instalado, pule esta fase e siga pro julgamento manual abaixo — nunca invente que rodou um comando dele.

Peça também ao usuário um print/screenshot do build renderizado e avalie visualmente contra a intenção descrita em `art-direction.md`/`creative-dna.md` (e contra `02-references/extracted-patterns.md`, se existir). Isso exige julgamento visual real, o tipo de avaliação que um script não consegue fazer sozinho.

## Avaliar e notar de 0 a 10 cada dimensão

- Design
- UX
- Conversão
- Responsividade
- Acessibilidade
- Performance
- Originalidade

## Procurar especificamente

Aparência de template, aparência de site gerado por IA, hierarquia visual fraca, hero/abertura pouco impactante, tipografia genérica, espaçamento inconsistente, excesso de cards, excesso de bordas arredondadas, cores sem personalidade, CTAs fracos, seções repetitivas, falta de ritmo visual, composição previsível, excesso de elementos, problemas de contraste, acessibilidade, mobile, performance, animações desnecessárias.

## Saída

```
06-audit/
├── fidelity-audit.md    ← resultado da Fase 0 (stack + blueprint), sempre em primeiro lugar
├── visual-audit.md
├── ux-audit.md
├── technical-audit.md
└── priority-fixes.md
```

Em `priority-fixes.md`, liste os problemas encontrados priorizados:

- **P0** — crítico (bloqueia a entrega) — inclui automaticamente TODA violação de `fidelity-audit.md`
- **P1** — importante (afeta percepção de qualidade)
- **P2** — refinamento (melhora perceptível, não bloqueante)
- **P3** — nice-to-have

**Não faça alterações nesta etapa.** Apenas diagnostique. A correção acontece em `/polish` — e se houver P0 de fidelidade, o `/polish` precisa refazer a partir do ponto de divergência, não só "ajustar visualmente por cima".
