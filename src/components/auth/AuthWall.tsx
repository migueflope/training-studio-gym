"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "./GoogleButton";
import { PasswordField } from "./PasswordField";
import { Loader2, Mail, Phone, User, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthWallProps {
  mensualidad: {
    price: number;
    discount_percentage: number;
  };
}

const SAVED_PROFILE_KEY = "ts_saved_profile";

export function AuthWall({ mensualidad }: AuthWallProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "saved">("login");
  const [savedProfile, setSavedProfile] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Load saved profile from localStorage
    const saved = localStorage.getItem(SAVED_PROFILE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          setSavedProfile(parsed);
          setMode("saved");
        }
      } catch (e) {}
    }

    // Listen for auth state changes — catches Google OAuth redirects too
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        const u = session.user;
        const profile = {
          email: u.email ?? "",
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "",
        };
        localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profile));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isMounted) {
    return <div className="flex min-h-screen w-full bg-black" />;
  }

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
        
        {/* Futuristic Floating Elements on the Image */}
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
        {/* Mobile Welcome Text (Hidden on Desktop) */}
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
          {/* Logo (Hidden on mobile because Navbar has it) */}
          <div className="hidden lg:flex justify-center mb-8">
            <Image
              src="/assets/logo-transparent.png"
              alt="Training Studio Gym"
              width={200}
              height={200}
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
          </div>

          {/* Dynamic Auth Box */}
          <div className="bg-[#0a0a0a] rounded-2xl lg:rounded-3xl border border-white/5 p-5 sm:p-8 shadow-2xl relative overflow-hidden">
             {/* Subtle internal glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 blur-[50px] pointer-events-none" />
             
             <AnimatePresence mode="wait">
               {mode === "saved" && savedProfile && (
                 <SavedProfileView 
                   key="saved" 
                   profile={savedProfile} 
                   onSwitchAccount={() => setMode("login")} 
                 />
               )}
               {mode === "login" && (
                 <LoginView 
                   key="login" 
                   onSwitchMode={() => setMode("signup")} 
                 />
               )}
               {mode === "signup" && (
                 <SignupView 
                   key="signup" 
                   onSwitchMode={() => setMode("login")} 
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

function SavedProfileView({ profile, onSwitchAccount }: { profile: { email: string; name: string }; onSwitchAccount: () => void }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });
    if (signInError) {
      setIsLoading(false);
      setError("Contraseña incorrecta.");
      return;
    }
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center relative z-10">
      <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary to-yellow-200 rounded-full p-1 mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
        <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center border-2 border-[#111]">
          <User className="w-10 h-10 text-primary/80" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{profile.name || profile.email}</h3>
      <p className="text-sm text-white/40 mb-6">Inicia sesión de nuevo</p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleLogin} className="space-y-4">
        <PasswordField value={password} onChange={setPassword} required placeholder="Contraseña" />
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full group overflow-hidden rounded-xl bg-primary px-4 py-3.5 font-bold text-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <button onClick={onSwitchAccount} className="mt-6 text-xs text-white/50 hover:text-primary transition-colors">
        Usar otra cuenta
      </button>
    </motion.div>
  );
}

function LoginView({ onSwitchMode }: { onSwitchMode: () => void }) {
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
    
    // Save to localStorage for quick login next time
    if (data.user) {
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify({
        email: data.user.email,
        name: data.user.user_metadata?.full_name || ""
      }));
    }
    router.refresh();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-4 sm:mb-6">Iniciar Sesión</h2>

      {error && <ErrorBanner message={error} />}

      <GoogleButton mode="login" />
      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <InputWithIcon Icon={Mail} type="email" value={email} onChange={setEmail} required placeholder="Correo Electrónico" />
        <PasswordField value={password} onChange={setPassword} required placeholder="Contraseña" />
        
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full group overflow-hidden rounded-xl bg-primary px-4 py-3 sm:py-3.5 font-bold text-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <div className="mt-6 sm:mt-8 text-center border-t border-white/5 pt-4 sm:pt-6">
        <p className="text-xs sm:text-sm text-white/50 mb-2 sm:mb-3">¿No tienes cuenta?</p>
        <button
          onClick={onSwitchMode}
          className="text-primary font-bold hover:text-yellow-300 transition-colors text-xs sm:text-sm uppercase tracking-wider"
        >
          Regístrate completamente gratis
        </button>
      </div>
    </motion.div>
  );
}

function SignupView({ onSwitchMode }: { onSwitchMode: () => void }) {
  const router = useRouter();
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
    
    // Save to localStorage for quick login
    localStorage.setItem("ts_saved_profile", JSON.stringify({
      email: email,
      name: fullName
    }));
    
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
      <h2 className="text-xl font-bold text-center text-white mb-2">Crear Cuenta</h2>
      <p className="text-xs text-center text-primary mb-6">Regístrate y reclama tus ofertas exclusivas</p>

      {error && <ErrorBanner message={error} />}

      <GoogleButton mode="signup" />
      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <InputWithIcon Icon={User} type="text" value={fullName} onChange={setFullName} required placeholder="Nombre Completo" />
        <InputWithIcon Icon={Phone} type="tel" value={phone} onChange={setPhone} required placeholder="Teléfono" />
        <InputWithIcon Icon={Mail} type="email" value={email} onChange={setEmail} required placeholder="Correo Electrónico" />
        <PasswordField value={password} onChange={setPassword} required placeholder="Contraseña (min. 6)" />
        
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
}: {
  Icon: typeof Mail;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        className="w-full bg-[#111] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-white/30 text-base"
      />
    </div>
  );
}
