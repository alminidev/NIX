---
description: Revisão de direção — cliente não aprovou o resultado e quer mudanças estruturais antes de seguir
argument-hint: <o que o cliente disse que não gostou>
---

# /revise

Use este comando quando o cliente viu o resultado (design ou build) e **não aprovou** — quer mudança de direção, não um ajuste pontual. Diferente do `/change` (que é manutenção pós-entrega), aqui o projeto ainda está em andamento e alguma etapa anterior pode precisar ser refeita.

## Passo 0 — Checar rodadas de revisão disponíveis

Leia `00-brief/escopo.md` (regra completa em `.agents/rules/ESCOPO.md`) e `00-brief/revisions-log.md` (se existir) para saber quantas rodadas já foram usadas e quantas estão inclusas no combinado. Se esta rodada ultrapassar o limite combinado, avise o usuário antes de prosseguir: "Essa seria a revisão [N], e o combinado prevê [X] rodadas inclusas — quer que eu siga mesmo assim, ou prefere alinhar isso com o cliente antes?" Só prossiga após a confirmação dele.

Se `00-brief/escopo.md` não existir, pule esta etapa sem travar o fluxo.

## Passo 1 — Diagnosticar em qual camada está o problema

Pergunte ao usuário (se ele ainda não tiver dito com clareza) o que exatamente não agradou. Classifique em uma destas camadas — a resposta determina até onde voltar:

| O que o cliente disse | Camada afetada | Onde reabrir |
|---|---|---|
| "não gostei da cor/fonte/algum elemento específico" | Execução visual pontual | `05-build/` direto, sem reabrir design |
| "não tem a cara que eu esperava", "parece genérico", "não combina com minha marca" | Direção criativa | Reabrir `02-references/` (Creative DNA) e refazer `04-design/` a partir dele |
| "a página não está clara", "não sei o que fazer quando entro no site" | UX/mensagem | Reabrir `03-strategy/` e/ou a parte de UX de `04-design/` |
| "quero um site completamente diferente do que foi mostrado" | Direção geral | Reabrir desde `02-references/`, tratando como um novo Creative DNA — mas reaproveite o que já foi validado no brief/research, não refaça do zero |

Nunca presuma a camada — se a resposta do cliente for vaga ("não gostei"), pergunte o que especificamente incomodou antes de mexer em qualquer coisa.

## Passo 2 — Preservar o que já funcionou

Antes de reabrir qualquer etapa anterior, registre em `04-design/design-system.md` (ou onde fizer sentido) uma nota rápida do que o cliente já validou e não deve mudar — pra não perder isso na correção.

## Passo 3 — Versionar, não sobrescrever

Nunca apague a tentativa anterior. Antes de refazer uma etapa, copie os arquivos atuais dela para uma subpasta `_v1/` (ex: `04-design/_v1/`), e trabalhe nos arquivos principais como a nova versão. Isso preserva histórico — útil pra mostrar ao cliente a evolução, e pra não perder trabalho caso ele prefira a versão anterior.

## Passo 4 — Refazer só a camada identificada, seguindo os gates normais

Use os comandos normais do pipeline (`/references`, `/strategy`, `/design`, `/build`) para refazer a partir da camada identificada no Passo 1 — mas incorporando o feedback do cliente como um requisito explícito da nova versão, marcado no topo do documento relevante como:

```
[FEEDBACK DO CLIENTE — v2]: <o que foi dito>
```

## Passo 5 — Registrar a revisão

Adicione uma entrada em `00-brief/revisions-log.md` (crie se não existir):

```
## Revisão [N] — [DATA]
Motivo: [o que o cliente não aprovou]
Camada reaberta: [references / strategy / design / build]
Resultado: [resumo do que mudou na v2]
```

Isso serve pra você acompanhar quantas rodadas de revisão cada projeto já teve — útil na hora de decidir se uma próxima rodada extra deve ser cobrada à parte (isso é uma decisão sua de negócio, o sistema só registra, não decide por você).
