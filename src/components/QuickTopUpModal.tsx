import { CheckCircle2, CreditCard, ShieldCheck, Sparkles, Upload, UserCheck, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type GameItem, type GamePackage } from '../data/catalog';
import {
  createUserSocket,
  fetchActiveChannels,
  type PublicPaymentChannel,
  validatePlayerRequest
} from '../services/api';
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
    targetPayload?: Record<string, string>;
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
  const [targetValues, setTargetValues] = useState<Record<string, string>>({});
  const [referenceCode, setReferenceCode] = useState('');
  const [proofImage, setProofImage] = useState<string | undefined>(undefined);
  const [proofFileName, setProofFileName] = useState('');
  const [channels, setChannels] = useState<PublicPaymentChannel[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>(isAuthenticated ? 'wallet' : '');
  const [submitting, setSubmitting] = useState(false);
  const [validatingPlayer, setValidatingPlayer] = useState(false);
  const [playerValidation, setPlayerValidation] = useState<{
    status: 'valid' | 'invalid' | 'unverified';
    playerName: string | null;
    reason: string | null;
  } | null>(null);
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
    game.packages.find((p) => p.popular && p.inStock !== false) ??
    game.packages.find((p) => p.inStock !== false) ??
    game.packages[0];

  const dynamicSchema = activePack.targetSchema && activePack.targetSchema.length > 0 ? activePack.targetSchema : null;
  const finalPrice = isResellerMode ? activePack.resellerPriceUsd : activePack.publicPriceUsd;
  const savings = activePack.publicPriceUsd - activePack.resellerPriceUsd;
  const selectedChannel = channels.find((c) => c.id === paymentId) ?? null;

  const resolveTargetSubmission = () => {
    if (dynamicSchema) {
      const payload: Record<string, string> = {};
      for (const field of dynamicSchema) {
        const val = String(targetValues[field.key] ?? '').trim();
        if (val) {
          payload[field.key] = val;
        }
      }
      const primaryField = dynamicSchema.find((f) => !/zone|server|region/i.test(f.key)) ?? dynamicSchema[0];
      const zoneField = dynamicSchema.find((f) => /zone|server|region/i.test(f.key));
      return {
        playerId: primaryField ? String(payload[primaryField.key] ?? '') : '',
        zoneId: zoneField ? payload[zoneField.key] : undefined,
        targetPayload: Object.keys(payload).length > 0 ? payload : undefined
      };
    }
    return {
      playerId: playerId.trim(),
      zoneId: game.requiresZoneId ? zoneId.trim() || undefined : undefined,
      targetPayload: undefined
    };
  };

  const handleValidatePlayer = async () => {
    const resolved = resolveTargetSubmission();
    if (!resolved.playerId || validatingPlayer) {
      return;
    }
    setValidatingPlayer(true);
    setPlayerValidation(null);
    try {
      const res = await validatePlayerRequest({
        packageId: activePack.id,
        playerId: resolved.playerId,
        zoneId: resolved.zoneId,
        targetPayload: resolved.targetPayload
      });
      setPlayerValidation(res);
    } catch {
      setPlayerValidation({ status: 'unverified', playerName: null, reason: 'error' });
    } finally {
      setValidatingPlayer(false);
    }
  };

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

    if (activePack.inStock === false) {
      setErrorMessage('Este paquete no tiene stock disponible en este momento.');
      return;
    }

    const resolved = resolveTargetSubmission();
    if (dynamicSchema) {
      for (const field of dynamicSchema) {
        if (field.required && !String(targetValues[field.key] ?? '').trim()) {
          setErrorMessage(`Completa el campo requerido: ${field.label}.`);
          return;
        }
      }
    } else {
      if (!resolved.playerId) {
        return;
      }
      if (game.requiresZoneId && !resolved.zoneId) {
        return;
      }
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
        playerId: resolved.playerId,
        zoneId: resolved.zoneId,
        targetPayload: resolved.targetPayload,
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
                {dynamicSchema ? 'Datos requeridos de tu cuenta' : `Ingresa tu ${game.inputLabel}`}
              </label>

              {dynamicSchema ? (
                <div className={`nc-input-row ${dynamicSchema.length > 1 ? 'has-zone' : ''}`}>
                  {dynamicSchema.map((field) =>
                    field.type === 'select' && field.options && field.options.length > 0 ? (
                      <select
                        key={field.key}
                        required={field.required}
                        value={targetValues[field.key] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTargetValues((prev) => ({ ...prev, [field.key]: val }));
                          setPlayerValidation(null);
                        }}
                        className="nc-input"
                        aria-label={field.label}
                      >
                        <option value="">{field.placeholder || `Selecciona ${field.label}`}</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        key={field.key}
                        type={field.type === 'email' ? 'email' : 'text'}
                        required={field.required}
                        value={targetValues[field.key] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTargetValues((prev) => ({ ...prev, [field.key]: val }));
                          setPlayerValidation(null);
                        }}
                        placeholder={field.placeholder || field.label}
                        className="nc-input"
                        aria-label={field.label}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className={`nc-input-row ${game.requiresZoneId ? 'has-zone' : ''}`}>
                  <input
                    type="text"
                    required
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      setPlayerValidation(null);
                    }}
                    placeholder={game.inputPlaceholder}
                    className="nc-input"
                  />
                  {game.requiresZoneId && (
                    <input
                      type="text"
                      required
                      value={zoneId}
                      onChange={(e) => {
                        setZoneId(e.target.value);
                        setPlayerValidation(null);
                      }}
                      placeholder={game.zonePlaceholder}
                      className="nc-input"
                    />
                  )}
                </div>
              )}

              {(game.category === 'topup' || activePack.requiresTarget) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="nc-btn nc-btn-ghost nc-btn-sm"
                    disabled={validatingPlayer || !resolveTargetSubmission().playerId}
                    onClick={handleValidatePlayer}
                  >
                    {validatingPlayer ? 'Verificando...' : 'Verificar ID'}
                  </button>
                  {playerValidation && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color:
                          playerValidation.status === 'valid'
                            ? '#86efac'
                            : playerValidation.status === 'invalid'
                              ? '#fca5a5'
                              : '#cbd5e1'
                      }}
                    >
                      {playerValidation.status === 'valid'
                        ? `Cuenta válida${playerValidation.playerName ? `: ${playerValidation.playerName}` : ''}`
                        : playerValidation.status === 'invalid'
                          ? 'ID no encontrado para este juego'
                          : 'Verificación automática no disponible para este SKU'}
                    </span>
                  )}
                </div>
              )}
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
                  const outOfStock = pack.inStock === false;
                  const price = isResellerMode ? pack.resellerPriceUsd : pack.publicPriceUsd;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      disabled={outOfStock}
                      className={`nc-pack-item ${isSelected ? 'is-selected' : ''} ${pack.imageUrl ? 'has-media' : ''}`}
                      style={outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
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
                          {outOfStock ? (
                            <span className="nc-pack-bonus">Sin stock</span>
                          ) : (
                            pack.bonus && <span className="nc-pack-bonus">{pack.bonus}</span>
                          )}
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
