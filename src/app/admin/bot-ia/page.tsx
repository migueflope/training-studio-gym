import { Bot, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { getCmsContent } from "@/lib/cms";
import { BotConfigForm } from "./BotConfigForm";

export const dynamic = "force-dynamic";

export default async function AdminBotIaPage() {
  const cms = await getCmsContent();
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Configurar Bot</h1>
        <p className="text-muted-foreground">
          Edita la personalidad del chatbot del sitio y a qué WhatsApp se
          redirige a los usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              Modelo
            </p>
            <p className="font-bold">Gemini 2.5 Flash</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              hasGeminiKey ? "bg-success/10" : "bg-destructive/10"
            }`}
          >
            <KeyRound
              className={`w-6 h-6 ${
                hasGeminiKey ? "text-success" : "text-destructive"
              }`}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
              API Key Gemini
            </p>
            <p
              className={`font-bold inline-flex items-center gap-1.5 ${
                hasGeminiKey ? "text-success" : "text-destructive"
              }`}
            >
              {hasGeminiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Configurada
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" /> Falta configurar
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <BotConfigForm
        systemPrompt={cms.chatbot_system_prompt}
        whatsappNumber={cms.whatsapp_number}
        whatsappDisplay={cms.whatsapp_display}
      />
    </div>
  );
}
