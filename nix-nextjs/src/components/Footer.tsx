/**
 * Footer — Rodapé da NIX 3D.
 * Idêntico ao <footer id="site-footer" class="site-footer"> do HTML original.
 */
export default function Footer() {
  const whatsappUrl =
    'https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D';

  return (
    <footer id="site-footer" className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-nix.png" alt="Logotipo NIX" width={100} height={30} />
            <p>
              Mobiliário técnico e soluções inteligentes com controle térmico para a comunidade de
              manufatura aditiva e impressão 3D.
            </p>
            <div className="footer-disclaimer-note">
              ⚠️ <strong>Observação Importante:</strong> Imagens ilustrativas. A impressora e os
              filamentos não acompanham o produto.
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
                    href="https://instagram.com/nix_impressoes3d"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram @nix_impressoes3d
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
            © 2026 <strong>NIX 3D</strong>. Todos os direitos reservados. nix3d.
          </p>
          <p>
            Frete a consultar no checkout de acordo com o CEP de destino. Retirada disponível no
            local em São Paulo.
          </p>
        </div>
      </div>
    </footer>
  );
}
