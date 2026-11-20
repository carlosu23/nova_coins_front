import { ArrowUpRight, Calculator, Check, Crown, Receipt, Users, X } from 'lucide-react';

interface ResellerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmAction: () => void;
}

export function ResellerModal({ open, onClose, onConfirmAction }: ResellerModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="nc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Programa de Revendedores Nova Coins"
    >
      <div className="nc-modal nc-reseller-modal">
        <div className="nc-modal-header">
          <div className="nc-modal-game-info">
            <div className="nc-reseller-icon-badge">
              <Crown size={22} />
            </div>
            <div>
              <h3>Programa Revendedor B2B</h3>
              <p>Activación automatizada · Método a $10 USD</p>
            </div>
          </div>

          <button type="button" className="nc-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="nc-modal-body">
          <p className="nc-reseller-desc">
            Con un pago único de <strong>$10.00 USD</strong> (vía billetera interna, Binance Pay o
            transferencia), tu cuenta asciende automáticamente a <strong>Revendedor B2B</strong>{' '}
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
          </div>

          <button
            type="button"
            className="nc-btn nc-btn-gold nc-btn-lg nc-btn-full"
            onClick={onConfirmAction}
          >
            <Crown size={17} />
            <span>Activar Cuenta Revendedor ($10 USD)</span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

