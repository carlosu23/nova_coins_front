import { ArrowUpRight, Calculator, Check, Crown, Receipt, Users } from 'lucide-react';

interface ResellerBannerProps {
  isResellerMode: boolean;
  onActivatePreview: () => void;
}

export function ResellerBanner({ isResellerMode, onActivatePreview }: ResellerBannerProps) {
  return (
    <section id="revendedores" className="nc-reseller-section">
      <div className="nc-container">
        <div className="nc-reseller-card">
          <div className="nc-reseller-content">
            <div className="nc-reseller-badge">
              <Crown size={15} />
              <span>MODELO B2B · ACTIVACIÓN AUTOMATIZADA</span>
            </div>

            <h2 className="nc-reseller-title">
              Conviértete en Revendedor con el{' '}
              <span className="nc-gold-text">&ldquo;Método a $10&rdquo;</span>
            </h2>

            <p className="nc-reseller-desc">
              Con un pago único de <strong>$10.00 USD</strong> (vía billetera interna, Binance Pay
              o transferencia), tu cuenta asciende automáticamente a <strong>Revendedor B2B</strong>{' '}
              desbloqueando precios mayoristas de por vida.
            </p>

            <ul className="nc-reseller-perks">
              <li>
                <Check size={16} />
                <span>Lista de precios mayoristas con descuento en todo el catálogo</span>
              </li>
              <li>
                <Calculator size={16} />
                <span>Calculadora de márgenes de ganancia y guardado de IDs frecuentes</span>
              </li>
              <li>
                <Receipt size={16} />
                <span>Comprobantes personalizados para tus propios clientes</span>
              </li>
              <li>
                <Users size={16} />
                <span>Débito instantáneo desde tu Billetera Prepago en USD</span>
              </li>
            </ul>

            <div className="nc-reseller-actions">
              <button type="button" className="nc-btn nc-btn-gold nc-btn-lg" onClick={onActivatePreview}>
                <Crown size={17} />
                <span>
                  {isResellerMode
                    ? 'Tarifa Revendedor Activa en Vista Previa'
                    : 'Simular Precios Revendedor ($10)'}
                </span>
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>

          <div className="nc-reseller-sim">
            <div className="nc-sim-header">
              <span>Ejemplo de Margen B2B</span>
              <span className="nc-sim-tag">Free Fire · 1,060 Diamantes</span>
            </div>

            <div className="nc-sim-rows">
              <div className="nc-sim-row">
                <span>Precio Público Sugerido</span>
                <strong className="nc-mono">$10.90 USD</strong>
              </div>
              <div className="nc-sim-row">
                <span>Costo Mayorista Nova Coins</span>
                <strong className="nc-mono nc-text-cyan">$9.45 USD</strong>
              </div>
              <div className="nc-sim-divider" />
              <div className="nc-sim-row is-profit">
                <span>Tu Ganancia Neta por Venta</span>
                <strong className="nc-mono nc-price-gold">+$1.45 USD</strong>
              </div>
            </div>

            <p className="nc-sim-footnote">
              Con solo 7 recargas recuperas tu activación única de $10 USD.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

