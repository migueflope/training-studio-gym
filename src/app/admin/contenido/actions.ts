"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/assertAdmin";
import type { BankConfig, TrainerConfig } from "@/lib/cms";

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

const TEXT_KEYS = [
  "hero_title",
  "hero_subtitle",
  "about_text",
  "address",
  "hours_weekdays",
  "hours_saturday",
  "hours_sunday",
  "contact_email",
] as const;

const NUMBER_KEYS = ["price_monthly", "price_session", "price_assessment"] as const;

const BANK_KEYS = ["bank_bancolombia", "bank_nequi", "bank_daviplata"] as const;
type BankKey = (typeof BANK_KEYS)[number];

const TRAINER_KEYS = ["trainer_1", "trainer_2"] as const;
type TrainerKey = (typeof TRAINER_KEYS)[number];

export async function saveCmsContent(formData: FormData): Promise<Result> {
  const { supabase } = await assertAdmin();

  const updates: { key: string; value: unknown }[] = [];

  for (const k of TEXT_KEYS) {
    const v = String(formData.get(k) ?? "").trim();
    if (!v) return { ok: false, error: `El campo "${k}" no puede estar vacío.` };
    updates.push({ key: k, value: v });
  }

  for (const k of NUMBER_KEYS) {
    const raw = String(formData.get(k) ?? "").replace(/[^\d]/g, "");
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: `Precio inválido en "${k}".` };
    }
    updates.push({ key: k, value: n });
  }

  for (const k of BANK_KEYS) {
    const name = String(formData.get(`${k}__name`) ?? "").trim();
    const holder = String(formData.get(`${k}__holder`) ?? "").trim();
    const account = String(formData.get(`${k}__account`) ?? "").trim();
    const enabled = formData.get(`${k}__enabled`) === "on";
    const qrPath = String(formData.get(`${k}__qr_path`) ?? "").trim() || null;

    if (!name || !holder || !account) {
      return {
        ok: false,
        error: `Datos bancarios incompletos para ${k.replace("bank_", "")}.`,
      };
    }
    const value: BankConfig = { name, holder, account, qr_path: qrPath, enabled };
    updates.push({ key: k, value });
  }

  for (const k of TRAINER_KEYS) {
    const name = String(formData.get(`${k}__name`) ?? "").trim();
    const enabled = formData.get(`${k}__enabled`) === "on";
    const photoPath = String(formData.get(`${k}__photo_path`) ?? "").trim() || null;
    if (!name) {
      return {
        ok: false,
        error: `Falta el nombre del entrenador (${k}).`,
      };
    }
    const value: TrainerConfig = { name, photo_path: photoPath, enabled };
    updates.push({ key: k, value });
  }

  for (const u of updates) {
    const { error } = await supabase.from("content").upsert(
      {
        key: u.key,
        value: u.value as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadBankQr(
  bankKey: BankKey,
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "El archivo debe ser una imagen." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Imagen muy pesada (máx 4MB)." };
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const path = `${bankKey}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("payment-qrs")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) return { ok: false, error: upErr.message };

  // Update the bank record so the new QR is live immediately. We need to
  // preserve the rest of the bank fields, so read first.
  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", bankKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<BankConfig>;
  const next: BankConfig = {
    name: current.name ?? "",
    holder: current.holder ?? "",
    account: current.account ?? "",
    enabled: current.enabled ?? true,
    qr_path: path,
  };

  const { error: updErr } = await supabase.from("content").upsert(
    { key: bankKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true, path };
}

export async function removeBankQr(
  bankKey: BankKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", bankKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<BankConfig>;

  if (current.qr_path) {
    await supabase.storage.from("payment-qrs").remove([current.qr_path]);
  }

  const next: BankConfig = {
    name: current.name ?? "",
    holder: current.holder ?? "",
    account: current.account ?? "",
    enabled: current.enabled ?? true,
    qr_path: null,
  };

  const { error } = await supabase.from("content").upsert(
    { key: bankKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadTrainerPhoto(
  trainerKey: TrainerKey,
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "El archivo debe ser una imagen." };
  }
  if (file.size > 6 * 1024 * 1024) {
    return { ok: false, error: "Imagen muy pesada (máx 6MB)." };
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const path = `${trainerKey}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("trainer-photos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", trainerKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<TrainerConfig>;
  const next: TrainerConfig = {
    name: current.name ?? "",
    enabled: current.enabled ?? true,
    photo_path: path,
  };

  const { error: updErr } = await supabase.from("content").upsert(
    { key: trainerKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true, path };
}

export async function removeTrainerPhoto(
  trainerKey: TrainerKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", trainerKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<TrainerConfig>;

  if (current.photo_path) {
    await supabase.storage.from("trainer-photos").remove([current.photo_path]);
  }

  const next: TrainerConfig = {
    name: current.name ?? "",
    enabled: current.enabled ?? true,
    photo_path: null,
  };

  const { error } = await supabase.from("content").upsert(
    { key: trainerKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}
