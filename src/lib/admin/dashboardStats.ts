import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  activeMembers: number;
  activeMembersDeltaPct: number | null;
  monthlyRevenueCop: number;
  monthlyRevenueDeltaPct: number | null;
  pendingPayments: number;
  expiringSoon: number;
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

  return {
    activeMembers,
    activeMembersDeltaPct: pct(activeMembers, activeMembersPrev),
    monthlyRevenueCop,
    monthlyRevenueDeltaPct: pct(monthlyRevenueCop, prevMonthlyRevenueCop),
    pendingPayments: pendingRes.count ?? 0,
    expiringSoon: expiringRes.count ?? 0,
    growth,
  };
}

export function formatCop(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m.toFixed(m >= 10 ? 1 : 2).replace(/\.0+$/, "")}M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

export function formatDeltaPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}% este mes`;
}
