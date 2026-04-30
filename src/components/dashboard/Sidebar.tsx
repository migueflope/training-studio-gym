"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, LayoutDashboard, CreditCard, TrendingUp, Users, Settings, LogOut, Shield, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  disabled?: boolean;
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
  { icon: CreditCard, label: "Mi Membresía", href: "/dashboard/membresia" },
  { icon: Dumbbell, label: "Rutinas", href: "/dashboard/rutinas", disabled: true },
  { icon: TrendingUp, label: "Progreso y Metas", href: "/dashboard/progreso" },
  { icon: Users, label: "Referidos", href: "/dashboard/referidos", disabled: true },
  { icon: Settings, label: "Perfil", href: "/dashboard/perfil" },
];

interface SidebarProps {
  isAdmin: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/assets/logo-transparent.png"
            alt="Training Studio Gym"
            width={928}
            height={1105}
            className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105"
          />
          <span className="font-display font-bold text-sm tracking-tight truncate">
            TRAINING STUDIO
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.href}
                aria-disabled
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/60 cursor-not-allowed select-none"
              >
                <item.icon className="w-5 h-5 text-muted-foreground/60" />
                <span>{item.label}</span>
                <span className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary/80 px-1.5 py-0.5 rounded-full border border-primary/20">
                  <Lock className="w-2.5 h-2.5" />
                  Pronto
                </span>
              </div>
            );
          }
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-border" />
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15 transition-all"
            >
              <Shield className="w-5 h-5" />
              Panel de Admin
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
