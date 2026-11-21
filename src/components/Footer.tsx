import { Crown, MessageCircle, ShieldCheck } from 'lucide-react';
import { buildWhatsAppLink } from '../config/env';
import { NovaLogo } from './NovaLogo';

interface FooterProps {
  onOpenResellerModal: () => void;
  onSupportClick: () => void;
}

export function Footer({ onOpenResellerModal, onSupportClick }: FooterProps) {
  const whatsappHref = buildWhatsAppLink('Hola Nova Coins, necesito soporte con una recarga.');

  return (
    <footer className="nc-footer">
      <div className="nc-container nc-footer-grid">
        <div className="nc-footer-brand">
          <NovaLogo variant="full" size={40} />
          <p>
            Recargas y servicios digitales para Ecuador, operando íntegramente en dólares
            estadounidenses (USD). ¡Tu mundo digital en un solo lugar!
          </p>
          <div className="nc-footer-trust">
            <ShieldCheck size={15} />
            <span>Entrega Inmediata · Pagos Seguros USD · Soporte +593</span>
          </div>
        </div>

        <div className="nc-footer-col">
          <h4>Catálogo</h4>
          <a href="#tienda">Free Fire Diamantes</a>
          <a href="#tienda">Blood Strike Oro</a>
          <a href="#tienda">Roblox Gift Cards</a>
          <a href="#tienda">Mobile Legends &amp; PUBG</a>
        </div>

        <div className="nc-footer-col">
          <h4>Ecosistema</h4>
          <a href="#tienda">Billetera Prepago USD</a>
          <a href="#tienda">Binance Pay 1:1</a>
          <a href="#tienda">Deuna! y Banca Ecuador</a>
          <button type="button" className="nc-footer-link-btn" onClick={onOpenResellerModal}>
            <Crown size={13} />
            <span>¿Querés ser Reseller?</span>
          </button>
        </div>

        <div className="nc-footer-col">
          <h4>Atención Ecuador</h4>
          <p className="nc-footer-support-note">
            Validación automática y soporte directo por WhatsApp para pagos locales.
          </p>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="nc-btn nc-btn-ghost nc-btn-sm"
            >
              <MessageCircle size={15} />
              <span>Canal Oficial WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              className="nc-btn nc-btn-ghost nc-btn-sm"
              onClick={onSupportClick}
            >
              <MessageCircle size={15} />
              <span>Canal Oficial WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      <div className="nc-container nc-footer-bottom">
        <span>© 2026 Nova Coins Ecuador. Todos los derechos reservados.</span>
        <span className="nc-mono">MONEDA OFICIAL: USD ($)</span>
      </div>
    </footer>
  );
}
