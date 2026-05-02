import { getCmsContent } from "@/lib/cms";
import ContactoClient from "./ContactoClient";

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const cms = await getCmsContent();
  return (
    <ContactoClient
      whatsappNumber={cms.whatsapp_number}
      whatsappDisplay={cms.whatsapp_display}
      address={cms.address}
      hoursWeekdays={cms.hours_weekdays}
      hoursSaturday={cms.hours_saturday}
      hoursSunday={cms.hours_sunday}
      contactEmail={cms.contact_email}
    />
  );
}
