---
name: fidelity-check
description: Verifica mecanicamente (via script, não por julgamento do agente) se o build de um projeto viola o stack-lock.md ou o design-system.md — stack proibida, texto placeholder, headings ausentes, cores não especificadas. Use durante o /audit, na Fase 0 (Fidelidade ao contrato).
---

# Fidelity Check

Esta skill existe porque a autoavaliação do agente sobre "segui o contrato?" é sujeita ao mesmo viés que causa o problema (o agente tende a achar que fez certo). Este script não julga — ele verifica fatos objetivos.

## Quando usar

Sempre que o comando `/audit` chegar na Fase 0 (Fidelidade ao contrato), antes de escrever qualquer avaliação subjetiva, rode este script.

## Como usar

1. Localize a raiz do projeto (a pasta que contém `00-brief/`, `04-design/`, `05-build/` etc.)
2. Rode, via terminal:

```
node .agents/skills/fidelity-check/scripts/check-fidelity.js <caminho-da-raiz-do-projeto>
```

3. O script imprime um relatório em JSON com os campos: `stackViolations`, `placeholderText`, `missingHeadings`, `orphanColors`. Cada lista vazia significa "sem violação encontrada" naquele critério.
4. Copie o resultado do script, sem reinterpretar ou suavizar, para `06-audit/fidelity-audit.md`. Qualquer item não-vazio nas listas é P0 automático em `priority-fixes.md`.
5. Este script cobre só a parte mecânica (stack, placeholder, headings, cores órfãs). Ele NÃO verifica se os valores de grid/tipografia/espaçamento batem numericamente com `design-system.md` — isso continua exigindo leitura humana/do agente.

## Limitações (seja honesto sobre isso no relatório)

- O script usa correspondência de texto simples (regex), não entende semântica. Pode ter falso positivo ou falso negativo. Trate o resultado como forte indício, não verdade absoluta — mas trate qualquer achado como investigação obrigatória, nunca ignore silenciosamente.
