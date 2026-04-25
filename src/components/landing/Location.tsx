"use client";

import { MapPin, Clock } from "lucide-react";

export function Location() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Encuentra Tu <span className="text-primary">Estudio</span>
              </h2>
              <p className="text-muted-foreground text-lg flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                <span>Urb. Villa Sol 2 Mz. E22 Variante Mamonal<br />Calle Principal, Cartagena, Colombia</span>
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" /> Horarios de Atención
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <span className="font-medium text-foreground">Lunes a Viernes</span>
                  <div className="text-right text-muted-foreground text-sm">
                    <p>5:00 A.M. – 11:00 A.M.</p>
                    <p>2:30 P.M. – 9:00 P.M.</p>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <span className="font-medium text-foreground">Sábados</span>
                  <div className="text-right text-muted-foreground text-sm">
                    <p>6:30 A.M. – 11:00 A.M.</p>
                    <p>2:30 P.M. – 6:00 P.M.</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Dom. y Festivos</span>
                  <div className="text-right text-muted-foreground text-sm">
                    <p>7:00 A.M. – 12:00 P.M.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[500px] rounded-2xl overflow-hidden border border-border shadow-2xl relative group">
            {/* Embedded Google Maps iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15694.757843818398!2d-75.5032!3d10.3662!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef62f0015555555%3A0x0000000000000000!2sMamonal%2C%20Cartagena!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(100%) invert(90%) hue-rotate(180deg)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 z-0 transition-all duration-500 group-hover:filter-none"
            ></iframe>
            <div className="absolute inset-0 bg-primary/10 pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-0" />
          </div>

        </div>
      </div>
    </section>
  );
}
