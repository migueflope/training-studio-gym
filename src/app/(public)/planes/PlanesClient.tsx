"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, QrCode, Copy, ArrowLeft, RotateCcw, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { WizardUploadPanel } from "./WizardUploadPanel";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { readCheckout, writeCheckout, clearCheckout } from "@/lib/checkout/storage";
import type { PlanPricingConfig, PlanSlug } from "@/lib/cms";

const BANK_LOGOS: Record<string, string> = {
  bancolombia: "/assets/banks/bancolombia.svg",
  nequi: "/assets/banks/nequi.svg",
  daviplata: "/assets/banks/daviplata.svg",
};

type PlanCardMeta = {
  id: string;
  slug: PlanSlug;
  name: string;
  isPopular: boolean;
  features: string[];
};

const BASIC_SERVICES: PlanCardMeta[] = [
  {
    id: "mensualidad",
    slug: "mensualidad",
    name: "Mensualidad del Gym",
    isPopular: false,
    features: [
      "Acceso ilimitado a las instalaciones",
      "Uso de todas las máquinas",
      "Horarios flexibles",
    ],
  },
  {
    id: "sesion",
    slug: "sesion",
    name: "Sesión de Entrenamiento",
    isPopular: false,
    features: ["Pase por 1 día", "Acceso a máquinas", "Ideal para probar"],
  },
  {
    id: "valoracion",
    slug: "valoracion",
    name: "Valoración Física",
    isPopular: false,
    features: [
      "Análisis de composición corporal",
      "Medidas y peso",
      "Definición de objetivos",
    ],
  },
];

const CUSTOM_PACKAGES: PlanCardMeta[] = [
  {
    id: "12-clases",
    slug: "package_12",
    name: "Paquete 12 Clases",
    isPopular: false,
    features: [
      "12 sesiones personalizadas",
      "Rutina adaptada por IA",
      "Valoración incluida",
      "Soporte de entrenadores",
    ],
  },
  {
    id: "15-clases",
    slug: "package_15",
    name: "Paquete 15 Clases",
    isPopular: true,
    features: [
      "15 sesiones personalizadas",
      "Rutina premium adaptada",
      "Valoración física mensual",
      "Prioridad en reservas",
    ],
  },
  {
    id: "20-clases",
    slug: "package_20",
    name: "Paquete 20 Clases",
    isPopular: false,
    features: [
      "20 sesiones personalizadas",
      "Resultados acelerados",
      "Valoración física quincenal",
      "Acceso total a la app",
    ],
  },
];

const ALL_PLAN_META: PlanCardMeta[] = [...BASIC_SERVICES, ...CUSTOM_PACKAGES];

function formatCop(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

function priceForPlan(meta: PlanCardMeta, pricing: PlanPricingConfig) {
  const entry = pricing[meta.slug];
  const original = entry.price;
  const discount = entry.discount_percentage;
  const final = Math.max(0, Math.round(original * (1 - discount / 100)));
  return {
    originalLabel: formatCop(original),
    finalLabel: formatCop(final),
    discount,
    hasDiscount: discount > 0,
  };
}

export type PaymentMethod = {
  id: "bancolombia" | "nequi" | "daviplata";
  name: string;
  account: string;
  qrUrl: string | null;
};

export default function PlanesClient({
  paymentMethods,
  whatsappNumber,
  planPricing,
}: {
  paymentMethods: PaymentMethod[];
  whatsappNumber: string;
  planPricing: PlanPricingConfig;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PlanesContent
        paymentMethods={paymentMethods}
        whatsappNumber={whatsappNumber}
        planPricing={planPricing}
      />
    </Suspense>
  );
}

function PlanesContent({
  paymentMethods,
  whatsappNumber,
  planPricing,
}: {
  paymentMethods: PaymentMethod[];
  whatsappNumber: string;
  planPricing: PlanPricingConfig;
}) {
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [contactData, setContactData] = useState({ name: "", whatsapp: "", email: "" });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [transactionRef, setTransactionRef] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  // Mount-only: restore from URL params and/or localStorage.
  // URL plan/step always wins for plan+step. Contact/method/txRef are
  // restored from storage only if the stored plan matches.
  useEffect(() => {
    const planParam = searchParams.get("plan");
    const stepParam = searchParams.get("step");
    const saved = readCheckout();

    let restoredAny = false;

    if (planParam && stepParam) {
      setSelectedPlan(planParam);
      setStep(parseInt(stepParam, 10));
      if (saved && saved.plan === planParam) {
        setContactData(saved.contact);
        const m = paymentMethods.find((pm) => pm.id === saved.methodId);
        if (m) setSelectedMethod(m);
        setTransactionRef(saved.txRef);
        if (saved.step >= 2) restoredAny = true;
      } else if (saved) {
        clearCheckout();
      }
    } else if (saved && saved.step >= 2 && saved.step <= 3) {
      setSelectedPlan(saved.plan);
      setStep(saved.step);
      setContactData(saved.contact);
      const m = paymentMethods.find((pm) => pm.id === saved.methodId);
      if (m) setSelectedMethod(m);
      setTransactionRef(saved.txRef);
      restoredAny = true;
    }

    if (restoredAny) setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist progress whenever the user advances or edits anything in step 2/3.
  useEffect(() => {
    if (!selectedPlan || step < 2 || step > 3) return;
    writeCheckout({
      plan: selectedPlan,
      step,
      contact: contactData,
      methodId: selectedMethod.id,
      txRef: transactionRef,
    });
  }, [selectedPlan, step, contactData, selectedMethod, transactionRef]);

  // Clean up once the user reaches success.
  useEffect(() => {
    if (step === 4) clearCheckout();
  }, [step]);

  const resetCheckout = () => {
    clearCheckout();
    setRestored(false);
    setStep(1);
    setSelectedPlan(null);
    setContactData({ name: "", whatsapp: "", email: "" });
    setSelectedMethod(paymentMethods[0]);
    setTransactionRef("");
  };

  const selectedPlanMeta =
    ALL_PLAN_META.find((p) => p.id === selectedPlan) ?? null;
  const restoredPlanName = selectedPlanMeta?.name ?? "tu plan";
  const selectedPlanFinalLabel = selectedPlanMeta
    ? priceForPlan(selectedPlanMeta, planPricing).finalLabel
    : "—";

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMethod.account);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background py-24 relative overflow-hidden">
      {/* Background Holographic Glows */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        {restored && (step === 2 || step === 3) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 rounded-2xl border border-primary/30 bg-primary/[0.06] backdrop-blur-sm px-4 py-3.5 sm:px-5 sm:py-4 overflow-hidden flex items-center gap-3 sm:gap-4"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
                className="h-px w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(212,175,55,0.85)]"
              />
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 border border-primary/30 shrink-0 shadow-[0_0_18px_-4px_rgba(212,175,55,0.5)]">
              <RotateCcw className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-sm sm:text-[15px] leading-tight">
                Continuá tu pago
              </p>
              <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 leading-snug">
                Recuperamos tu progreso de <span className="text-foreground font-medium">{restoredPlanName}</span>. Seguí desde donde lo dejaste.
              </p>
            </div>
            <button
              type="button"
              onClick={resetCheckout}
              aria-label="Empezar de cero"
              className="shrink-0 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 sm:px-3 py-1.5 rounded-full border border-border hover:border-primary/40 transition-colors"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Empezar de cero</span>
              <span className="sm:hidden">Reiniciar</span>
            </button>
          </motion.div>
        )}

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Selecciona tu <span className="text-primary">Plan</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground">
            <span className={step >= 1 ? "text-primary" : ""}>1. Plan</span>
            <div className={`h-px w-8 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            <span className={step >= 2 ? "text-primary" : ""}>2. Datos</span>
            <div className={`h-px w-8 ${step >= 3 ? "bg-primary" : "bg-border"}`} />
            <span className={step >= 3 ? "text-primary" : ""}>3. Pago</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-16"
            >
              {/* SERVICIOS BÁSICOS */}
              <div>
                <h2 className="text-2xl font-display font-bold text-center mb-8 uppercase tracking-wider text-primary">Servicios</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {BASIC_SERVICES.map((plan) => {
                    const pricing = priceForPlan(plan, planPricing);
                    return (
                      <div
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan.id); setStep(2); }}
                        className="glass-panel cursor-pointer group relative p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                      >
                        <h3 className="text-xl font-display font-bold mb-6">{plan.name}</h3>
                        <div className="flex flex-col items-start gap-1 mb-8">
                          {pricing.hasDiscount && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-through text-sm font-medium">{pricing.originalLabel}</span>
                              <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">-{pricing.discount}% OFF</span>
                            </div>
                          )}
                          <span className="text-4xl font-bold font-mono text-primary tracking-tighter">{pricing.finalLabel}</span>
                        </div>

                        <ul className="space-y-4 mb-8 text-left flex-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary shrink-0" />
                              <span className="text-muted-foreground text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="w-full text-center py-3 rounded-lg border border-primary/30 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-auto">
                          Seleccionar Plan
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SERVICIOS COMPLEMENTARIOS */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-primary mb-1">Servicios Complementarios</h2>
                  <p className="text-muted-foreground">Entrenamiento Personalizado</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CUSTOM_PACKAGES.map((plan) => {
                    const pricing = priceForPlan(plan, planPricing);
                    return (
                      <div
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan.id); setStep(2); }}
                        className={`glass-panel cursor-pointer group relative p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col h-full ${plan.isPopular ? 'border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)] md:-translate-y-2' : 'border-border hover:border-primary/50'}`}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            MÁS POPULAR
                          </div>
                        )}
                        <h3 className="text-xl font-display font-bold mb-6">{plan.name}</h3>
                        <div className="flex flex-col items-start gap-1 mb-8">
                          {pricing.hasDiscount && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-through text-sm font-medium">{pricing.originalLabel}</span>
                              <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">-{pricing.discount}% OFF</span>
                            </div>
                          )}
                          <span className="text-4xl font-bold font-mono text-primary tracking-tighter">{pricing.finalLabel}</span>
                        </div>

                        <ul className="space-y-4 mb-8 text-left flex-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary shrink-0" />
                              <span className="text-muted-foreground text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="w-full text-center py-3 rounded-lg border border-primary/30 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-auto">
                          Seleccionar Plan
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CONTACT DATA */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl"
            >
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Cambiar plan
              </button>
              
              <h3 className="text-2xl font-display font-bold mb-6">Tus Datos</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nombre Completo</label>
                  <input
                    type="text" required
                    className="w-full bg-secondary/50 border-b-2 border-transparent focus:border-primary focus:outline-none py-3 px-4 rounded-t-md text-foreground transition-all"
                    value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">WhatsApp</label>
                  <input
                    type="tel" required
                    className="w-full bg-secondary/50 border-b-2 border-transparent focus:border-primary focus:outline-none py-3 px-4 rounded-t-md text-foreground transition-all"
                    value={contactData.whatsapp} onChange={e => setContactData({...contactData, whatsapp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Correo</label>
                  <input
                    type="email" required
                    className="w-full bg-secondary/50 border-b-2 border-transparent focus:border-primary focus:outline-none py-3 px-4 rounded-t-md text-foreground transition-all"
                    value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})}
                  />
                </div>
                
                <button type="submit" className="w-full py-4 mt-6 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
                  Continuar al Pago
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: HOLOGRAPHIC PAYMENT TERMINAL */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-panel rounded-3xl overflow-hidden border border-primary/30 relative shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                {/* Scanner line animation */}
                <motion.div 
                  className="absolute left-0 right-0 h-1 bg-primary/50 blur-[2px] z-20"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="flex flex-col md:flex-row">
                  {/* Left Side: QR and Methods */}
                  <div className="md:w-1/2 p-8 bg-secondary/30 border-r border-border relative z-10">
                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                      <ArrowLeft className="w-4 h-4" /> Volver
                    </button>
                    
                    <h3 className="text-xl font-display font-bold mb-6 text-primary flex items-center gap-2">
                      <QrCode className="w-6 h-6" /> Escanea para Pagar
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {paymentMethods.map(method => {
                        const logo = BANK_LOGOS[method.id];
                        const isActive = selectedMethod.id === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method)}
                            aria-label={method.name}
                            aria-pressed={isActive}
                            title={method.name}
                            className={`flex-1 min-w-0 inline-flex items-center justify-center rounded-full px-4 py-2.5 transition-all ${isActive ? 'bg-primary' : 'bg-secondary hover:bg-secondary/70'}`}
                          >
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={logo}
                                alt={method.name}
                                className={`block h-5 w-auto max-w-full ${isActive ? '[filter:brightness(0)]' : '[filter:brightness(0)_invert(1)]'}`}
                              />
                            ) : (
                              <span className={`text-sm font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{method.name}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-center mx-auto w-48 h-48 mb-6 relative">
                       {/* Holographic glow behind QR */}
                       <div className="absolute inset-0 bg-primary/20 blur-[20px] animate-pulse" />
                       {selectedMethod.qrUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img
                           src={selectedMethod.qrUrl}
                           alt={`QR ${selectedMethod.name}`}
                           className="relative w-40 h-40 object-contain"
                         />
                       ) : (
                         <QRCodeSVG value={`transfer:${selectedMethod.account}`} size={160} level="H" includeMargin={false} />
                       )}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Número de cuenta {selectedMethod.name}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-xl font-bold">{selectedMethod.account}</span>
                        <button onClick={handleCopy} className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors">
                          {isCopied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Inline upload */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center relative z-10">
                    <WizardUploadPanel
                      wizardPlanId={selectedPlan}
                      method={selectedMethod.id}
                      whatsappNumber={whatsappNumber}
                      priceLabel={selectedPlanFinalLabel}
                      transactionRef={transactionRef}
                      onTransactionRefChange={setTransactionRef}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">¡Pago Recibido!</h2>
              <p className="text-muted-foreground mb-8">
                Estamos verificando tu comprobante. En breve recibirás un correo de confirmación y podrás acceder a tu panel.
              </p>
              <button
                onClick={() => openAuth("login")}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
              >
                Iniciar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
