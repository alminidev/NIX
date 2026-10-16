# Oportunidades e Riscos — NIX

## 1. Oportunidades Estratégicas

### A. Posicionamento de "Linha Aeroespacial / Engenharia Limpa" (DJI Aesthetic Match)
- O consumidor que gasta R$ 10.000 em uma impressora Bambu Lab X1-Carbon tem a mesma mentalidade de quem compra um drone DJI ou um MacBook: valoriza design industrial limpo, engenharia precisa, acabamento fosco e materiais duráveis.
- A referência de design da DJI (hero escuro com iluminação de borda revelando o produto, cards brancos limpos sobre canvas Fog `#ededed`, botão azul pontual de ação) posiciona a NIX não como uma "marcenaria qualquer", mas como uma **marca de engenharia e setup de alta performance**.

### B. Proposta de Valor Clara: "Da Bagunça Térmica ao Setup de Estúdio"
- Nenhum concorrente direto no Brasil comunica essa integração entre **organização do ambiente de trabalho** e **controle ativo de umidade**. A NIX tem a oportunidade de dominar essa narrativa e se tornar sinônimo de categoria (*"Tenho um setup NIX"*).

### C. Clareza na Arquitetura de 5 Produtos
- Com 5 modelos bem definidos no catálogo (diferenciados por capacidade de carretéis, dimensões ou recursos térmicos), a landing page pode guiar o comprador com extrema facilidade de escolha, reduzindo fricção de decisão:
  - Modelo de entrada (compacto / 4 a 6 carretéis)
  - Modelo intermediário (estação para 1 impressora + dry box)
  - Modelo avançado / pro (estação dupla / alta capacidade)
  - Acessórios / módulos de expansão (se aplicável aos 5 itens reais)

---

## 2. Riscos Mapeados e Mitigações

| Risco | Impacto | Mitigação Prática no Front-End / UX |
|---|---|---|
| **Percepção de "móvel comum de marcenaria"** | Perda de valor percebido e resistência ao preço. | Destacar nas seções visuais a tecnologia embarcada: vedação técnica estanque, controle de temperatura/umidade, passagens de tubos PTFE e dados de performance térmica. |
| **Fricção do checkout externo (InfinitePay)** | Abandono no clique do botão "Comprar". | Deixar o fluxo transparente: aviso sutil nos cards ("Frete calculado no checkout") e botão "Comprar" com microinteração de segurança (ícone de cadeado/seta indicando checkout seguro). |
| **Falta de fotos profissionais em alta resolução** | Quebra da barreira estética premium estabelecida pela referência DJI. | Tratar as imagens dos produtos com foco em iluminação de recorte e fundo limpo; manter a estrutura do card neutra e sem molduras decorativas para maximizar a dignidade da foto. |
| **Dúvidas sobre montagem e transporte** | Objeção de entrega de item volumoso. | Incluir na seção de FAQ / Como Funciona respostas claras sobre envio seguro via transportadora e facilidade de montagem/uso imediato (*plug and play*). |

---

## 3. Diretrizes para as Próximas Etapas (/references e /strategy)
1. **Gate Criativo:** A estratégia de copy e hierarquia visual deve comunicar **controle térmico + organização estética**, nunca apenas "guarde seus filamentos".
2. **Estrutura de Vitrine:** Os 5 cards de produtos precisam ter hierarquia limpa (SKU, nome com peso 600, badge de capacidade, preço e botão comprar em azul da marca).
3. **Simplicidade Técnica:** Manter fidelidade absoluta ao `stack-lock.md` — os dados dos 5 produtos serão consumidos de `produtos.js`, gerando a grade de forma limpa e semântica.
