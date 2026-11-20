import { ArrowLeft, CheckCircle2, Crown, Mail, MessageCircle, Phone, Send, ShieldCheck, Store, User } from 'lucide-react';
import { useState } from 'react';

interface ResellerPageProps {
  onBackHome: () => void;
}

export function ResellerPage({ onBackHome }: ResellerPageProps) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('$100 - $500 USD');
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const buildWhatsAppUrl = () => {
    const text = [
      'Hola Nova Coins, quiero solicitar acceso como Reseller.',
      fullName ? `Nombre: ${fullName}` : '',
      businessName ? `Negocio: ${businessName}` : '',
      email ? `Correo: ${email}` : '',
      phone ? `Teléfono: +593 ${phone}` : '',
      `Volumen estimado: ${monthlyVolume}`,
      message ? `Detalle: ${message}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/593999999999?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    setSubmittedRef(`RES-${Date.now().toString().slice(-5)}`);
  };

  return (
    <section className="nc-reseller-page">
      <div className="nc-container">
        <button type="button" className="nc-back-link" onClick={onBackHome}>
          <ArrowLeft size={16} />
          <span>Volver a la Tienda</span>
        </button>

        <div className="nc-reseller-page-grid">
          <div className="nc-reseller-info-panel">
            <div className="nc-reseller-badge">
              <Crown size={15} />
              <span>SOLICITUD DE REVENDEDOR</span>
            </div>

            <h1 className="nc-reseller-page-title">
              Trabaja con <span className="nc-gold-text">Nova Coins</span> como Reseller
            </h1>

            <p className="nc-reseller-desc">
              El alta de cuentas revendedoras se realiza exclusivamente mediante solicitud previa con
              nuestro equipo comercial. Completa el formulario o contáctanos directo por WhatsApp.
            </p>

            <div className="nc-reseller-highlights">
              <div className="nc-reseller-highlight-item">
                <Store size={18} />
                <div>
                  <strong>Tarifas Mayoristas en USD</strong>
                  <span>Precios preferenciales en Free Fire, Roblox, MLBB, PUBG y más.</span>
                </div>
              </div>

              <div className="nc-reseller-highlight-item">
                <ShieldCheck size={18} />
                <div>
                  <strong>Billetera Prepago &amp; Soporte +593</strong>
                  <span>Fondeo flexible en USD con el monto que necesites y atención directa.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nc-reseller-form-card">
            {submittedRef ? (
              <div className="nc-order-success">
                <div className="nc-success-ring">
                  <CheckCircle2 size={38} />
                </div>
                <h4>Solicitud Enviada</h4>
                <p>
                  Registramos tu solicitud <strong className="nc-mono">{submittedRef}</strong>.
                  Nuestro equipo revisará tus datos y se pondrá en contacto contigo.
                </p>

                <div className="nc-reseller-success-actions">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="nc-btn nc-btn-gold nc-btn-lg nc-btn-full"
                  >
                    <MessageCircle size={17} />
                    <span>Enviar también por WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    className="nc-btn nc-btn-ghost nc-btn-full"
                    onClick={() => setSubmittedRef(null)}
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="nc-auth-form">
                <h2 className="nc-reseller-form-title">Formulario de Contacto</h2>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-name">
                    Nombre completo
                  </label>
                  <div className="nc-input-icon-wrap">
                    <User size={16} className="nc-field-icon" />
                    <input
                      id="res-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej: Mateo Andrade"
                      className="nc-input nc-input-with-icon"
                    />
                  </div>
                </div>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-business">
                    Nombre de tu tienda o marca (opcional)
                  </label>
                  <div className="nc-input-icon-wrap">
                    <Store size={16} className="nc-field-icon" />
                    <input
                      id="res-business"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej: Recargas EC"
                      className="nc-input nc-input-with-icon"
                    />
                  </div>
                </div>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-email">
                    Correo electrónico
                  </label>
                  <div className="nc-input-icon-wrap">
                    <Mail size={16} className="nc-field-icon" />
                    <input
                      id="res-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contacto@tutienda.com"
                      className="nc-input nc-input-with-icon"
                    />
                  </div>
                </div>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-phone">
                    WhatsApp / Teléfono Ecuador
                  </label>
                  <div className="nc-phone-row">
                    <div className="nc-phone-prefix">
                      <span className="nc-flag-dot" />
                      <Phone size={13} />
                      <span className="nc-mono">+593</span>
                    </div>
                    <input
                      id="res-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="99 123 4567"
                      className="nc-input"
                    />
                  </div>
                </div>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-volume">
                    Volumen mensual estimado
                  </label>
                  <select
                    id="res-volume"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    className="nc-input"
                  >
                    <option value="$100 - $500 USD">$100 - $500 USD</option>
                    <option value="$500 - $1,500 USD">$500 - $1,500 USD</option>
                    <option value="$1,500+ USD">Más de $1,500 USD</option>
                  </select>
                </div>

                <div className="nc-field-group">
                  <label className="nc-field-label" htmlFor="res-message">
                    Cuéntanos sobre tu negocio
                  </label>
                  <textarea
                    id="res-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Juegos que más vendes, canales de atención, etc."
                    className="nc-input nc-textarea"
                  />
                </div>

                <div className="nc-reseller-form-actions">
                  <button type="submit" className="nc-btn nc-btn-gold nc-btn-lg nc-btn-full">
                    <Send size={16} />
                    <span>Enviar Solicitud por Formulario</span>
                  </button>

                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="nc-btn nc-btn-whatsapp nc-btn-lg nc-btn-full"
                  >
                    <MessageCircle size={17} />
                    <span>Solicitar por WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

