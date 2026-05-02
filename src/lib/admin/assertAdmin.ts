import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/roles";

export async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !isAdminRole(profile.role)) {
    throw new Error("No autorizado");
  }
  return { supabase, adminId: user.id };
}
