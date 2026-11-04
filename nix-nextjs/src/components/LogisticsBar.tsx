/**
 * LogisticsBar — Seção de informações comerciais e logísticas.
 * Idêntico ao <section class="section-logistics"> do HTML original.
 */
export default function LogisticsBar() {
  const whatsappUrl =
    'https://wa.me/5511941692023?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  return (
    <section className="section-logistics" aria-label="Informações Comerciais e Logísticas">
      <div className="container">
        <div className="logistics-grid">

          <div className="logistics-card">
            <div className="logistics-content">
              <h3>Envio para Todo o Brasil</h3>
              <p>Enviamos para todo o Brasil (Frete a consultar).</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-content">
              <h3>Até 3x Sem Juros</h3>
              <p>Pagamento facilitado em até 3x sem juros no cartão de crédito.</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-content">
              <h3>Retirada no Local</h3>
              <p>Disponível para retirada no local em São Paulo.</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-content">
              <h3>Instagram &amp; Contato</h3>
              <p>
                <a
                  href="https://www.instagram.com/nix3d_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-social"
                >
                  @nix3d_
                </a>{' '}
                •{' '}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-social"
                >
                  Fale com a Nix
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
