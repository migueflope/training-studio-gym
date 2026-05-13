import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { DashboardMobileShell } from "@/components/dashboard/mobile/DashboardMobileShell";
import { RegistrationBanner } from "@/components/dashboard/RegistrationBanner";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";
import {
  ensureExpiringNotification,
  getMyNotifications,
} from "@/lib/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const isAdmin = isAdminRole(profile.role);
  if (!isAdmin) await ensureExpiringNotification(profile.id);
  const { items: notifItems, unreadCount } = await getMyNotifications(30);

  // Banner state: show when a (non-admin) member is missing core info.
  // Google sign-ups don't carry a phone, and brand-new accounts may not
  // have paid yet — both are nudged to finish setup.
  const missingPhone = !isAdmin && !profile.phone;
  const missingMembership =
    !isAdmin && !(await getActiveMembership(profile.id));

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
          <RegistrationBanner
            missingPhone={missingPhone}
            missingMembership={missingMembership}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
