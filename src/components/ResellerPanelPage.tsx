import {
  ArrowLeft,
  BarChart3,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Gamepad2,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { type GameItem, type GamePackage } from '../data/catalog';
import { type PanelSection, type UserOrder, type UserProfile } from '../types/user';
import { ApiKeysManager } from './ApiKeysManager';

interface SkuProductItem {
  game: GameItem;
  pack: GamePackage;
}

interface ResellerPanelPageProps {
  user: UserProfile;
  catalog: GameItem[];
  activeSection: PanelSection;
  onSectionChange: (section: PanelSection) => void;
  onBackHome: () => void;
  onLogout: () => void;
  onTopUpWallet: (amountUsd: number) => void;
  onExecuteB2BSale: (payload: {
    packageId: string;
    gameTitle: string;
    packageLabel: string;
    playerId: string;
    zoneId?: string;
    accountName?: string;
    whatsapp?: string;
    amountUsd: number;
    paymentMethod: string;
    usedWallet: boolean;
  }) => Promise<UserOrder>;
  onAddSavedId: (payload: {
    gameTitle: string;
    playerId: string;
    zoneId?: string;
    accountName?: string;
    whatsapp?: string;
  }) => void;
  onCopyReceipt: (order: UserOrder) => void;
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function ResellerPanelPage({
  user,
  catalog,
  activeSection: section,
  onSectionChange: setSection,
  onBackHome,
  onLogout,
  onTopUpWallet,
  onExecuteB2BSale,
  onAddSavedId,
  onCopyReceipt
}: ResellerPanelPageProps) {
  const allSkus = useMemo<SkuProductItem[]>(
    () => catalog.flatMap((game) => game.packages.map((pack) => ({ game, pack }))),
    [catalog]
  );

  const [panelSearch, setPanelSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [fundAmount, setFundAmount] = useState('');
  const [activeSku, setActiveSku] = useState<SkuProductItem | null>(null);
  const [salePlayerId, setSalePlayerId] = useState('');
  const [saleZoneId, setSaleZoneId] = useState('');
  const [saleAccountName, setSaleAccountName] = useState('');
  const [saleWhatsapp, setSaleWhatsapp] = useState('');
  const [submittingSale, setSubmittingSale] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<UserOrder | null>(null);
  const [calcGameId, setCalcGameId] = useState(catalog[0]?.id ?? '');
  const [calcPackId, setCalcPackId] = useState(
    catalog[0]?.packages[1]?.id ?? catalog[0]?.packages[0]?.id ?? ''
  );
  const [customSalePrice, setCustomSalePrice] = useState('');
  const [newIdGame, setNewIdGame] = useState(catalog[0]?.title ?? '');
  const [newPlayerId, setNewPlayerId] = useState('');
  const [newZoneId, setNewZoneId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const normalizedQuery = panelSearch.trim().toLowerCase();

  const filteredSkus = useMemo(() => {
    return allSkus.filter(({ game, pack }) => {
      const matchesGame = gameFilter === 'all' || game.id === gameFilter;
      const matchesQuery =
        !normalizedQuery ||
        game.title.toLowerCase().includes(normalizedQuery) ||
        pack.label.toLowerCase().includes(normalizedQuery) ||
        pack.id.toLowerCase().includes(normalizedQuery) ||
        game.currencyName.toLowerCase().includes(normalizedQuery);
      return matchesGame && matchesQuery;
    });
  }, [allSkus, gameFilter, normalizedQuery]);

  const filteredClients = useMemo(() => {
    if (!normalizedQuery) {
      return user.savedIds;
    }
    return user.savedIds.filter(
      (c) =>
        c.gameTitle.toLowerCase().includes(normalizedQuery) ||
        c.playerId.toLowerCase().includes(normalizedQuery) ||
        (c.accountName?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (c.whatsapp?.toLowerCase().includes(normalizedQuery) ?? false)
    );
  }, [user.savedIds, normalizedQuery]);

  const filteredOrders = useMemo(() => {
    if (!normalizedQuery) {
      return user.recentOrders;
    }
    return user.recentOrders.filter(
      (o) =>
        o.gameTitle.toLowerCase().includes(normalizedQuery) ||
        o.packageLabel.toLowerCase().includes(normalizedQuery) ||
        o.playerId.toLowerCase().includes(normalizedQuery) ||
        o.id.toLowerCase().includes(normalizedQuery)
    );
  }, [user.recentOrders, normalizedQuery]);

  const weeklyMetrics = useMemo(() => {
    const today = new Date();
    const days: { key: string; day: string; volume: number }[] = [];
    const byKey = new Map<string, { key: string; day: string; volume: number }>();

    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const entry = { key, day: WEEKDAY_LABELS[d.getDay()], volume: 0 };
      days.push(entry);
      byKey.set(key, entry);
    }

    for (const order of user.recentOrders) {
      if (order.status === 'Rechazado' || order.gameTitle === 'Fondeo de Billetera USD') {
        continue;
      }
      if (!order.createdAt) {
        continue;
      }
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.volume = Number((bucket.volume + order.amountUsd).toFixed(2));
      }
    }

    const maxVol = Math.max(...days.map((d) => d.volume), 0);
    return days.map((d) => ({
      day: d.day,
      volume: d.volume,
      pct: maxVol > 0 ? Math.max(8, Math.round((d.volume / maxVol) * 100)) : 0
    }));
  }, [user.recentOrders]);

  const selectedCalcGame = catalog.find((g) => g.id === calcGameId) ?? catalog[0];
  const selectedCalcPack =
    selectedCalcGame.packages.find((p) => p.id === calcPackId) ?? selectedCalcGame.packages[0];

  const wholesaleCost = selectedCalcPack.resellerPriceUsd;
  const parsedSale = Number.parseFloat(customSalePrice);
  const effectiveSalePrice =
    Number.isFinite(parsedSale) && parsedSale > 0
      ? parsedSale
      : selectedCalcPack.publicPriceUsd;
  const netProfit = effectiveSalePrice - wholesaleCost;
  const marginPct = wholesaleCost > 0 ? Math.round((netProfit / wholesaleCost) * 100) : 0;

  const completedSalesOrders = useMemo(
    () =>
      user.recentOrders.filter(
        (ord) =>
          ord.gameTitle !== 'Fondeo de Billetera USD' &&
          (ord.status === 'Completado' || ord.status === 'Aprobado')
      ),
    [user.recentOrders]
  );

  const totalSpent = completedSalesOrders.reduce((sum, ord) => sum + ord.amountUsd, 0);

  const estimatedProfit = useMemo(() => {
    const publicPriceMap = new Map(
      allSkus.map(({ game, pack }) => [`${game.title}::${pack.label}`, pack.publicPriceUsd])
    );
    const total = completedSalesOrders.reduce((sum, ord) => {
      const suggestedPublic = publicPriceMap.get(`${ord.gameTitle}::${ord.packageLabel}`);
      if (suggestedPublic === undefined) {
        return sum;
      }
      return sum + Math.max(0, suggestedPublic - ord.amountUsd);
    }, 0);
    return Number(total.toFixed(2));
  }, [allSkus, completedSalesOrders]);

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseFloat(fundAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    onTopUpWallet(Number(parsed.toFixed(2)));
    setFundAmount('');
  };

  const handleStartSkuSale = (item: SkuProductItem) => {
    setActiveSku(item);
    setLastCompletedOrder(null);
    const saved = user.savedIds.find((s) => s.gameTitle === item.game.title);
    setSalePlayerId(saved?.playerId ?? '');
    setSaleZoneId(saved?.zoneId ?? '');
    setSaleAccountName(saved?.accountName ?? '');
    setSaleWhatsapp(saved?.whatsapp ?? '');
  };

  const handleConfirmB2BSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSku || !salePlayerId.trim() || submittingSale) {
      return;
    }
    const cleanPlayer = salePlayerId.trim();
    const cleanZone = activeSku.game.requiresZoneId ? saleZoneId.trim() : undefined;

    setSubmittingSale(true);
    try {
      const created = await onExecuteB2BSale({
        packageId: activeSku.pack.id,
        gameTitle: activeSku.game.title,
        packageLabel: activeSku.pack.label,
        playerId: cleanPlayer,
        zoneId: cleanZone || undefined,
        accountName: saleAccountName.trim() || undefined,
        whatsapp: saleWhatsapp.trim() || undefined,
        amountUsd: activeSku.pack.resellerPriceUsd,
        paymentMethod: 'Billetera Nova USD',
        usedWallet: true
      });

      setLastCompletedOrder(created);
      setActiveSku(null);
      setSalePlayerId('');
      setSaleZoneId('');
      setSaleAccountName('');
      setSaleWhatsapp('');
    } catch {
      // Error toast handled by parent
    } finally {
      setSubmittingSale(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerId.trim()) {
      return;
    }
    onAddSavedId({
      gameTitle: newIdGame,
      playerId: newPlayerId.trim(),
      zoneId: newZoneId.trim() || undefined,
      accountName: newAccountName.trim() || undefined,
      whatsapp: newWhatsapp.trim() || undefined
    });
    setNewPlayerId('');
    setNewZoneId('');
    setNewAccountName('');
    setNewWhatsapp('');
  };

  const handleReceiptAction = (order: UserOrder) => {
    onCopyReceipt(order);
    setCopiedOrderId(order.id);
    window.setTimeout(() => {
      setCopiedOrderId((curr) => (curr === order.id ? null : curr));
    }, 2200);
  };

  const renderSkuCards = (items: SkuProductItem[]) => {
    if (items.length === 0) {
      return (
        <div className="nc-empty-state">
          <p>No se encontraron productos para esa búsqueda.</p>
          <button
            type="button"
            className="nc-btn nc-btn-primary nc-btn-sm"
            onClick={() => {
              setPanelSearch('');
              setGameFilter('all');
            }}
          >
            Ver todos los paquetes
          </button>
        </div>
      );
    }

    return (
      <div className="nc-b2b-cards-grid">
        {items.map(({ game, pack }) => {
          const diff = pack.publicPriceUsd - pack.resellerPriceUsd;
          const pct = pack.publicPriceUsd > 0 ? Math.round((diff / pack.publicPriceUsd) * 100) : 0;
          const isSelected = activeSku?.pack.id === pack.id;
          return (
            <article
              key={pack.id}
              className={`nc-b2b-product-card ${isSelected ? 'is-selected' : ''}`}
            >
              <div className="nc-b2b-card-top">
                <div className="nc-b2b-card-identity">
                  <div className="nc-b2b-card-thumb">
                    {pack.imageUrl ? (
                      <img src={pack.imageUrl} alt={pack.label} />
                    ) : game.logoUrl ? (
                      <img src={game.logoUrl} alt={game.title} />
                    ) : (
                      <span>{game.shortCode}</span>
                    )}
                  </div>
                  <div className="nc-b2b-card-titles">
                    <span className="nc-b2b-card-game">{game.title}</span>
                    <h3>{pack.label}</h3>
                  </div>
                </div>

                <span className="nc-discount-badge">-{pct}%</span>
              </div>

              <div className="nc-b2b-card-metrics">
                <div>
                  <span>Mayorista</span>
                  <strong className="nc-mono nc-text-cyan">
                    ${pack.resellerPriceUsd.toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span>Público</span>
                  <strong className="nc-mono">${pack.publicPriceUsd.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Tu Margen</span>
                  <strong className="nc-mono nc-price-gold">+${diff.toFixed(2)}</strong>
                </div>
              </div>

              <div className="nc-b2b-card-footer">
                <span className="nc-b2b-sku-code">{game.deliverySpeed}</span>
                <button
                  type="button"
                  className="nc-btn nc-btn-gold nc-btn-sm"
                  onClick={() => handleStartSkuSale({ game, pack })}
                >
                  <Zap size={14} />
                  <span>Vender</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <section className="nc-b2b-shell">
      <div className="nc-container nc-b2b-layout">
        <aside className="nc-b2b-sidebar" aria-label="Navegación del panel B2B">
          <div className="nc-b2b-profile-box">
            <div className="nc-profile-avatar">{initials || 'B2B'}</div>
            <div>
              <strong>{user.fullName}</strong>
              <span className="nc-b2b-role-tag">
                <Crown size={11} />
                {user.role}
              </span>
            </div>
          </div>

          <div className="nc-b2b-sidebar-wallet">
            <span>Saldo Disponible USD</span>
            <strong className="nc-mono">${user.walletBalanceUsd.toFixed(2)} USD</strong>
          </div>

          <nav className="nc-b2b-nav">
            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'catalog' ? 'is-active' : ''}`}
              onClick={() => setSection('catalog')}
            >
              <ShoppingBag size={17} />
              <span>Catálogo Mayorista</span>
            </button>

            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'overview' ? 'is-active' : ''}`}
              onClick={() => setSection('overview')}
            >
              <LayoutDashboard size={17} />
              <span>Resumen y Métricas</span>
            </button>

            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'calculator' ? 'is-active' : ''}`}
              onClick={() => setSection('calculator')}
            >
              <Calculator size={17} />
              <span>Calculadora</span>
            </button>

            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'clients' ? 'is-active' : ''}`}
              onClick={() => setSection('clients')}
            >
              <Gamepad2 size={17} />
              <span>IDs de Clientes</span>
            </button>

            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'orders' ? 'is-active' : ''}`}
              onClick={() => setSection('orders')}
            >
              <Receipt size={17} />
              <span>Ventas y Recibos</span>
            </button>

            <button
              type="button"
              className={`nc-b2b-nav-item ${section === 'apikeys' ? 'is-active' : ''}`}
              onClick={() => setSection('apikeys')}
            >
              <KeyRound size={17} />
              <span>API Keys</span>
            </button>
          </nav>

          <div className="nc-b2b-sidebar-footer">
            <button
              type="button"
              className="nc-btn nc-btn-ghost nc-btn-sm nc-btn-full"
              onClick={onBackHome}
            >
              <ArrowLeft size={15} />
              <span>Ir a Tienda Pública</span>
            </button>
            <button type="button" className="nc-b2b-logout-btn" onClick={onLogout}>
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        <div className="nc-b2b-main">
          <div className="nc-b2b-topbar">
            <div className="nc-b2b-search-wrap">
              <Search size={16} className="nc-search-icon" />
              <input
                type="search"
                value={panelSearch}
                onChange={(e) => setPanelSearch(e.target.value)}
                placeholder="Buscar juego, paquete (ej: 310, Robux, ML) o cliente..."
                aria-label="Buscar en panel de revendedor"
              />
            </div>

            <form onSubmit={handleFundSubmit} className="nc-wallet-topup-form">
              <div className="nc-wallet-input-wrap">
                <span className="nc-mono">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.00"
                  aria-label="Monto a fondear en USD"
                  className="nc-mono"
                />
              </div>
              <button type="submit" className="nc-btn nc-btn-gold nc-btn-sm">
                <Plus size={15} />
                <span>Fondear USD</span>
              </button>
            </form>
          </div>

          <div className="nc-panel-kpis">
            <div className="nc-kpi-card">
              <Wallet size={18} className="nc-price-gold" />
              <div>
                <span>Saldo Billetera</span>
                <strong className="nc-mono">${user.walletBalanceUsd.toFixed(2)} USD</strong>
              </div>
            </div>
            <div className="nc-kpi-card">
              <TrendingUp size={18} className="nc-kpi-green" />
              <div>
                <span>Ganancia Estimada</span>
                <strong className="nc-mono">+${estimatedProfit.toFixed(2)} USD</strong>
              </div>
            </div>
            <div className="nc-kpi-card">
              <BarChart3 size={18} className="nc-text-cyan" />
              <div>
                <span>Volumen Procesado</span>
                <strong className="nc-mono">${totalSpent.toFixed(2)} USD</strong>
              </div>
            </div>
            <div className="nc-kpi-card">
              <Users size={18} className="nc-kpi-purple" />
              <div>
                <span>Paquetes Disponibles</span>
                <strong className="nc-mono">{allSkus.length}</strong>
              </div>
            </div>
          </div>

          {activeSku && (
            <form onSubmit={handleConfirmB2BSale} className="nc-b2b-inline-checkout">
              <div className="nc-b2b-checkout-head">
                <div>
                  <span className="nc-b2b-checkout-tag">ENVÍO DIRECTO · PAGO CON BILLETERA</span>
                  <h3>
                    {activeSku.game.title} — {activeSku.pack.label}
                  </h3>
                </div>
                <button
                  type="button"
                  className="nc-modal-close"
                  onClick={() => setActiveSku(null)}
                  aria-label="Cancelar venta"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="nc-b2b-checkout-fields">
                <input
                  type="text"
                  required
                  value={salePlayerId}
                  onChange={(e) => setSalePlayerId(e.target.value)}
                  placeholder={activeSku.game.inputPlaceholder}
                  className="nc-input"
                />
                {activeSku.game.requiresZoneId && (
                  <input
                    type="text"
                    required
                    value={saleZoneId}
                    onChange={(e) => setSaleZoneId(e.target.value)}
                    placeholder={activeSku.game.zonePlaceholder}
                    className="nc-input"
                  />
                )}
                <input
                  type="text"
                  value={saleAccountName}
                  onChange={(e) => setSaleAccountName(e.target.value)}
                  placeholder="Nombre de la cuenta (auto si vacío)"
                  className="nc-input"
                />
                <input
                  type="tel"
                  value={saleWhatsapp}
                  onChange={(e) => setSaleWhatsapp(e.target.value)}
                  placeholder="WhatsApp cliente (opcional)"
                  className="nc-input"
                />
                <div className="nc-b2b-checkout-cost">
                  <span>Costo Billetera</span>
                  <strong className="nc-mono nc-price-gold">
                    ${activeSku.pack.resellerPriceUsd.toFixed(2)} USD
                  </strong>
                </div>
                <button type="submit" disabled={submittingSale} className="nc-btn nc-btn-gold">
                  <Zap size={16} />
                  <span>{submittingSale ? 'Procesando...' : 'Ejecutar Recarga'}</span>
                </button>
              </div>
            </form>
          )}

          {lastCompletedOrder && (
            <div className="nc-b2b-inline-success">
              <div className="nc-b2b-inline-success-info">
                <CheckCircle2 size={20} className="nc-kpi-green" />
                <div>
                  <strong>
                    Recarga ejecutada ({lastCompletedOrder.id}): {lastCompletedOrder.gameTitle} ·{' '}
                    {lastCompletedOrder.packageLabel}
                  </strong>
                  <span>
                    ID: {lastCompletedOrder.playerId} · Debitado{' '}
                    <strong className="nc-mono">${lastCompletedOrder.amountUsd.toFixed(2)} USD</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="nc-btn nc-btn-ghost nc-btn-sm"
                onClick={() => handleReceiptAction(lastCompletedOrder)}
              >
                <Copy size={14} />
                <span>Copiar Comprobante</span>
              </button>
            </div>
          )}

          {section === 'catalog' && (
            <div className="nc-b2b-section-block">
              <div className="nc-b2b-block-head nc-b2b-catalog-head">
                <h2>Productos Mayoristas ({filteredSkus.length} paquetes)</h2>

                <div className="nc-filter-tabs">
                  <button
                    type="button"
                    className={`nc-filter-tab ${gameFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setGameFilter('all')}
                  >
                    Todos
                  </button>
                  {catalog.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`nc-filter-tab ${gameFilter === g.id ? 'is-active' : ''}`}
                      onClick={() => setGameFilter(g.id)}
                    >
                      {g.title}
                    </button>
                  ))}
                </div>
              </div>

              {renderSkuCards(filteredSkus)}
            </div>
          )}

          {section === 'overview' && (
            <div className="nc-b2b-stack">
              <div className="nc-panel-card">
                <div className="nc-panel-card-head">
                  <h2>
                    <BarChart3 size={17} />
                    <span>Ventas de los Últimos 7 Días (USD)</span>
                  </h2>
                  <span className="nc-b2b-api-status">
                    <span className="nc-pulse-dot" />
                    Servicio en Línea 24/7
                  </span>
                </div>
                <div className="nc-b2b-chart">
                  {weeklyMetrics.map((item) => (
                    <div key={item.day} className="nc-chart-col">
                      <span className="nc-chart-val nc-mono">${item.volume.toFixed(2)}</span>
                      <div className="nc-chart-track">
                        <div className="nc-chart-bar" style={{ height: `${item.pct}%` }} />
                      </div>
                      <span className="nc-chart-day">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nc-b2b-section-block">
                <div className="nc-b2b-block-head">
                  <h2>Paquetes Más Vendidos</h2>
                  <button
                    type="button"
                    className="nc-text-link"
                    onClick={() => setSection('catalog')}
                  >
                    Ver todos ({allSkus.length})
                  </button>
                </div>
                {renderSkuCards(filteredSkus.filter((s) => s.pack.popular).slice(0, 6))}
              </div>
            </div>
          )}

          {section === 'calculator' && (
            <div className="nc-panel-card">
              <div className="nc-panel-card-head">
                <h2>
                  <Calculator size={17} />
                  <span>Calculadora de Márgenes de Ganancia</span>
                </h2>
              </div>

              <div className="nc-calc-form">
                <div className="nc-calc-grid">
                  <div className="nc-field-group">
                    <label className="nc-field-label" htmlFor="calc-game">
                      Juego
                    </label>
                    <select
                      id="calc-game"
                      className="nc-input"
                      value={calcGameId}
                      onChange={(e) => {
                        const nextGame =
                          catalog.find((g) => g.id === e.target.value) ?? catalog[0];
                        setCalcGameId(nextGame.id);
                        setCalcPackId(nextGame.packages[0].id);
                        setCustomSalePrice('');
                      }}
                    >
                      {catalog.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="nc-field-group">
                    <label className="nc-field-label" htmlFor="calc-pack">
                      Paquete
                    </label>
                    <select
                      id="calc-pack"
                      className="nc-input"
                      value={selectedCalcPack.id}
                      onChange={(e) => {
                        setCalcPackId(e.target.value);
                        setCustomSalePrice('');
                      }}
                    >
                      {selectedCalcGame.packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="nc-field-group">
                    <label className="nc-field-label" htmlFor="calc-sale">
                      Precio de Venta al Cliente (USD)
                    </label>
                    <input
                      id="calc-sale"
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={customSalePrice}
                      onChange={(e) => setCustomSalePrice(e.target.value)}
                      placeholder={`Sugerido: $${selectedCalcPack.publicPriceUsd.toFixed(2)}`}
                      className="nc-input nc-mono"
                    />
                  </div>
                </div>

                <div className="nc-reseller-sim">
                  <div className="nc-sim-rows">
                    <div className="nc-sim-row">
                      <span>Costo Mayorista Nova Coins</span>
                      <strong className="nc-mono nc-text-cyan">${wholesaleCost.toFixed(2)} USD</strong>
                    </div>
                    <div className="nc-sim-row">
                      <span>Precio Venta Cliente</span>
                      <strong className="nc-mono">${effectiveSalePrice.toFixed(2)} USD</strong>
                    </div>
                    <div className="nc-sim-divider" />
                    <div className="nc-sim-row is-profit">
                      <span>Ganancia Neta ({marginPct}%)</span>
                      <strong className="nc-mono nc-price-gold">
                        {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} USD
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'clients' && (
            <div className="nc-panel-card">
              <div className="nc-panel-card-head">
                <h2>
                  <Gamepad2 size={17} />
                  <span>IDs Frecuentes de Clientes</span>
                </h2>
              </div>

              <form onSubmit={handleSaveClientId} className="nc-save-id-form">
                <select
                  value={newIdGame}
                  onChange={(e) => setNewIdGame(e.target.value)}
                  className="nc-input"
                  aria-label="Juego del cliente"
                >
                  {catalog.map((g) => (
                    <option key={g.id} value={g.title}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <div className="nc-save-id-inputs">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Nombre de la cuenta"
                    className="nc-input"
                  />
                  <input
                    type="text"
                    required
                    value={newPlayerId}
                    onChange={(e) => setNewPlayerId(e.target.value)}
                    placeholder="Player ID / Correo"
                    className="nc-input"
                  />
                  <input
                    type="text"
                    value={newZoneId}
                    onChange={(e) => setNewZoneId(e.target.value)}
                    placeholder="Zone (opcional)"
                    className="nc-input"
                  />
                  <input
                    type="tel"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="WhatsApp (+593...)"
                    className="nc-input"
                  />
                  <button type="submit" className="nc-btn nc-btn-primary nc-btn-sm">
                    <Plus size={15} />
                    <span>Guardar</span>
                  </button>
                </div>
              </form>

              <div className="nc-profile-list">
                {filteredClients.length === 0 ? (
                  <p className="nc-profile-empty">Aún no tienes IDs de clientes guardados.</p>
                ) : (
                  filteredClients.map((item) => (
                    <div key={item.id} className="nc-profile-row-card">
                      <div>
                        <strong>
                          {item.accountName ? `${item.accountName} · ` : ''}
                          {item.gameTitle}
                        </strong>
                        <span className="nc-mono">
                          ID: {item.playerId}
                          {item.zoneId ? ` · Zone ${item.zoneId}` : ''}
                        </span>
                        {item.whatsapp && (
                          <a
                            href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="nc-client-wa-link"
                          >
                            <MessageCircle size={12} />
                            <span className="nc-mono">{item.whatsapp}</span>
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        className="nc-btn nc-btn-gold nc-btn-sm"
                        onClick={() => {
                          const matchedGame =
                            catalog.find((g) => g.title === item.gameTitle) ?? catalog[0];
                          const matchedPack =
                            matchedGame.packages.find((p) => p.popular) ?? matchedGame.packages[0];
                          handleStartSkuSale({ game: matchedGame, pack: matchedPack });
                          setSalePlayerId(item.playerId);
                          setSaleZoneId(item.zoneId ?? '');
                          setSaleAccountName(item.accountName ?? '');
                          setSaleWhatsapp(item.whatsapp ?? '');
                          setSection('catalog');
                        }}
                      >
                        Recargar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === 'orders' && (
            <div className="nc-panel-card">
              <div className="nc-panel-card-head">
                <h2>
                  <Receipt size={17} />
                  <span>Historial de Ventas y Comprobantes</span>
                </h2>
              </div>

              <div className="nc-profile-list">
                {filteredOrders.length === 0 ? (
                  <p className="nc-profile-empty">Aún no tienes ventas registradas.</p>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="nc-profile-row-card">
                      <div>
                        <strong>
                          {order.gameTitle} · {order.packageLabel}
                        </strong>
                        <span>
                          Orden {order.id} · ID: {order.playerId} · {order.status}
                          {order.fulfillmentStatus ? ` (${order.fulfillmentStatus})` : ''} · {order.dateLabel}
                        </span>
                        {order.codes && order.codes.length > 0 ? (
                          <span className="nc-mono" style={{ fontSize: '0.78rem', color: 'var(--nc-gold, #f5c542)', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>
                            PIN / Código: {order.codes.join(' · ')}
                          </span>
                        ) : null}
                      </div>
                      <div className="nc-panel-order-actions">
                        <strong className="nc-mono nc-price-gold">${order.amountUsd.toFixed(2)}</strong>
                        <button
                          type="button"
                          className="nc-btn nc-btn-ghost nc-btn-sm"
                          onClick={() => handleReceiptAction(order)}
                        >
                          {copiedOrderId === order.id ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedOrderId === order.id ? 'Copiado' : 'Comprobante'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {section === 'apikeys' && (
            <div className="nc-panel-card">
              <div className="nc-panel-card-head">
                <h2>
                  <KeyRound size={17} />
                  <span>API Keys para Integraciones</span>
                </h2>
              </div>
              <ApiKeysManager />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
