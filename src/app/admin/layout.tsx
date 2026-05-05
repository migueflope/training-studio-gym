import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { createClient } from "@/lib/supabase/server";
import { getMyNotifications } from "@/lib/notifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AdminMobileShell } from "@/components/admin/mobile/AdminMobileShell";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/admin");
  if (!isAdminRole(profile.role)) redirect("/dashboard");

  const roleLabel = profile.role === "owner" ? "Propietario" : "Partner";

  const supabase = await createClient();
  const { count: pendingPayments } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const pendingBadge = pendingPayments ?? 0;

  const { items: notifItems, unreadCount } = await getMyNotifications(30);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile shell (top bar + drawer + bottom tab bar) */}
      <AdminMobileShell
        profile={profile}
        pendingBadge={pendingBadge}
        notifItems={notifItems}
        notifUnread={unreadCount}
      />

      {/* Admin Sidebar — desktop only */}
      <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-border bg-primary/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/assets/logo-transparent.png"
              alt="Training Studio Gym"
              width={928}
              height={1105}
              className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.35)] transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-display font-bold text-sm tracking-tight block">ADMIN</span>
              <span className="text-xs text-muted-foreground">Training Studio</span>
            </div>
          </Link>
        </div>

        <AdminNav pendingBadge={pendingBadge} />

        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
            <LogOut className="w-5 h-5" /> Salir del Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="hidden md:flex h-16 bg-card border-b border-border items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="font-display font-bold text-lg">Centro de Control</h2>
          <div className="flex items-center gap-4">
            <NotificationBell
              userId={profile.id}
              initialItems={notifItems}
              initialUnread={unreadCount}
            />
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="text-right">
                <p className="text-sm font-bold leading-none mb-1">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground leading-none">{roleLabel}</p>
              </div>
              <Link href="/dashboard/perfil" aria-label="Mi perfil">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {profile.initials}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
