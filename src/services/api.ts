import { io, type Socket } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../config/env';
import { type GameItem } from '../data/catalog';
import { type UserApiKey, type UserOrder, type UserProfile } from '../types/user';

const TOKEN_KEY = 'nc_token';

export interface MarginOverride {
  id: string;
  publicPriceUsd: number;
  resellerPriceUsd: number;
}

export interface PublicPaymentChannel {
  id: string;
  name: string;
  accountDetail: string;
  priority: string;
  qrImage?: string;
}

export interface HeroBannerSlide {
  id: string;
  tagLeft: string;
  tagRight: string;
  title: string;
  accentWord: string;
  subtitle: string;
  ctaLabel: string;
  action: 'game' | 'catalog';
  targetGameId?: string;
  badgeIcon: 'zap' | 'sparkles';
  backgroundImage?: string;
  sideHighlightTitle: string;
  sideHighlightValue: string;
  sideHighlightNote: string;
}

export function createUserSocket(token?: string | null): Socket {
  return io(SOCKET_URL, {
    auth: token ? { token } : {},
    transports: ['websocket']
  });
}

export function fetchCatalog(): Promise<{ games: GameItem[] }> {
  return apiRequest('/catalog');
}

export function fetchActiveChannels(): Promise<{ channels: PublicPaymentChannel[] }> {
  return apiRequest('/catalog/channels');
}

export function fetchHeroBanners(): Promise<{ banners: HeroBannerSlide[] }> {
  return apiRequest('/catalog/hero-banners');
}

export function fetchCatalogMargins(): Promise<{ margins: MarginOverride[] }> {
  return apiRequest('/catalog/margins');
}

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo completar la solicitud.');
  }
  return data;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<{ token: string; user: UserProfile }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerRequest(payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchCurrentUser(): Promise<{ user: UserProfile }> {
  return apiRequest('/auth/me');
}

export async function updateProfileRequest(payload: {
  fullName: string;
  phone: string;
}): Promise<{ user: UserProfile }> {
  return apiRequest('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function changePasswordRequest(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  return apiRequest('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function validatePlayerRequest(payload: {
  packageId: string;
  playerId: string;
  zoneId?: string;
  targetPayload?: Record<string, string>;
}): Promise<{ status: 'valid' | 'invalid' | 'unverified'; playerName: string | null; reason: string | null }> {
  return apiRequest('/catalog/validate-player', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function topUpWalletRequest(
  amountUsd: number,
  options?: { paymentMethod?: string; referenceCode?: string; proofImage?: string }
): Promise<{
  user: UserProfile;
  order: { id: string; amountUsd: number; status: string };
}> {
  return apiRequest('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({
      amountUsd,
      paymentMethod: options?.paymentMethod,
      referenceCode: options?.referenceCode,
      proofImage: options?.proofImage
    })
  });
}

export async function savePlayerIdRequest(payload: {
  gameTitle: string;
  playerId: string;
  zoneId?: string;
  accountName?: string;
  whatsapp?: string;
}): Promise<{ user: UserProfile }> {
  return apiRequest('/saved-ids', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createOrderRequest(payload: {
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
}): Promise<{ user: UserProfile; order: UserOrder }> {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function submitResellerApplicationRequest(payload: {
  fullName: string;
  businessName?: string;
  email: string;
  phone: string;
  monthlyVolume: string;
  message?: string;
}): Promise<{ referenceCode: string; status: string }> {
  return apiRequest('/reseller-applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchApiKeysRequest(): Promise<{ apiKeys: UserApiKey[] }> {
  return apiRequest('/api-keys');
}

export async function createApiKeyRequest(payload: {
  name: string;
  environment: 'production' | 'sandbox';
  scopes: string[];
  allowedIps?: string;
}): Promise<{ plainKey: string; apiKey: UserApiKey }> {
  return apiRequest('/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function revokeApiKeyRequest(id: string): Promise<{ ok: boolean }> {
  return apiRequest(`/api-keys/${id}`, {
    method: 'DELETE'
  });
}
