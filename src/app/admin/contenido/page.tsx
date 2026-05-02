import {
  getCmsContent,
  getBankQrUrl,
  getTrainerPhotoUrl,
  type BankConfig,
  type TrainerConfig,
} from "@/lib/cms";
import { CmsForm } from "./CmsForm";

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

  const [bancolombia, nequi, daviplata, trainer1, trainer2] = await Promise.all([
    withQrUrl(cms.bank_bancolombia),
    withQrUrl(cms.bank_nequi),
    withQrUrl(cms.bank_daviplata),
    withPhotoUrl(cms.trainer_1, TRAINER_FALLBACKS.trainer_1),
    withPhotoUrl(cms.trainer_2, TRAINER_FALLBACKS.trainer_2),
  ]);

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
    </div>
  );
}
