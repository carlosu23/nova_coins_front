import { type GameItem } from '../data/catalog';
import { GameCard } from './GameCard';

export type CatalogFilter = 'all' | 'topup' | 'giftcard' | 'hot';

interface CatalogSectionProps {
  allGames: GameItem[];
  games: GameItem[];
  activeFilter: CatalogFilter;
  isResellerMode?: boolean;
  onFilterChange: (filter: CatalogFilter) => void;
  onSelectGame: (game: GameItem) => void;
}

const FILTER_TABS: { id: CatalogFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'topup', label: 'Top-Up por ID' },
  { id: 'giftcard', label: 'Gift Cards' },
  { id: 'hot', label: 'Más Vendidos' }
];

export function CatalogSection({
  allGames,
  games,
  activeFilter,
  isResellerMode = false,
  onFilterChange,
  onSelectGame
}: CatalogSectionProps) {
  const safeAllGames = allGames ?? games ?? [];
  const safeGames = games ?? [];
  const recommendedIds = ['free-fire', 'roblox', 'mobile-legends'];
  const recommendedGames = safeAllGames.filter((g) => recommendedIds.includes(g.id));

  return (
    <section id="tienda" className="nc-store-section">
      <div className="nc-container">
        <div className="nc-store-header">
          <h2 className="nc-store-heading">TIENDA DE JUEGOS</h2>
        </div>

        <div className="nc-subsection">
          <div className="nc-subsection-head">
            <h3 className="nc-subsection-title">Recomendados para ti</h3>
          </div>

          <div className="nc-recommended-grid">
            {recommendedGames.map((game) => (
              <GameCard
                key={`rec-${game.id}`}
                game={game}
                isResellerMode={isResellerMode}
                variant="featured"
                onSelect={onSelectGame}
              />
            ))}
          </div>
        </div>

        <div id="catalogo" className="nc-subsection">
          <div className="nc-subsection-head nc-subsection-with-tabs">
            <h3 className="nc-subsection-title">Populares en la tienda</h3>

            <div className="nc-filter-tabs" role="tablist" aria-label="Filtrar tienda">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.id}
                  className={`nc-filter-tab ${activeFilter === tab.id ? 'is-active' : ''}`}
                  onClick={() => onFilterChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {safeGames.length === 0 ? (
            <div className="nc-empty-state">
              <p>No encontramos juegos que coincidan con tu búsqueda.</p>
              <button
                type="button"
                className="nc-btn nc-btn-primary nc-btn-sm"
                onClick={() => onFilterChange('all')}
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="nc-popular-grid">
              {safeGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isResellerMode={isResellerMode}
                  variant="compact"
                  onSelect={onSelectGame}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
