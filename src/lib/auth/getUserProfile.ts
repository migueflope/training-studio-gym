import { createClient } from "@/lib/supabase/server";
import { isAdminRole, type UserProfile, type UserRole } from "@/lib/auth/roles";

export { isAdminRole };
export type { UserProfile, UserRole };

/**
 * Server-side helper to load the current user + their profile row.
 * Returns null when no session is active.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  // Fall back to auth metadata if the profile row hasn't been created yet
  // (e.g. trigger missing or first request after signup before /auth/callback ran).
  const meta = user.user_metadata ?? {};
  const fullName: string =
    profile?.full_name ??
    meta.full_name ??
    meta.name ??
    user.email?.split("@")[0] ??
    "Usuario";

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    firstName: fullName.split(" ")[0],
    initials: getInitials(fullName),
    phone: profile?.phone ?? meta.phone ?? null,
    avatarUrl: profile?.avatar_url ?? meta.avatar_url ?? null,
    role: profile?.role ?? "member",
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
