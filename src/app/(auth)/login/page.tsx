"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for now (Supabase auth will go here)
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold mb-2">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground text-sm">
          Ingresa tus credenciales para acceder a tu panel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              required
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center pl-1 pr-1">
            <label className="text-sm font-medium text-muted-foreground">Contraseña</label>
            <Link href="/recuperar" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              required
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <Link href="/registro" className="text-primary font-bold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </motion.div>
  );
}
