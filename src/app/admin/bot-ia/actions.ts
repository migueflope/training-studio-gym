"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/assertAdmin";

type Result = { ok: true } | { ok: false; error: string };

export async function saveBotConfig(formData: FormData): Promise<Result> {
  const { supabase } = await assertAdmin();

  const systemPrompt = String(formData.get("system_prompt") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim();
  const whatsappDisplay = String(formData.get("whatsapp_display") ?? "").trim();

  if (systemPrompt.length < 20) {
    return { ok: false, error: "El prompt es demasiado corto." };
  }
  if (!/^\d{8,15}$/.test(whatsappNumber)) {
    return {
      ok: false,
      error: "Número de WhatsApp inválido (solo dígitos, ej. 573122765732).",
    };
  }
  if (whatsappDisplay.length < 6) {
    return { ok: false, error: "Formato de visualización muy corto." };
  }

  const updates = [
    { key: "chatbot_system_prompt", value: systemPrompt },
    { key: "whatsapp_number", value: whatsappNumber },
    { key: "whatsapp_display", value: whatsappDisplay },
  ];

  for (const u of updates) {
    const { error } = await supabase
      .from("content")
      .upsert(
        { key: u.key, value: u.value, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/bot-ia");
  revalidatePath("/", "layout");
  return { ok: true };
}
