---
description: Mostra o status de todos os projetos na pasta atual — em qual etapa cada um está e o que está pendente
---

# /status

Use este comando na pasta "guarda-chuva" (ex: `Projetos/`), não dentro de um projeto específico.

## O que fazer

1. Liste todas as subpastas de projeto (cada uma com estrutura `00-brief/` até `08-delivery/`)
2. Para cada projeto, verifique:
   - Qual é a última pasta numerada que tem conteúdo (indica em que etapa do pipeline ele parou)
   - A data de modificação mais recente entre os arquivos do projeto (indica há quanto tempo está parado)
   - Se `00-brief/questions.md` tem perguntas em aberto sem resposta registrada — sinal de "esperando o cliente responder algo"
   - Se `00-brief/escopo.md` existe e está com campos `[DESCONHECIDO]` — sinal de "escopo não fechado com o cliente"

3. Apresente um resumo em tabela:

| Projeto | Etapa atual | Última atividade | Pendências |
|---|---|---|---|
| oficina-lucy | 04-design | há 3 dias | aguardando aprovação de referências |
| outro-cliente | 00-brief | há 12 dias | 2 perguntas sem resposta em questions.md |

4. Destaque no final quais projetos estão parados há mais tempo (sem julgar o motivo — só informar), pra você decidir se vale dar um follow-up com o cliente.

## Regra

Este comando é só leitura — nunca crie, edite ou apague nenhum arquivo ao rodá-lo.
