/**
 * Footer — Rodapé da NIX 3D.
 * Idêntico ao <footer id="site-footer" class="site-footer"> do HTML original.
 */
export default function Footer() {
  const whatsappUrl =
    'https://wa.me/5511941692023?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  return (
    <footer id="site-footer" className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">

            <strong className="footer-brand-logo">NIX</strong>
            <p>
              Soluções inteligentes para armazenamento, conservação e organização de filamentos, desenvolvidos para elevar a experiência de impressão 3D.
            </p>
            <div className="footer-disclaimer-note">
              <strong>Aviso:</strong> Imagens ilustrativas. Impressora e filamentos não inclusos no produto.
            </div>
          </div>

          <div className="footer-nav">
            <div className="footer-col">
              <h4>Navegação</h4>
              <ul>
                <li><a href="#hero">Início</a></li>
                <li><a href="#produtos">Produtos</a></li>
                <li><a href="#diferenciais">Diferenciais</a></li>
                <li><a href="#faq">Dúvidas Frequentes</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Atendimento &amp; Social</h4>
              <ul>
                <li>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Fale com a Nix (WhatsApp)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/nix3d_"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram @nix3d_
                  </a>
                </li>
                <li><span>Retirada no local em São Paulo</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Condições</h4>
              <ul>
                <li><span>Até 3x sem juros</span></li>
                <li><span>Envio para todo o Brasil</span></li>
                <li><span>Checkout Seguro InfinitePay</span></li>
                <li><span>Garantia de Fábrica</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 <strong>NIX 3D</strong>. Todos os direitos reservados.
          </p>
          <p>
            Frete a consultar no checkout de acordo com o CEP de destino. Retirada disponível no
            local em São Paulo.
          </p>
          <p className="footer-credits">
            DESIGN &amp; CODE BY{' '}
            <a
              href="https://www.alministudio.com.br/almini"
              target="_blank"
              rel="noopener noreferrer"
            >
              ALEXANDRE POLETTINI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
