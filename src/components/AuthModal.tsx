import { CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User, X } from 'lucide-react';
import { useState } from 'react';
import { type UserProfile } from '../data/mockUser';
import { loginRequest, registerRequest, setStoredToken } from '../services/api';
import { NovaLogo } from './NovaLogo';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

type AuthTab = 'login' | 'register';

export function AuthModal({ open, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      return;
    }
    if (tab === 'register' && (!fullName.trim() || !phone.trim())) {
      return;
    }

    setLoading(true);
    try {
      const result =
        tab === 'login'
          ? await loginRequest(email.trim(), password)
          : await registerRequest({
              fullName: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              password
            });

      setStoredToken(result.token);
      setPendingUser(result.user);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!pendingUser) {
      return;
    }
    const resolved = pendingUser;
    setPendingUser(null);
    onAuthSuccess(resolved);
  };

  return (
    <div
      className="nc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Acceso y registro Nova Coins"
    >
      <div className="nc-modal nc-auth-modal">
        <div className="nc-modal-header">
          <div className="nc-modal-game-info">
            <NovaLogo variant="emblem" size={44} />
            <div>
              <h3>{tab === 'login' ? 'Inicia sesión en Nova Coins' : 'Crea tu cuenta de jugador'}</h3>
              <p>Recarga tus juegos favoritos al instante</p>
            </div>
          </div>

          <button type="button" className="nc-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {pendingUser ? (
          <div className="nc-order-success">
            <div className="nc-success-ring">
              <CheckCircle2 size={38} />
            </div>
            <h4>¡Hola, {pendingUser.fullName}!</h4>
            <p>Tu cuenta está lista para recargar tus juegos favoritos al instante.</p>
            <button
              type="button"
              className="nc-btn nc-btn-gold nc-btn-lg nc-btn-full"
              onClick={handleFinish}
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="nc-modal-body">
            <div className="nc-auth-tabs" role="tablist" aria-label="Modo de acceso">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'login'}
                className={`nc-auth-tab ${tab === 'login' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'register'}
                className={`nc-auth-tab ${tab === 'register' ? 'is-active' : ''}`}
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
              >
                Registrarse (+593)
              </button>
            </div>

            {errorMessage && (
              <div className="nc-auth-error" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="nc-auth-form" autoComplete="off">
              {tab === 'register' && (
                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="auth-fullname">
                    Nombre completo o Razón social
                  </label>
                  <div className="nc-input-icon-wrap">
                    <User size={16} className="nc-field-icon" />
                    <input
                      id="auth-fullname"
                      name="nc_fullname"
                      type="text"
                      autoComplete="off"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nombre completo"
                      className="nc-input nc-input-with-icon"
                    />
                  </div>
                </div>
              )}

              <div className="nc-field-group">
                <label className="nc-field-label" htmlFor="auth-email">
                  Correo electrónico
                </label>
                <div className="nc-input-icon-wrap">
                  <Mail size={16} className="nc-field-icon" />
                  <input
                    id="auth-email"
                    name="nc_email"
                    type="email"
                    autoComplete="off"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="nc-input nc-input-with-icon"
                  />
                </div>
              </div>

              {tab === 'register' && (
                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="auth-phone">
                    Teléfono Ecuador
                  </label>
                  <div className="nc-phone-row">
                    <div className="nc-phone-prefix">
                      <span className="nc-flag-dot" />
                      <Phone size={13} />
                      <span className="nc-mono">+593</span>
                    </div>
                    <input
                      id="auth-phone"
                      name="nc_phone"
                      type="tel"
                      autoComplete="off"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Número celular"
                      className="nc-input"
                    />
                  </div>
                </div>
              )}

              <div className="nc-field-group">
                <div className="nc-field-label-row">
                  <label className="nc-field-label" htmlFor="auth-password">
                    Contraseña
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      className="nc-text-link"
                      onClick={() => setTab('register')}
                    >
                      ¿No tienes cuenta?
                    </button>
                  )}
                </div>
                <div className="nc-input-icon-wrap">
                  <Lock size={16} className="nc-field-icon" />
                  <input
                    id="auth-password"
                    name="nc_pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="nc-input nc-input-with-icon nc-input-with-toggle"
                  />
                  <button
                    type="button"
                    className="nc-pass-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nc-btn nc-btn-gold nc-btn-lg nc-btn-full"
              >
                {loading
                  ? 'Validando...'
                  : tab === 'login'
                    ? 'Ingresar'
                    : 'Crear Cuenta'}
              </button>
            </form>

            <div className="nc-modal-security">
              <ShieldCheck size={14} />
              <span>Recargas seguras y entrega instantánea · Ecuador</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
