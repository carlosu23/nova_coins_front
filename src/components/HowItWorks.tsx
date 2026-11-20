import { CreditCard, Gamepad2, ShieldCheck, Zap } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Elige tu juego e ingresa tu ID',
    desc: 'Selecciona el título, escribe tu Player ID (o correo para Gift Cards) y elige el paquete en USD.',
    icon: Gamepad2
  },
  {
    step: '02',
    title: 'Paga en USD a tu manera',
    desc: 'Usa tu Billetera Nova en 1 clic, Binance Pay (USDT/USDC 1:1) o Deuna! / Banca Ecuador.',
    icon: CreditCard
  },
  {
    step: '03',
    title: 'Recibe en segundos',
    desc: 'Tu recarga se acredita en segundos de forma automática directo en tu cuenta.',
    icon: Zap
  }
];

export function HowItWorks() {
  return (
    <section className="nc-how-section">
      <div className="nc-container">
        <div className="nc-how-head">
          <span className="nc-eyebrow">
            <ShieldCheck size={15} />
            FLUJO RÁPIDO Y SEGURO
          </span>
          <h2 className="nc-section-title">Recarga en 3 Simples Pasos</h2>
        </div>

        <div className="nc-how-grid">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.step} className="nc-how-card">
                <div className="nc-how-top">
                  <span className="nc-how-step nc-mono">{item.step}</span>
                  <div className="nc-how-icon">
                    <Icon size={20} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

