"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export interface UpdateProfileInput {
  fullName: string;
  phone: string | null;
}

export async function updateProfile({ fullName, phone }: UpdateProfileInput) {
  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) {
    return { ok: false as const, error: "Tu nombre es demasiado corto" };
  }
  if (trimmedName.length > 80) {
    return { ok: false as const, error: "Tu nombre es demasiado largo" };
  }

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmedName, phone: phone?.trim() || null })
    .eq("id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function setAvatarUrl(path: string | null) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function requestEmailChange(newEmail: string) {
  const trimmed = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false as const, error: "Email inválido" };
  }

  const { supabase, user } = await requireUser();
  if (trimmed === user.email?.toLowerCase()) {
    return { ok: false as const, error: "Ese ya es tu email actual" };
  }

  const { error } = await supabase.auth.updateUser({ email: trimmed });
  if (error) return { ok: false as const, error: error.message };

  return { ok: true as const, sentTo: trimmed };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
