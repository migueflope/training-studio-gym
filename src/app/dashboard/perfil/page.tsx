import { redirect } from "next/navigation";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";
import { ProfileSection } from "./ProfileSection";
import { AvatarSection } from "./AvatarSection";
import { EmailSection } from "./EmailSection";
import { MembershipCard } from "./MembershipCard";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

function isOwnedAvatarUrl(url: string | null): boolean {
  if (!url) return false;
  return url.includes("/storage/v1/object/public/avatars/");
}

export default async function ProfilePage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard/perfil");

  const isAdmin = isAdminRole(profile.role);
  const membership = isAdmin ? null : await getActiveMembership(profile.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Mi perfil</h1>
        <p className="text-muted-foreground">
          Actualizá tus datos, foto y preferencias de la cuenta.
        </p>
      </div>

      <AvatarSection
        userId={profile.id}
        fullName={profile.fullName}
        initials={profile.initials}
        avatarUrl={profile.avatarUrl}
        isOwnedAvatar={isOwnedAvatarUrl(profile.avatarUrl)}
      />

      <ProfileSection
        fullName={profile.fullName}
        phone={profile.phone}
        role={profile.role}
      />

      <EmailSection currentEmail={profile.email} />

      <MembershipCard membership={membership} isAdmin={isAdmin} />

      <div className="flex justify-end pt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
