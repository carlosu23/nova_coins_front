import {
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Gamepad2,
  History,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Upload,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  changePasswordRequest,
  fetchActiveChannels,
  updateProfileRequest,
  type PublicPaymentChannel
} from '../services/api';
import { type UserProfile } from '../types/user';
import { ApiKeysManager } from './ApiKeysManager';

interface ProfileModalProps {
  open: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onTopUpWallet: (
    amountUsd: number,
    options?: { paymentMethod?: string; referenceCode?: string; proofImage?: string }
  ) => void;
  onUserUpdated?: (user: UserProfile) => void;
  onNotify?: (message: string) => void;
  onLogout: () => void;
}

export function ProfileModal({
  open,
  user,
  onClose,
  onTopUpWallet,
  onUserUpdated,
  onNotify,
  onLogout
}: ProfileModalProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [channels, setChannels] = useState<PublicPaymentChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [showTopUpExtras, setShowTopUpExtras] = useState(false);

  const [showEditSection, setShowEditSection] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    fetchActiveChannels()
      .then((res) => {
        if (!active) {
          return;
        }
        const list = res.channels ?? [];
        setChannels(list);
        if (list.length > 0) {
          setSelectedChannel((prev) => prev || list[0].name);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  if (!open || !user) {
    return null;
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const activeChannelObj = channels.find((c) => c.name === selectedChannel) ?? channels[0];

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProofImage('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(customAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    onTopUpWallet(Number(parsed.toFixed(2)), {
      paymentMethod: selectedChannel || undefined,
      referenceCode: referenceCode.trim() || undefined,
      proofImage: proofImage || undefined
    });
    setCustomAmount('');
    setReferenceCode('');
    setProofImage('');
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSaving(true);
    try {
      const res = await updateProfileRequest({
        fullName: fullName.trim(),
        phone: phone.trim()
      });
      onUserUpdated?.(res.user);
      onNotify?.('Perfil actualizado.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePasswordRequest({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      onNotify?.('Contraseña actualizada.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCopyCodes = async (orderId: string, codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopiedOrderId(orderId);
      onNotify?.('Códigos copiados al portapapeles.');
      setTimeout(() => {
        setCopiedOrderId((prev) => (prev === orderId ? null : prev));
      }, 2000);
    } catch {
      onNotify?.('No se pudo copiar los códigos.');
    }
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
          <div className="nc-profile-wallet-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
                <button
                  type="button"
                  className="nc-btn nc-btn-ghost nc-btn-sm"
                  onClick={() => setShowTopUpExtras((prev) => !prev)}
                >
                  <span>{showTopUpExtras ? 'Ocultar medio' : 'Medio / Comprobante'}</span>
                </button>
              </form>
            </div>

            {showTopUpExtras ? (
              <div style={{ display: 'grid', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {channels.length > 0 ? (
                  <label style={{ display: 'grid', gap: '4px', fontSize: '0.82rem' }}>
                    <span>Medio de pago</span>
                    <select
                      className="nc-input"
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                    >
                      {channels.map((ch) => (
                        <option key={ch.id} value={ch.name}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {activeChannelObj ? (
                  <div style={{ fontSize: '0.8rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span>{activeChannelObj.accountDetail}</span>
                    {activeChannelObj.qrImage ? (
                      <img
                        src={activeChannelObj.qrImage}
                        alt={`QR ${activeChannelObj.name}`}
                        style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '4px' }}
                      />
                    ) : null}
                  </div>
                ) : null}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="nc-input"
                    placeholder="Código de referencia (opcional)"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                  />
                  <label className="nc-btn nc-btn-ghost nc-btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <span>{proofImage ? 'Comprobante listo' : 'Subir captura'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            ) : null}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="nc-btn nc-btn-ghost nc-btn-sm"
              onClick={() => {
                setShowEditSection((prev) => {
                  const next = !prev;
                  if (next) {
                    setFullName(user.fullName);
                    setPhone(user.phone);
                    setProfileError('');
                    setPasswordError('');
                  }
                  return next;
                });
              }}
            >
              <Edit3 size={14} />
              <span>{showEditSection ? 'Ocultar edición' : 'Editar Perfil y Contraseña'}</span>
            </button>
          </div>

          {showEditSection ? (
            <div className="nc-profile-section" style={{ display: 'grid', gap: '12px' }}>
              <form onSubmit={handleProfileSave} className="nc-profile-row-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <strong style={{ fontSize: '0.88rem' }}>Datos personales</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="nc-input"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nombre completo"
                  />
                  <input
                    type="tel"
                    className="nc-input"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
                {profileError ? <div className="nc-auth-error">{profileError}</div> : null}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="nc-btn nc-btn-gold nc-btn-sm" disabled={profileSaving}>
                    <span>{profileSaving ? 'Guardando...' : 'Guardar perfil'}</span>
                  </button>
                </div>
              </form>

              <form onSubmit={handlePasswordSave} className="nc-profile-row-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <strong style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} />
                  <span>Cambiar contraseña</span>
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="password"
                    className="nc-input"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Contraseña actual"
                  />
                  <input
                    type="password"
                    className="nc-input"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mín. 6)"
                  />
                </div>
                {passwordError ? <div className="nc-auth-error">{passwordError}</div> : null}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="nc-btn nc-btn-ghost nc-btn-sm" disabled={passwordSaving}>
                    <span>{passwordSaving ? 'Actualizando...' : 'Actualizar contraseña'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}

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
                      {order.codes && order.codes.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span className="nc-mono" style={{ fontSize: '0.76rem', color: 'var(--nc-gold, #f5c542)', wordBreak: 'break-all' }}>
                            PIN: {order.codes.join(' · ')}
                          </span>
                          <button
                            type="button"
                            className="nc-btn nc-btn-ghost nc-btn-sm"
                            style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                            onClick={() => handleCopyCodes(order.id, order.codes ?? [])}
                          >
                            {copiedOrderId === order.id ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedOrderId === order.id ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="nc-profile-order-right">
                      <strong className="nc-mono nc-price-gold">
                        ${order.amountUsd.toFixed(2)}
                      </strong>
                      <span className="nc-order-status">
                        <CheckCircle2 size={11} />
                        {order.status}
                        {order.fulfillmentStatus ? ` · ${order.fulfillmentStatus}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="nc-profile-section">
            <h4 className="nc-profile-section-title">
              <KeyRound size={15} />
              <span>Mis API Keys (/api/v1)</span>
            </h4>
            <ApiKeysManager compact />
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
