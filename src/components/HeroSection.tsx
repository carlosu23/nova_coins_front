import { ArrowRight, CheckCircle2, Crown, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { type GameItem } from '../data/catalog';

interface HeroSectionProps {
  featuredGame: GameItem;
  isResellerMode: boolean;
  onQuickSelectGame: (game: GameItem) => void;
  onScrollToReseller: () => void;
}

export function HeroSection({
  featuredGame,
  isResellerMode,
  onQuickSelectGame,
  onScrollToReseller
}: HeroSectionProps) {
  const featuredPack = featuredGame.packages[1] ?? featuredGame.packages[0];
  const displayPrice = isResellerMode
    ? featuredPack.resellerPriceUsd
    : featuredPack.publicPriceUsd;

  return (
    <section id="top" className="nc-hero">
      <div className="nc-container nc-hero-grid">
        <div className="nc-hero-copy">
          <div className="nc-hero-badge">
            <Sparkles size={14} />
            <span>PLATAFORMA AUTOMATIZADA · ECUADOR 100% USD</span>
          </div>

          <h1 className="nc-hero-title">
            Recargas de Juegos por ID{' '}
            <span className="nc-text-gradient">en Segundos</span>
          </h1>

          <p className="nc-hero-subtitle">
            Compra directa sin registro previo o recarga al instante con tu{' '}
            <strong>Billetera Prepago USD</strong>. Pagos híbridos con{' '}
            <span className="nc-highlight-cyan">Binance Pay (1:1)</span>,{' '}
            <span className="nc-highlight-gold">Deuna!</span> y banca ecuatoriana.
          </p>

          <div className="nc-hero-ctas">
            <a href="#catalogo" className="nc-btn nc-btn-primary nc-btn-lg">
              <Zap size={18} />
              <span>Explorar Catálogo</span>
              <ArrowRight size={17} />
            </a>

            <button
              type="button"
              className="nc-btn nc-btn-gold-outline nc-btn-lg"
              onClick={onScrollToReseller}
            >
              <Crown size={18} />
              <span>Activar Revendedor ($10)</span>
            </button>
          </div>

          <div className="nc-hero-metrics">
            <div className="nc-metric-item">
              <Zap size={16} className="nc-icon-cyan" />
              <span>Motor Multi-API con Fallback</span>
            </div>
            <div className="nc-metric-item">
              <ShieldCheck size={16} className="nc-icon-green" />
              <span>Ledger Auditado en USD</span>
            </div>
            <div className="nc-metric-item">
              <CheckCircle2 size={16} className="nc-icon-gold" />
              <span>B2C Directo &amp; B2B Mayorista</span>
            </div>
          </div>
        </div>

        <div className="nc-hero-showcase">
          <div className="nc-showcase-glow" />
          <div className="nc-showcase-card">
            <div className="nc-showcase-header">
              <span className="nc-status-live">
                <span className="nc-pulse-dot" />
                TOP-UP EN VIVO
              </span>
              <span className="nc-showcase-tag">
                {isResellerMode ? 'TARIFA MAYORISTA B2B' : 'ENTREGA INMEDIATA'}
              </span>
            </div>

            <div className="nc-showcase-game">
              <div
                className="nc-showcase-avatar"
                style={{ background: featuredGame.accentGradient }}
              >
                {featuredGame.shortCode}
              </div>
              <div>
                <h3>{featuredGame.title}</h3>
                <p>
                  {featuredGame.publisher} · {featuredGame.currencyName}
                </p>
              </div>
            </div>

            <div className="nc-showcase-box">
              <div className="nc-showcase-row">
                <span>Paquete Popular</span>
                <strong>{featuredPack.label}</strong>
              </div>
              <div className="nc-showcase-row">
                <span>Método</span>
                <span>ID Directo · Multi-API</span>
              </div>
              <div className="nc-showcase-row">
                <span>Precio {isResellerMode ? 'Revendedor' : 'Público'}</span>
                <strong className="nc-mono nc-price-gold">
                  ${displayPrice.toFixed(2)} USD
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="nc-btn nc-btn-primary nc-btn-full"
              onClick={() => onQuickSelectGame(featuredGame)}
            >
              <Zap size={16} />
              <span>Recargar {featuredGame.title} Ahora</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
