"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { saveBotConfig } from "./actions";

export function BotConfigForm({
  systemPrompt,
  whatsappNumber,
  whatsappDisplay,
}: {
  systemPrompt: string;
  whatsappNumber: string;
  whatsappDisplay: string;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "err"; text: string } | null
  >(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveBotConfig(fd);
      if (res.ok) {
        setFeedback({ tone: "ok", text: "Cambios guardados." });
      } else {
        setFeedback({ tone: "err", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg mb-1">
            Personalidad del bot
          </h3>
          <p className="text-sm text-muted-foreground">
            Estas instrucciones definen el tono, conocimiento y reglas del
            chatbot. Lo lee antes de cada conversación.
          </p>
        </div>
        <textarea
          name="system_prompt"
          defaultValue={systemPrompt}
          rows={16}
          required
          className="w-full bg-background border border-border rounded-xl p-4 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          placeholder="Ej: Eres el asistente de Training Studio Gym..."
        />
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg mb-1">
            WhatsApp del gimnasio
          </h3>
          <p className="text-sm text-muted-foreground">
            Cuando el bot ofrece agendar o un usuario hace click en cualquier
            botón de WhatsApp del sitio, va a este número.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Número (solo dígitos, con código país)
            </label>
            <input
              name="whatsapp_number"
              defaultValue={whatsappNumber}
              required
              pattern="\d{8,15}"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="573122765732"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Cómo se muestra al usuario
            </label>
            <input
              name="whatsapp_display"
              defaultValue={whatsappDisplay}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="+57 312 276 5732"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {feedback ? (
          <div
            className={`flex items-center gap-2 text-sm ${
              feedback.tone === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {feedback.tone === "ok" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{feedback.text}</span>
          </div>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
