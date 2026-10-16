---
description: Inicia um novo projeto — coleta brief (ou extrai de briefing colado) e cria a estrutura de pastas
argument-hint: <nome ou tipo do projeto, opcional>
---

# /new-project

Sempre leia `.agents/rules/MASTER-RULES.md`, `.agents/rules/WORKFLOW.md` antes de executar este comando.

## Passo 0 — sempre pergunte, nunca decida sozinho (sobre pastas)

Antes de qualquer outra pergunta, pergunte exatamente isto ao usuário:

"Vou criar uma subpasta pra este projeto dentro de `[nome da pasta atual]`, com o nome do projeto (ex: `oficina-lucy/`). Confirma? Ou você já está com a pasta certa aberta e quer que eu use ela direto, sem criar subpasta?"

Nunca presuma a resposta com base no conteúdo da pasta (vazia, com outros projetos, etc). Esta decisão é sempre do usuário, não do agente.

## Passo 0.5 — pergunte se já existe um briefing pronto

Antes das 11 perguntas abaixo, pergunte: "Você já tem um briefing pronto (texto, documento, e-mail do cliente) pra colar aqui, ou prefere responder algumas perguntas rápidas comigo?"

- Se o usuário colar um briefing existente: extraia dele o máximo de informação possível para as 11 perguntas abaixo. Nunca infira silenciosamente o que não estiver explícito no texto — marque como `[CONFIRMAR]` ou `[DESCONHECIDO]` qualquer pergunta que o briefing colado não responda claramente, e pergunte só essas ao usuário (não repita as que já foram respondidas pelo texto colado).
- Se o usuário não tiver briefing pronto: siga com a entrevista completa, pergunta por pergunta, normalmente.

## O que fazer

Pergunte ao usuário (uma pergunta de cada vez, não um formulário longo de uma vez — a menos que várias já tenham sido respondidas pelo briefing colado no Passo 0.5, nesse caso pule direto para o que falta):

1. Nome do projeto? (o usuário pode escrever o nome que quiser — vira o nome da pasta, em minúsculas e sem espaços/acentos, ex: "Oficina Lucy" → `oficina-lucy`)
2. Cliente?
3. Tipo de projeto? (landing page, site institucional, SaaS, e-commerce, portfólio, dashboard, web app, campanha, branding, apresentação)
4. Objetivo do projeto?
5. Público-alvo?
6. Prazo?
7. Tecnologia obrigatória do projeto? **Preferência padrão do usuário: HTML5, CSS3 e JavaScript puro (vanilla), sem framework — evite React, Next.js, Vue, Angular, Tailwind, Bootstrap ou qualquer outro framework/biblioteca por padrão.** Pergunte assim: "Por padrão eu uso HTML/CSS/JS puro, sem framework — serve pra esse projeto, ou esse caso específico precisa de outra stack (ex: um sistema mais complexo que realmente precise de React/Next.js)?" Só saia do padrão se o usuário confirmar explicitamente que este projeto precisa de algo diferente. Isso vira uma trava — nenhuma tecnologia fora do combinado (padrão ou exceção confirmada) poderá ser usada depois, nem mesmo se o agente de build achar outra opção "melhor".
8. Já existem referências visuais que o cliente gosta?
9. Já existe identidade visual (logo, cores, fontes) definida?
10. Quantas rodadas de revisão de direção (via `/revise`) estão incluídas no valor combinado com o cliente? (se ainda não decidiu, pode responder "decidir depois", mas sinalize isso como pendente)
11. Existe algo que o cliente já pediu ou pode vir a pedir que você sabe que NÃO está incluso no valor combinado? (ex: criação de textos, fotos profissionais, páginas extras, manutenção mensal)

Se o usuário já tiver escrito o nome do projeto junto do comando (ex: `/new-project Oficina Lucy`), não pergunte de novo — use isso como resposta à pergunta 1 e siga direto para a pergunta 2.

## Classificação do tipo de projeto

Com base na resposta 3, registre o tipo de projeto em `00-brief/brief.md` (ex: "Tipo: site institucional"). O tipo de projeto serve pra calibrar decisões nas etapas seguintes (ex: um dashboard tem prioridades diferentes de uma landing page).

## Regra crítica

Nunca preencher informações que o cliente não forneceu como se fossem fatos. Toda suposição deve ser marcada:

`[HIPÓTESE]` — algo que você está assumindo, precisa validar
`[CONFIRMAR]` — pergunta pendente pro cliente/usuário
`[DESCONHECIDO]` — informação que falta e impede avançar com segurança

## Saída

Este passo é obrigatório e não pode ser pulado ou deixado "implícito": crie fisicamente, uma por uma, TODAS as pastas abaixo (na raiz atual, ou dentro da subpasta do projeto, conforme decidido no Passo 0) — mesmo as que ainda não têm nenhum conteúdo:

```
00-brief/
01-research/
02-references/
03-strategy/
04-design/
05-build/
06-audit/
07-polish/
08-delivery/
```

Para as pastas que ainda não têm arquivo nenhum (`01-research/` até `08-delivery/`), crie dentro de cada uma um arquivo vazio chamado `.gitkeep` — isso garante que a pasta seja criada de verdade no sistema de arquivos, e não só "planejada". Use comandos de terminal para garantir que isso aconteça, não deixe como uma intenção descrita em texto.

Depois de criar todas as 9 pastas, confirme a criação listando o conteúdo da pasta do projeto e mostre ao usuário que as 9 pastas existem.

Preencha `00-brief/brief.md` com as respostas coletadas (marcando hipóteses) e `00-brief/questions.md` com as perguntas ainda em aberto.

Preencha também `00-brief/escopo.md`, seguindo o formato descrito em `.agents/rules/ESCOPO.md`, com as respostas das perguntas 10 e 11.

Preencha também `00-brief/stack-lock.md`, seguindo o formato descrito em `.agents/rules/DECISION-CONTRACT.md`, com a resposta da pergunta 7 transformada numa lista explícita de "Permitido" e "Proibido". Esta trava vale a partir de agora — nenhum comando posterior (`/build`, `/change`, `/revise`) pode introduzir tecnologia fora dessa lista sem antes voltar aqui e perguntar ao usuário.

Não avance para `/research` automaticamente — aguarde o comando explícito.
