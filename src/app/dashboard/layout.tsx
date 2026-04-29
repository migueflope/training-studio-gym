import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard");

  // Membership gating happens per-page via requireActiveMembership().
  // Mi Membresía and Perfil intentionally stay reachable without an active
  // plan, so a user who just signed up can pay and edit their profile.

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdminRole(profile.role)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
