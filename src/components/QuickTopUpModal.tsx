import { CheckCircle2, CreditCard, ShieldCheck, Sparkles, Upload, UserCheck, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type GameItem, type GamePackage } from '../data/catalog';
import { createUserSocket, fetchActiveChannels, type PublicPaymentChannel } from '../services/api';
import { type UserOrder } from '../types/user';

interface QuickTopUpModalProps {
  game: GameItem | null;
  isAuthenticated: boolean;
  isResellerMode: boolean;
  walletBalanceUsd?: number;
  onRequireAuth: () => void;
  onOrderComplete: (payload: {
    packageId: string;
    gameTitle: string;
    packageLabel: string;
    playerId: string;
    zoneId?: string;
    amountUsd: number;
    paymentMethod: string;
    referenceCode?: string;
    proofImage?: string;
    usedWallet: boolean;
  }) => Promise<UserOrder>;
  onClose: () => void;
}

export function QuickTopUpModal({
  game,
  isAuthenticated,
  isResellerMode,
  walletBalanceUsd,
  onRequireAuth,
  onOrderComplete,
  onClose
}: QuickTopUpModalProps) {
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [proofImage, setProofImage] = useState<string | undefined>(undefined);
  const [proofFileName, setProofFileName] = useState('');
  const [channels, setChannels] = useState<PublicPaymentChannel[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>(isAuthenticated ? 'wallet' : '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<UserOrder | null>(null);

  useEffect(() => {
    if (!game) {
      return;
    }
    fetchActiveChannels()
      .then((res) => {
        const list = res.channels ?? [];
        setChannels(list);
        setPaymentId((curr) => {
          if (curr === 'wallet' && isAuthenticated) {
            return 'wallet';
          }
          if (curr && list.some((c) => c.id === curr)) {
            return curr;
          }
          return isAuthenticated ? 'wallet' : list[0]?.id ?? '';
        });
      })
      .catch(() => {});

    const socket = createUserSocket();
    socket.on('catalog:channels', (payload: { channels: PublicPaymentChannel[] }) => {
      if (payload?.channels) {
        setChannels(payload.channels);
        setPaymentId((curr) => {
          if (curr === 'wallet') {
            return 'wallet';
          }
          if (payload.channels.some((c) => c.id === curr)) {
            return curr;
          }
          return payload.channels[0]?.id ?? (isAuthenticated ? 'wallet' : '');
        });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [game, isAuthenticated]);

  if (!game) {
    return null;
  }

  const activePack: GamePackage =
    game.packages.find((p) => p.id === selectedPackId) ??
    game.packages.find((p) => p.popular) ??
    game.packages[0];

  const finalPrice = isResellerMode ? activePack.resellerPriceUsd : activePack.publicPriceUsd;
  const savings = activePack.publicPriceUsd - activePack.resellerPriceUsd;
  const selectedChannel = channels.find((c) => c.id === paymentId) ?? null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProofImage(undefined);
      setProofFileName('');
      return;
    }
    if (file.size > 1_100_000) {
      setErrorMessage('El comprobante debe pesar menos de 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
        setProofFileName(file.name);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!playerId.trim()) {
      return;
    }
    if (game.requiresZoneId && !zoneId.trim()) {
      return;
    }
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    const usedWallet = paymentId === 'wallet';
    const methodName = usedWallet
      ? 'Billetera Nova USD'
      : selectedChannel?.name ?? channels[0]?.name ?? 'Transferencia';

    if (!usedWallet && !selectedChannel && channels.length === 0) {
      setErrorMessage('No hay medios de cobro externos activos en este momento.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await onOrderComplete({
        packageId: activePack.id,
        gameTitle: game.title,
        packageLabel: activePack.label,
        playerId: playerId.trim(),
        zoneId: game.requiresZoneId ? zoneId.trim() : undefined,
        amountUsd: finalPrice,
        paymentMethod: methodName,
        referenceCode: !usedWallet ? referenceCode.trim() || undefined : undefined,
        proofImage: !usedWallet ? proofImage : undefined,
        usedWallet
      });
      setCreatedOrder(order);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo registrar la orden.');
    } finally {
      setSubmitting(false);
    }
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

        {createdOrder ? (
          <div className="nc-order-success">
            <div className="nc-success-ring">
              <CheckCircle2 size={38} />
            </div>
            <h4>
              {createdOrder.status === 'Pendiente'
                ? 'Orden Registrada · Pendiente de Validación'
                : 'Orden Confirmada'}
            </h4>
            <p>
              Orden <strong className="nc-mono">{createdOrder.id}</strong> ·{' '}
              <strong>{createdOrder.packageLabel}</strong> para{' '}
              <strong>{createdOrder.gameTitle}</strong> ({createdOrder.playerId})
            </p>
            <div className="nc-success-summary">
              <div>
                <span>Total en USD</span>
                <strong className="nc-mono">${createdOrder.amountUsd.toFixed(2)} USD</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{createdOrder.status}</strong>
              </div>
            </div>
            <button
              type="button"
              className="nc-btn nc-btn-primary nc-btn-full"
              onClick={() => {
                setCreatedOrder(null);
                onClose();
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="nc-modal-body">
            {errorMessage && (
              <div className="nc-auth-error" role="alert">
                {errorMessage}
              </div>
            )}

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
                <button
                  type="button"
                  className={`nc-pay-item ${paymentId === 'wallet' ? 'is-selected' : ''}`}
                  onClick={() => {
                    setPaymentId('wallet');
                    setErrorMessage(null);
                  }}
                >
                  <div className="nc-pay-head">
                    <strong>Billetera Nova USD</strong>
                    <span className="nc-pay-badge">
                      {walletBalanceUsd !== undefined
                        ? `Saldo: $${walletBalanceUsd.toFixed(2)}`
                        : '0% Comisión'}
                    </span>
                  </div>
                  <span className="nc-pay-sub">Compra en 1 clic con tu saldo USD</span>
                </button>

                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    className={`nc-pay-item ${paymentId === ch.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setPaymentId(ch.id);
                      setErrorMessage(null);
                    }}
                  >
                    <div className="nc-pay-head">
                      <strong>{ch.name}</strong>
                      <span className="nc-pay-badge">{ch.priority}</span>
                    </div>
                    <span className="nc-pay-sub">{ch.accountDetail}</span>
                  </button>
                ))}
              </div>

              {paymentId !== 'wallet' && selectedChannel && (
                <div className="nc-field-group" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="nc-reseller-sim" style={{ padding: 10, fontSize: '0.78rem', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {selectedChannel.qrImage && (
                      <img
                        src={selectedChannel.qrImage}
                        alt={`QR ${selectedChannel.name}`}
                        style={{
                          width: 112,
                          height: 112,
                          borderRadius: 10,
                          objectFit: 'contain',
                          background: '#ffffff',
                          padding: 4,
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <strong style={{ display: 'block', marginBottom: 4 }}>{selectedChannel.name}</strong>
                      <span style={{ opacity: 0.9 }}>{selectedChannel.accountDetail}</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="Número de comprobante o referencia (opcional)"
                    className="nc-input"
                  />
                  <label className="nc-btn nc-btn-ghost nc-btn-sm" style={{ cursor: 'pointer', justifyContent: 'flex-start' }}>
                    <Upload size={14} />
                    <span>{proofFileName ? `Adjunto: ${proofFileName}` : 'Adjuntar captura de comprobante (opcional)'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
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

              <button type="submit" disabled={submitting} className="nc-btn nc-btn-primary nc-btn-lg">
                <Zap size={17} />
                <span>
                  {submitting
                    ? 'Procesando...'
                    : isAuthenticated
                      ? 'Confirmar Recarga'
                      : 'Ingresar para Comprar'}
                </span>
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
