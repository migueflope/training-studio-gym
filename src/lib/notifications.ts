import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "membership_activated"
  | "payment_confirmed"
  | "payment_rejected"
  | "membership_expiring"
  | "admin_new_user"
  | "admin_new_payment"
  | "admin_message"
  | "broadcast"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export async function getMyNotifications(limit = 30): Promise<{
  items: Notification[];
  unreadCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], unreadCount: 0 };

  const [{ data: rows }, { count: unread }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, link, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ]);

  const items: Notification[] = (rows ?? []).map((r) => ({
    id: r.id,
    type: r.type as NotificationType,
    title: r.title,
    body: r.body,
    link: r.link,
    read: r.read,
    createdAt: r.created_at,
  }));

  return { items, unreadCount: unread ?? 0 };
}

/**
 * Backup for the Vercel Cron: if the user has an active membership whose
 * end_date is within the next 7 days and there isn't a fresh
 * `membership_expiring` notification for today, insert one. Called on
 * each dashboard / public layout render so the bell stays in sync even
 * when the cron misfires.
 */
export async function ensureExpiringNotification(userId: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sevenDaysOut = new Date(now);
  sevenDaysOut.setUTCDate(sevenDaysOut.getUTCDate() + 7);
  const horizon = sevenDaysOut.toISOString().slice(0, 10);

  const { data: membership } = await supabase
    .from("memberships")
    .select("end_date, plans(name)")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("end_date", today)
    .lte("end_date", horizon)
    .order("end_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return;

  const end = new Date(`${membership.end_date}T00:00:00Z`);
  const offset = Math.max(
    0,
    Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const { count: alreadySent } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "membership_expiring")
    .gte("created_at", `${today}T00:00:00Z`);

  if ((alreadySent ?? 0) > 0) return;

  const planName = Array.isArray(membership.plans)
    ? membership.plans[0]?.name
    : (membership.plans as { name?: string } | null)?.name;

  const title =
    offset === 0
      ? "Tu membresía vence hoy"
      : offset === 1
        ? "Tu membresía vence mañana"
        : `Tu membresía vence en ${offset} días`;
  const body = `Renová ${planName ? `tu plan "${planName}"` : "tu plan"} para no perder el acceso al club ni tu rutina personalizada.`;

  await supabase.from("notifications").insert({
    user_id: userId,
    type: "membership_expiring",
    title,
    body,
    link: "/planes",
  });
}
