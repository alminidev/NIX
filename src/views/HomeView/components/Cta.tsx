import { ArrowRight } from "lucide-react";

/**
 * CtaFinal — Banner de encerramento / CTA final.
 * Idêntico ao <section class="section-cta-final"> do HTML original.
 */
export default function CTA() {
  return (
    <section className="section-cta-final">
      <div className="container">
        <div className="cta-final-box">
          <h2>Pronto para elevar o nível do seu estúdio 3D?</h2>
          <p>
            Elimine as falhas por umidade e organize suas máquinas com o padrão
            que seu trabalho merece.
          </p>
          <a href="#produtos" className="btn-primary">
            Escolher Meu Modelo
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
