"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, Flame, Trophy, Play, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Alert if less than 7 days */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Tu membresía vence en 5 días</h4>
          <p className="text-xs opacity-90 mt-1">Renueva ahora para no perder tu racha ni el acceso a tus rutinas personalizadas.</p>
        </div>
        <button className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded hover:bg-destructive/90 transition-colors">
          Renovar
        </button>
      </motion.div>

      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Hola, Juan 👋</h1>
        <p className="text-muted-foreground">Aquí está el resumen de tu progreso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-success/20 text-success rounded-full">Activa</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Membresía</p>
          <h3 className="text-xl font-bold font-display mb-1">Paquete 15 Clases</h3>
          <p className="text-sm font-mono">Vence: 15 Mayo 2026</p>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-xs mb-1">
              <span>Clases Restantes</span>
              <span className="font-bold">6/15</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[40%]" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Flame className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Racha Actual</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold font-display text-foreground">4</h3>
            <span className="text-muted-foreground">días seguidos</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">¡Estás en fuego! Entrena mañana para mantener la racha.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Trophy className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Meta Principal</p>
          <h3 className="text-lg font-bold font-display mb-1">Bajar 5kg</h3>
          <p className="text-sm font-mono text-muted-foreground">Progreso: 2.5kg / 5kg</p>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success w-[50%]" />
            </div>
            <p className="text-xs text-right mt-1 text-muted-foreground">50% completado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-display font-bold">Rutina de Hoy</h3>
            <Link href="/dashboard/rutinas" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-border group cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-xl bg-secondary overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop" alt="Rutina" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">Día 3</p>
                <h4 className="text-lg font-bold mb-2">Tren Superior (Hipertrofia)</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">Pecho, espalda y brazos. 6 ejercicios, 45 mins estimados.</p>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-secondary text-foreground font-bold rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Empezar Entrenamiento
            </button>
          </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-display font-bold">Actividad Reciente</h3>
          </div>
          <div className="glass-panel rounded-2xl border border-border p-2">
            {[
              { title: "Entrenamiento completado", desc: "Día 2: Pierna", time: "Ayer" },
              { title: "Nuevo Récord", desc: "Sentadilla libre: 80kg", time: "Hace 2 días" },
              { title: "Registro de peso", desc: "78.5kg", time: "Hace 1 semana" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 hover:bg-secondary/30 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">{item.title}</h5>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
