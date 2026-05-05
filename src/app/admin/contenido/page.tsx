import {
  getCmsContent,
  getBankQrUrl,
  getTrainerPhotoUrl,
  type BankConfig,
  type TrainerConfig,
} from "@/lib/cms";
import { createClient } from "@/lib/supabase/server";
import { CmsForm } from "./CmsForm";
import {
  NotificationsComposer,
  type MemberOption,
  type RecentNotification,
} from "./NotificationsComposer";

export const dynamic = "force-dynamic";

async function withQrUrl(bank: BankConfig) {
  return { ...bank, qrUrl: await getBankQrUrl(bank.qr_path) };
}

async function withPhotoUrl(trainer: TrainerConfig, fallbackUrl: string) {
  return {
    ...trainer,
    photoUrl: await getTrainerPhotoUrl(trainer.photo_path),
    fallbackUrl,
  };
}

const TRAINER_FALLBACKS = {
  trainer_1: "/images/camilo-ortiz.png",
  trainer_2: "/images/juan-carlos-bork.png",
};

export default async function AdminContenidoPage() {
  const cms = await getCmsContent();
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    bancolombia,
    nequi,
    daviplata,
    trainer1,
    trainer2,
    membersRes,
    activeMembersRes,
    recentNotifsRes,
  ] = await Promise.all([
    withQrUrl(cms.bank_bancolombia),
    withQrUrl(cms.bank_nequi),
    withQrUrl(cms.bank_daviplata),
    withPhotoUrl(cms.trainer_1, TRAINER_FALLBACKS.trainer_1),
    withPhotoUrl(cms.trainer_2, TRAINER_FALLBACKS.trainer_2),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "member")
      .order("full_name"),
    supabase
      .from("memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("end_date", today),
    supabase
      .from("notifications")
      .select("id, type, title, body, link, user_id, created_at, profiles!notifications_user_id_fkey(full_name)")
      .in("type", ["admin_message", "broadcast"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const userIds = (membersRes.data ?? []).map((p) => p.id);
  const emailMap = new Map<string, string>();
  if (userIds.length > 0) {
    // profiles table doesn't expose email; rely on auth user metadata via admin call.
    // For now we just leave the email blank in the dropdown — full_name is enough.
  }

  const members: MemberOption[] = (membersRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name,
    email: emailMap.get(p.id) ?? "",
  }));

  const activeMembersCount = activeMembersRes.count ?? 0;

  // Group broadcasts: same title+body+createdAt minute = one entry with count.
  type RawNotif = {
    id: string;
    type: "admin_message" | "broadcast";
    title: string;
    body: string | null;
    link: string | null;
    user_id: string;
    created_at: string;
    profiles: { full_name: string } | { full_name: string }[] | null;
  };
  const rawNotifs = (recentNotifsRes.data ?? []) as RawNotif[];

  const groups = new Map<string, RecentNotification & { ids: string[] }>();
  for (const n of rawNotifs) {
    const profile = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles;
    if (n.type === "broadcast") {
      const key = `b|${n.title}|${n.body ?? ""}|${n.created_at.slice(0, 16)}`;
      const existing = groups.get(key);
      if (existing) {
        existing.ids.push(n.id);
        existing.recipientCount += 1;
        existing.recipientName = `Broadcast · ${existing.recipientCount} miembros`;
      } else {
        groups.set(key, {
          id: n.id,
          ids: [n.id],
          type: "broadcast",
          title: n.title,
          body: n.body,
          link: n.link,
          recipientName: "Broadcast · 1 miembro",
          recipientCount: 1,
          createdAt: n.created_at,
        });
      }
    } else {
      groups.set(`u|${n.id}`, {
        id: n.id,
        ids: [n.id],
        type: "admin_message",
        title: n.title,
        body: n.body,
        link: n.link,
        recipientName: profile?.full_name ?? "Socio",
        recipientCount: 1,
        createdAt: n.created_at,
      });
    }
  }

  const recent: RecentNotification[] = Array.from(groups.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)
    .map(({ ids: _ids, ...rest }) => rest);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">CMS Web</h1>
        <p className="text-muted-foreground">
          Edita los textos del sitio, los precios y los datos bancarios sin
          tocar código. Los cambios se reflejan en todo el sitio al guardar.
        </p>
      </div>

      <CmsForm
        initial={{
          hero_title: cms.hero_title,
          hero_subtitle: cms.hero_subtitle,
          about_text: cms.about_text,
          address: cms.address,
          hours_weekdays: cms.hours_weekdays,
          hours_saturday: cms.hours_saturday,
          hours_sunday: cms.hours_sunday,
          price_monthly: cms.price_monthly,
          price_session: cms.price_session,
          price_assessment: cms.price_assessment,
          contact_email: cms.contact_email,
          bank_bancolombia: bancolombia,
          bank_nequi: nequi,
          bank_daviplata: daviplata,
          trainer_1: trainer1,
          trainer_2: trainer2,
        }}
      />

      <NotificationsComposer
        members={members}
        activeMembersCount={activeMembersCount}
        recent={recent}
      />
    </div>
  );
}
