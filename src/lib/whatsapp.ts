// Fallbacks used when the CMS hasn't been seeded or hydration is happening.
// Anything user-facing should prefer values from `getCmsContent()` and pass
// them through `whatsappUrlFor`.
export const WHATSAPP_NUMBER = "573122765732";
export const WHATSAPP_DISPLAY = "+57 312 276 5732";

export function whatsappUrlFor(number: string, message: string): string {
  const digits = number.replace(/\D/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** @deprecated use whatsappUrlFor with a CMS-backed number. */
export function whatsappUrl(message: string): string {
  return whatsappUrlFor(WHATSAPP_NUMBER, message);
}
