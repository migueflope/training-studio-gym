import "server-only";

import { createClient } from "@/lib/supabase/server";

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
