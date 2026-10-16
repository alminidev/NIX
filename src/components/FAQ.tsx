/**
 * FAQ — Seção de perguntas frequentes com accordion nativo HTML (<details>/<summary>).
 * Idêntico ao <section id="faq" class="section-faq"> do HTML original.
 * Sem estado React necessário — o browser gerencia o accordion nativamente.
 */
export default function FAQ() {
  const items = [
    {
      pergunta: 'Como funciona a entrega por transportadora?',
      resposta:
        'Nossos móveis e estufas são despachados em embalagens técnicas de alta proteção com transportadoras especializadas em cargas sensíveis. Ao clicar em "Comprar", você será direcionado para o checkout onde o frete é calculado de acordo com seu CEP.',
    },
    {
      pergunta: 'Quais tipos e marcas de filamentos cabem nas Dry Boxes?',
      resposta:
        'Todos os modelos comportam bobinas padrão universais de 1kg (diâmetro de 200mm) para filamentos de qualquer marca (Bambu Lab, Polymaker, eSun, Creality, 3D Prime). Os modelos de alta capacidade (Dry Box 48) também acomodam bobinas industriais de 2,5kg e 3kg de filamentos.',
    },
    {
      pergunta: 'Qual é o consumo elétrico do sistema de controle térmico?',
      resposta:
        'O consumo é ultraeficiente. Uma vez atingida a temperatura e umidade programadas, o isolamento térmico do armário retém o calor e o sistema atua em regime de manutenção, com consumo médio comparável a uma lâmpada LED comum (bivolt automático 110V/220V).',
    },
    {
      pergunta: 'Como é feito o pagamento e a segurança da compra?',
      resposta:
        'A transação é processada diretamente pelo gateway seguro da InfinitePay, com criptografia de ponta a ponta e suporte a Pix e cartão de crédito em até 3x sem juros.',
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
