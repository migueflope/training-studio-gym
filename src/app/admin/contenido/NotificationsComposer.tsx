"use client";

import { useState, useTransition } from "react";
import {
  Megaphone,
  Send,
  User,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Repeat2,
} from "lucide-react";
import { sendAdminNotification } from "@/app/notifications/actions";

export interface MemberOption {
  id: string;
  name: string;
  email: string;
}

export interface RecentNotification {
  id: string;
  type: "broadcast" | "admin_message";
  title: string;
  body: string | null;
  link: string | null;
  recipientName: string;
  recipientCount: number;
  createdAt: string;
}

interface Props {
  members: MemberOption[];
  activeMembersCount: number;
  recent: RecentNotification[];
}

export function NotificationsComposer({
  members,
  activeMembersCount,
  recent,
}: Props) {
  const [audience, setAudience] = useState<"user" | "all_members">("user");
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ count: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setTitle("");
    setBody("");
    setLink("");
    setUserId("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await sendAdminNotification({
        audience,
        userId: audience === "user" ? userId : null,
        title,
        body,
        link: link || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess({ count: res.sent ?? 0 });
      reset();
    });
  };

  const handleResend = (n: RecentNotification) => {
    setAudience(n.type === "broadcast" ? "all_members" : "user");
    setTitle(n.title);
    setBody(n.body ?? "");
    setLink(n.link ?? "");
    if (n.type === "admin_message") setUserId("");
    setSuccess(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Notificaciones</h3>
            <p className="text-xs text-muted-foreground">
              Mandá un mensaje a un socio puntual o a todos los miembros activos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Destinatario
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudience("user")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  audience === "user"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                <User className="w-4 h-4" />
                Un socio
              </button>
              <button
                type="button"
                onClick={() => setAudience("all_members")}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  audience === "all_members"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                <Users className="w-4 h-4" />
                Todos ({activeMembersCount})
              </button>
            </div>
          </div>

          {audience === "user" && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Socio
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={pending}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
              >
                <option value="">Elegí un socio…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Título <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
              disabled={pending}
              placeholder="Ej: Clase de mañana cancelada"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {title.length}/120
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Mensaje <span className="text-muted-foreground/60 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              disabled={pending}
              placeholder="Detalle del mensaje. Aparece debajo del título en la campanita."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Link <span className="text-muted-foreground/60 font-normal normal-case">(opcional, ruta interna)</span>
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={pending}
              placeholder="/dashboard/membresia"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Al hacer click en la notificación, el usuario va a esa ruta.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Notificación enviada a {success.count}{" "}
                {success.count === 1 ? "destinatario" : "destinatarios"}.
              </span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || title.trim().length < 3 || (audience === "user" && !userId)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar notificación
            </button>
          </div>
        </form>
      </div>

      {recent.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h3 className="font-display font-bold text-lg mb-4">Últimas enviadas</h3>
          <ul className="divide-y divide-border">
            {recent.map((n) => (
              <li key={n.id} className="py-3 flex items-start gap-3">
                <div className="p-1.5 bg-secondary rounded-lg shrink-0 text-primary">
                  {n.type === "broadcast" ? (
                    <Megaphone className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {n.recipientName} · {new Date(n.createdAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResend(n)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border rounded-lg hover:bg-secondary transition-colors"
                  title="Cargar este mensaje en el composer"
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  Re-usar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
