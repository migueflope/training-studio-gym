import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable, type AdminUserRow, type PlanOption } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);
  const { data: activeMemberships } = await supabase
    .from("memberships")
    .select("id, user_id, start_date, end_date, plans(name)")
    .eq("status", "active")
    .gte("end_date", today);

  const membershipByUser = new Map<
    string,
    { id: string; planName: string; startDate: string; endDate: string }
  >();
  for (const m of activeMemberships ?? []) {
    const plan = Array.isArray(m.plans) ? m.plans[0] : m.plans;
    membershipByUser.set(m.user_id, {
      id: m.id,
      planName: plan?.name ?? "Plan",
      startDate: m.start_date,
      endDate: m.end_date,
    });
  }

  // Emails live on auth.users, not on profiles. Pull them via the admin API
  // using the service role client.
  const emailsById = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data: usersList } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    for (const u of usersList?.users ?? []) {
      if (u.email) emailsById.set(u.id, u.email);
    }
  } catch (err) {
    console.error("[admin/usuarios] listUsers failed:", err);
  }

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: emailsById.get(p.id) ?? "—",
    phone: p.phone,
    avatarUrl: p.avatar_url,
    role: p.role,
    createdAt: p.created_at,
    activeMembership: membershipByUser.get(p.id) ?? null,
  }));

  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, duration_days, price_cop")
    .order("price_cop", { ascending: true });

  const planOptions: PlanOption[] = (plans ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    durationDays: p.duration_days,
    priceCop: Number(p.price_cop),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestioná las membresías de los socios. Activá un plan tras confirmar
          el pago, o cancelá una membresía cuando corresponda.
        </p>
      </div>
      <UsersTable rows={rows} plans={planOptions} />
    </div>
  );
}
