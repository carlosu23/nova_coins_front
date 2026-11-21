export type GameCategory = 'topup' | 'giftcard';

export interface TargetSchemaField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'email';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface GamePackage {
  id: string;
  label: string;
  bonus?: string;
  imageUrl?: string;
  publicPriceUsd: number;
  resellerPriceUsd: number;
  popular?: boolean;
  inStock?: boolean;
  availableStock?: number | null;
  requiresTarget?: boolean;
  targetSchema?: TargetSchemaField[];
  supplierLinked?: boolean;
}

export interface GameItem {
  id: string;
  slug: string;
  title: string;
  publisher: string;
  currencyName: string;
  category: GameCategory;
  categoryLabel: string;
  badgeText: string;
  deliverySpeed: string;
  requiresZoneId: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  zonePlaceholder?: string;
  accentGradient: string;
  accentColor: string;
  shortCode: string;
  logoUrl?: string;
  isHot?: boolean;
  packages: GamePackage[];
}

export const INITIAL_CATALOG: GameItem[] = [
  {
    id: 'free-fire',
    slug: 'free-fire',
    title: 'Free Fire',
    publisher: 'Garena',
    currencyName: 'Diamantes',
    category: 'topup',
    categoryLabel: 'Top-Up por ID',
    badgeText: 'Top Ventas EC',
    deliverySpeed: 'Entrega < 5s',
    requiresZoneId: false,
    inputLabel: 'ID de Jugador (UID)',
    inputPlaceholder: 'Ej: 2491857302',
    accentGradient: '#000000',
    accentColor: '#F97316',
    shortCode: 'FF',
    logoUrl: '/images/free-fire-logo.svg',
    isHot: true,
    packages: [
      {
        id: 'ff-100',
        label: '100 + 10 Diamantes',
        bonus: '+10% Bonus',
        imageUrl: '/images/free-fire-diamonds.jpg',
        publicPriceUsd: 1.15,
        resellerPriceUsd: 0.96
      },
      {
        id: 'ff-310',
        label: '310 + 31 Diamantes',
        bonus: '+10% Bonus',
        imageUrl: '/images/free-fire-diamonds.jpg',
        publicPriceUsd: 3.35,
        resellerPriceUsd: 2.89,
        popular: true
      },
      {
        id: 'ff-520',
        label: '520 + 52 Diamantes',
        bonus: '+10% Bonus',
        imageUrl: '/images/free-fire-vault.jpg',
        publicPriceUsd: 5.5,
        resellerPriceUsd: 4.78
      },
      {
        id: 'ff-1060',
        label: '1,060 + 106 Diamantes',
        bonus: '+10% Bonus',
        imageUrl: '/images/free-fire-vault.jpg',
        publicPriceUsd: 10.9,
        resellerPriceUsd: 9.45
      },
      {
        id: 'ff-2180',
        label: '2,180 + 218 Diamantes',
        bonus: 'VIP Pack',
        imageUrl: '/images/free-fire-chest.jpg',
        publicPriceUsd: 21.8,
        resellerPriceUsd: 18.95
      },
      {
        id: 'ff-5600',
        label: '5,600 + 560 Diamantes',
        bonus: 'Mega Pack',
        imageUrl: '/images/free-fire-chest.jpg',
        publicPriceUsd: 53.9,
        resellerPriceUsd: 46.8
      }
    ]
  },
  {
    id: 'blood-strike',
    slug: 'blood-strike',
    title: 'Blood Strike',
    publisher: 'NetEase Games',
    currencyName: 'Oro',
    category: 'topup',
    categoryLabel: 'Top-Up por ID',
    badgeText: 'Entrega Rápida',
    deliverySpeed: 'Instantáneo',
    requiresZoneId: false,
    inputLabel: 'ID de Jugador',
    inputPlaceholder: 'Ej: 884012934',
    accentGradient: '#000000',
    accentColor: '#EF4444',
    shortCode: 'BS',
    logoUrl: '/images/blood-strike-logo.svg',
    isHot: true,
    packages: [
      { id: 'bs-100', label: '100 + 5 Oro', publicPriceUsd: 0.99, resellerPriceUsd: 0.85 },
      { id: 'bs-300', label: '300 + 20 Oro', bonus: '+20 Bonus', publicPriceUsd: 2.95, resellerPriceUsd: 2.52, popular: true },
      { id: 'bs-500', label: '500 + 40 Oro', bonus: '+40 Bonus', publicPriceUsd: 4.89, resellerPriceUsd: 4.18 },
      { id: 'bs-1000', label: '1,000 + 100 Oro', bonus: '+100 Bonus', publicPriceUsd: 9.65, resellerPriceUsd: 8.30 },
      { id: 'bs-2000', label: '2,000 + 260 Oro', bonus: 'Pro Pack', publicPriceUsd: 19.20, resellerPriceUsd: 16.45 },
      { id: 'bs-5000', label: '5,000 + 800 Oro', bonus: 'Elite Pack', publicPriceUsd: 47.50, resellerPriceUsd: 40.90 }
    ]
  },
  {
    id: 'roblox',
    slug: 'roblox',
    title: 'Roblox',
    publisher: 'Roblox Corp',
    currencyName: 'Gift Cards / Robux',
    category: 'giftcard',
    categoryLabel: 'Gift Card',
    badgeText: 'PIN Digital',
    deliverySpeed: 'Entrega Inmediata',
    requiresZoneId: false,
    inputLabel: 'Correo para recibir PIN',
    inputPlaceholder: 'tu-correo@ejemplo.com',
    accentGradient: '#000000',
    accentColor: '#00D2FF',
    shortCode: 'RBX',
    logoUrl: '/images/roblox-logo.webp',
    packages: [
      {
        id: 'rbx-10',
        label: 'Gift Card $10 USD (800 Robux)',
        imageUrl: '/images/roblox-10.jpg',
        publicPriceUsd: 10.5,
        resellerPriceUsd: 9.65,
        popular: true
      },
      {
        id: 'rbx-15',
        label: 'Gift Card $15 USD (1,200 Robux)',
        imageUrl: '/images/roblox-15.jpg',
        publicPriceUsd: 15.6,
        resellerPriceUsd: 14.4
      },
      {
        id: 'rbx-25',
        label: 'Gift Card $25 USD (2,000 Robux)',
        bonus: 'Más elegida',
        imageUrl: '/images/roblox-25.jpg',
        publicPriceUsd: 25.8,
        resellerPriceUsd: 23.9
      },
      {
        id: 'rbx-50',
        label: 'Gift Card $50 USD (4,500 Robux)',
        bonus: '+10% Valor',
        imageUrl: '/images/roblox-50.jpg',
        publicPriceUsd: 51.2,
        resellerPriceUsd: 47.6
      }
    ]
  },
  {
    id: 'mobile-legends',
    slug: 'mobile-legends',
    title: 'Mobile Legends: Bang Bang',
    publisher: 'Moonton',
    currencyName: 'Diamantes',
    category: 'topup',
    categoryLabel: 'Top-Up por ID',
    badgeText: 'ID + Zone ID',
    deliverySpeed: 'Entrega < 5s',
    requiresZoneId: true,
    inputLabel: 'User ID',
    inputPlaceholder: 'Ej: 194827105',
    zonePlaceholder: 'Zone ID (Ej: 5201)',
    accentGradient: '#000000',
    accentColor: '#D946EF',
    shortCode: 'ML',
    logoUrl: '/images/mlbb-logo.webp',
    isHot: true,
    packages: [
      { id: 'ml-86', label: '78 + 8 Diamantes', publicPriceUsd: 1.45, resellerPriceUsd: 1.24 },
      { id: 'ml-172', label: '156 + 16 Diamantes', publicPriceUsd: 2.85, resellerPriceUsd: 2.46 },
      { id: 'ml-257', label: '234 + 23 Diamantes', bonus: 'Popular', publicPriceUsd: 4.25, resellerPriceUsd: 3.68, popular: true },
      { id: 'ml-706', label: '625 + 81 Diamantes', bonus: '+81 Bonus', publicPriceUsd: 11.40, resellerPriceUsd: 9.85 },
      { id: 'ml-2195', label: '1,860 + 335 Diamantes', bonus: 'Mythic Pack', publicPriceUsd: 34.50, resellerPriceUsd: 29.80 }
    ]
  },
  {
    id: 'pubg-mobile',
    slug: 'pubg-mobile',
    title: 'PUBG Mobile',
    publisher: 'Tencent Games',
    currencyName: 'UC',
    category: 'topup',
    categoryLabel: 'Top-Up por ID',
    badgeText: 'Global UC',
    deliverySpeed: 'Entrega < 10s',
    requiresZoneId: false,
    inputLabel: 'Character ID',
    inputPlaceholder: 'Ej: 5192048172',
    accentGradient: '#000000',
    accentColor: '#FACC15',
    shortCode: 'UC',
    logoUrl: '/images/pubg-logo.svg',
    packages: [
      { id: 'pubg-60', label: '60 UC', publicPriceUsd: 0.99, resellerPriceUsd: 0.87 },
      { id: 'pubg-325', label: '300 + 25 UC', bonus: '+25 UC', publicPriceUsd: 4.85, resellerPriceUsd: 4.25, popular: true },
      { id: 'pubg-660', label: '600 + 60 UC', bonus: 'Royale Pass', publicPriceUsd: 9.65, resellerPriceUsd: 8.45 },
      { id: 'pubg-1800', label: '1,500 + 300 UC', bonus: '+300 UC', publicPriceUsd: 23.90, resellerPriceUsd: 21.10 },
      { id: 'pubg-3850', label: '3,000 + 850 UC', bonus: 'Elite UC', publicPriceUsd: 47.90, resellerPriceUsd: 42.30 }
    ]
  },
  {
    id: 'honor-of-kings',
    slug: 'honor-of-kings',
    title: 'Honor of Kings',
    publisher: 'Level Infinite',
    currencyName: 'Tokens',
    category: 'topup',
    categoryLabel: 'Top-Up por ID',
    badgeText: 'Nuevo',
    deliverySpeed: 'Instantáneo',
    requiresZoneId: false,
    inputLabel: 'Player ID (UID)',
    inputPlaceholder: 'Ej: 7710294812',
    accentGradient: '#000000',
    accentColor: '#F59E0B',
    shortCode: 'HOK',
    logoUrl: '/images/hok-logo.jpg',
    packages: [
      { id: 'hok-80', label: '80 Tokens', publicPriceUsd: 0.99, resellerPriceUsd: 0.86 },
      { id: 'hok-240', label: '240 + 16 Tokens', publicPriceUsd: 2.95, resellerPriceUsd: 2.55 },
      { id: 'hok-400', label: '400 + 32 Tokens', bonus: 'Popular', publicPriceUsd: 4.90, resellerPriceUsd: 4.22, popular: true },
      { id: 'hok-800', label: '800 + 80 Tokens', bonus: '+80 Bonus', publicPriceUsd: 9.75, resellerPriceUsd: 8.40 },
      { id: 'hok-2400', label: '2,400 + 360 Tokens', bonus: 'Grandmaster', publicPriceUsd: 28.90, resellerPriceUsd: 25.10 }
    ]
  }
];

