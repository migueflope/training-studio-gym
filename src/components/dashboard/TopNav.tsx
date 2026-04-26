import { Menu, Bell } from "lucide-react";
import { getUserProfile } from "@/lib/auth/getUserProfile";

export async function TopNav() {
  const profile = await getUserProfile();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-muted-foreground hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="font-display font-bold text-lg hidden sm:block">Panel de Usuario</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none mb-1">{profile?.fullName ?? "Invitado"}</p>
            <p className="text-xs text-muted-foreground leading-none">
              {profile ? roleLabel(profile.role) : "Sin sesión"}
            </p>
          </div>
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-9 h-9 rounded-full object-cover border border-primary/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-primary/20">
              {profile?.initials ?? "?"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function roleLabel(role: "owner" | "partner" | "member"): string {
  if (role === "owner") return "Owner";
  if (role === "partner") return "Partner";
  return "Miembro Activo";
}
