# ESCOPO — como preencher 00-brief/escopo.md

Todo projeto criado pelo `/new-project` deve gerar um `00-brief/escopo.md` com este formato, preenchido com o que foi combinado com o cliente:

```
# Escopo do Projeto — [nome do projeto]

## Incluso
- Número de páginas/seções: [preencher]
- Rodadas de revisão inclusas (via /revise): [preencher, ex: 2]
- Responsivo (mobile + desktop): [sim/não]
- Formulário de contato: [sim/não]
- Outros itens combinados: [preencher]

## Não incluso
[o que ficou de fora explicitamente, ou o que costuma ser pedido depois e não está no preço combinado]

## Rodadas de revisão usadas
0 de [N] — atualizado a cada /revise (ver 00-brief/revisions-log.md)
```

Se o usuário não souber ainda o que vai cobrar/incluir no momento do `/new-project`, preencha com `[DESCONHECIDO]` e sinalize que isso deve ser combinado com o cliente antes de avançar pro `/build`.

## Regra de uso — `/change` e `/revise` devem consultar este arquivo

Antes de implementar qualquer pedido do cliente via `/change` ou `/revise`, verifique contra `00-brief/escopo.md`:

- Pedido dentro do combinado → implemente normalmente
- Pedido fora do combinado (página extra, funcionalidade nova, rodada de revisão além do limite) → não implemente direto. Avise: "Esse pedido parece estar fora do escopo combinado (ver `00-brief/escopo.md`) — quer que eu implemente mesmo assim, ou prefere alinhar isso com o cliente antes?"

O objetivo não é travar o atendimento — é fazer a decisão de "cortesia ou cobrar à parte" ser consciente, não automática.
