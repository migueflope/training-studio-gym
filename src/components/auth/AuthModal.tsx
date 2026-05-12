"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  AlertCircle,
  Lock,
  Loader2,
  Mail,
  MailCheck,
  Phone,
  User,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuthModal } from "./AuthModalProvider";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const desktopCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

const mobileCardVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
};

export function AuthModal() {
  const { state, closeAuth, setMode } = useAuthModal();
  const { open, mode } = state;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeAuth]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
          onClick={closeAuth}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <motion.div
            key={mode}
            variants={isMobile ? mobileCardVariants : desktopCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={
              isMobile
                ? { type: "spring", stiffness: 280, damping: 32 }
                : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
            }
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:w-[440px] md:max-w-[calc(100vw-2rem)] max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl border-t md:border border-primary/30 bg-background/95 backdrop-blur-xl shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(212,175,55,0.3)] md:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(212,175,55,0.3)]"
          >
            {/* Subtle top glow border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-2.5">
              <span className="block h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <button
              onClick={closeAuth}
              aria-label="Cerrar"
              className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 md:px-8 pb-8 pt-6 md:pt-7">
              <ModalHeader mode={mode} />

              {mode === "login" ? (
                <LoginForm onSuccess={closeAuth} next={state.next ?? "/dashboard"} />
              ) : (
                <SignupForm />
              )}

              <FooterToggle mode={mode} onSwitch={setMode} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalHeader({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="mb-4 flex items-center justify-center">
        <Image
          src="/assets/logo-transparent.png"
          alt="Training Studio Gym"
          width={928}
          height={1105}
          className="h-14 w-auto object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.4)]"
          priority
        />
      </div>
      <h2 className="text-2xl font-display font-bold mb-1.5">
        {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
      </h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        {mode === "login"
          ? "Ingresá tus credenciales para acceder a tu panel."
          : "Unite a la comunidad y empezá tu transformación."}
      </p>
    </div>
  );
}

function FooterToggle({
  mode,
  onSwitch,
}: {
  mode: "login" | "signup";
  onSwitch: (mode: "login" | "signup") => void;
}) {
  const isLogin = mode === "login";
  return (
    <div className="mt-6 text-center text-sm text-muted-foreground">
      {isLogin ? "¿No tenés una cuenta? " : "¿Ya tenés una cuenta? "}
      <button
        type="button"
        onClick={() => onSwitch(isLogin ? "signup" : "login")}
        className="text-primary font-bold hover:underline"
      >
        {isLogin ? "Regístrate aquí" : "Iniciá sesión"}
      </button>
    </div>
  );
}

function LoginForm({ onSuccess, next }: { onSuccess: () => void; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setIsLoading(false);
        setError(translateLoginError(signInError.message));
        return;
      }
      onSuccess();
      router.push(next);
      router.refresh();
    },
    [email, password, next, onSuccess, router],
  );

  return (
    <>
      <GoogleButton mode="login" />

      <Divider />

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldEmail value={email} onChange={setEmail} />
        <div className="space-y-1">
          <div className="flex justify-between items-center pl-1 pr-1">
            <label className="text-sm font-medium text-muted-foreground">
              Contraseña
            </label>
            <Link
              href="/recuperar"
              className="text-xs text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <InputWithIcon
            Icon={Lock}
            type="password"
            required
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />
        </div>
        <SubmitButton loading={isLoading} label="Iniciar Sesión" />
      </form>
    </>
  );
}

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
          data: { full_name: fullName, phone },
        },
      });
      setIsLoading(false);
      if (signUpError) {
        setError(translateSignupError(signUpError.message));
        return;
      }
      setEmailSent(true);
    },
    [email, password, fullName, phone],
  );

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <MailCheck className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-display font-bold mb-2">Revisa tu correo</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Te enviamos un enlace de confirmación a{" "}
          <span className="text-foreground font-medium">{email}</span>. Tocá el
          enlace para activar tu cuenta.
        </p>
        <p className="text-xs text-muted-foreground">
          ¿No te llegó? Revisá tu carpeta de spam o{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="text-primary hover:underline font-medium"
          >
            usá otro correo
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <GoogleButton mode="signup" />

      <Divider />

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nombre Completo"
          Icon={User}
          type="text"
          required
          value={fullName}
          onChange={setFullName}
          placeholder="Juan Pérez"
        />
        <Field
          label="WhatsApp"
          Icon={Phone}
          type="tel"
          required
          value={phone}
          onChange={setPhone}
          placeholder="300 123 4567"
        />
        <FieldEmail value={email} onChange={setEmail} />
        <Field
          label="Contraseña"
          Icon={Lock}
          type="password"
          required
          minLength={6}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms-modal"
            required
            className="mt-1 h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
          />
          <label htmlFor="terms-modal" className="text-xs text-muted-foreground">
            He leído y acepto la{" "}
            <Link href="/legal/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>{" "}
            y los{" "}
            <Link href="/legal/terminos" className="text-primary hover:underline">
              Términos
            </Link>
            .
          </label>
        </div>
        <SubmitButton loading={isLoading} label="Crear Cuenta" />
      </form>
    </>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">o</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function FieldEmail({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field
      label="Correo Electrónico"
      Icon={Mail}
      type="email"
      required
      value={value}
      onChange={onChange}
      placeholder="tu@email.com"
    />
  );
}

interface FieldProps {
  label: string;
  Icon: typeof Mail;
  type: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function Field({ label, Icon, type, required, minLength, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-muted-foreground pl-1">
        {label}
      </label>
      <InputWithIcon
        Icon={Icon}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function InputWithIcon({
  Icon,
  type,
  required,
  minLength,
  value,
  onChange,
  placeholder,
}: Omit<FieldProps, "label">) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary/50 border border-border text-foreground rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 mt-2 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : label}
    </button>
  );
}

function translateLoginError(message: string): string {
  if (/invalid login credentials/i.test(message))
    return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(message))
    return "Confirmá tu correo antes de iniciar sesión. Revisá tu bandeja.";
  if (/rate limit/i.test(message))
    return "Demasiados intentos. Esperá un momento e intentá de nuevo.";
  return message;
}

function translateSignupError(message: string): string {
  if (/already registered/i.test(message))
    return "Ese correo ya tiene una cuenta. Iniciá sesión.";
  if (/password/i.test(message) && /6/.test(message))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (/invalid email/i.test(message)) return "El correo no es válido.";
  if (/rate limit/i.test(message))
    return "Demasiados intentos. Esperá un momento e intentá de nuevo.";
  return message;
}
