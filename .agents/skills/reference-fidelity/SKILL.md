---
name: reference-fidelity
description: Use sempre que o usuário enviar link, URL ou print de um site como referência visual ou de comportamento para um projeto. Analisa o site de verdade (browser, CSS computado, animações), recomenda o stack de animação, e gera um reference-spec.md com valores numéricos que o /build deve seguir como contrato. Nunca copia cor, marca ou conteúdo.
---

# Reference Fidelity

## Quando ativar
- O usuário colou uma URL ou print dizendo "quero algo assim", "me baseie nesse site" ou similar.
- Várias referências no mesmo pedido: processe uma por vez e anote o que o usuário quer de cada uma.
- Link e print juntos: o link é a fonte das medições; o print indica o recorte que o usuário quer aproveitar.

## Passo 1: entender o que ele quer da referência
Se não estiver claro, pergunte em UMA mensagem o que ele quer aproveitar (layout, tipografia, animação, scroll, navegação, ritmo de espaçamento). Não assuma que é para copiar tudo.

## Passo 2: inspecionar de verdade
Abra a URL no browser em desktop (1440px) e mobile (390px). Tire screenshots de cada seção. Não descreva de memória nem por impressão. Extraia:
- Tipografia: famílias, pesos, tamanhos (px e clamp, se houver), line-height, letter-spacing, por nível (h1, h2, corpo, label)
- Espaçamento: padding de seções, gaps, escala usada (ex: múltiplos de 8)
- Grid: colunas, gutter, largura máxima, assimetrias, breakpoints
- Motion: duração, easing, delay, stagger, e o gatilho de cada animação (load, scroll, hover)
- Scroll: smooth scroll, parallax, pin/sticky, scroll-triggered. Identifique bibliotecas (GSAP, Lenis, Locomotive, Framer Motion, Three.js etc.) pelos scripts carregados
- Componentes: header, botões, cards, cursor, transições de página (estados normal e hover)

## Passo 3: cor é separada
NUNCA extraia a paleta como decisão. Cor é identidade de marca. Pergunte ao usuário: "Já existe paleta da marca ou devo sugerir uma?". Só registre a lógica de uso (contraste, quantidade de cores, uso de acento).

## Passo 4: gravar o contrato
Crie `00-brief/reference-spec.md` com:
1. URL e o que foi aproveitado dela
2. Tabela de valores numéricos por categoria (Passo 2)
3. Princípios (ex: "hero ocupa 100vh com tipografia gigante e muito respiro")
4. Lista "NÃO copiar": marca, textos, imagens, ilustrações, cores
5. Recomendação de stack de animação (Passo 4b)

Valores têm que ser números. Se não conseguir medir algo, escreva "não medido" em vez de inventar.

## Passo 4b: recomendação de stack para animação
Com base nas animações medidas no Passo 2, classifique a complexidade (simples, intermediária ou avançada) e recomende:
- Vanilla (CSS/JS puro) ou biblioteca específica
- Justificativa em 1-2 linhas: qual efeito exige a biblioteca
- Custo: peso aproximado em KB e impacto em mobile
- O que se perde se ficar em vanilla (ex: "o pin da seção 3 vira sticky simples, sem scrub")

Critério de referência:
- Hover, fade-in, transições simples, position: sticky, animation-timeline do CSS, IntersectionObserver: vanilla
- Smooth scroll com inércia: vanilla é possível, mas Lenis compensa pelo peso baixo
- Timelines encadeadas, pin de seção, scrub atrelado ao scroll, texto dividido em letras ou linhas: GSAP + ScrollTrigger
- Transições entre páginas: GSAP, Barba.js ou View Transitions API (se só navegador moderno)
- WebGL, 3D, shaders: Three.js, avisando do peso e do aumento de esforço

Apresente a recomendação ao usuário e AGUARDE a decisão. Só depois grave no stack-lock.md. NUNCA introduza biblioteca sem aprovação explícita. Se o usuário mantiver vanilla, registre no reference-spec.md quais efeitos serão simplificados.

## Passo 5: verificar depois do /build
Quando o build estiver pronto, tire screenshots nos mesmos tamanhos e compare lado a lado com a referência. Liste os desvios (tipografia, espaçamento, timing, comportamento). Desvio do spec ou do stack aprovado é P0 no /audit.

## Regras
- Extraia princípio e padrão, nunca clone marca ou conteúdo.
- Se o site bloquear acesso ou o CSS estiver ofuscado, avise o usuário e peça prints; não preencha com suposição.
- Nunca declare "fiel à referência" sem ter feito o Passo 5.