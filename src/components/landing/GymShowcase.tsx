"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { VideoModal } from "@/components/ui/VideoModal";

const SHOWCASE_VIDEOS = [
  {
    id: 1,
    url: "https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/showcase/1.mp4",
    title: "Tecnología de Punta",
    colSpan: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    url: "https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/showcase/2.mp4",
    title: "Ambiente Premium",
    colSpan: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    url: "https://jigwpntqxywjwruftwix.supabase.co/storage/v1/object/public/gym-media/showcase/4.mp4",
    title: "Resultados Reales",
    colSpan: "md:col-span-1 md:row-span-1",
  },
];

export function GymShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // To handle hover sound
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const handleMouseEnter = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      video.muted = false;
      // En caso de que el navegador bloquee el unmute sin interacción previa, lo atrapamos
      video.play().catch(() => {
        video.muted = true;
      });
    }
  };

  const handleMouseLeave = (id: number) => {
    const video = videoRefs.current[id];
    if (video) {
      video.muted = true;
    }
  };

  return (
    <>
      <section className="relative py-24 overflow-hidden bg-black/50">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight uppercase mb-4">
              Conoce tu <span className="text-gradient-gold">Estudio</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Instalaciones de primer nivel diseñadas para potenciar tu entrenamiento. 
              Descubre el lugar donde sucederá tu transformación.
            </p>
          </motion.div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {SHOWCASE_VIDEOS.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ 
                  scale: 1.02, 
                  transition: { type: "spring", stiffness: 400, damping: 25 } 
                }}
                onMouseEnter={() => handleMouseEnter(video.id)}
                onMouseLeave={() => handleMouseLeave(video.id)}
                onClick={() => setSelectedVideo(video.url)}
                className={`relative rounded-3xl overflow-hidden group border border-primary/20 hover:border-primary/50 bg-secondary/20 backdrop-blur-sm min-h-[300px] md:min-h-[250px] shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] cursor-pointer ${video.colSpan}`}
              >
                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Technological Scanning Effect Line */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl">
                  <div className="w-full h-[2px] bg-primary/40 blur-[1px] absolute top-[-10%] group-hover:top-[110%] transition-all duration-[2s] ease-in-out" />
                </div>

                <video
                  ref={(el) => { videoRefs.current[video.id] = el; }}
                  src={video.url}
                  autoPlay
                  loop
                  muted={true}
                  playsInline
                  suppressHydrationWarning={true}
                  className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700"
                />

                <div className="absolute bottom-0 left-0 p-6 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white drop-shadow-md">
                    {video.title}
                  </h3>
                  <p className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-1">
                    Ver video completo ↗
                  </p>
                </div>
              </motion.div>
            ))}
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
