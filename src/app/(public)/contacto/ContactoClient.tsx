"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Send,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { whatsappUrlFor } from "@/lib/whatsapp";
import { VideoModal } from "@/components/ui/VideoModal";

const goalOptions = [
  "Ganar masa muscular",
  "Perder peso",
  "Mejorar resistencia",
  "Mantenerme activo",
  "Solo quiero información",
];

const scheduleOptions = [
  "Mañana (5 a.m. – 11 a.m.)",
  "Tarde (2:30 p.m. – 6 p.m.)",
  "Noche (6 p.m. – 9 p.m.)",
  "Sábados",
  "Aún no estoy seguro",
];

export default function ContactoClient({
  whatsappNumber,
  whatsappDisplay,
  address,
  hoursWeekdays,
  hoursSaturday,
  hoursSunday,
  contactEmail,
}: {
  whatsappNumber: string;
  whatsappDisplay: string;
  address: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  contactEmail: string;
}) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState(goalOptions[0]);
  const [schedule, setSchedule] = useState(scheduleOptions[0]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const directMessage =
    "¡Hola! Quiero agendar mi valoración física en Training Studio Gym 💪";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `¡Hola Training Studio Gym! 💪

Mi nombre es ${name || "(sin nombre)"} y quiero agendar mi valoración física.

🎯 Objetivo: ${goal}
🕐 Horario preferido: ${schedule}

¡Quedo atento(a) a su respuesta!`;
    window.open(whatsappUrlFor(whatsappNumber, message), "_blank", "noopener,noreferrer");
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
        if (videoRef.current) videoRef.current.muted = true;
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left lg:col-span-5 flex flex-col"
            >
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <span className="text-primary font-medium text-sm">
                    Estamos para ayudarte
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight uppercase mb-6">
                  Hablemos, <span className="text-gradient-gold">mi llave</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg mb-8">
                  Agenda tu valoración física, resuelve dudas o cuéntanos tu meta.
                  Te respondemos por WhatsApp en minutos y te guiamos paso a paso.
                </p>
              </div>
              
              {/* WhatsApp Direct CTA - Moved here for mobile layout */}
              <a
                href={whatsappUrlFor(whatsappNumber, directMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between gap-4 p-4 md:p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-transparent border border-primary/40 hover:border-primary/60 transition-all hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.5)] max-w-sm mx-auto lg:mx-0 w-full"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Escríbenos directo</p>
                    <p className="text-lg md:text-xl font-display font-bold">{whatsappDisplay}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>

            {/* Dynamic Video Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative perspective-1000 w-full lg:col-span-7 flex justify-center lg:justify-start mt-8 lg:mt-0"
            >
              <motion.div 
                whileHover={{ 
                  scale: 1.02, 
                  rotateY: -3,
                  rotateX: 3,
                  boxShadow: "0 0 60px rgba(212,175,55,0.4)"
                }}
                onClick={() => setSelectedVideo("https://pub-1aa2a648b54b4be9a60b7b93f559af4e.r2.dev/agendar-valoracion.mp4")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative rounded-[2rem] overflow-hidden border border-primary/40 shadow-[0_0_30px_rgba(212,175,55,0.2)] aspect-[4/5] sm:aspect-video w-full max-w-3xl bg-secondary/20 cursor-pointer group"
              >
                {/* Tech Scanline Effect */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="w-full h-[1px] bg-primary/50 absolute top-0 animate-scanline shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                </div>
                
                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent mix-blend-overlay z-10 pointer-events-none" />
                
                <video
                  ref={videoRef}
                  src="https://pub-1aa2a648b54b4be9a60b7b93f559af4e.r2.dev/agendar-valoracion.mp4"
                  autoPlay
                  loop
                  muted={true}
                  playsInline
                  suppressHydrationWarning={true}
                  className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-500"
                />
                
                <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium border border-white/10 flex items-center gap-2">
                    Ver con sonido ↗
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-secondary/30 border border-border p-6 md:p-8"
            >
              <h2 className="text-2xl font-display font-bold mb-2">
                ¿Prefieres contarnos primero?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Llena estos datos y abrimos WhatsApp con tu mensaje listo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Tu nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej: María López"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal"
                    className="block text-sm font-medium mb-2"
                  >
                    ¿Cuál es tu objetivo?
                  </label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {goalOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="schedule"
                    className="block text-sm font-medium mb-2"
                  >
                    Horario preferido
                  </label>
                  <select
                    id="schedule"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {scheduleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_15px_rgba(212,175,55,0.35)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all"
                >
                  Enviar por WhatsApp <Send className="w-4 h-4" />
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Tus datos se envían directo al WhatsApp del gym, no se
                  almacenan en ningún servidor.
                </p>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-secondary/30 border border-border p-6 md:p-8">
                <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Encuéntranos
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground whitespace-pre-line">
                      {address}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a
                      href={whatsappUrlFor(whatsappNumber, directMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {whatsappDisplay}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-secondary/30 border border-border p-6 md:p-8">
                <h3 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Horarios
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between gap-4 pb-3 border-b border-border">
                    <span className="font-medium">Lunes a Viernes</span>
                    <span className="text-right text-muted-foreground">
                      {hoursWeekdays}
                    </span>
                  </li>
                  <li className="flex justify-between gap-4 pb-3 border-b border-border">
                    <span className="font-medium">Sábados</span>
                    <span className="text-right text-muted-foreground">
                      {hoursSaturday}
                    </span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span className="font-medium">Dom. y Festivos</span>
                    <span className="text-right text-muted-foreground">
                      {hoursSunday}
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl h-[420px] relative group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15694.757843818398!2d-75.5032!3d10.3662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef62f0015555555%3A0x0000000000000000!2sMamonal%2C%20Cartagena!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "grayscale(100%) invert(90%) hue-rotate(180deg)",
              }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 z-0 transition-all duration-500 group-hover:filter-none"
              title="Ubicación de Training Studio Gym"
            />
            <div className="absolute inset-0 bg-primary/10 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-0" />
          </div>
        </div>
      </section>

      <VideoModal 
        isOpen={!!selectedVideo} 
        videoUrl={selectedVideo || ""} 
        onClose={() => setSelectedVideo(null)} 
      />
    </>
  );
}
