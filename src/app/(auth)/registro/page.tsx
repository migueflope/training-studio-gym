"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2, Phone, MailCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return;
    }

    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MailCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Revisa tu correo</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Te enviamos un enlace de confirmación a <span className="text-foreground font-medium">{email}</span>.
          Haz click en el enlace del correo para activar tu cuenta.
        </p>
        <p className="text-xs text-muted-foreground">
          ¿No te llegó? Revisa tu carpeta de spam o{" "}
          <button
            onClick={() => setEmailSent(false)}
            className="text-primary hover:underline font-medium"
          >
            usa otro correo
          </button>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold mb-2">Crea tu Cuenta</h1>
        <p className="text-muted-foreground text-sm">
          Únete a la comunidad y empieza tu transformación.
        </p>
      </div>

      <GoogleButton mode="signup" />

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="Juan Pérez"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="300 123 4567"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2 pb-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground">
            He leído y acepto la <Link href="/legal/privacidad" className="text-primary hover:underline">Política de Privacidad</Link> y los <Link href="/legal/terminos" className="text-primary hover:underline">Términos y Condiciones</Link>.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Cuenta"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </motion.div>
  );
}

function translateAuthError(message: string): string {
  if (/already registered/i.test(message)) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (/password/i.test(message) && /6/.test(message)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/invalid email/i.test(message)) return "El correo no es válido.";
  if (/rate limit/i.test(message)) return "Demasiados intentos. Espera un momento e intenta de nuevo.";
  return message;
}
