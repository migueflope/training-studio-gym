export const WHATSAPP_NUMBER = "573122765732";
export const WHATSAPP_DISPLAY = "+57 312 276 5732";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
