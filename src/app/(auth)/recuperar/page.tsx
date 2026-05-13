"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/recuperar/cambiar`,
      },
    );

    setIsLoading(false);

    if (resetError) {
      setError(translateError(resetError.message));
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
          Si <span className="text-foreground font-medium">{email}</span> tiene
          una cuenta con nosotros, te enviamos un enlace para crear una nueva
          contraseña.
        </p>
        <p className="text-xs text-muted-foreground">
          ¿No te llegó? Revisá tu carpeta de spam o{" "}
          <button
            onClick={() => setEmailSent(false)}
            className="text-primary hover:underline font-medium"
          >
            probá con otro correo
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
        <h1 className="text-2xl font-display font-bold mb-2">
          Recuperar contraseña
        </h1>
        <p className="text-muted-foreground text-sm">
          Ingresá tu correo y te mandamos un enlace para crear una nueva
          contraseña.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">
            Correo Electrónico
          </label>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Enviar enlace"
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya recordaste?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </motion.div>
  );
}

function translateError(message: string): string {
  if (/rate limit/i.test(message))
    return "Demasiados intentos. Esperá un momento e intentá de nuevo.";
  if (/invalid email/i.test(message)) return "El correo no es válido.";
  return message;
}
