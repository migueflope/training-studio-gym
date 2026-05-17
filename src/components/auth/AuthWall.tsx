"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "./GoogleButton";
import { PasswordField } from "./PasswordField";
import {
  Loader2,
  Mail,
  Phone,
  User,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  MoreVertical,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadProfiles,
  upsertProfile,
  removeProfile,
  requestCredentialSave,
  type SavedProfile,
} from "@/lib/auth/savedProfiles";

interface AuthWallProps {
  mensualidad: {
    price: number;
    discount_percentage: number;
  };
}

export function AuthWall({ mensualidad: _mensualidad }: AuthWallProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<"list" | "saved" | "login" | "signup">("login");
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<SavedProfile | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const loaded = loadProfiles();
    setProfiles(loaded);
    if (loaded.length === 1) {
      setActiveProfile(loaded[0]);
      setMode("saved");
    } else if (loaded.length > 1) {
      setMode("list");
    } else {
      setMode("login");
    }

    // Catches Google OAuth redirects too.
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        const u = session.user;
        const profile: SavedProfile = {
          email: u.email ?? "",
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
        };
        if (profile.email) {
          setProfiles(upsertProfile(profile));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isMounted) {
    return <div className="flex min-h-screen w-full bg-black" />;
  }

  const handleProfileSelected = (profile: SavedProfile) => {
    setActiveProfile(profile);
    setMode("saved");
  };

  const handleRemoveProfile = (email: string) => {
    const next = removeProfile(email);
    setProfiles(next);
    if (next.length === 0) {
      setMode("login");
    } else if (next.length === 1) {
      setActiveProfile(next[0]);
      setMode("saved");
    }
  };

  const handleLoginSuccess = async (profile: SavedProfile, password?: string) => {
    setProfiles(upsertProfile(profile));
    if (password) {
      await requestCredentialSave(profile.email, password, profile.name);
    }
  };

  // The list is only reachable when there are 2+ profiles.
  const canGoBackToList = profiles.length >= 2;

  return (
    <div className="flex min-h-screen w-full bg-black">
      {/* Left Side: Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black z-10" />
        <img
          src="/ig-auth-bg.png"
          alt="Gym"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        <div className="z-20 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-md mx-auto"
          >
            <h1 className="text-5xl font-display font-extrabold text-white mb-6 drop-shadow-2xl leading-tight">
              EL FUTURO DEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ffdf70]">FITNESS</span>
            </h1>
            <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <p className="text-white/80 text-lg leading-relaxed">
                Te damos la bienvenida a nuestra nueva página. Por pagar aquí, reclama ofertas imperdibles y de tiempo limitado de <span className="text-white font-bold">10% de descuento</span> en todos nuestros productos.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-12 relative z-20 bg-[#050505] min-h-[100dvh] lg:min-h-screen">
        <div className="lg:hidden text-center mb-4 mt-16 sm:mt-4">
          <h1 className="text-2xl font-display font-extrabold text-white mb-1 drop-shadow-xl">
            EL FUTURO DEL <span className="text-primary">FITNESS</span>
          </h1>
          <p className="text-xs text-white/60 px-2">
            Regístrate y reclama <span className="text-white font-bold">10% de descuento</span> hoy mismo.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="hidden lg:flex justify-center mb-8">
            <Image
              src="/assets/logo-transparent.png"
              alt="Training Studio Gym"
              width={200}
              height={200}
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
          </div>

          <div className="bg-[#0a0a0a] rounded-2xl lg:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[50px] pointer-events-none" />

            <AnimatePresence mode="wait">
              {mode === "list" && (
                <SavedProfilesListView
                  key="list"
                  profiles={profiles}
                  onSelect={handleProfileSelected}
                  onRemove={handleRemoveProfile}
                  onUseOther={() => setMode("login")}
                />
              )}
              {mode === "saved" && activeProfile && (
                <SavedProfileView
                  key="saved"
                  profile={activeProfile}
                  onUseOtherAccount={() => setMode("login")}
                  onBack={canGoBackToList ? () => setMode("list") : undefined}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
              {mode === "login" && (
                <LoginView
                  key="login"
                  onSwitchMode={() => setMode("signup")}
                  onBack={canGoBackToList ? () => setMode("list") : undefined}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
              {mode === "signup" && (
                <SignupView
                  key="signup"
                  onSwitchMode={() => setMode("login")}
                  onSignupSuccess={handleLoginSuccess}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function SavedProfilesListView({
  profiles,
  onSelect,
  onRemove,
  onUseOther,
}: {
  profiles: SavedProfile[];
  onSelect: (p: SavedProfile) => void;
  onRemove: (email: string) => void;
  onUseOther: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-2">Elige una cuenta</h2>
      <p className="text-xs sm:text-sm text-white/50 text-center mb-6">Para continuar en Training Studio</p>

      <div className="space-y-2 sm:space-y-3">
        {profiles.map((profile) => {
          const isOpen = openMenu === profile.email;
          return (
            <div
              key={profile.email}
              className="relative bg-[#111] border border-white/5 rounded-xl hover:border-primary/40 hover:bg-[#161616] transition-all"
            >
              <button
                type="button"
                onClick={() => onSelect(profile)}
                className="w-full flex items-center gap-3 p-3 sm:p-4 text-left"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-primary to-yellow-200 rounded-full p-[2px] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center overflow-hidden">
                    {profile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary/80" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm sm:text-base font-bold text-white truncate">{profile.name || profile.email}</p>
                  <p className="text-xs text-white/40 truncate">{profile.email}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(isOpen ? null : profile.email);
                }}
                aria-label="Más opciones"
                className="absolute top-2 right-2 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-9 right-2 z-20 min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(null);
                        onRemove(profile.email);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs sm:text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                      <span>Eliminar cuenta del dispositivo</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onUseOther}
          className="w-full flex items-center justify-center gap-2 p-3 sm:p-4 mt-2 bg-transparent border border-dashed border-white/15 rounded-xl text-white/70 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Usar otra cuenta</span>
        </button>
      </div>
    </motion.div>
  );
}

function SavedProfileView({
  profile,
  onUseOtherAccount,
  onBack,
  onLoginSuccess,
}: {
  profile: SavedProfile;
  onUseOtherAccount: () => void;
  onBack?: () => void;
  onLoginSuccess: (profile: SavedProfile, password?: string) => Promise<void>;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });
    if (signInError) {
      setIsLoading(false);
      setError("Contraseña incorrecta.");
      return;
    }
    const updated: SavedProfile = {
      email: profile.email,
      name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || profile.name,
      avatarUrl: data.user?.user_metadata?.avatar_url || data.user?.user_metadata?.picture || profile.avatarUrl || null,
    };
    await onLoginSuccess(updated, password);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center relative z-10"
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 top-0 flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
      )}

      <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary to-yellow-200 rounded-full p-1 mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
        <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center border-2 border-[#111] overflow-hidden">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-10 h-10 text-primary/80" />
          )}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{profile.name || profile.email}</h3>
      <p className="text-sm text-white/40 mb-6">Inicia sesión de nuevo</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
        <input type="hidden" name="email" autoComplete="username" value={profile.email} readOnly />
        <PasswordField
          value={password}
          onChange={setPassword}
          required
          placeholder="Contraseña"
          name="password"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full group overflow-hidden rounded-xl bg-primary px-4 py-3.5 font-bold text-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <button
        onClick={onUseOtherAccount}
        className="mt-6 text-xs text-white/50 hover:text-primary transition-colors"
      >
        Usar otra cuenta
      </button>
    </motion.div>
  );
}

function LoginView({
  onSwitchMode,
  onBack,
  onLoginSuccess,
}: {
  onSwitchMode: () => void;
  onBack?: () => void;
  onLoginSuccess: (profile: SavedProfile, password?: string) => Promise<void>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setIsLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    if (data.user) {
      const profile: SavedProfile = {
        email: data.user.email ?? email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
        avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
      };
      await onLoginSuccess(profile, password);
    }
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10"
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 top-0 flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
      )}

      <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-4 sm:mb-6">Iniciar Sesión</h2>

      {error && <ErrorBanner message={error} />}

      <GoogleButton mode="login" />
      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete="on">
        <InputWithIcon
          Icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="Correo Electrónico"
          name="email"
          autoComplete="username"
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          required
          placeholder="Contraseña"
          name="password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full group overflow-hidden rounded-xl bg-primary px-4 py-3 sm:py-3.5 font-bold text-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <div className="mt-6 sm:mt-8 text-center border-t border-white/5 pt-4 sm:pt-6">
        <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-4">¿No tienes cuenta?</p>
        <motion.button
          onClick={onSwitchMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: [
              "0 0 0px rgba(212,175,55,0.3)",
              "0 0 25px rgba(212,175,55,0.55)",
              "0 0 0px rgba(212,175,55,0.3)",
            ],
          }}
          transition={{
            opacity: { duration: 0.4 },
            y: { duration: 0.4 },
            boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full group overflow-hidden rounded-xl border-2 border-primary bg-primary/5 px-4 py-3 sm:py-3.5 font-bold text-primary uppercase tracking-widest text-xs sm:text-sm hover:bg-primary/10 hover:text-yellow-200 transition-colors"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-x-full animate-[shimmer_2.8s_infinite]" />
          <span className="relative z-10">Regístrate completamente gratis</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function SignupView({
  onSwitchMode,
  onSignupSuccess,
}: {
  onSwitchMode: () => void;
  onSignupSuccess: (profile: SavedProfile, password?: string) => Promise<void>;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    setIsLoading(false);
    if (signUpError) {
      setError("Hubo un error al registrarte. Verifica tus datos.");
      return;
    }

    await onSignupSuccess({ email, name: fullName, avatarUrl: null }, password);

    setSuccess(true);
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center relative z-10 py-8">
        <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¡Registro Exitoso!</h3>
        <p className="text-sm text-white/60 mb-6">Revisa tu correo electrónico para confirmar tu cuenta.</p>
        <button onClick={onSwitchMode} className="text-primary hover:underline text-sm font-bold uppercase">
          Volver a Iniciar Sesión
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10"
    >
      <h2 className="text-xl font-bold text-center text-white mb-2">Crear Cuenta</h2>
      <p className="text-xs text-center text-primary mb-6">Regístrate y reclama tus ofertas exclusivas</p>

      {error && <ErrorBanner message={error} />}

      <GoogleButton mode="signup" />
      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3" autoComplete="on">
        <InputWithIcon
          Icon={User}
          type="text"
          value={fullName}
          onChange={setFullName}
          required
          placeholder="Nombre Completo"
          name="name"
          autoComplete="name"
        />
        <InputWithIcon
          Icon={Phone}
          type="tel"
          value={phone}
          onChange={setPhone}
          required
          placeholder="Teléfono"
          name="tel"
          autoComplete="tel"
        />
        <InputWithIcon
          Icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="Correo Electrónico"
          name="email"
          autoComplete="username"
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          required
          placeholder="Contraseña (min. 6)"
          name="password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#ffdf70] px-4 py-3.5 font-bold text-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.4)] mt-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Completar Registro"}
            {!isLoading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={onSwitchMode} className="text-xs text-white/50 hover:text-white transition-colors">
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </motion.div>
  );
}

function OrSeparator() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-white/40 uppercase tracking-widest">o</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function InputWithIcon({
  Icon,
  type,
  required,
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
}: {
  Icon: typeof Mail;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  name?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        name={name}
        autoComplete={autoComplete}
        className="w-full bg-[#111] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-white/30 text-base"
      />
    </div>
  );
}
