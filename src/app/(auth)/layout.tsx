import Link from "next/link";
import { Dumbbell, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 flex flex-col items-center justify-center">
          <Link href="/" className="flex items-center gap-2 mb-8 group transition-transform hover:scale-105">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Dumbbell className="w-7 h-7" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              TRAINING STUDIO
              <span className="text-primary ml-1 block text-center -mt-2">GYM</span>
            </span>
          </Link>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden">
          {/* Subtle glow border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          {children}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
