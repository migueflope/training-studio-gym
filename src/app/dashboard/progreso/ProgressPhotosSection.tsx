"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Plus, Trash2, Loader2, AlertCircle, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addProgressPhoto, deleteProgressPhoto } from "./actions";

export interface ProgressPhotoRow {
  id: string;
  takenOn: string;
  path: string;
  url: string | null;
  label: string | null;
  notes: string | null;
}

interface ProgressPhotosSectionProps {
  userId: string;
  photos: ProgressPhotoRow[];
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProgressPhotosSection({
  userId,
  photos,
}: ProgressPhotosSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [zoom, setZoom] = useState<ProgressPhotoRow | null>(null);

  return (
    <section className="glass-panel rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Fotos de progreso</h2>
            <p className="text-xs text-muted-foreground">
              Compará tu evolución con fotos antes / después.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Subir foto
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Subí tu primera foto. Te recomendamos misma postura, misma luz y misma hora.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <PhotoTile key={p.id} photo={p} onZoom={() => setZoom(p)} />
          ))}
        </div>
      )}

      {showForm && (
        <UploadDialog userId={userId} onClose={() => setShowForm(false)} />
      )}
      {zoom && <ZoomDialog photo={zoom} onClose={() => setZoom(null)} />}
    </section>
  );
}

function PhotoTile({
  photo,
  onZoom,
}: {
  photo: ProgressPhotoRow;
  onZoom: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Borrar esta foto?")) return;
    startTransition(async () => {
      await deleteProgressPhoto(photo.id);
    });
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-square cursor-pointer" onClick={onZoom}>
      {photo.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={photo.label ?? "Foto de progreso"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
          (no se pudo cargar)
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-[10px] text-white/90 font-bold">{fmtDate(photo.takenOn)}</p>
        {photo.label && <p className="text-[11px] text-white truncate">{photo.label}</p>}
      </div>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all disabled:opacity-50"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function ZoomDialog({
  photo,
  onClose,
}: {
  photo: ProgressPhotoRow;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-10" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative max-w-3xl max-h-full">
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-primary">
          <X className="w-6 h-6" />
        </button>
        {photo.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.label ?? "Foto"} className="max-h-[80vh] rounded-xl border border-border" />
        )}
        <p className="text-white/80 text-sm mt-3">
          {fmtDate(photo.takenOn)}
          {photo.label && <span className="text-white"> · {photo.label}</span>}
        </p>
        {photo.notes && <p className="text-white/60 text-xs mt-1">{photo.notes}</p>}
      </div>
    </div>
  );
}

function UploadDialog({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Subí una foto");
    if (!ACCEPTED.includes(file.type))
      return setError("Formato no soportado (JPG, PNG o WebP)");
    if (file.size > MAX_BYTES) return setError("Foto muy pesada (máx 8 MB)");

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;

      startTransition(async () => {
        const res = await addProgressPhoto({
          takenOn: date,
          photoPath: path,
          label: label || null,
          notes: notes || null,
        });
        if (!res.ok) {
          await supabase.storage.from("progress-photos").remove([path]);
          setError(res.error);
          return;
        }
        onClose();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo");
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || pending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto" onClick={busy ? undefined : onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <h3 className="font-display font-bold text-lg">Subir foto de progreso</h3>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Fecha
          </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={today} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Etiqueta (opcional)
          </label>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Frente / Lateral / Espalda" className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notas (opcional)
          </label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm" />
        </div>

        <div>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{file?.name ?? "Elegir foto (JPG, PNG, WebP · máx 8 MB)"}</span>
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Subir
          </button>
        </div>
      </form>
    </div>
  );
}
