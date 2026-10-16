# IMPECCABLE — integração com o AI Creative Agency OS

**Impeccable** (de Paul Bakaus, código aberto, construído sobre a skill oficial `frontend-design` da Anthropic) é uma skill de julgamento de design para agentes de IA: 24 comandos nomeados e 61 regras determinísticas de detecção de "cara de IA genérica" (gradiente roxo, fonte Inter em excesso, cards dentro de cards, texto cinza em fundo colorido, easing de quique, entre outras).

## Divisão de responsabilidade

- **Nosso sistema (AI Creative Agency OS)**: cuida do *processo de agência* — briefing, pesquisa, estratégia, escopo combinado, contrato de stack/design (`DECISION-CONTRACT.md`), revisão, changelog.
- **Impeccable**: cuida especificamente do *julgamento visual* — a camada que decide se algo parece genérico/"feito por IA" ou profissional. Mais rigoroso e mantido externamente do que nosso `ANTI-GENERIC.md`.

Os dois sistemas são complementares, não concorrentes. Impeccable não sabe nada sobre briefing, escopo ou contrato de stack — só sobre design.

## Instalação (o usuário faz isso, não o agente sozinho)

No terminal, dentro da pasta do projeto:

```
npx impeccable install
```

O instalador detecta os agentes presentes (Claude Code, Codex, Cursor, Gemini CLI...) e pergunta se a instalação deve ser por projeto ou global. Depois, rodar `/impeccable init` para começar.

## Onde ele entra no nosso pipeline

- **`/design`**: depois de montar o Visual Blueprint (ver `DECISION-CONTRACT.md`), se o Impeccable estiver instalado, rode `/impeccable document` — ele gera um `DESIGN.md` próprio com tokens reais (cores, tipografia, espaçamento) a partir do que já existe no projeto ou do que foi definido. Use esse `DESIGN.md` como checagem cruzada do nosso `design-system.md` — se divergirem, resolva a divergência antes de prosseguir, não ignore.
- **`/build`**: ao implementar, considere rodar `/impeccable craft` para seções complexas, que já aplica o vocabulário de design do Impeccable durante a própria implementação, não só depois.
- **`/audit`**: depois (ou junto) da fase de Fidelidade (skill `fidelity-check`), rode `/impeccable audit` e/ou `/impeccable critique` como uma segunda camada de verificação, especificamente pra pegar os 61 padrões de "cara de IA" que nosso sistema não verifica mecanicamente. Qualquer problema encontrado pelo Impeccable entra na mesma lista de `priority-fixes.md`, com severidade a critério do `/audit` (não é automaticamente P0 como as violações de contrato — julgamento de design tem mais nuance que fidelidade a um valor numérico).
- **`/polish`**: `/impeccable polish` pode ser usado como uma passada final de refinamento, depois que os P0/P1 do `priority-fixes.md` já foram resolvidos.

## Regra importante

Se o Impeccable não estiver instalado no projeto, isso não bloqueia nada do nosso pipeline — ele é um reforço opcional, não uma dependência obrigatória. Nesse caso, siga usando `ANTI-GENERIC.md` e `QUALITY-BAR.md` como estão.

Nunca invente ter rodado um comando do Impeccable se ele não estiver instalado — se tentar usá-lo e a ferramenta não existir, avise o usuário em vez de simular o resultado.
