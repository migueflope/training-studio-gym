import { getCmsContent, getBankQrUrl, type BankConfig } from "@/lib/cms";
import PlanesClient, { type PaymentMethod } from "./PlanesClient";

export const dynamic = "force-dynamic";

async function toMethod(
  id: PaymentMethod["id"],
  bank: BankConfig,
): Promise<PaymentMethod> {
  return {
    id,
    name: bank.name,
    account: bank.account,
    qrUrl: await getBankQrUrl(bank.qr_path),
  };
}

export default async function PlanesPage() {
  const cms = await getCmsContent();
  const banks = [
    { id: "bancolombia" as const, bank: cms.bank_bancolombia },
    { id: "nequi" as const, bank: cms.bank_nequi },
    { id: "daviplata" as const, bank: cms.bank_daviplata },
  ].filter((b) => b.bank.enabled);

  const paymentMethods: PaymentMethod[] = await Promise.all(
    banks.map((b) => toMethod(b.id, b.bank)),
  );

  return (
    <PlanesClient
      paymentMethods={paymentMethods}
      whatsappNumber={cms.whatsapp_number}
    />
  );
}
