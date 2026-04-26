"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, QrCode, UploadCloud, Copy, ArrowLeft, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const basicServices = [
  { id: "mensualidad", name: "Mensualidad del Gym", price: "$60.000", originalPrice: "$90.000", isPopular: false, discount: "-33% OFF", features: ["Acceso ilimitado a las instalaciones", "Uso de todas las máquinas", "Horarios flexibles"] },
  { id: "sesion", name: "Sesión de Entrenamiento", price: "$5.000", originalPrice: "$10.000", isPopular: false, discount: "-50% OFF", features: ["Pase por 1 día", "Acceso a máquinas", "Ideal para probar"] },
  { id: "valoracion", name: "Valoración Física", price: "$15.000", originalPrice: "$30.000", isPopular: false, discount: "-50% OFF", features: ["Análisis de composición corporal", "Medidas y peso", "Definición de objetivos"] },
];

const customPackages = [
  { id: "12-clases", name: "Paquete 12 Clases", price: "$150.000", originalPrice: "$240.000", isPopular: false, discount: "-38% OFF", features: ["12 sesiones personalizadas", "Rutina adaptada por IA", "Valoración incluida", "Soporte de entrenadores"] },
  { id: "15-clases", name: "Paquete 15 Clases", price: "$200.000", originalPrice: "$320.000", isPopular: true, discount: "-38% OFF", features: ["15 sesiones personalizadas", "Rutina premium adaptada", "Valoración física mensual", "Prioridad en reservas"] },
  { id: "20-clases", name: "Paquete 20 Clases", price: "$250.000", originalPrice: "$400.000", isPopular: false, discount: "-38% OFF", features: ["20 sesiones personalizadas", "Resultados acelerados", "Valoración física quincenal", "Acceso total a la app"] },
];

const allPlans = [...basicServices, ...customPackages];

const paymentMethods = [
  { id: "bancolombia", name: "Bancolombia", account: "Ahorros 123-456789-00" },
  { id: "nequi", name: "Nequi", account: "300 123 4567" },
  { id: "daviplata", name: "Daviplata", account: "300 123 4567" },
];

export default function PlanesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PlanesContent />
    </Suspense>
  );
}

function PlanesContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan');
    const stepParam = searchParams.get('step');
    if (planParam && stepParam) {
      setSelectedPlan(planParam);
      setStep(parseInt(stepParam));
    }
  }, [searchParams]);
  const [contactData, setContactData] = useState({ name: "", whatsapp: "", email: "" });
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMethod.account);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-24 relative overflow-hidden">
      {/* Background Holographic Glows */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
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
                  {basicServices.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => { setSelectedPlan(plan.id); setStep(2); }}
                      className="glass-panel cursor-pointer group relative p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
                    >
                      <h3 className="text-xl font-display font-bold mb-6">{plan.name}</h3>
                      <div className="flex flex-col items-start gap-1 mb-8">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground line-through text-sm font-medium">{plan.originalPrice}</span>
                          <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.discount}</span>
                        </div>
                        <span className="text-4xl font-bold font-mono text-primary tracking-tighter">{plan.price}</span>
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
                  ))}
                </div>
              </div>

              {/* SERVICIOS COMPLEMENTARIOS */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-primary mb-1">Servicios Complementarios</h2>
                  <p className="text-muted-foreground">Entrenamiento Personalizado</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customPackages.map((plan) => (
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
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground line-through text-sm font-medium">{plan.originalPrice}</span>
                          <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">{plan.discount}</span>
                        </div>
                        <span className="text-4xl font-bold font-mono text-primary tracking-tighter">{plan.price}</span>
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
                  ))}
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
                    
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      {paymentMethods.map(method => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedMethod.id === method.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                        >
                          {method.name}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-center mx-auto w-48 h-48 mb-6 relative">
                       {/* Holographic glow behind QR */}
                       <div className="absolute inset-0 bg-primary/20 blur-[20px] animate-pulse" />
                       <QRCodeSVG value={`transfer:${selectedMethod.account}`} size={160} level="H" includeMargin={false} />
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

                  {/* Right Side: Upload Proof */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center relative z-10">
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-1">Total a pagar:</h4>
                      <p className="text-4xl font-mono text-primary font-bold">{allPlans.find(p => p.id === selectedPlan)?.price}</p>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors bg-secondary/10 group">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <h5 className="font-bold mb-2">Sube tu comprobante</h5>
                      <p className="text-sm text-muted-foreground mb-6">Arrastra la imagen o haz clic para buscar</p>
                      <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-6 py-2 bg-secondary text-foreground rounded-lg text-sm font-bold hover:bg-secondary/80 transition-all flex items-center gap-2"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simular Subida"}
                      </button>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Tu reserva expira en 15:00
                    </div>
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
                onClick={() => window.location.href = "/login"}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all"
              >
                Ir a Iniciar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
