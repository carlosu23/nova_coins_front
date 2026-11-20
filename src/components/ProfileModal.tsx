import { CheckCircle2, Gamepad2, History, LogOut, Mail, Phone, Plus, ShieldCheck, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { type UserProfile } from '../data/mockUser';

interface ProfileModalProps {
  open: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onTopUpWallet: (amountUsd: number) => void;
  onLogout: () => void;
}

export function ProfileModal({
  open,
  user,
  onClose,
  onTopUpWallet,
  onLogout
}: ProfileModalProps) {
  const [customAmount, setCustomAmount] = useState('');

  if (!open || !user) {
    return null;
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(customAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    onTopUpWallet(Number(parsed.toFixed(2)));
  };

  return (
    <div
      className="nc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de usuario Nova Coins"
    >
      <div className="nc-modal nc-profile-modal">
        <div className="nc-modal-header">
          <div className="nc-modal-game-info">
            <div className="nc-profile-avatar">{initials || 'NC'}</div>
            <div>
              <h3>{user.fullName}</h3>
              <p>{user.role} · Ecuador USD</p>
            </div>
          </div>

          <button type="button" className="nc-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="nc-modal-body">
          <div className="nc-profile-wallet-card">
            <div>
              <span className="nc-profile-wallet-label">
                <Wallet size={14} />
                Billetera Interna en USD
              </span>
              <strong className="nc-mono nc-profile-wallet-balance">
                ${user.walletBalanceUsd.toFixed(2)} USD
              </strong>
            </div>

            <form onSubmit={handleTopUpSubmit} className="nc-wallet-topup-form">
              <div className="nc-wallet-input-wrap">
                <span className="nc-mono">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  aria-label="Monto a fondear en USD"
                  className="nc-mono"
                />
              </div>
              <button type="submit" className="nc-btn nc-btn-gold nc-btn-sm">
                <Plus size={15} />
                <span>Fondear</span>
              </button>
            </form>
          </div>

          <div className="nc-profile-info-grid">
            <div className="nc-profile-info-item">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
            <div className="nc-profile-info-item">
              <Phone size={14} />
              <span className="nc-mono">{user.phone}</span>
            </div>
          </div>

          <div className="nc-profile-section">
            <h4 className="nc-profile-section-title">
              <Gamepad2 size={15} />
              <span>IDs Frecuentes Guardados</span>
            </h4>
            <div className="nc-profile-list">
              {user.savedIds.length === 0 ? (
                <p className="nc-profile-empty">Aún no tienes IDs guardados.</p>
              ) : (
                user.savedIds.map((item) => (
                  <div key={item.id} className="nc-profile-row-card">
                    <div>
                      <strong>
                        {item.accountName ? `${item.accountName} · ` : ''}
                        {item.gameTitle}
                      </strong>
                      <span className="nc-mono">
                        ID: {item.playerId}
                        {item.zoneId ? ` · Zone ${item.zoneId}` : ''}
                        {item.whatsapp ? ` · ${item.whatsapp}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="nc-profile-section">
            <h4 className="nc-profile-section-title">
              <History size={15} />
              <span>Últimas Recargas</span>
            </h4>
            <div className="nc-profile-list">
              {user.recentOrders.length === 0 ? (
                <p className="nc-profile-empty">Sin recargas recientes.</p>
              ) : (
                user.recentOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="nc-profile-row-card">
                    <div>
                      <strong>
                        {order.gameTitle} · {order.packageLabel}
                      </strong>
                      <span>
                        {order.paymentMethod} · {order.dateLabel}
                      </span>
                    </div>
                    <div className="nc-profile-order-right">
                      <strong className="nc-mono nc-price-gold">
                        ${order.amountUsd.toFixed(2)}
                      </strong>
                      <span className="nc-order-status">
                        <CheckCircle2 size={11} />
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="nc-profile-actions">
            <div className="nc-modal-security">
              <ShieldCheck size={14} />
              <span>Saldo y movimientos protegidos en USD</span>
            </div>

            <button type="button" className="nc-btn nc-btn-ghost nc-btn-sm" onClick={onLogout}>
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
