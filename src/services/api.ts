import { io, type Socket } from 'socket.io-client';
import { type UserProfile } from '../data/mockUser';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = API_BASE.replace(/\/api\/?$/, '');
const TOKEN_KEY = 'nc_token';

export interface MarginOverride {
  id: string;
  publicPriceUsd: number;
  resellerPriceUsd: number;
}

export function createUserSocket(token?: string | null): Socket {
  return io(SOCKET_URL, {
    auth: token ? { token } : {},
    transports: ['websocket', 'polling']
  });
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

export async function topUpWalletRequest(amountUsd: number): Promise<{ user: UserProfile }> {
  return apiRequest('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amountUsd })
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
  gameTitle: string;
  packageLabel: string;
  playerId: string;
  zoneId?: string;
  accountName?: string;
  whatsapp?: string;
  amountUsd: number;
  paymentMethod: string;
  usedWallet: boolean;
}): Promise<{ user: UserProfile }> {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

