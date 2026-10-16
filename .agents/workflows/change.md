---
description: Aplica uma alteração pontual num projeto já entregue, sem refazer etapas anteriores
argument-hint: <descreva a alteração pedida pelo cliente>
---

# /change

Use este comando quando o cliente pedir uma alteração num projeto que já passou por `/ship` (ou mesmo que ainda não tenha passado, mas já está em `05-build/` funcionando). Ele NÃO reinicia o pipeline — é uma manutenção cirúrgica.

## Passo 1 — Entender o pedido

Leia o pedido do cliente/usuário com atenção. Classifique internamente em um destes tipos (não precisa anunciar a classificação, só usá-la pra decidir a profundidade da alteração):

- **Conteúdo** (trocar texto, imagem, telefone, preço, horário) — mudança rápida, direto no código
- **Visual/estilo** (cor, fonte, espaçamento, tamanho de algum elemento específico) — mudança rápida, mas precisa respeitar o `design-system.md` já existente
- **Layout/UX** (mudar ordem de seções, adicionar/remover uma seção, mudar navegação) — precisa reconsultar `04-design/` antes de mexer
- **Funcionalidade nova** (formulário novo, integração, página nova) — trate como um mini-ciclo: pode precisar de uma passagem rápida por art direction/UX antes do código
- **Correção de bug** — não é "mudança", é conserto; corrija sem alterar nada além do necessário

## Passo 1.5 — Checar contra o escopo combinado

Leia `00-brief/escopo.md` (regra completa em `.agents/rules/ESCOPO.md`). Se o pedido claramente adiciona algo fora do combinado (página nova não prevista, funcionalidade não prevista, ou está com o texto "Não incluso" batendo com o pedido), pare antes de implementar e avise o usuário: "Esse pedido parece estar fora do escopo combinado — quer que eu implemente mesmo assim, ou prefere alinhar isso com o cliente antes?" Só prossiga com a confirmação dele.

Se `00-brief/escopo.md` não existir (projetos criados antes desse recurso), pule esta etapa sem travar o fluxo.

## Passo 2 — Ler o contexto antes de tocar em código

Sempre leia, antes de editar:

- `.agents/rules/MASTER-RULES.md` e `.agents/rules/ANTI-GENERIC.md`
- `04-design/design-system.md` (pra não quebrar consistência visual)
- `00-brief/stack-lock.md` (a stack travada vale também pra manutenção)
- O código relevante em `05-build/` (não edite arquivos que não leu)

## Passo 3 — Regra de ouro: mudança mínima e cirúrgica

Nunca aproveite uma alteração pequena pra "melhorar" outras coisas que não foram pedidas. Se você notar um problema não relacionado ao pedido, informe o usuário separadamente — não misture na mesma alteração sem avisar.

Se o pedido do cliente, se atendido literalmente, quebrar a consistência visual ou a Quality Bar (ex: "põe esse texto enorme em vermelho piscando"), não implemente cegamente — explique o risco e sugira uma alternativa que atenda a intenção sem comprometer a qualidade.

## Passo 4 — Registrar a alteração

Depois de aplicar, adicione uma entrada em `08-delivery/changelog.md` (crie o arquivo se não existir) no formato:

```
## [DATA] — [resumo da alteração]
Pedido por: [cliente/usuário]
O que mudou: [descrição objetiva]
Arquivos alterados: [lista]
```

## Passo 5 — Confirmar

Depois de aplicar, descreva pro usuário o que foi alterado em 2-3 frases simples (sem jargão técnico), pra ele poder repassar pro cliente ou validar antes de considerar concluído.
