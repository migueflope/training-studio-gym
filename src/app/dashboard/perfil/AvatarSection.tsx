"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2, AlertCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setAvatarUrl } from "./actions";

interface AvatarSectionProps {
  userId: string;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
  /** True when the current avatar lives in our 'avatars' bucket (vs a Google URL). */
  isOwnedAvatar: boolean;
}

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const TARGET_SIZE = 512;

export function AvatarSection({
  userId,
  fullName,
  initials,
  avatarUrl,
  isOwnedAvatar,
}: AvatarSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const flashSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);

    if (!ACCEPTED.includes(file.type)) {
      setError("Formato no soportado. Usá JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen pesa más de 2 MB. Probá con una más liviana.");
      return;
    }

    setUploading(true);
    try {
      const resized = await resizeImage(file, TARGET_SIZE);
      const supabase = createClient();
      const filename = `avatar-${Date.now()}.jpg`;
      const path = `${userId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, resized, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const versionedUrl = `${publicUrl}?v=${Date.now()}`;

      // Best-effort cleanup of any previous file the user uploaded.
      const { data: existing } = await supabase.storage
        .from("avatars")
        .list(userId);
      const stale = (existing ?? [])
        .map((f) => `${userId}/${f.name}`)
        .filter((p) => p !== path);
      if (stale.length > 0) {
        await supabase.storage.from("avatars").remove(stale);
      }

      startTransition(async () => {
        const res = await setAvatarUrl(versionedUrl);
        if (!res.ok) {
          setError(res.error);
        } else {
          setPreview(versionedUrl);
          flashSuccess();
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo la foto";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const supabase = createClient();
      const { data: existing } = await supabase.storage
        .from("avatars")
        .list(userId);
      const paths = (existing ?? []).map((f) => `${userId}/${f.name}`);
      if (paths.length > 0) {
        await supabase.storage.from("avatars").remove(paths);
      }

      const res = await setAvatarUrl(null);
      if (!res.ok) {
        setError(res.error);
      } else {
        setPreview(null);
        flashSuccess();
      }
    });
  };

  const busy = uploading || pending;

  return (
    <div className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shadow-[0_0_20px_-6px_rgba(212,175,55,0.5)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-primary text-2xl font-display font-bold shadow-[0_0_20px_-6px_rgba(212,175,55,0.5)]">
              {initials}
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-lg mb-1">Foto de perfil</h3>
          <p className="text-sm text-muted-foreground mb-3">
            JPG, PNG o WebP. Hasta 2 MB. La recortamos a un cuadrado.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              {preview ? "Cambiar foto" : "Subir foto"}
            </button>
            {preview && isOwnedAvatar && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Quitar
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Foto actualizada.</span>
        </div>
      )}
    </div>
  );
}

async function resizeImage(file: File, size: number): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("No pude leer la imagen"));
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  // Cover-fit: pick the smaller side, center-crop.
  const scale = Math.max(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No pude codificar"))),
      "image/jpeg",
      0.9,
    );
  });
}
