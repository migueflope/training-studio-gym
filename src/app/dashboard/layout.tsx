import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { DashboardMobileShell } from "@/components/dashboard/mobile/DashboardMobileShell";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getMyNotifications } from "@/lib/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const isAdmin = isAdminRole(profile.role);
  const { items: notifItems, unreadCount } = await getMyNotifications(30);

  // Membership gating happens per-page via requireActiveMembership().
  // Mi Membresía and Perfil intentionally stay reachable without an active
  // plan, so a user who just signed up can pay and edit their profile.

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />

      <DashboardMobileShell
        profile={profile}
        isAdmin={isAdmin}
        notifItems={notifItems}
        notifUnread={unreadCount}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="hidden md:block">
          <TopNav />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
