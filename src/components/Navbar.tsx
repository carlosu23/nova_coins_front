import {
  Calculator,
  Crown,
  Gamepad2,
  Gift,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Search,
  ShoppingBag,
  User,
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type UserProfile } from '../data/mockUser';
import { NovaLogo } from './NovaLogo';
import { type PanelSection } from './ResellerPanelPage';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  currentUser: UserProfile | null;
  activePage: 'home' | 'reseller' | 'reseller-panel';
  resellerSection: PanelSection;
  onSelectResellerSection: (section: PanelSection) => void;
  onGoHomeSection: (hash: string) => void;
  onOpenAuthPrompt: () => void;
  onOpenProfileModal: () => void;
  onOpenResellerModal: () => void;
  onOpenResellerPanel: () => void;
  onLogout: () => void;
  onSupportClick: () => void;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  currentUser,
  activePage,
  resellerSection,
  onSelectResellerSection,
  onGoHomeSection,
  onOpenAuthPrompt,
  onOpenProfileModal,
  onOpenResellerModal,
  onOpenResellerPanel,
  onLogout,
  onSupportClick
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const firstName = currentUser?.fullName.split(' ')[0] ?? '';
  const initials = currentUser
    ? currentUser.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('')
    : '';

  const isResellerUser = currentUser?.role === 'Revendedor';

  const handleResellerNav = (sec: PanelSection) => {
    setMenuOpen(false);
    onSelectResellerSection(sec);
    if (activePage !== 'reseller-panel') {
      onOpenResellerPanel();
    }
  };

  return (
    <>
      <header className="nc-navbar">
        <div className="nc-container nc-navbar-inner">
          <div className="nc-navbar-left">
            <button
              type="button"
              className="nc-menu-pill"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Abrir menú"
            >
              <Menu size={16} />
              <span className="nc-menu-pill-label">Menú</span>
            </button>

            <a
              href="#top"
              className="nc-navbar-brand"
              onClick={(e) => {
                e.preventDefault();
                onGoHomeSection('#top');
              }}
            >
              <NovaLogo variant="full" size={34} />
            </a>
          </div>

          <div className="nc-navbar-search">
            <Search size={16} className="nc-search-icon" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Busca juegos, gift cards y más"
              aria-label="Busca juegos, gift cards y más"
            />
            <span className="nc-search-shortcut" aria-hidden="true">
              /
            </span>
          </div>

          <div className="nc-navbar-actions">
            {isResellerUser ? (
              <button
                type="button"
                className="nc-btn-reseller-cta is-panel-btn"
                onClick={onOpenResellerPanel}
              >
                <Crown size={14} />
                <span>Panel Reseller</span>
              </button>
            ) : (
              <button
                type="button"
                className="nc-btn-reseller-cta"
                onClick={onOpenResellerModal}
              >
                <Crown size={14} />
                <span>¿Querés ser Reseller?</span>
              </button>
            )}

            <div className="nc-region-pill" title="Mercado Ecuador · Dólares USD">
              <span className="nc-flag-dot" />
              <span>EC · USD</span>
            </div>

            {currentUser ? (
              <button
                type="button"
                className="nc-user-pill"
                onClick={onOpenProfileModal}
                title="Ver perfil y billetera"
              >
                <span className="nc-user-avatar-sm">{initials}</span>
                <span className="nc-user-pill-name">{firstName}</span>
                <span className="nc-mono nc-user-pill-bal">
                  ${currentUser.walletBalanceUsd.toFixed(2)}
                </span>
              </button>
            ) : (
              <button type="button" className="nc-btn-ingresar" onClick={onOpenAuthPrompt}>
                <User size={16} />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>

        {activePage === 'home' && (
          <div className="nc-mobile-search-bar">
            <div className="nc-container">
              <div className="nc-navbar-search nc-mobile-search-input">
                <Search size={16} className="nc-search-icon" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Busca juegos, gift cards y más"
                  aria-label="Buscar en móvil"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {menuOpen && (
        <div
          className="nc-burger-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          onClick={() => setMenuOpen(false)}
        >
          <aside className="nc-burger-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="nc-burger-header">
              <NovaLogo variant="full" size={32} />
              <button
                type="button"
                className="nc-modal-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>

            {currentUser ? (
              <button
                type="button"
                className="nc-burger-user-card"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfileModal();
                }}
              >
                <div className="nc-profile-avatar">{initials}</div>
                <div>
                  <strong>{currentUser.fullName}</strong>
                  <span className="nc-b2b-role-tag">
                    <Wallet size={12} />
                    <span className="nc-mono">${currentUser.walletBalanceUsd.toFixed(2)} USD</span>
                    {' · '}
                    {currentUser.role}
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                className="nc-btn nc-btn-gold nc-btn-full"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuthPrompt();
                }}
              >
                <User size={16} />
                <span>Ingresar o Registrarse</span>
              </button>
            )}

            <div className="nc-burger-scroll">
              {isResellerUser ? (
                <div className="nc-burger-group">
                  <span className="nc-burger-label">Panel Reseller</span>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${
                      activePage === 'reseller-panel' && resellerSection === 'catalog'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => handleResellerNav('catalog')}
                  >
                    <ShoppingBag size={17} />
                    <span>Catálogo Mayorista</span>
                  </button>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${
                      activePage === 'reseller-panel' && resellerSection === 'overview'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => handleResellerNav('overview')}
                  >
                    <LayoutDashboard size={17} />
                    <span>Resumen y Métricas</span>
                  </button>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${
                      activePage === 'reseller-panel' && resellerSection === 'calculator'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => handleResellerNav('calculator')}
                  >
                    <Calculator size={17} />
                    <span>Calculadora de Márgenes</span>
                  </button>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${
                      activePage === 'reseller-panel' && resellerSection === 'clients'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => handleResellerNav('clients')}
                  >
                    <Gamepad2 size={17} />
                    <span>IDs de Clientes</span>
                  </button>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${
                      activePage === 'reseller-panel' && resellerSection === 'orders'
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() => handleResellerNav('orders')}
                  >
                    <Receipt size={17} />
                    <span>Ventas y Recibos</span>
                  </button>

                  <span className="nc-burger-label nc-burger-label-spaced">Accesos</span>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${activePage === 'home' ? 'is-active' : ''}`}
                    onClick={() => {
                      setMenuOpen(false);
                      onGoHomeSection('#tienda');
                    }}
                  >
                    <Crown size={17} />
                    <span>Ver Tienda Pública</span>
                  </button>
                  <button
                    type="button"
                    className="nc-b2b-nav-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onSupportClick();
                    }}
                  >
                    <Headphones size={17} />
                    <span>Soporte Prioritario +593</span>
                  </button>
                </div>
              ) : (
                <div className="nc-burger-group">
                  <span className="nc-burger-label">Tienda Nova Coins</span>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${activePage === 'home' ? 'is-active' : ''}`}
                    onClick={() => {
                      setMenuOpen(false);
                      onGoHomeSection('#tienda');
                    }}
                  >
                    <ShoppingBag size={17} />
                    <span>Tienda de Juegos</span>
                  </button>
                  <button
                    type="button"
                    className="nc-b2b-nav-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onGoHomeSection('#catalogo');
                    }}
                  >
                    <Zap size={17} />
                    <span>Top-Up por ID</span>
                  </button>
                  <button
                    type="button"
                    className="nc-b2b-nav-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onGoHomeSection('#catalogo');
                    }}
                  >
                    <Gift size={17} />
                    <span>Gift Cards USD</span>
                  </button>
                  <button
                    type="button"
                    className={`nc-b2b-nav-item ${activePage === 'reseller' ? 'is-active' : ''}`}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenResellerModal();
                    }}
                  >
                    <Crown size={17} />
                    <span>¿Querés ser Reseller?</span>
                  </button>
                  <button
                    type="button"
                    className="nc-b2b-nav-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onSupportClick();
                    }}
                  >
                    <Headphones size={17} />
                    <span>Soporte Ecuador +593</span>
                  </button>
                </div>
              )}
            </div>

            {currentUser && (
              <div className="nc-burger-footer">
                <button
                  type="button"
                  className="nc-b2b-logout-btn nc-btn-full"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
