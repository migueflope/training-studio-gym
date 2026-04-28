import { createClient } from "@/lib/supabase/server";

export interface ActiveMembership {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export async function getActiveMembership(
  userId: string,
): Promise<ActiveMembership | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("memberships")
    .select("id, plan_id, start_date, end_date, status, plans(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("end_date", today)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const plan = Array.isArray(data.plans) ? data.plans[0] : data.plans;
  const end = new Date(data.end_date);
  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    id: data.id,
    planId: data.plan_id,
    planName: plan?.name ?? "Plan",
    startDate: data.start_date,
    endDate: data.end_date,
    daysRemaining,
  };
}
