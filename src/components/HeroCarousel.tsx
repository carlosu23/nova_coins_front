import { ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type GameItem } from '../data/catalog';
import { NovaLogo } from './NovaLogo';

interface HeroCarouselProps {
  featuredGame: GameItem;
  onQuickSelectGame: (game: GameItem) => void;
}

interface BannerSlide {
  id: string;
  tagLeft: string;
  tagRight: string;
  title: string;
  accentWord: string;
  subtitle: string;
  ctaLabel: string;
  action: 'game' | 'catalog';
  badgeIcon: 'zap' | 'sparkles';
  backgroundImage?: string;
  sideHighlightTitle: string;
  sideHighlightValue: string;
  sideHighlightNote: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-topup',
    tagLeft: 'NOVA COINS',
    tagRight: 'FREE FIRE · TOP-UP ID',
    title: 'RECARGA DIAMANTES',
    accentWord: 'AL INSTANTE EN USD',
    subtitle: 'Entrega automática en menos de 5 segundos con Binance Pay 1:1, Deuna! y banca ecuatoriana.',
    ctaLabel: 'Recargar Free Fire',
    action: 'game',
    badgeIcon: 'zap',
    backgroundImage: '/images/hero-freefire.jpg',
    sideHighlightTitle: 'PACK MÁS VENDIDO',
    sideHighlightValue: '310 + 31',
    sideHighlightNote: 'Diamantes · Entrega Inmediata'
  },
  {
    id: 'slide-giftcards',
    tagLeft: 'ECUADOR 100% USD',
    tagRight: 'GIFT CARDS & ROBUX',
    title: 'GiftCards de Roblox',
    accentWord: 'SIN COMISIONES OCULTAS',
    subtitle: 'Recibe tu PIN digital al instante o usa tu Billetera Prepago USD para comprar en 1 clic.',
    ctaLabel: 'Explorar Tienda',
    action: 'catalog',
    badgeIcon: 'sparkles',
    backgroundImage: '/images/hero-roblox.jpg',
    sideHighlightTitle: 'PASARELA HÍBRIDA',
    sideHighlightValue: '1:1 USD',
    sideHighlightNote: 'Binance Pay · Deuna! · Banca EC'
  },
  {
    id: 'slide-arena',
    tagLeft: 'TOP-UP DIRECTO',
    tagRight: 'MLBB · PUBG · BLOOD STRIKE',
    title: 'TUS JUEGOS FAVORITOS',
    accentWord: 'SIEMPRE DISPONIBLES 24/7',
    subtitle: 'Recarga automática 24/7 para que tus monedas lleguen directo a tu cuenta sin demoras.',
    ctaLabel: 'Ver Catálogo',
    action: 'catalog',
    badgeIcon: 'zap',
    backgroundImage: '/images/hero-arena.jpg',
    sideHighlightTitle: 'ENTREGA AUTOMÁTICA',
    sideHighlightValue: '< 5 SEG',
    sideHighlightNote: 'Directo a tu ID de Jugador'
  }
];

export function HeroCarousel({ featuredGame, onQuickSelectGame }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const handleSlideAction = (slide: BannerSlide) => {
    if (slide.action === 'game') {
      onQuickSelectGame(featuredGame);
      return;
    }
    document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="top"
      className="nc-carousel-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="nc-container">
        <div className="nc-banner-frame">
          <div
            className="nc-banner-track"
            style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
          >
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`nc-banner-slide ${idx === activeIndex ? 'is-active' : ''} ${slide.backgroundImage ? 'has-bg-art' : ''}`}
                aria-hidden={idx !== activeIndex}
              >
                {slide.backgroundImage && (
                  <>
                    <img
                      src={slide.backgroundImage}
                      alt=""
                      aria-hidden="true"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={idx === 0 ? 'high' : 'low'}
                      className="nc-banner-bg-art"
                    />
                    <div className="nc-banner-bg-scrim" />
                  </>
                )}
                <div className="nc-banner-grid">
                  <div className="nc-banner-copy">
                    <div className="nc-banner-tags">
                      <span className="nc-banner-tag-brand">{slide.tagLeft}</span>
                      <span className="nc-banner-tag-sub">{slide.tagRight}</span>
                    </div>

                    <h1 className="nc-banner-title">
                      {slide.title} <br />
                      <span className="nc-text-gradient">{slide.accentWord}</span>
                    </h1>

                    <p className="nc-banner-subtitle">{slide.subtitle}</p>

                    <div className="nc-banner-bottom">
                      <button
                        type="button"
                        tabIndex={idx === activeIndex ? 0 : -1}
                        className="nc-btn nc-btn-gold"
                        onClick={() => handleSlideAction(slide)}
                      >
                        {slide.badgeIcon === 'sparkles' ? <Sparkles size={17} /> : <Zap size={17} />}
                        <span>{slide.ctaLabel}</span>
                      </button>

                      <div className="nc-banner-pay-strip">
                        <span>Binance Pay</span>
                        <span>Deuna!</span>
                        <span>Pichincha</span>
                        <span>Guayaquil</span>
                      </div>
                    </div>
                  </div>

                  {!slide.backgroundImage && (
                    <div className="nc-banner-visual">
                      <div className="nc-banner-emblem-card">
                        <div className="nc-emblem-brand-row">
                          <NovaLogo variant="emblem" size={68} />
                          <div className="nc-emblem-brand-copy">
                            <span className="nc-emblem-label">{slide.sideHighlightTitle}</span>
                            <strong className="nc-emblem-value nc-mono">
                              {slide.sideHighlightValue}
                            </strong>
                          </div>
                        </div>
                        <span className="nc-emblem-note">{slide.sideHighlightNote}</span>
                        <div className="nc-emblem-footer">
                          <span>¡Tu mundo digital en un solo lugar!</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="nc-carousel-arrow is-prev"
            onClick={() => setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Banner anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            className="nc-carousel-arrow is-next"
            onClick={() => setActiveIndex((prev) => (prev + 1) % SLIDES.length)}
            aria-label="Siguiente banner"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="nc-carousel-dots" role="tablist" aria-label="Diapositivas del banner">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Ir al banner ${idx + 1}`}
              className={`nc-carousel-dot ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
