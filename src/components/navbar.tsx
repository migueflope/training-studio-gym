"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-lg font-medium tracking-tight text-white flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
          Training Studio
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link>
          <Link href="#precios" className="hover:text-white transition-colors">Precios</Link>
          <Link href="#horarios" className="hover:text-white transition-colors">Horarios</Link>
          <Link href="#contacto" className="text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
            Únete Ahora
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-white/5 py-4 px-6 flex flex-col gap-4 text-sm text-zinc-400">
          <Link href="#servicios" className="hover:text-white">Servicios</Link>
          <Link href="#precios" className="hover:text-white">Precios</Link>
          <Link href="#horarios" className="hover:text-white">Horarios</Link>
          <Link href="#contacto" className="text-white mt-2">Únete Ahora</Link>
        </div>
      )}
    </nav>
  );
}
