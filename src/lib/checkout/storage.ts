const KEY = "ts:checkout";
const TTL_MS = 24 * 60 * 60 * 1000;

export interface CheckoutState {
  plan: string;
  step: number;
  contact: { name: string; whatsapp: string; email: string };
  methodId: string;
  txRef: string;
  ts: number;
}

export function readCheckout(): CheckoutState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CheckoutState;
    if (!data?.ts || Date.now() - data.ts > TTL_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeCheckout(state: Omit<CheckoutState, "ts">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...state, ts: Date.now() }));
  } catch {
    // quota or private mode — ignore
  }
}

export function clearCheckout(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
