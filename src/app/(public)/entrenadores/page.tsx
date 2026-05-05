import { getCmsContent, getTrainerPhotoUrl } from "@/lib/cms";
import EntrenadoresClient from "./EntrenadoresClient";
import { FALLBACK_TRAINERS, type Trainer } from "./trainers-data";

export const dynamic = "force-dynamic";

export default async function EntrenadoresPage() {
  const cms = await getCmsContent();
  const cmsTrainers = [cms.trainer_1, cms.trainer_2];

  const trainers: Trainer[] = await Promise.all(
    FALLBACK_TRAINERS.map(async (fallback, i) => {
      const cmsTrainer = cmsTrainers[i];
      const url = await getTrainerPhotoUrl(cmsTrainer.photo_path);
      return {
        ...fallback,
        name: cmsTrainer.name || fallback.name,
        image: url ?? fallback.image,
        enabled: cmsTrainer.enabled,
      };
    }),
  );

  return (
    <EntrenadoresClient
      whatsappNumber={cms.whatsapp_number}
      trainers={trainers}
    />
  );
}
