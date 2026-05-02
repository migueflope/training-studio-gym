"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Trash2, Loader2, UserCircle2 } from "lucide-react";
import { uploadTrainerPhoto, removeTrainerPhoto } from "./actions";

type TrainerKey = "trainer_1" | "trainer_2";

export function TrainerPhotoUploader({
  trainerKey,
  initialPath,
  initialUrl,
  fallbackUrl,
}: {
  trainerKey: TrainerKey;
  initialPath: string | null;
  initialUrl: string | null;
  fallbackUrl: string;
}) {
  const [path, setPath] = useState<string | null>(initialPath);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const fd = new FormData();
    fd.set("file", file);

    startTransition(async () => {
      const res = await uploadTrainerPhoto(trainerKey, fd);
      if (res.ok) {
        setPath(res.path);
        const reader = new FileReader();
        reader.onload = () => setUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setError(res.error);
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function onRemove() {
    setError(null);
    startTransition(async () => {
      const res = await removeTrainerPhoto(trainerKey);
      if (res.ok) {
        setPath(null);
        setUrl(null);
      } else {
        setError(res.error);
      }
    });
  }

  const displayUrl = url ?? fallbackUrl;

  return (
    <div>
      <input
        type="hidden"
        name={`${trainerKey}__photo_path`}
        value={path ?? ""}
        readOnly
      />
      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Foto de perfil
      </label>
      <div className="flex items-start gap-4">
        <div className="w-28 h-28 rounded-full border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt={`Entrenador ${trainerKey}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle2 className="w-14 h-14 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
            id={`photo-input-${trainerKey}`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 bg-secondary border border-border px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-secondary/80 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {url ? "Reemplazar" : "Subir foto"}
            </button>
            {url && (
              <button
                type="button"
                disabled={pending}
                onClick={onRemove}
                className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-destructive/20 disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Quitar
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Si no subes una foto, el sitio usa la imagen por defecto. Recomendado: cuadrada, JPG o PNG hasta 6MB.
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
