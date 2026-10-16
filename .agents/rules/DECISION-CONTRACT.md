# DECISION CONTRACT — mecanismo de fidelidade

Este arquivo existe porque decisões tomadas em `/new-project` e `/design` estavam sendo tratadas como sugestões durante o `/build`, não como restrições. Isso não se resolve com mais instruções qualitativas ("respeite as decisões") — resolve-se removendo a possibilidade de reinterpretação.

## Princípio

Uma decisão registrada em `00-brief/stack-lock.md` ou em `04-design/design-system.md` não é uma referência, não é uma sugestão, não é uma inspiração. É um contrato. O agente de build não tem autoridade para substituir, "melhorar", simplificar ou reinterpretar nenhum item desses arquivos, sob nenhuma justificativa técnica, estética ou de conveniência.

Isso é diferente de "seguir instruções com atenção" — instruções qualitativas (`"faça bonito"`, `"seja moderno"`) sempre deixam espaço de interpretação, porque não têm forma de ser verificadas objetivamente. Um contrato precisa ser verificável: números, nomes de tecnologia exatos, valores de CSS, listas fechadas de permitido/proibido.

## Stack Lock (`00-brief/stack-lock.md`)

Gerado pelo `/new-project`. Formato:

```
# Stack Lock — [projeto]

## Permitido (única lista válida)
- [ex: HTML5, CSS3, JavaScript vanilla (ES6+)]

## Proibido (explícito — qualquer coisa fora da lista "Permitido" está implicitamente aqui também)
- Frameworks JS (React, Next.js, Vue, Angular, Svelte...)
- Frameworks CSS (Tailwind, Bootstrap...)
- Build tools não solicitados (Webpack, Vite...) — a menos que estejam listados em "Permitido"
- Qualquer dependência via npm/yarn que não conste explicitamente em "Permitido"
```

Regra de leitura pelo `/build`: antes de criar qualquer arquivo de configuração de framework (`package.json` com dependências não listadas, `next.config.*`, `tailwind.config.*`, etc.) ou rodar qualquer `npm install` de algo fora da lista, o agente deve parar e reler este arquivo. Se a tecnologia não está literalmente escrita em "Permitido", ela é proibida — não existe exceção por "ser mais robusto", "ser mais fácil de manter". Se o agente julgar genuinamente que a stack travada é inviável pro que foi pedido, ele deve PARAR e perguntar ao usuário — nunca decidir sozinho e prosseguir.

## Visual Blueprint (dentro de `04-design/design-system.md`)

O `/design` não está mais autorizado a descrever composição só com adjetivos. Toda decisão visual estrutural precisa ter, junto da descrição qualitativa, um valor numérico ou estrutural equivalente. Exemplos de tradução obrigatória:

| Adjetivo (sozinho, não é suficiente) | Precisa vir acompanhado de |
|---|---|
| "tipografia monumental" | tamanho exato ou `clamp()`, peso, line-height, largura relativa ao viewport |
| "composição assimétrica" | grid explícito (`grid-template-columns` ou equivalente) com proporções exatas, não "50/50" nem "container centralizado" por padrão |
| "elementos sobrepostos" | valores de `z-index`, offset em `rem`/`%`, ponto de ancoragem |
| "espaço negativo generoso" | valores de padding/margin específicos, não "espaçamento confortável" |
| "tratamento editorial de imagem" | proporção exata (nunca 16:9 por padrão a menos que decidido), crop, posição focal |

Regra de leitura pelo `/build`: o agente implementa os valores numéricos do blueprint como estão escritos. Se o blueprint disser grid assimétrico com colunas em proporção 2:5:1, o CSS precisa refletir exatamente essa proporção — não "um grid parecido" nem "uma versão simplificada pra facilitar responsividade" (responsividade é resolvida com media queries que adaptam a mesma composição, não abandonando ela em telas maiores).

## Extração de Padrões Reais (`02-references/extracted-patterns.md`)

Gerado opcionalmente pelo `/extract-design`, quando há um site de referência real disponível. Diferente de um valor inventado pelo Designer a partir de um adjetivo, um valor extraído de um site real (grid, espaçamento, timing de animação, comportamento de scroll) já é comprovadamente funcional em produção — é uma âncora mais confiável que qualquer valor gerado do zero.

Quando esse arquivo existe, o `/design` deve tratá-lo como fonte primária de referência estrutural ao montar o Visual Blueprint — adaptando os padrões extraídos ao projeto atual (nunca copiando 1:1 a marca/identidade do site de origem, só os padrões estruturais/comportamentais, conforme a regra de "extrair princípio, não clonar" do `CREATIVE-PRINCIPLES.md`).

Cor é tratada à parte — nunca herdada do site/imagem de referência (ver `/extract-design`), sempre definida diretamente com o usuário/cliente.

## Verificação (Fidelity Audit)

Ver `.agents/workflows/audit.md` — a dimensão "Fidelidade" existe especificamente para comparar o build contra este contrato, não contra impressão geral de qualidade. Qualquer desvio do Stack Lock ou do Visual Blueprint é P0 (bloqueia entrega), nunca P1/P2/P3.

## O que este mecanismo NÃO é

Não é uma auditoria de "isso ficou bonito?" (isso é `QUALITY-BAR.md`/skill Impeccable, outra camada). É uma auditoria de "isso é o que foi decidido?" — são perguntas diferentes, e a segunda é a que estava faltando.
