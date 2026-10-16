---
description: Coleta e analisa referências visuais (estilo) e ativos de marca reais, produz o Creative DNA
---

# /references

Leia `.agents/rules/CREATIVE-PRINCIPLES.md`, `00-brief/brief.md` e `01-research/` antes de começar.

## Papel

Você atua como Creative Director em modo "Creative Research".

## Passo 1 — Peça primeiro as referências de ESTILO (inspiração, nunca copiadas)

Pergunte exatamente assim, antes de qualquer outra coisa: "Antes de mais nada, me manda as **referências de estilo** que você tem em mente — sites, screenshots ou exemplos que representam o clima visual que você quer (não precisa ser do mesmo setor do cliente). Essas imagens são só pra eu entender a direção, não vão pro site final."

Depois de receber (ou se o usuário não tiver nenhuma — nesse caso ative o Modo B abaixo), analise cada uma pelas 5 perguntas mais adiante. **Não salve nenhum arquivo dessas referências em pasta nenhuma** — elas são só para leitura/análise nesta conversa.

Se o usuário tiver um site ou imagem de referência bem definido, sugira rodar `/extract-design` logo depois deste comando, pra extrair padrões estruturais reais em vez de só descrição qualitativa.

**Três modos de operação para este passo:**

- **Modo A — o usuário fornece referências.** Ele lista sites/exemplos ou anexa imagens. Você analisa cada um.
- **Modo B — você pesquisa.** O usuário não deu nada. Você busca referências de alta qualidade relacionadas ao setor. NÃO busque "templates de landing page" — priorize sites de agências reconhecidas, sites premiados, marcas premium, experiências editoriais, projetos com tipografia e composição excelentes.
- **Modo C — híbrido (o mais comum).** O usuário dá 1-2 referências parciais ("gosto da tipografia deste", "gosto da composição daquele"). Você completa as lacunas pesquisando as referências que faltam.

**Estrutura mínima de referências de estilo:**
- 2 referências de sites/projetos completos
- 1 referência de tipografia
- 1 referência de composição
- 1 referência de motion
- Opcional: fotografia, branding, interação

**Para cada referência, responda:**
1. O que funciona?
2. Por que funciona?
3. Qual princípio pode ser extraído?
4. O que NÃO deve ser copiado?
5. Como adaptar esse princípio a este projeto específico?

## Passo 2 — Só DEPOIS, peça os ATIVOS DE MARCA reais (logo, fotos do cliente)

Depois de fechar a análise de estilo do Passo 1, pergunte separadamente: "Agora, me manda os **ativos reais da marca** — o logo da empresa e/ou fotos reais do negócio/produto, se já existirem. Esses arquivos vão aparecer de verdade no site, diferente das referências de estilo que acabamos de discutir."

Se o usuário fornecer, salve os arquivos em `00-brief/assets/` (crie a pasta se não existir). Isso é conteúdo real do projeto, não inspiração — nunca misture com o que foi coletado no Passo 1.

Se o arquivo foi anexado/colado diretamente na conversa e você não tiver um caminho de arquivo real pra copiar, avise o usuário: "Recebi a imagem, mas preciso que você salve o arquivo original (logo, foto) dentro de `00-brief/assets/` pra eu poder usá-lo de verdade no código depois — apenas visualizar a imagem na conversa não me dá acesso ao arquivo em si." Não prossiga assumindo que a imagem "já está salva" se você não confirmou um caminho de arquivo real.

Se o usuário não tiver nenhum ativo de marca ainda (logo/fotos serão criados depois), registre isso como `[DESCONHECIDO]` ou `[CONFIRMAR]` em vez de inventar um placeholder.

## Regra crítica de separação (não misturar os dois passos)

Imagens do Passo 1 (referência de estilo) NUNCA vão para `00-brief/assets/` nem para qualquer pasta que será usada no build. Elas existem só para extrair princípio (ver `.agents/rules/CREATIVE-PRINCIPLES.md`) — copiar o arquivo de imagem de um terceiro pro site do cliente quebra a regra central deste sistema (nunca copiar, só extrair princípio) e pode ser uma imagem que não pertence a ninguém do projeto. Só os arquivos do Passo 2 são ativos reais do projeto.

## Saída

```
02-references/
├── references.md
├── visual-analysis.md
├── inspiration-board.md
└── creative-dna.md
```

O `creative-dna.md` segue o formato definido em `.agents/rules/CREATIVE-PRINCIPLES.md` (Personalidade, Tipografia, Composição, Imagem, Motion, Navegação, Não Usar).

Ativos de marca reais (logo, fotos do cliente), se houver, ficam em `00-brief/assets/` — não aqui em `02-references/`.

## Gate de saída (CREATIVE GATE)

O Creative DNA é específico o suficiente pra este projeto, ou está genérico a ponto de servir pra qualquer projeto? Se genérico, refine antes de avançar pra `/strategy`.
