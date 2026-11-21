import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { type CatalogFilter, CatalogSection } from './components/CatalogSection';
import { Footer } from './components/Footer';
import { HeroCarousel } from './components/HeroCarousel';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { QuickNavStrip } from './components/QuickNavStrip';
import { buildWhatsAppLink } from './config/env';
import { type GameItem, INITIAL_CATALOG } from './data/catalog';
import {
  clearStoredToken,
  createOrderRequest,
  createUserSocket,
  fetchCatalog,
  fetchCatalogMargins,
  fetchCurrentUser,
  getStoredToken,
  type MarginOverride,
  savePlayerIdRequest,
  topUpWalletRequest
} from './services/api';
import { type PanelSection, type UserOrder, type UserProfile } from './types/user';
import './styles/home.css';

const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const ProfileModal = lazy(() =>
  import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal }))
);
const QuickTopUpModal = lazy(() =>
  import('./components/QuickTopUpModal').then((m) => ({ default: m.QuickTopUpModal }))
);
const ResellerPage = lazy(() =>
  import('./components/ResellerPage').then((m) => ({ default: m.ResellerPage }))
);
const ResellerPanelPage = lazy(() =>
  import('./components/ResellerPanelPage').then((m) => ({ default: m.ResellerPanelPage }))
);

type ActivePage = 'home' | 'reseller' | 'reseller-panel';

function resolvePageFromHash(): ActivePage {
  if (window.location.hash === '#reseller') {
    return 'reseller';
  }
  if (window.location.hash === '#panel-reseller') {
    return 'reseller-panel';
  }
  return 'home';
}

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>(resolvePageFromHash);
  const [resellerSection, setResellerSection] = useState<PanelSection>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>('all');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [catalogGames, setCatalogGames] = useState<GameItem[]>(INITIAL_CATALOG);
  const [marginOverrides, setMarginOverrides] = useState<MarginOverride[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isReseller = currentUser?.role === 'Revendedor';

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(resolvePageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    fetchCatalog()
      .then((res) => {
        if (res.games && res.games.length > 0) {
          setCatalogGames(res.games);
        }
      })
      .catch(() => { });

    fetchCatalogMargins()
      .then((res) => setMarginOverrides(res.margins))
      .catch(() => { });

    if (!getStoredToken()) {
      return;
    }
    fetchCurrentUser()
      .then((res) => {
        setCurrentUser(res.user);
      })
      .catch(() => {
        clearStoredToken();
      });
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    const socket = createUserSocket(token);
    socket.on('user:updated', (payload: { user: UserProfile }) => {
      if (payload?.user) {
        setCurrentUser(payload.user);
      }
    });
    socket.on('catalog:margins', (payload: { margins: MarginOverride[] }) => {
      if (payload?.margins) {
        setMarginOverrides(payload.margins);
      }
    });
    socket.on('catalog:updated', (payload: { games: GameItem[] }) => {
      if (payload?.games && payload.games.length > 0) {
        setCatalogGames(payload.games);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id]);

  const liveCatalog = useMemo(() => {
    if (marginOverrides.length === 0) {
      return catalogGames;
    }
    const map = new Map(marginOverrides.map((m) => [m.id, m]));
    return catalogGames.map((game) => ({
      ...game,
      packages: game.packages.map((pack) => {
        const override = map.get(pack.id);
        return override
          ? {
            ...pack,
            publicPriceUsd: override.publicPriceUsd,
            resellerPriceUsd: override.resellerPriceUsd
          }
          : pack;
      })
    }));
  }, [catalogGames, marginOverrides]);

  const navigateTo = (page: ActivePage) => {
    setActivePage(page);
    if (page === 'reseller') {
      window.location.hash = '#reseller';
    } else if (page === 'reseller-panel') {
      window.location.hash = '#panel-reseller';
    } else {
      window.location.hash = '#tienda';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return liveCatalog.filter((game) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'hot' && Boolean(game.isHot)) ||
        game.category === activeFilter;

      const matchesSearch =
        !q ||
        game.title.toLowerCase().includes(q) ||
        game.currencyName.toLowerCase().includes(q) ||
        game.publisher.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [liveCatalog, searchQuery, activeFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3600);
  };

  const handleSupportClick = () => {
    const whatsappHref = buildWhatsAppLink('Hola Nova Coins, necesito soporte con una recarga.');
    if (whatsappHref) {
      window.open(whatsappHref, '_blank', 'noopener,noreferrer');
      return;
    }
    showToast('Atención directa Ecuador (+593) para pagos y soporte.');
  };

  const handleTopUpWallet = async (
    amountUsd: number,
    options?: { paymentMethod?: string; referenceCode?: string; proofImage?: string }
  ) => {
    try {
      const res = await topUpWalletRequest(amountUsd, options);
      setCurrentUser(res.user);
      showToast(
        `Solicitud de fondeo ${res.order.id} ($${amountUsd.toFixed(2)} USD) enviada para validación.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo solicitar el fondeo.');
    }
  };

  const handleAddSavedId = async (payload: {
    gameTitle: string;
    playerId: string;
    zoneId?: string;
    targetPayload?: Record<string, string>;
    accountName?: string;
    whatsapp?: string;
  }) => {
    try {
      const res = await savePlayerIdRequest(payload);
      setCurrentUser(res.user);
      showToast(`ID ${payload.playerId} guardado en frecuentes.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo guardar el ID.');
    }
  };

  const handleCopyReceipt = (order: UserOrder) => {
    const receipt = [
      'NOVA COINS · COMPROBANTE DE RECARGA',
      `Orden: ${order.id}`,
      `Juego: ${order.gameTitle}`,
      `Paquete: ${order.packageLabel}`,
      `ID Jugador: ${order.playerId}`,
      ...(order.codes && order.codes.length > 0 ? [`PIN / Códigos: ${order.codes.join(', ')}`] : []),
      `Estado: ${order.status}`
    ].join('\n');
    navigator.clipboard?.writeText(receipt).catch(() => {});
    showToast(`Comprobante ${order.id} copiado para tu cliente.`);
  };

  const handleOrderComplete = async (payload: {
    packageId?: string;
    gameTitle: string;
    packageLabel: string;
    playerId: string;
    zoneId?: string;
    targetPayload?: Record<string, string>;
    accountName?: string;
    whatsapp?: string;
    amountUsd: number;
    paymentMethod: string;
    referenceCode?: string;
    proofImage?: string;
    usedWallet: boolean;
  }): Promise<UserOrder> => {
    if (!getStoredToken()) {
      setAuthModalOpen(true);
      throw new Error('Inicia sesión para completar tu recarga.');
    }
    try {
      const res = await createOrderRequest(payload);
      setCurrentUser(res.user);
      return res.order;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo registrar la orden.';
      showToast(msg);
      throw err;
    }
  };

  return (
    <div className="nc-app">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (activePage !== 'home') {
            setActivePage('home');
          }
        }}
        currentUser={currentUser}
        activePage={activePage}
        resellerSection={resellerSection}
        onSelectResellerSection={setResellerSection}
        onGoHomeSection={(hash) => {
          setActivePage('home');
          window.location.hash = hash;
          window.setTimeout(() => {
            const id = hash.replace('#', '');
            if (id === 'top') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }
          }, 50);
        }}
        onOpenAuthPrompt={() => setAuthModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenResellerModal={() => navigateTo('reseller')}
        onOpenResellerPanel={() => navigateTo('reseller-panel')}
        onLogout={() => {
          clearStoredToken();
          setCurrentUser(null);
          if (activePage === 'reseller-panel') {
            navigateTo('home');
          }
          showToast('Sesión cerrada.');
        }}
        onSupportClick={handleSupportClick}
      />

      <main>
        <Suspense fallback={null}>
          {activePage === 'reseller' ? (
            <ResellerPage onBackHome={() => navigateTo('home')} />
          ) : activePage === 'reseller-panel' && isReseller && currentUser ? (
            <ResellerPanelPage
              user={currentUser}
              catalog={liveCatalog}
              activeSection={resellerSection}
              onSectionChange={setResellerSection}
              onBackHome={() => navigateTo('home')}
              onLogout={() => {
                clearStoredToken();
                setCurrentUser(null);
                navigateTo('home');
                showToast('Sesión cerrada.');
              }}
              onTopUpWallet={handleTopUpWallet}
              onExecuteB2BSale={handleOrderComplete}
              onAddSavedId={handleAddSavedId}
              onCopyReceipt={handleCopyReceipt}
            />
          ) : (
            <>
              <HeroCarousel
                featuredGame={liveCatalog[0]}
                allGames={liveCatalog}
                onQuickSelectGame={setSelectedGame}
              />

              <QuickNavStrip
                onSelectFilter={setActiveFilter}
                onSupportClick={handleSupportClick}
              />

              <CatalogSection
                allGames={liveCatalog}
                games={filteredGames}
                activeFilter={activeFilter}
                isResellerMode={isReseller}
                onFilterChange={setActiveFilter}
                onSelectGame={setSelectedGame}
              />

              <HowItWorks />
            </>
          )}
        </Suspense>
      </main>

      <Footer
        onOpenResellerModal={() =>
          navigateTo(isReseller ? 'reseller-panel' : 'reseller')
        }
        onSupportClick={handleSupportClick}
      />

      <Suspense fallback={null}>
        <QuickTopUpModal
          key={selectedGame?.id ?? 'none'}
          game={selectedGame}
          isAuthenticated={Boolean(currentUser)}
          isResellerMode={isReseller}
          walletBalanceUsd={currentUser?.walletBalanceUsd}
          onRequireAuth={() => {
            setSelectedGame(null);
            setAuthModalOpen(true);
            showToast('Inicia sesión o regístrate para completar tu recarga.');
          }}
          onOrderComplete={handleOrderComplete}
          onClose={() => setSelectedGame(null)}
        />

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setAuthModalOpen(false);
            if (user.role === 'Revendedor') {
              navigateTo('reseller-panel');
              showToast(`Bienvenido al Panel Reseller, ${user.fullName}.`);
            } else {
              navigateTo('home');
              showToast(`Sesión iniciada como ${user.fullName} · Billetera USD activa.`);
            }
          }}
        />

        <ProfileModal
          open={profileModalOpen}
          user={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onTopUpWallet={handleTopUpWallet}
          onUserUpdated={(u) => setCurrentUser(u)}
          onNotify={showToast}
          onLogout={() => {
            clearStoredToken();
            setCurrentUser(null);
            setProfileModalOpen(false);
            if (activePage === 'reseller-panel') {
              navigateTo('home');
            }
            showToast('Sesión cerrada.');
          }}
        />
      </Suspense>

      {toastMessage && (
        <div className="nc-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
