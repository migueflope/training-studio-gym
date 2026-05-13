"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/auth/PasswordField";

export default function CambiarPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The user lands here after clicking the email link. /auth/callback
  // already exchanged the code → there should be a session.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  };

  if (checking) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/15 flex items-center justify-center mb-6">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">
          Enlace inválido o expirado
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Este enlace ya no es válido. Pedí uno nuevo para crear tu nueva
          contraseña.
        </p>
        <Link
          href="/recuperar"
          className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
        >
          Pedir nuevo enlace
        </Link>
      </motion.div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">¡Listo!</h1>
        <p className="text-muted-foreground text-sm">
          Tu contraseña se actualizó. Te llevamos al panel...
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
        <h1 className="text-2xl font-display font-bold mb-2">Nueva contraseña</h1>
        <p className="text-muted-foreground text-sm">
          Elegí una contraseña nueva para tu cuenta.
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
            Nueva contraseña
          </label>
          <PasswordField
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground pl-1">
            Confirmar contraseña
          </label>
          <PasswordField
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Cambiar contraseña"
          )}
        </button>
      </form>
    </motion.div>
  );
}
