import { Gift, Headphones, ShoppingBag, Zap } from 'lucide-react';
import { type CatalogFilter } from './CatalogSection';

interface QuickNavStripProps {
  onSelectFilter: (filter: CatalogFilter) => void;
  onSupportClick: () => void;
}

export function QuickNavStrip({ onSelectFilter, onSupportClick }: QuickNavStripProps) {
  const goToCatalog = (filter: CatalogFilter) => {
    onSelectFilter(filter);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="nc-quicknav-section" aria-label="Accesos rápidos">
      <div className="nc-container">
        <div className="nc-quicknav-grid">
          <button
            type="button"
            className="nc-quicknav-card"
            onClick={() => goToCatalog('all')}
          >
            <ShoppingBag size={18} />
            <span>TIENDA</span>
          </button>

          <button
            type="button"
            className="nc-quicknav-card"
            onClick={() => goToCatalog('topup')}
          >
            <Zap size={18} />
            <span>TOP-UP POR ID</span>
          </button>

          <button
            type="button"
            className="nc-quicknav-card"
            onClick={() => goToCatalog('giftcard')}
          >
            <Gift size={18} />
            <span>GIFT CARDS</span>
          </button>

          <button type="button" className="nc-quicknav-card" onClick={onSupportClick}>
            <Headphones size={18} />
            <span>SOPORTE +593</span>
          </button>
        </div>
      </div>
    </section>
  );
}
