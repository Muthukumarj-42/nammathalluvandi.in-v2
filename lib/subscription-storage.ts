export interface StoredSubscription {
  id: string;
  user_id: string;
  vendor_id?: string | null;
  plan_id: "basic" | "growth" | "pro";
  billing_cycle: "1_month" | "3_months";
  amount: number;
  payment_id?: string | null;
  payment_status: "initiated" | "completed" | "failed" | "cancelled" | "pending";
  status: "active" | "expired" | "pending";
  max_carts: number;
  starts_at: string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY_PREFIX = "ntv_vendor_sub_";

/**
 * Saves an active subscription to localStorage for immediate resilience
 * across page reloads, tab navigation, and network/RLS issues.
 */
export function saveLocalSubscription(userId: string, subscription: any): void {
  if (typeof window === "undefined" || !userId || !subscription) return;
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(key, JSON.stringify(subscription));
  } catch (err) {
    console.warn("Failed to write subscription to localStorage:", err);
  }
}

/**
 * Retrieves a valid, unexpired subscription from localStorage for the given user.
 */
export function getLocalSubscription(userId: string): StoredSubscription | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: StoredSubscription = JSON.parse(raw);
    if (!parsed || !parsed.expires_at) return null;

    // Check expiration
    const expiresAt = new Date(parsed.expires_at).getTime();
    const now = Date.now();
    if (expiresAt <= now) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn("Failed to read subscription from localStorage:", err);
    return null;
  }
}

/**
 * Clears subscription from localStorage
 */
export function clearLocalSubscription(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("Failed to clear subscription from localStorage:", err);
  }
}
