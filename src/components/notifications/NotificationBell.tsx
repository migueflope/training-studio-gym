"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Megaphone,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/notifications/actions";
import type { Notification, NotificationType } from "@/lib/notifications";

interface NotificationBellProps {
  userId: string;
  initialItems: Notification[];
  initialUnread: number;
}

const TYPE_META: Record<
  NotificationType,
  { Icon: typeof Bell; tone: string }
> = {
  membership_activated: { Icon: CreditCard, tone: "text-success" },
  payment_confirmed: { Icon: CreditCard, tone: "text-success" },
  payment_rejected: { Icon: AlertTriangle, tone: "text-destructive" },
  membership_expiring: { Icon: AlertTriangle, tone: "text-accent" },
  admin_new_user: { Icon: UserPlus, tone: "text-primary" },
  admin_new_payment: { Icon: CreditCard, tone: "text-primary" },
  admin_message: { Icon: MessageSquare, tone: "text-primary" },
  broadcast: { Icon: Megaphone, tone: "text-primary" },
  system: { Icon: Sparkles, tone: "text-muted-foreground" },
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationBell({
  userId,
  initialItems,
  initialUnread,
}: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: NotificationType;
            title: string;
            body: string | null;
            link: string | null;
            read: boolean;
            created_at: string;
          };
          const next: Notification = {
            id: row.id,
            type: row.type,
            title: row.title,
            body: row.body,
            link: row.link,
            read: row.read,
            createdAt: row.created_at,
          };
          setItems((prev) => [next, ...prev].slice(0, 30));
          if (!next.read) setUnread((u) => u + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; read: boolean };
          setItems((prev) =>
            prev.map((n) => (n.id === row.id ? { ...n, read: row.read } : n)),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleMarkAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await markAllNotificationsRead();
    router.refresh();
  }, [router]);

  const handleItemClick = useCallback(
    async (n: Notification) => {
      if (!n.read) {
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
        );
        setUnread((u) => Math.max(0, u - 1));
        await markNotificationRead(n.id);
      }
      setOpen(false);
      if (n.link) router.push(n.link);
    },
    [router],
  );

  const hasUnread = unread > 0;
  const visibleUnread = useMemo(() => Math.min(99, unread), [unread]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificaciones${hasUnread ? ` (${unread} sin leer)` : ""}`}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {visibleUnread}
            {unread > 99 ? "+" : ""}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-2 right-2 top-[60px] md:absolute md:left-auto md:right-0 md:top-12 z-50 w-auto md:w-[360px] md:max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-display font-bold text-sm">Notificaciones</h4>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No tenés notificaciones todavía.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.system;
                  const Icon = meta.Icon;
                  const Wrapper = n.link
                    ? ({ children }: { children: React.ReactNode }) => (
                        <button
                          type="button"
                          onClick={() => handleItemClick(n)}
                          className="w-full text-left"
                        >
                          {children}
                        </button>
                      )
                    : ({ children }: { children: React.ReactNode }) => (
                        <button
                          type="button"
                          onClick={() => handleItemClick(n)}
                          className="w-full text-left"
                        >
                          {children}
                        </button>
                      );
                  return (
                    <li
                      key={n.id}
                      className={`px-4 py-3 transition-colors hover:bg-secondary/50 ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      <Wrapper>
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg bg-secondary shrink-0 ${meta.tone}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="text-sm font-bold truncate">{n.title}</p>
                              {!n.read && (
                                <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                            {n.body && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                {n.body}
                              </p>
                            )}
                            <p className="text-[11px] text-muted-foreground/70">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Wrapper>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Las notificaciones leídas se guardan acá por 30 días
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
