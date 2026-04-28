import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS and exposes the auth admin API.
 * Use ONLY in server-only modules (server components, server actions, route
 * handlers) and never leak to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase admin env vars");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
