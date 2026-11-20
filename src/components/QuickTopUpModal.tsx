import { CheckCircle2, CreditCard, ShieldCheck, Sparkles, UserCheck, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { type GameItem, type GamePackage, PAYMENT_METHODS } from '../data/catalog';

interface QuickTopUpModalProps {
  game: GameItem | null;
  isResellerMode: boolean;
  walletBalanceUsd?: number;
  onOrderComplete?: (payload: {
    gameTitle: string;
    packageLabel: string;
    playerId: string;
    amountUsd: number;
    paymentMethod: string;
    usedWallet: boolean;
  }) => void;
  onClose: () => void;
}

export function QuickTopUpModal({
  game,
  isResellerMode,
  walletBalanceUsd,
  onOrderComplete,
  onClose
}: QuickTopUpModalProps) {
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<'wallet' | 'binance' | 'ecuador'>('binance');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  if (!game) {
    return null;
  }

  const activePack: GamePackage =
    game.packages.find((p) => p.id === selectedPackId) ??
    game.packages.find((p) => p.popular) ??
    game.packages[0];

  const finalPrice = isResellerMode ? activePack.resellerPriceUsd : activePack.publicPriceUsd;
  const savings = activePack.publicPriceUsd - activePack.resellerPriceUsd;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim()) {
      return;
    }
    const methodName = PAYMENT_METHODS.find((m) => m.id === paymentId)?.name ?? 'Binance Pay';
    onOrderComplete?.({
      gameTitle: game.title,
      packageLabel: activePack.label,
      playerId: playerId.trim(),
      amountUsd: finalPrice,
      paymentMethod: methodName,
      usedWallet: paymentId === 'wallet'
    });
    setOrderSubmitted(true);
  };

  return (
    <div className="nc-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Recargar ${game.title}`}>
      <div className="nc-modal">
        <div className="nc-modal-header">
          <div className="nc-modal-game-info">
            <div className="nc-modal-avatar" style={{ background: game.accentGradient }}>
              {game.shortCode}
            </div>
            <div>
              <h3>{game.title}</h3>
              <p>
                {game.categoryLabel} · {game.deliverySpeed}
              </p>
            </div>
          </div>

          <button type="button" className="nc-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {orderSubmitted ? (
          <div className="nc-order-success">
            <div className="nc-success-ring">
              <CheckCircle2 size={38} />
            </div>
            <h4>Orden Lista para Procesar</h4>
            <p>
              <strong>{activePack.label}</strong> para <strong>{game.title}</strong> ({playerId}
              {game.requiresZoneId && zoneId ? ` · Zone ${zoneId}` : ''})
            </p>
            <div className="nc-success-summary">
              <div>
                <span>Total en USD</span>
                <strong className="nc-mono">${finalPrice.toFixed(2)} USD</strong>
              </div>
              <div>
                <span>Método</span>
                <strong>{PAYMENT_METHODS.find((m) => m.id === paymentId)?.name}</strong>
              </div>
            </div>
            <button
              type="button"
              className="nc-btn nc-btn-primary nc-btn-full"
              onClick={() => {
                setOrderSubmitted(false);
                onClose();
              }}
            >
              Finalizar Vista Previa
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="nc-modal-body">
            <div className="nc-step-block">
              <label className="nc-step-title">
                <span className="nc-step-num">1</span>
                <UserCheck size={15} />
                Ingresa tu {game.inputLabel}
              </label>

              <div className={`nc-input-row ${game.requiresZoneId ? 'has-zone' : ''}`}>
                <input
                  type="text"
                  required
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder={game.inputPlaceholder}
                  className="nc-input"
                />
                {game.requiresZoneId && (
                  <input
                    type="text"
                    required
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder={game.zonePlaceholder}
                    className="nc-input"
                  />
                )}
              </div>
            </div>

            <div className="nc-step-block">
              <span className="nc-step-title">
                <span className="nc-step-num">2</span>
                <Sparkles size={15} />
                Selecciona el paquete ({game.currencyName})
              </span>

              <div className="nc-pack-grid">
                {game.packages.map((pack) => {
                  const isSelected = pack.id === activePack.id;
                  const price = isResellerMode ? pack.resellerPriceUsd : pack.publicPriceUsd;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      className={`nc-pack-item ${isSelected ? 'is-selected' : ''} ${pack.imageUrl ? 'has-media' : ''}`}
                      onClick={() => setSelectedPackId(pack.id)}
                    >
                      {pack.imageUrl && (
                        <div className="nc-pack-media">
                          <img src={pack.imageUrl} alt={pack.label} loading="lazy" />
                        </div>
                      )}
                      <div className="nc-pack-content">
                        <div className="nc-pack-top">
                          <span className="nc-pack-name">{pack.label}</span>
                          {pack.bonus && <span className="nc-pack-bonus">{pack.bonus}</span>}
                        </div>
                        <span className="nc-mono nc-pack-price">${price.toFixed(2)} USD</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="nc-step-block">
              <span className="nc-step-title">
                <span className="nc-step-num">3</span>
                <CreditCard size={15} />
                Método de Pago
              </span>

              <div className="nc-pay-grid">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`nc-pay-item ${paymentId === method.id ? 'is-selected' : ''}`}
                    onClick={() => setPaymentId(method.id)}
                  >
                    <div className="nc-pay-head">
                      <strong>{method.name}</strong>
                      <span className="nc-pay-badge">
                        {method.id === 'wallet' && walletBalanceUsd !== undefined
                          ? `Saldo: $${walletBalanceUsd.toFixed(2)}`
                          : method.badge}
                      </span>
                    </div>
                    <span className="nc-pay-sub">{method.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="nc-modal-footer">
              <div className="nc-modal-total">
                <span>Total a pagar</span>
                <div>
                  <strong className="nc-mono">${finalPrice.toFixed(2)} USD</strong>
                  {isResellerMode && (
                    <small className="nc-savings-note">
                      Ahorras ${savings.toFixed(2)} USD (Precio Reseller)
                    </small>
                  )}
                </div>
              </div>

              <button type="submit" className="nc-btn nc-btn-primary nc-btn-lg">
                <Zap size={17} />
                <span>Confirmar Recarga</span>
              </button>
            </div>

            <div className="nc-modal-security">
              <ShieldCheck size={14} />
              <span>Entrega automática en segundos · Paridad 1:1 USD</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
