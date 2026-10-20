import { DollarSign, Layers, Lock, Thermometer } from 'lucide-react';

/**
 * Diferenciais — Seção de diferenciais e engenharia da NIX 3D.
 * Idêntico ao <section id="diferenciais" class="section-features"> do HTML original.
 */
export default function Diferenciais() {
  return (
    <section id="diferenciais" className="section-features">
      <div className="container">
        <div className="features-grid">

          <div className="features-intro">
            <span className="kicker">Engenharia &amp; Precisão</span>
            <h2>Desenvolvido para eliminar falhas antes que elas aconteçam.</h2>
            <p>
              Filamentos de engenharia como Nylon, TPU e PETG absorvem umidade do ar em poucas
              horas. A NIX criou a primeira solução completa que une climatização hermética e
              estabilidade física em um único móvel.
            </p>
            <div className="features-badge-box">
              <strong>Padrão Estúdio Maker</strong>
              <span>Compatível com sistemas Bambu Lab (AMS), Creality e impressoras CoreXY.</span>
            </div>
          </div>

          <div className="features-items">

            <div className="feature-box">
              <div className="feature-icon" aria-hidden="true">
                <Thermometer size={22} aria-hidden />
              </div>
              <h3>Controle Térmico Ativo (&lt; 20% UR)</h3>
              <p>
                Display digital com leitura contínua de temperatura e umidade. Desumidificação
                uniforme sem risco de degradar filamentos.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon" aria-hidden="true">
                <Lock size={22} aria-hidden />
              </div>
              <h3>Vedação Estanque Automotiva</h3>
              <p>
                Perfis vedados com guarnições de alta durabilidade e portas com fecho magnético que
                isolam o interior do ar ambiente.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon" aria-hidden="true">
                <DollarSign size={22} aria-hidden />
              </div>
              <h3>Alimentação Direta sem Atrito</h3>
              <p>
                Conectores pneumáticos para tubos PTFE no topo e laterais: imprima direto do móvel
                sem expor o filamento à atmosfera.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon" aria-hidden="true">
                <Layers size={22} aria-hidden />
              </div>
              <h3>Estrutura Rígida em Alumínio</h3>
              <p>
                Projetado para absorver acelerações mecânicas de até 20.000 mm/s² das máquinas
                modernas sem oscilações ou ruídos.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
