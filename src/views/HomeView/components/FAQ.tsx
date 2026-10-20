import { ChevronDown } from "lucide-react";

const items = [
  {
    pergunta: "Como funciona a entrega por transportadora?",
    resposta:
      'Nossos móveis e estufas são despachados em embalagens técnicas de alta proteção com transportadoras especializadas em cargas sensíveis. Ao clicar em "Comprar", você será direcionado para o checkout onde o frete é calculado de acordo com seu CEP.',
  },
  {
    pergunta: "Quais tipos e marcas de filamentos cabem nas Dry Boxes?",
    resposta:
      "Todos os modelos comportam bobinas padrão universais de 1kg (diâmetro de 200mm) para filamentos de qualquer marca (Bambu Lab, Polymaker, eSun, Creality, 3D Prime). Os modelos de alta capacidade (Dry Box 48) também acomodam bobinas industriais de 2,5kg e 3kg de filamentos.",
  },
  {
    pergunta: "Qual é o consumo elétrico do sistema de controle térmico?",
    resposta:
      "O consumo é ultraeficiente. Uma vez atingida a temperatura e umidade programadas, o isolamento térmico do armário retém o calor e o sistema atua em regime de manutenção, com consumo médio comparável a uma lâmpada LED comum (bivolt automático 110V/220V).",
  },
  {
    pergunta: "Como é feito o pagamento e a segurança da compra?",
    resposta:
      "A transação é processada diretamente pelo gateway seguro da InfinitePay, com criptografia de ponta a ponta e suporte a Pix e cartão de crédito em até 3x sem juros.",
  },
];

/**
 * FAQ — Seção de perguntas frequentes com accordion nativo HTML (<details>/<summary>).
 * Sem estado React necessário — o browser gerencia o accordion nativamente.
 */
export default function FAQ() {
  return (
    <section
      id="faq"
      className="bg-surface-canvas-fog py-16 min-[640px]:py-20 min-[992px]:py-[100px]"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <header className="mx-auto mb-14 max-w-[680px] text-center">
          <span className="mb-3 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
            Dúvidas Frequentes
          </span>
          <h2 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
            Tudo o que você precisa saber antes de pedir o seu.
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-normal text-ink-secondary">
            Transparência total em entrega, dimensões e funcionamento.
          </p>
        </header>

        <div className="mx-auto max-w-[780px]">
          {items.map((item, i) => (
            <details
              key={i}
              className="group mb-3 overflow-hidden rounded-card border border-border-hairline bg-surface-card transition-colors duration-200 ease-nix open:border-[rgba(23,107,255,0.3)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-[1.0625rem] font-semibold text-ink-primary select-none [&::-webkit-details-marker]:hidden">
                <span>{item.pergunta}</span>
                <ChevronDown
                  size={20}
                  className="size-5 shrink-0 text-ink-muted transition-[color,rotate] duration-200 ease-nix group-open:rotate-180 group-open:text-brand-blue"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-[rgba(226,228,232,0.6)] px-6 pt-4 pb-5 text-[0.9375rem] leading-[1.6] text-ink-secondary">
                {item.resposta}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
