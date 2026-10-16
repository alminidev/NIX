/**
 * CtaFinal — Banner de encerramento / CTA final.
 * Idêntico ao <section class="section-cta-final"> do HTML original.
 */
export default function CtaFinal() {
  return (
    <section className="section-cta-final">
      <div className="container">
        <div className="cta-final-box">
          <h2>Pronto para elevar o nível do seu estúdio 3D?</h2>
          <p>
            Elimine as falhas por umidade e organize suas máquinas com o padrão que seu trabalho
            merece.
          </p>
          <a href="#produtos" className="btn-primary">
            Escolher Meu Modelo
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
