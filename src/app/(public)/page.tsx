import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
import { Pillars } from "@/components/landing/Pillars";
import { Pricing } from "@/components/landing/Pricing";
import { Trainers, type TrainerCardData } from "@/components/landing/Trainers";
import { GymShowcase } from "@/components/landing/GymShowcase";
import { Location } from "@/components/landing/Location";
import { ParticleField } from "@/components/ui/ParticleField";
import { HeroOpacityProvider } from "@/components/landing/HeroOpacityContext";
import { HeroOpacityEditor } from "@/components/landing/HeroOpacityEditor";
import { getCmsContent, getTrainerPhotoUrl } from "@/lib/cms";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";

export const dynamic = "force-dynamic";

const TRAINER_DEFAULTS: Array<
  Omit<TrainerCardData, "name" | "image" | "enabled"> & { fallbackImage: string }
> = [
  {
    specialty: "Hipertrofia y Fuerza",
    experience: "8 años de experiencia",
    bio: "Especialista en biomecánica y desarrollo muscular. Si tu objetivo es ganar masa muscular de forma efectiva y segura, Camilo diseñará la estrategia perfecta para tu cuerpo.",
    fallbackImage: "/images/camilo-ortiz.png",
  },
  {
    specialty: "Funcional y Pérdida de Peso",
    experience: "10 años de experiencia",
    bio: "Experto en acondicionamiento físico integral. Transforma tu metabolismo con rutinas dinámicas que combinan fuerza y resistencia cardiovascular.",
    fallbackImage: "/images/juan-carlos-bork.png",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ landing?: string }>;
}) {
  const { landing } = await searchParams;
  const profile = await getUserProfile();
  const isAdmin = !!profile && isAdminRole(profile.role);
  let hasActiveMembership = false;
  if (profile && !isAdmin) {
    const membership = await getActiveMembership(profile.id);
    hasActiveMembership = !!membership;
    if (!landing && membership) redirect("/dashboard");
  }

  const cms = await getCmsContent();

  const trainers: TrainerCardData[] = await Promise.all(
    [cms.trainer_1, cms.trainer_2].map(async (t, i) => {
      const url = await getTrainerPhotoUrl(t.photo_path);
      const meta = TRAINER_DEFAULTS[i];
      return {
        name: t.name,
        enabled: t.enabled,
        image: url ?? meta.fallbackImage,
        specialty: meta.specialty,
        experience: meta.experience,
        bio: meta.bio,
      };
    }),
  );

  return (
    <HeroOpacityProvider
      initialMobile={cms.hero_video_opacity_mobile}
      initialDesktop={cms.hero_video_opacity_desktop}
    >
      <div className="flex flex-col w-full">
        <ParticleField />
        <Hero
          badge={cms.hero_title}
          subtitle={cms.hero_subtitle}
          isAdmin={isAdmin}
          hasActiveMembership={hasActiveMembership}
        />
        <Pillars description={cms.about_text} />
        <Pricing planPricing={cms.plan_pricing} />
        <Trainers trainers={trainers} />
        <GymShowcase />
        <Location />
      </div>
      {isAdmin && <HeroOpacityEditor />}
    </HeroOpacityProvider>
  );
}
