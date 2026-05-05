import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();
  let hasActiveMembership = false;
  if (profile && !isAdminRole(profile.role)) {
    hasActiveMembership = !!(await getActiveMembership(profile.id));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar profile={profile} hasActiveMembership={hasActiveMembership} />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
