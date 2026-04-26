"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarMenu } from "@/components/auth/AvatarMenu";
import type { UserProfile } from "@/lib/auth/getUserProfile";

interface NavbarProps {
  profile: UserProfile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 shadow-lg"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/assets/logo-transparent.png"
            alt="Training Studio Gym Logo"
            width={928}
            height={1105}
            className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
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
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
          <Link
            href="/contacto"
            className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
          >
            Agendar Valoración
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border shadow-xl md:hidden"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              <Link href="/" className="flex items-center mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Image
                  src="/assets/logo-transparent.png"
                  alt="Training Studio Gym Logo"
                  width={928}
                  height={1105}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium p-2 hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
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
                      <p className="text-sm font-bold truncate">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-base font-medium p-2 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Panel
                  </Link>
                  <Link
                    href="/dashboard/perfil"
                    className="text-base font-medium p-2 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-lg font-medium p-2 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
              <Link
                href="/contacto"
                className="flex items-center justify-center p-3 text-base font-bold bg-primary text-primary-foreground rounded-md shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-4"
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
