import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ExpiringMember {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  planName: string;
  endDate: string;
  /** Días que faltan para que venza (0 = vence hoy). */
  daysLeft: number;
}

export interface DashboardStats {
  activeMembers: number;
  activeMembersDeltaPct: number | null;
  monthlyRevenueCop: number;
  monthlyRevenueDeltaPct: number | null;
  pendingPayments: number;
  expiringSoon: number;
  expiringMembers: ExpiringMember[];
  growth: { name: string; usuarios: number }[];
}

const MONTH_LABELS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Días enteros entre dos fechas YYYY-MM-DD (toYmd - fromYmd). */
function daysBetween(fromYmd: string, toYmd: string): number {
  const from = new Date(`${fromYmd}T00:00:00Z`).getTime();
  const to = new Date(`${toYmd}T00:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function pct(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const now = new Date();
  const today = ymd(now);

  const in7Days = new Date(now);
  in7Days.setUTCDate(in7Days.getUTCDate() + 7);
  const in7DaysStr = ymd(in7Days);

  const monthStart = startOfMonth(now);
  const prevMonthStart = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1),
  );

  const sixMonthsAgo = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 5, 1),
  );

  const [
    activeMembersRes,
    activeMembersPrevRes,
    monthRevenueRes,
    prevMonthRevenueRes,
    pendingRes,
    expiringRes,
    expiringDetailRes,
    growthRes,
  ] = await Promise.all([
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("end_date", today),
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .lt("created_at", monthStart.toISOString()),
    supabase
      .from("payments")
      .select("amount_cop")
      .eq("status", "confirmed")
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("payments")
      .select("amount_cop")
      .eq("status", "confirmed")
      .gte("created_at", prevMonthStart.toISOString())
      .lt("created_at", monthStart.toISOString()),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", in7DaysStr),
    supabase
      .from("memberships")
      .select("user_id, end_date, plans(name), profiles(full_name, phone)")
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", in7DaysStr)
      .order("end_date", { ascending: true }),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const monthlyRevenueCop = (monthRevenueRes.data ?? []).reduce(
    (acc, r) => acc + Number(r.amount_cop ?? 0),
    0,
  );
  const prevMonthlyRevenueCop = (prevMonthRevenueRes.data ?? []).reduce(
    (acc, r) => acc + Number(r.amount_cop ?? 0),
    0,
  );

  const activeMembers = activeMembersRes.count ?? 0;
  const activeMembersPrev = activeMembersPrevRes.count ?? 0;

  const buckets = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - (5 - i), 1),
    );
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    buckets.set(key, 0);
  }
  for (const row of growthRes.data ?? []) {
    const d = new Date(row.created_at);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  let cumulative = 0;
  const growth = Array.from(buckets.entries()).map(([key, count]) => {
    cumulative += count;
    const month = Number(key.split("-")[1]);
    return { name: MONTH_LABELS_ES[month], usuarios: cumulative };
  });

  // Lista detallada de quienes están por vencer (para el modal del dashboard).
  // Los emails viven en auth.users, así que se traen con el cliente admin.
  const expiringRows = expiringDetailRes.data ?? [];
  const emailsById = new Map<string, string>();
  if (expiringRows.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: usersList } = await admin.auth.admin.listUsers({
        perPage: 1000,
      });
      for (const u of usersList?.users ?? []) {
        if (u.email) emailsById.set(u.id, u.email);
      }
    } catch (err) {
      console.error("[dashboardStats] listUsers failed:", err);
    }
  }

  const expiringMembers: ExpiringMember[] = expiringRows.map((m) => {
    const plan = Array.isArray(m.plans) ? m.plans[0] : m.plans;
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      userId: m.user_id,
      fullName: profile?.full_name ?? "Usuario",
      email: emailsById.get(m.user_id) ?? "",
      phone: profile?.phone ?? null,
      planName: plan?.name ?? "Plan",
      endDate: m.end_date,
      daysLeft: daysBetween(today, m.end_date),
    };
  });

  return {
    activeMembers,
    activeMembersDeltaPct: pct(activeMembers, activeMembersPrev),
    monthlyRevenueCop,
    monthlyRevenueDeltaPct: pct(monthlyRevenueCop, prevMonthlyRevenueCop),
    pendingPayments: pendingRes.count ?? 0,
    expiringSoon: expiringRes.count ?? 0,
    expiringMembers,
    growth,
  };
}

/**
 * Exact COP amount with Colombian grouping: "." for thousands, "," for
 * decimals (only shown when the amount isn't a whole number). No abbreviation,
 * so the admin sees the precise monthly earnings, e.g. $1.290.000.
 */
export function formatCop(value: number): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `$${formatted}`;
}

export function formatDeltaPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}% este mes`;
}
