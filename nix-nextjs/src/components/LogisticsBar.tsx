/**
 * LogisticsBar — Seção de informações comerciais e logísticas.
 * Idêntico ao <section class="section-logistics"> do HTML original.
 */
export default function LogisticsBar() {
  const whatsappUrl =
    'https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  return (
    <section className="section-logistics" aria-label="Informações Comerciais e Logísticas">
      <div className="container">
        <div className="logistics-grid">

          <div className="logistics-card">
            <div className="logistics-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="logistics-content">
              <h3>Envio para Todo o Brasil</h3>
              <p>Enviamos para todo o Brasil (Frete a consultar no checkout).</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="logistics-content">
              <h3>Até 3x Sem Juros</h3>
              <p>Pagamento facilitado em até 3x sem juros no cartão de crédito.</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="logistics-content">
              <h3>Retirada no Local</h3>
              <p>Disponível para retirada no local em São Paulo.</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div className="logistics-content">
              <h3>Instagram &amp; Contato</h3>
              <p>
                <a
                  href="https://instagram.com/nix_impressoes3d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-social"
                >
                  @nix_impressoes3d
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
