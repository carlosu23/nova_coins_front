export type PanelSection = 'overview' | 'catalog' | 'calculator' | 'clients' | 'orders' | 'apikeys';

export interface UserApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  environment: 'production' | 'sandbox';
  scopes: string[];
  allowedIps: string;
  active: boolean;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface SavedPlayerId {
  id: string;
  gameTitle: string;
  playerId: string;
  zoneId?: string;
  accountName?: string;
  whatsapp?: string;
}

export type OrderStatus = 'Completado' | 'Aprobado' | 'Pendiente' | 'Rechazado' | 'En proceso';

export interface UserOrder {
  id: string;
  gameTitle: string;
  packageLabel: string;
  playerId: string;
  amountUsd: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt?: string;
  dateLabel: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Super Administrador' | 'Revendedor' | 'Cliente';
  walletBalanceUsd: number;
  savedIds: SavedPlayerId[];
  recentOrders: UserOrder[];
}
