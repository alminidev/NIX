/**
 * FAQ — Seção de perguntas frequentes com accordion nativo HTML (<details>/<summary>).
 * Idêntico ao <section id="faq" class="section-faq"> do HTML original.
 * Sem estado React necessário — o browser gerencia o accordion nativamente.
 */
export default function FAQ() {
  const items = [
    {
      pergunta: 'Quais filamentos posso armazenar na Dry Box?',
      resposta:
        'A Dry Box foi desenvolvida para armazenar diferentes tipos de filamentos utilizados na impressão 3D, incluindo PLA, ABS, PETG, TPU e Nylon.',
    },
    {
      pergunta: 'Quais as marcas de filamentos que cabem na Dry Box?',
      resposta:
        'Todos os modelos comportam bobinas de padrão universal de 1kg (diâmetro de 200mm) para filamentos de qualquer marca (Bambu Lab, Polymaker, eSun, Creality, 3D Prime). Os modelos de alta capacidade (Dry Box 48 ou 64) também acomodam bobinas industriais de 2,5kg e 3kg de filamentos.',
    },
    {
      pergunta: 'Qual é o consumo elétrico do sistema de controle térmico?',
      resposta:
        'É utilizado o sistema de aquecimento por PTC, uma tecnologia de última geração que proporciona aquecimento eficiente com baixo consumo de energia. Em testes com funcionamento contínuo de 24 horas, o consumo mensal estimado foi de aproximadamente 40 kWh.',
    },
    {
      pergunta: 'A Dry Box Station é compatível com quais impressoras?',
      resposta:
        'A Dry Box Station foi desenvolvida especialmente para as impressoras Bambu Lab A1 e A2L, permitindo integrar o AMS ao interior da estufa e ampliar a capacidade de armazenamento de filamentos. Porém, nada impede a utilização de outros modelos ou marcas de impressoras compatíveis com o tamanho da mesa.',
    },
    {
      pergunta: 'Quais são as formas de pagamento?',
      resposta:
        'O pagamento é processado pela InfinitePay, em ambiente seguro. Aceitamos Pix e cartão de crédito em até 3x sem juros.',
    },
    {
      pergunta: 'Os produtos possuem garantia?',
      resposta:
        'Sim! Nossos produtos possuem garantia de 90 dias contra defeitos de fabricação, conforme as condições descritas no manual de instruções. Também possuímos equipamentos de substituição caso necessário.',
    },
    {
      pergunta: 'Posso solicitar suporte após a compra?',
      resposta:
        'Claro! Nossa equipe está disponível para auxiliar com dúvidas sobre instalação, configuração e utilização dos produtos. Entre em contato pelo nosso canal de atendimento.',
    },
  ];

  return (
    <section id="faq" className="section-faq">
      <div className="container">
        <header className="section-header">
          <span className="kicker">Dúvidas Frequentes</span>
          <h2>Tudo o que você precisa saber antes de pedir o seu.</h2>
          <p>Transparência total em entrega, dimensões e funcionamento.</p>
        </header>

        <div className="faq-wrapper">
          {items.map((item, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-summary">
                <span>{item.pergunta}</span>
                <svg className="faq-chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="faq-content">{item.resposta}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
