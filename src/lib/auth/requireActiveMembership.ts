import { redirect } from "next/navigation";
import { isAdminRole, type UserProfile } from "@/lib/auth/roles";
import { getUserProfile } from "@/lib/auth/getUserProfile";
import {
  getActiveMembership,
  type ActiveMembership,
} from "@/lib/auth/getActiveMembership";

export interface MembershipContext {
  profile: UserProfile;
  isAdmin: boolean;
  membership: ActiveMembership | null;
}

/**
 * Use in dashboard pages that require an active membership (Resumen, Rutinas,
 * Progreso, Referidos). Sends unmembered users back to the public hero — the
 * navbar's "Mi Panel" modal nudges them to /planes from there.
 *
 * Pages that should be reachable WITHOUT an active membership (Mi Membresía
 * itself, Perfil) should NOT call this; they only need getUserProfile().
 */
export async function requireActiveMembership(): Promise<MembershipContext> {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const isAdmin = isAdminRole(profile.role);
  if (isAdmin) return { profile, isAdmin, membership: null };

  const membership = await getActiveMembership(profile.id);
  if (!membership) redirect("/");

  return { profile, isAdmin, membership };
}
