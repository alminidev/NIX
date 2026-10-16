---
description: Implementa o código com base em toda a documentação de design
---

# /build

Leia `.agents/rules/DECISION-CONTRACT.md` antes de qualquer outra coisa nesta etapa.

## Antes de escrever qualquer código

Diga explicitamente que vai verificar se todos os documentos necessários existem:

- [ ] Brief
- [ ] Stack Lock (`00-brief/stack-lock.md`)
- [ ] Research
- [ ] References / Creative DNA
- [ ] Strategy
- [ ] Art Direction
- [ ] UX
- [ ] Design System (com Visual Blueprint — valores numéricos, não só adjetivos)

Se algum estiver faltando ou incompleto, pare e sinalize — não implemente "no escuro" preenchendo lacunas com suposições.

## Padrões extraídos de referência real, se existirem

Se `02-references/extracted-patterns.md` existir (gerado pelo `/extract-design`), esses valores foram extraídos de uma referência real — trate-os com a mesma prioridade dos valores do `design-system.md` (que já deveria tê-los incorporado na etapa de `/design`; se não incorporou, sinalize a inconsistência em vez de decidir sozinho qual versão seguir).

## Nunca invente o que falta na especificação

Se, ao implementar, você perceber que falta algum valor no `design-system.md` que você precisa pra codar (uma cor sem código definido, um nível de heading sem tamanho especificado, um componente não descrito) — **PARE e avise o usuário que falta essa definição.** Não invente um valor plausível e siga em frente como se estivesse especificado. Isso vale mesmo que a lacuna pareça pequena. Um valor inventado pelo Engineer é, por definição, uma decisão de design tomada por quem não tem autoridade pra tomar essa decisão.

## Conteúdo real, nunca placeholder

Toda página implementada precisa ter o conteúdo de verdade do projeto — headline real (baseada em `03-strategy/messaging.md`), texto de proposta real, CTAs com texto real. **Nunca entregue texto de placeholder genérico como "Header", "Main Content", "Side", "Lorem ipsum" ou similar como se fosse a versão final.** Se o conteúdo de texto ainda não foi definido em nenhum documento anterior, pare e pergunte ao usuário o texto real antes de continuar — não preencha com rótulo estrutural.

## Estrutura semântica real, não só classes CSS

Se o Visual Blueprint define uma escala tipográfica para headings (h1, h2, h3...), o HTML precisa usar as tags de heading correspondentes de verdade (`<h1>`, `<h2>` etc.) — não `<div>` ou `<section>` com texto solto. Uma regra de CSS para `h1-h6` que não é aplicada a nenhuma tag real do documento é uma implementação que só parece completa; na prática, a tipografia especificada nunca é exibida.

## Ativos de marca (logo, fotos reais)

Se `00-brief/assets/` existir e tiver arquivos, copie-os para o local correto de imagens do projeto, de acordo com a stack travada em `stack-lock.md`:

- **HTML/CSS/JS puro**: copie para `05-build/images/` e referencie com caminho relativo simples (ex: `<img src="images/logo.png">`)
- **React/Next.js (só se travado explicitamente)**: copie para `public/images/` (Next.js) ou a convenção equivalente da stack travada

Nunca copie arquivos de `02-references/` (referências de estilo, screenshots de terceiros) para dentro de `05-build/` — essas imagens são só para consulta de princípio, não são ativos do projeto e não têm autorização de uso no site final.

## Stack — trava sem exceção

Leia `00-brief/stack-lock.md`. A lista em "Permitido" é a ÚNICA tecnologia autorizada para este projeto. Qualquer framework, biblioteca, build tool ou dependência que não esteja explicitamente nessa lista está PROIBIDO — sem exceção por robustez, velocidade de implementação, familiaridade do agente ou qualquer outro motivo técnico. Isso vale mesmo que a stack travada torne a implementação mais trabalhosa.

Antes de criar `package.json`, qualquer arquivo de configuração de framework (`next.config.*`, `tailwind.config.*`, `vite.config.*` etc.) ou rodar `npm install`/similar, confirme contra `stack-lock.md`. Se a tecnologia necessária não está na lista, PARE e pergunte ao usuário — nunca decida sozinho e prossiga com uma alternativa "equivalente".

## Design — trava sem exceção

Leia toda a documentação de `04-design/`, especialmente os valores numéricos do Visual Blueprint em `design-system.md`. **Você não tem autoridade para substituir, simplificar, "melhorar" ou reinterpretar nenhuma decisão registrada ali — nem mesmo com justificativa técnica ou estética.** Se um valor do blueprint parecer genuinamente inviável ou incoerente, pare e pergunte ao usuário — não resolva sozinho normalizando pra um padrão mais convencional.

Implemente os valores exatos: se o blueprint especifica `grid-template-columns: 2fr 5fr 1fr`, o CSS usa exatamente essa proporção. Se especifica um `clamp()` de tipografia, use esse `clamp()`, não um tamanho de heading padrão.

Escreva HTML semântico, com acessibilidade e responsive design desde o início — não como retrofit. Responsividade se resolve adaptando a MESMA composição via media queries, não abandonando a composição especificada em telas maiores/menores.

Não crie um template genérico. Priorize fidelidade ao blueprint sobre conveniência de implementação.

## Reforço opcional com Impeccable

Se a skill Impeccable estiver instalada (ver `.agents/rules/IMPECCABLE-INTEGRATION.md`), considere usar `/impeccable craft` para seções complexas (hero, navegação, seções com composição sofisticada) — ela aplica o vocabulário de design durante a implementação, não só depois.

## Depois de implementar

Não declare a etapa concluída só porque o código compila ou a página carrega. Faça uma primeira revisão crítica do próprio trabalho: releia `stack-lock.md` e o Visual Blueprint de `design-system.md` e confirme, item por item, que nada foi desviado — antes de passar pra `/audit`.

## Saída

```
05-build/
└── (código do projeto)
```
