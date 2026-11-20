export interface SavedPlayerId {
  id: string;
  gameTitle: string;
  playerId: string;
  zoneId?: string;
  accountName?: string;
  whatsapp?: string;
}

export interface UserOrder {
  id: string;
  gameTitle: string;
  packageLabel: string;
  playerId: string;
  amountUsd: number;
  paymentMethod: string;
  status: 'Completado' | 'En proceso';
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
