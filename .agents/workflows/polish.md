---
description: Corrige os problemas priorizados na auditoria (P0 primeiro)
---

# /polish

Leia `06-audit/priority-fixes.md`, a implementação atual em `05-build/` e `04-design/design-system.md`.

## Regra mais importante desta etapa

**Não redesenhar tudo só porque consegue.** Preserve o que já funciona. O objetivo é corrigir problemas específicos, não recomeçar.

## Ordem de correção

1. Se `06-audit/fidelity-audit.md` registrou alguma violação de stack ou de blueprint, corrija isso PRIMEIRO e de forma diferente das demais: não é um ajuste visual por cima do que já existe — é reconstruir a parte afetada a partir do valor correto especificado em `stack-lock.md`/`design-system.md`. Remendar por cima de uma base com tecnologia errada ou proporção errada preserva o erro estrutural.
2. Corrija os demais itens **P0**
3. Depois **P1**
4. Depois **P2** (se houver tempo/orçamento)
5. **P3** é opcional

## Passada final opcional com Impeccable

Se a skill Impeccable estiver instalada, depois de resolver P0/P1, rode `/impeccable polish` como uma passada final de refinamento (espaçamento, alinhamento, detalhes finos).

## Depois de corrigir

Execute uma mini-auditoria (repita rapidamente os pontos de `.agents/rules/QUALITY-BAR.md`) para confirmar que as correções não introduziram problemas novos.

## Saída

Atualização de `05-build/` + `07-polish/changelog.md` listando o que foi corrigido e por quê.
