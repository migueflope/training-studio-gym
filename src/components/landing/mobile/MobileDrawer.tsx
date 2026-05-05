"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  X,
  Home,
  CreditCard,
  Users,
  LayoutDashboard,
  User,
  Shield,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { createClient } from "@/lib/supabase/client";
import { isAdminRole, type UserProfile } from "@/lib/auth/roles";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export function MobileDrawer({ open, onClose, profile }: Props) {
  const router = useRouter();
  const isAdmin = !!profile && isAdminRole(profile.role);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Swipe left to close
    if (info.offset.x < -80 || info.velocity.x < -300) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-label="Menú principal"
            className="md:hidden fixed top-0 bottom-0 left-0 z-[61] w-[82%] max-w-[340px] bg-card border-r border-border shadow-2xl flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="px-5 py-5 border-b border-border flex items-start justify-between gap-3">
              {profile ? (
                <Link
                  href="/dashboard/perfil"
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-primary/30 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-primary/30 shrink-0">
                      {profile.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-base truncate">
                      {profile.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground border border-border shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-base">Invitado</p>
                    <p className="text-xs text-muted-foreground">
                      Iniciá sesión para tu panel
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              <DrawerLink href="/" icon={<Home className="w-5 h-5" />} onClose={onClose}>
                Inicio
              </DrawerLink>
              <DrawerLink href="/planes" icon={<CreditCard className="w-5 h-5" />} onClose={onClose}>
                Planes
              </DrawerLink>
              <DrawerLink href="/entrenadores" icon={<Users className="w-5 h-5" />} onClose={onClose}>
                Entrenadores
              </DrawerLink>
              <DrawerLink
                href="/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                onClose={onClose}
              >
                Mi Panel
              </DrawerLink>
              {profile && (
                <DrawerLink
                  href="/dashboard/perfil"
                  icon={<User className="w-5 h-5" />}
                  onClose={onClose}
                >
                  Mi Perfil
                </DrawerLink>
              )}
              <DrawerLink
                href="/contacto"
                icon={<WhatsAppIcon className="w-5 h-5" />}
                onClose={onClose}
              >
                Contacto
              </DrawerLink>

              {isAdmin && (
                <>
                  <div className="my-3 border-t border-border" />
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Panel de Admin
                  </Link>
                </>
              )}
            </nav>

            {/* Footer CTA + auth */}
            <div className="px-5 py-4 border-t border-border space-y-3">
              <Link
                href="/contacto"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(212,175,55,0.35)]"
              >
                <Sparkles className="w-4 h-4" />
                Agendar Valoración
              </Link>
              {profile ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold border border-border rounded-xl"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerLink({
  href,
  icon,
  onClose,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}
