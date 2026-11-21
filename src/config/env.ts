export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(
  /\/+$/,
  ''
);

export const SOCKET_URL = API_BASE.replace(/\/api$/, '');

export const WHATSAPP_NUMBER = String(import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

export function buildWhatsAppLink(message?: string): string | null {
  if (!WHATSAPP_NUMBER) {
    return null;
  }
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
