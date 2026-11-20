import { Flame, Sparkles, Zap } from 'lucide-react';
import { type GameItem } from '../data/catalog';

interface GameCardProps {
  game: GameItem;
  isResellerMode: boolean;
  variant?: 'featured' | 'compact';
  onSelect: (game: GameItem) => void;
}

export function GameCard({
  game,
  isResellerMode,
  variant = 'compact',
  onSelect
}: GameCardProps) {
  const minPublic = Math.min(...game.packages.map((p) => p.publicPriceUsd));
  const minReseller = Math.min(...game.packages.map((p) => p.resellerPriceUsd));
  const activeMin = isResellerMode ? minReseller : minPublic;
  const savingsPct = Math.round(((minPublic - minReseller) / minPublic) * 100);

  return (
    <article
      className={`nc-bonox-card is-${variant}`}
      data-game={game.id}
      onClick={() => onSelect(game)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(game);
        }
      }}
    >
      <div className="nc-bonox-art" style={{ background: game.accentGradient }}>
        {game.logoUrl && (
          <img
            src={game.logoUrl}
            alt={game.title}
            loading="lazy"
            decoding="async"
            className="nc-bonox-bg-logo"
          />
        )}
        <div className="nc-bonox-art-overlay" />

        <div className="nc-bonox-art-top">
          <span className="nc-game-cat-pill">{game.categoryLabel}</span>
          {game.isHot && (
            <span className="nc-game-hot-pill">
              <Flame size={11} />
              Top
            </span>
          )}
        </div>

        {!game.logoUrl && (
          <div className="nc-bonox-art-center">
            <span className="nc-bonox-shortcode">{game.shortCode}</span>
            <span className="nc-bonox-currency-tag">{game.currencyName}</span>
          </div>
        )}

        <div className="nc-bonox-art-speed">
          <Zap size={12} />
          <span>{game.deliverySpeed}</span>
        </div>
      </div>

      <div className="nc-bonox-footer">
        <div className="nc-bonox-title-col">
          <h4 className="nc-bonox-title">{game.title}</h4>
          <span className="nc-bonox-pub">{game.publisher}</span>
        </div>

        <div className="nc-bonox-price-col">
          <span className="nc-mono nc-bonox-price">${activeMin.toFixed(2)}</span>
          {isResellerMode ? (
            <span className="nc-discount-badge">
              <Sparkles size={10} />-{savingsPct}%
            </span>
          ) : (
            <span className="nc-bonox-usd">USD</span>
          )}
        </div>
      </div>
    </article>
  );
}
