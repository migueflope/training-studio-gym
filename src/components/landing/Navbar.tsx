"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarMenu } from "@/components/auth/AvatarMenu";
import { isAdminRole, type UserProfile } from "@/lib/auth/roles";

interface NavbarProps {
  profile: UserProfile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Planes", href: "/planes" },
    { name: "Entrenadores", href: "/entrenadores" },
    { name: "Rutinas", href: "/rutinas" },
  ];

  const isAdmin = !!profile && isAdminRole(profile.role);
  const activeLinkName =
    hoveredLink ?? navLinks.find((l) => l.href === pathname)?.name ?? null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 md:px-6 pt-3 md:pt-4">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto max-w-6xl rounded-full border transition-[background-color,border-color,box-shadow] duration-300 ${
          isScrolled
            ? "bg-background/85 backdrop-blur-xl border-primary/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]"
            : "bg-background/55 backdrop-blur-lg border-primary/15 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.35)]"
        }`}
      >
        <div className="px-4 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className="origin-center"
            >
              <Image
                src="/assets/logo-transparent.png"
                alt="Training Studio Gym Logo"
                width={928}
                height={1105}
                className="h-11 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 relative"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {navLinks.map((link) => {
              const isActive = activeLinkName === link.name;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  className="relative px-4 py-2 text-[15px] font-medium"
                >
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-full bg-primary/15 border border-primary/30 shadow-[0_0_18px_-2px_rgba(212,175,55,0.45)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                title="Panel de administración"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            {profile ? (
              <AvatarMenu
                fullName={profile.fullName}
                initials={profile.initials}
                avatarUrl={profile.avatarUrl}
                email={profile.email}
              />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Iniciar Sesión
              </Link>
            )}
            <Link
              href="/contacto"
              className="px-5 py-2.5 text-[15px] font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_15px_rgba(212,175,55,0.35)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Agendar Valoración
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 mx-auto max-w-6xl bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="flex flex-col px-4 py-5 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-base font-medium px-3 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "hover:text-primary hover:bg-primary/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="h-px w-full bg-border my-2" />
              {profile ? (
                <>
                  <div className="flex items-center gap-3 p-2">
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-primary/30">
                        {profile.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {profile.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-base font-medium px-3 py-2.5 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Panel
                  </Link>
                  <Link
                    href="/dashboard/perfil"
                    className="text-base font-medium px-3 py-2.5 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-base font-bold px-3 py-2.5 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Panel de Admin
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-base font-medium px-3 py-2.5 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
              <Link
                href="/contacto"
                className="flex items-center justify-center px-3 py-3 text-base font-bold bg-primary text-primary-foreground rounded-full shadow-[0_0_15px_rgba(212,175,55,0.35)] mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Agendar Valoración
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
