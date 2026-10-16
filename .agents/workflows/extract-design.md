---
description: Extrai padrões visuais reais (grid, tipografia, espaçamento, scroll, animações) de um site OU imagem de referência — não invenção
argument-hint: <URL do site de referência, ou anexe uma imagem>
---

# /extract-design

Leia `.agents/rules/CREATIVE-PRINCIPLES.md` e `.agents/rules/DECISION-CONTRACT.md` antes de começar. Rode depois do `/references`, normalmente antes do `/design` (não é obrigatório — só use quando houver uma referência real disponível).

## Por que este comando existe

Um valor numérico inventado pelo `/design` (mesmo sendo específico, tipo `clamp(3rem, 5vw, 6rem)`) ainda é uma decisão do agente sobre o que "deveria" funcionar. Um valor **extraído de uma referência real** já é comprovadamente funcional ou visualmente validado — é uma âncora mais confiável. Este comando existe pra dar ao `/design` material real pra trabalhar em cima, em vez de gerar tudo do zero.

## Passo 1 — Identificar o tipo de referência

Pergunte ao usuário (se ainda não estiver claro): "Você tem um **link de site** real pra eu inspecionar, ou uma **imagem/screenshot** de referência?" Os dois são aceitos, mas o processo de extração é diferente:

### Caminho A — URL de um site real

Use as ferramentas de navegador disponíveis (visite a página de verdade, inspecione o CSS computado, a estrutura do HTML, o comportamento de scroll/animação) — não descreva o site de memória ou baseado só no que ele "parece ser" pela captura de tela. O valor da extração é justamente ser real e verificável.

Extraia, quando disponível:
- **Grid/layout**: `grid-template-columns`/`flexbox` real usado nas seções principais, proporções exatas
- **Tipografia**: famílias de fonte reais, tamanhos (incluindo uso de `clamp()`/unidades fluidas), pesos, `line-height`, escala entre níveis de heading
- **Espaçamento**: valores reais de padding/margin, se há uma unidade-base perceptível (ex: múltiplos de 8px)
- **Scroll/animação**: comportamento de scroll (parallax, scroll-snap, sticky), timing e easing de transições/animações visíveis
- **Hero/abertura**: estrutura real da primeira seção (não só descrição — a composição real: onde fica o texto, a imagem, o CTA)

### Caminho B — Imagem/screenshot de referência

Aqui não existe CSS pra inspecionar — a extração é por análise visual cuidadosa, não por leitura de código. Seja explícito nesse arquivo sobre a diferença de confiabilidade: valores desta via são **estimativas visuais**, não números extraídos de código real.

Analise e estime, quando perceptível na imagem:
- **Grid/layout**: proporção aproximada entre colunas/áreas (ex: "a área de texto ocupa cerca de 35% da largura, a imagem 65%"), alinhamentos, pontos de ancoragem
- **Tipografia**: estilo aparente (serifada/sans, peso aparente, se há contraste de peso entre títulos e corpo), proporção de tamanho entre headline e texto de apoio
- **Cor**: identifique a paleta usada na imagem SÓ pra fins de entender o contraste/clima tonal (claro/escuro, saturado/dessaturado) — não registre os códigos hex exatos como valor a herdar (ver regra abaixo)
- **Espaçamento**: impressão de densidade (compacto vs. generoso), ritmo entre elementos
- **Composição**: estrutura observável (simétrica/assimétrica, sobreposição de elementos, uso de espaço negativo)

## Passo 2 — Regra crítica: extrair padrão, nunca clonar marca

**Nunca inclua na extração**: a paleta de cores exata da marca da referência (site ou imagem), o texto/copy real, imagens/logos de terceiros, ou qualquer elemento que identifique a marca de origem de forma reconhecível. Isso é conteúdo de marca de terceiros, não um padrão de design reutilizável — incluir isso quebraria a regra central deste sistema (extrair princípio, nunca copiar).

Cor especificamente: **não pergunte nem registre cor exata nesta etapa, de nenhuma das duas vias**. Cor é definida diretamente com o usuário sobre a marca do PRÓPRIO cliente (ver `/references` Passo 2, ou pergunte agora se ainda não foi definida) — nunca herdada da referência, mesmo que a cor dela seja bonita. Isso evita dois clientes diferentes saírem com "cara" parecida só por terem usado a mesma referência.

## Saída

```
02-references/
└── extracted-patterns.md
```

Formato sugerido:

```
# Padrões Extraídos — [URL ou "imagem de referência colada em DATA"]

## Fonte e confiabilidade
[URL real, extração por código — alta confiabilidade] OU [imagem, extração por análise visual — estimativa]

## Grid/Layout
[valores reais ou estimados, com nota de qual seção veio cada um]

## Tipografia
[valores reais ou estimados — família, tamanho, peso, line-height, escala]

## Espaçamento
[valores reais ou estimados, unidade-base identificada se possível]

## Scroll/Motion
[comportamento real observado, com timing/easing quando identificável — só disponível na via URL]

## Composição do Hero/Abertura
[estrutura real ou estimada da abertura da referência]

## Nota de adaptação
Estes valores são referência de padrão, não cópia. Ao montar o design-system.md
do projeto atual, adapte (não replique) estes números à direção/personalidade
definida no creative-dna.md deste projeto — cor NÃO vem desta extração.
```

## Gate

Este comando não bloqueia o pipeline — é uma ferramenta opcional. O `/design`, ao rodar depois, deve verificar se `02-references/extracted-patterns.md` existe e, se existir, usá-lo como referência primária ao definir os valores do Visual Blueprint em `design-system.md`.
