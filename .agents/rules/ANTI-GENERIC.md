# ANTI-GENERIC — o que evitar por padrão

Este arquivo é um resumo rápido. A fonte de verdade, com 61 regras determinísticas testadas e mantidas por especialista (não escritas à mão por nós), é a skill **Impeccable** — ver `IMPECCABLE-INTEGRATION.md`. Se a skill estiver instalada no projeto, ela tem prioridade sobre este resumo em qualquer divergência.

## Resumo — nunca use automaticamente

- Gradientes roxos/azuis genéricos
- Glassmorphism sem justificativa funcional
- Excesso de cards (inclusive cards dentro de cards)
- Bordas arredondadas em tudo
- Sombras exageradas
- Ícones decorativos sem função
- Fonte Inter por padrão sem motivo (fonte mais usada por IA, reconhecível)
- Hero com layout previsível (título centralizado + subtítulo + botão + imagem à direita)
- Texto cinza sobre fundo colorido
- Easing de "quique" (bounce) genérico
- Excesso de badges/ícones
- Seções repetitivas (mesmo padrão visual repetido sem variação de ritmo)
- Aparência de template
- Estética SaaS genérica quando o projeto não é SaaS (e vice-versa — um SaaS também não deveria usar linguagem de landing page editorial)
- Animações sem propósito

## Antes de adicionar qualquer elemento, pergunte

"Isso melhora a experiência ou apenas preenche espaço?"

Se a resposta for "só preenche espaço" — remova.

## Ao invés disso, priorize

- Hierarquia forte
- Tipografia expressiva (contraste real entre display e body, não só tamanhos diferentes)
- Espaço negativo intencional
- Grid consistente, com assimetria quando fizer sentido
- Composição editorial em vez de blocos empilhados
- Ritmo entre seções (variar densidade, não repetir o mesmo padrão a cada seção)
- Imagens tratadas como elementos de design (crop, proporção, posição focal, relação com o texto), não como decoração
- Motion com função: entrada suave, hover states, microinterações, parallax quando fizer sentido — sempre respeitando `prefers-reduced-motion`

## Regra de decisão

Se uma escolha visual parecer previsível ou "a primeira coisa que qualquer IA faria", questione-a antes de aceitar. Se a skill Impeccable estiver instalada, rode `/impeccable audit` ou `/impeccable critique` pra checagem objetiva em vez de confiar só no próprio julgamento.
