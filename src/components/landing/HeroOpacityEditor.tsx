"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Settings2, X } from "lucide-react";
import { saveHeroVideoOpacity } from "@/app/admin/contenido/actions";
import { useHeroOpacity } from "./HeroOpacityContext";

/**
 * Admin-only floating panel to live-tune the hero video opacity in mobile
 * and desktop independently. Persists to the CMS on "Guardar". The Hero
 * subscribes to the context so the canvas updates as you drag.
 */
export function HeroOpacityEditor() {
  const { mobile, desktop, setMobile, setDesktop } = useHeroOpacity();
  const [open, setOpen] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [initial, setInitial] = useState({ mobile, desktop });

  useEffect(() => {
    if (!savedFlag) return;
    const t = setTimeout(() => setSavedFlag(false), 1800);
    return () => clearTimeout(t);
  }, [savedFlag]);

  const dirty = mobile !== initial.mobile || desktop !== initial.desktop;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveHeroVideoOpacity({ mobile, desktop });
      if (res.ok) {
        setInitial({ mobile, desktop });
        setSavedFlag(true);
      } else {
        setError(res.error);
      }
    });
  };

  const handleRevert = () => {
    setMobile(initial.mobile);
    setDesktop(initial.desktop);
    setError(null);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Editar opacidad del hero"
        className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-black/85 backdrop-blur-md border border-primary/40 text-primary text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-shadow"
      >
        <Settings2 className="w-4 h-4" />
        Opacidad del Hero
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[320px] bg-card/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(212,175,55,0.4)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm">Opacidad del Hero</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <Slider
          label="Celular"
          value={mobile}
          onChange={setMobile}
        />
        <Slider
          label="Computador"
          value={desktop}
          onChange={setDesktop}
        />

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRevert}
            disabled={!dirty || pending}
            className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Deshacer
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || pending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : savedFlag ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Guardado
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-primary font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(212,175,55,0.6)] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
      />
    </div>
  );
}
