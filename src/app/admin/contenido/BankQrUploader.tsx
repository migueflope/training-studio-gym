"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, QrCode } from "lucide-react";
import { uploadBankQr, removeBankQr } from "./actions";

type BankKey = "bank_bancolombia" | "bank_nequi" | "bank_daviplata";

export function BankQrUploader({
  bankKey,
  initialPath,
  initialUrl,
}: {
  bankKey: BankKey;
  initialPath: string | null;
  initialUrl: string | null;
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
      const res = await uploadBankQr(bankKey, fd);
      if (res.ok) {
        setPath(res.path);
        // Generate a temporary preview URL until the page revalidates.
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
      const res = await removeBankQr(bankKey);
      if (res.ok) {
        setPath(null);
        setUrl(null);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div>
      <input
        type="hidden"
        name={`${bankKey}__qr_path`}
        value={path ?? ""}
        readOnly
      />
      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        QR oficial del banco
      </label>
      <div className="flex items-start gap-4">
        <div className="w-28 h-28 rounded-xl border border-dashed border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
          {url ? (
            // Use plain img — Supabase host isn't in next.config images.remotePatterns
            // and these are small admin previews.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`QR ${bankKey}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <QrCode className="w-7 h-7 mx-auto mb-1 opacity-50" />
              <span className="text-[10px] uppercase tracking-wider">
                Sin QR
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
            id={`qr-input-${bankKey}`}
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
              {url ? "Reemplazar" : "Subir QR"}
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
            Si no subes un QR oficial, el sitio genera uno automáticamente con
            el número de cuenta. Recomendado: PNG o JPG hasta 4MB.
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
