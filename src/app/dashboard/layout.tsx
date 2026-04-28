import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { MembershipGate } from "@/components/dashboard/MembershipGate";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const isAdmin = isAdminRole(profile.role);
  if (!isAdmin) {
    const membership = await getActiveMembership(profile.id);
    if (!membership) {
      return <MembershipGate fullName={profile.fullName} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
