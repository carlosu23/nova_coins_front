const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(
  /\/+$/,
  ''
);

export const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const SOCKET_URL = API_BASE.replace(/\/api$/, '');

let currentWhatsappNumber = '';

export function setWhatsappNumber(raw?: string | null) {
  currentWhatsappNumber = String(raw || '').replace(/\D/g, '');
}

export function buildWhatsAppLink(message?: string): string | null {
  if (!currentWhatsappNumber) {
    return null;
  }
  const base = `https://wa.me/${currentWhatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
