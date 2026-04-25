import Link from "next/link";
import { Dumbbell, LayoutDashboard, Users, CreditCard, Dumbbell as DumbbellIcon, Key, Settings, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-border bg-primary/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight block">ADMIN</span>
              <span className="text-xs text-muted-foreground">Training Studio</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/10 transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Resumen
          </Link>
          <Link href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Users className="w-5 h-5" /> Usuarios
          </Link>
          <Link href="/admin/pagos" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" /> Pagos
            </div>
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </Link>
          <Link href="/admin/rutinas" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <DumbbellIcon className="w-5 h-5" /> Rutinas IA
          </Link>
          <Link href="/admin/bot-ia" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Key className="w-5 h-5" /> Configurar Bot
          </Link>
          <Link href="/admin/contenido" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" /> CMS Web
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
            <LogOut className="w-5 h-5" /> Salir del Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="font-display font-bold text-lg">Centro de Control</h2>
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="text-right">
              <p className="text-sm font-bold leading-none mb-1">Camilo Ortiz</p>
              <p className="text-xs text-muted-foreground leading-none">Propietario</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              CO
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
