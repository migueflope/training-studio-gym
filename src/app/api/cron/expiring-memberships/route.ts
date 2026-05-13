import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
// We reject any other call so the route can't be triggered externally.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const ymd = (offsetDays: number) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  // We notify every day in the final 7-day window so the bell shows a
  // sticky reminder until the member renews. Offsets 7..1 = "X days left",
  // offset 0 = "vence hoy".
  const targets: number[] = [7, 6, 5, 4, 3, 2, 1, 0];

  const stats: Record<string, number> = {};
  const errors: string[] = [];

  for (const offset of targets) {
    const targetDate = ymd(offset);
    const { data: memberships, error } = await supabase
      .from("memberships")
      .select("user_id, end_date, plans(name)")
      .eq("status", "active")
      .eq("end_date", targetDate);

    if (error) {
      errors.push(`day+${offset}: ${error.message}`);
      continue;
    }

    let inserted = 0;
    for (const m of memberships ?? []) {
      // Idempotency: skip if a membership_expiring notif was already sent
      // to this user today (handles cron re-runs / manual triggers).
      const { count: alreadySent } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", m.user_id)
        .eq("type", "membership_expiring")
        .gte("created_at", `${today}T00:00:00Z`);

      if ((alreadySent ?? 0) > 0) continue;

      const planName = Array.isArray(m.plans)
        ? m.plans[0]?.name
        : (m.plans as { name?: string } | null)?.name;

      const title =
        offset === 0
          ? "Tu membresía vence hoy"
          : offset === 1
            ? "Tu membresía vence mañana"
            : `Tu membresía vence en ${offset} días`;

      const body = `Renová ${planName ? `tu plan "${planName}"` : "tu plan"} para no perder el acceso al club ni tu rutina personalizada.`;

      const { error: insertErr } = await supabase.from("notifications").insert({
        user_id: m.user_id,
        type: "membership_expiring",
        title,
        body,
        link: "/planes",
      });

      if (insertErr) {
        errors.push(`insert ${m.user_id}: ${insertErr.message}`);
        continue;
      }
      inserted += 1;
    }
    stats[`day+${offset}`] = inserted;
  }

  return NextResponse.json({
    ok: errors.length === 0,
    ranAt: now.toISOString(),
    stats,
    errors,
  });
}
