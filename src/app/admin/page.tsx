"use client";

import { Users, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', usuarios: 40, ingresos: 2400000 },
  { name: 'Feb', usuarios: 55, ingresos: 3300000 },
  { name: 'Mar', usuarios: 85, ingresos: 5100000 },
  { name: 'Abr', usuarios: 120, ingresos: 7200000 },
  { name: 'May', usuarios: 165, ingresos: 9900000 },
  { name: 'Jun', usuarios: 210, ingresos: 12600000 },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Resumen Financiero</h1>
        <p className="text-muted-foreground">Métricas clave del rendimiento del gimnasio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-success/20 text-success rounded-full">+12% este mes</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Miembros Activos</p>
          <h3 className="text-3xl font-bold font-display">210</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-success/20 text-success rounded-full">+25% este mes</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Ingresos (Mensual)</p>
          <h3 className="text-3xl font-bold font-display">$12.6M</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-destructive/20 text-destructive rounded-full">3 Pendientes</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pagos por Validar</p>
          <h3 className="text-3xl font-bold font-display">3</h3>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Vencen en &lt; 7 días</p>
          <h3 className="text-3xl font-bold font-display text-destructive">15</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-display font-bold mb-6">Crecimiento de Usuarios</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis dataKey="name" stroke="#9A9A9A" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A9A9A" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Line type="monotone" dataKey="usuarios" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border flex flex-col">
          <h3 className="text-xl font-display font-bold mb-6">Acciones Rápidas</h3>
          <div className="space-y-4 flex-1">
            <button className="w-full p-4 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors border border-border flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-sm">Validar Transferencias</h4>
                <p className="text-xs text-muted-foreground">3 comprobantes nuevos</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </button>
            <button className="w-full p-4 bg-secondary rounded-xl text-left hover:bg-secondary/80 transition-colors border border-border flex items-center justify-between group">
              <div>
                <h4 className="font-bold text-sm">Enviar Recordatorios</h4>
                <p className="text-xs text-muted-foreground">15 usuarios por vencer</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
