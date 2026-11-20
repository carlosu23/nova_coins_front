import { ECUADOR_TRUST_CHANNELS } from '../data/catalog';

export function PaymentTrustBar() {
  return (
    <section className="nc-trust-strip" aria-label="Métodos de pago soportados">
      <div className="nc-container">
        <div className="nc-trust-grid">
          {ECUADOR_TRUST_CHANNELS.map((channel) => (
            <div key={channel.name} className={`nc-trust-pill tone-${channel.tone}`}>
              <span className="nc-trust-dot" />
              <div className="nc-trust-text">
                <strong>{channel.name}</strong>
                <span>{channel.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

