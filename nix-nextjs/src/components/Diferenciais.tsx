/**
 * Diferenciais — Seção de diferenciais e tecnologia da NIX 3D.
 * Idêntico ao <section id="diferenciais" class="section-features"> do HTML original.
 */
export default function Diferenciais() {
  return (
    <section id="diferenciais" className="section-features">
      <div className="container">
        <div className="features-grid">

          <div className="features-intro">
            <span className="kicker">TECNOLOGIA &amp; PROTEÇÃO</span>
            <h2>Mais cuidado com seus filamentos. Mais qualidade para suas impressões.</h2>
            <p>
              Filamentos como Nylon, TPU e PETG são sensíveis à umidade. A NIX desenvolveu a
              primeira solução completa que reúne controle de temperatura e umidade otimizando o
              armazenamento em um só equipamento, ajudando a preservar seus materiais e a qualidade
              das impressões 3D.
            </p>
            <div className="features-badge-box">
              <strong>Padrão Estúdio Maker</strong>
              <span>
                Dry Box para diferentes setups de impressão 3D. Dry Box Station com integração
                exclusiva para Bambu Lab A1 e A2L.
              </span>
            </div>
          </div>

          <div className="features-items">

            <div className="feature-box">
              <h3>Controle inteligente</h3>
              <p>
                Monitoramento digital com controlador STC-3028 e ajustes independentes para
                temperatura e umidade.
              </p>
            </div>

            <div className="feature-box">
              <h3>Estrutura robusta e sofisticada</h3>
              <p>
                Construída em MDF texturizado, com excelente resistência e estabilidade para auxiliar
                na redução de vibrações. Porta em vidro lapidado de 6 mm, unindo um acabamento
                perfeito.
              </p>
            </div>

            <div className="feature-box">
              <h3>Sistema de Circulação de Ar</h3>
              <p>
                Circulação de ar integrada para favorecer a distribuição da temperatura no interior da
                estufa.
              </p>
            </div>

            <div className="feature-box">
              <h3>Desumidificação ativa</h3>
              <p>
                Sistema elétrico de desumidificação que auxilia no controle da umidade interna,
                contribuindo para a conservação dos seus filamentos.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
