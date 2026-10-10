/** Seller WhatsApp number, digits only in international format (e.g. 351912345678). Set VITE_SELLER_WHATSAPP in .env. */
export const SELLER_WHATSAPP = (import.meta.env.VITE_SELLER_WHATSAPP ?? '').replace(/\D/g, '');
