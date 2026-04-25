import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-border">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-6">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground mb-12">Última actualización: Mayo 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al registrarse y utilizar los servicios de TRAINING STUDIO GYM, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Membresías y Pagos</h2>
            <p className="mb-2">
              El pago de la membresía o paquete de clases debe realizarse por anticipado mediante los canales autorizados.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Las membresías son personales e intransferibles.</li>
              <li>No se realizarán devoluciones o reembolsos por días no asistidos.</li>
              <li>La activación del plan está sujeta a la confirmación de la transferencia o pago en efectivo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Normas de Comportamiento</h2>
            <p className="mb-2">Para garantizar un ambiente seguro y respetuoso, todo miembro debe:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar ropa y calzado deportivo adecuado.</li>
              <li>Limpiar las máquinas y equipos después de usarlos.</li>
              <li>Tratar con respeto al personal y a otros miembros del estudio.</li>
              <li>Seguir las instrucciones de los entrenadores en todo momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Exoneración de Responsabilidad</h2>
            <p>
              El uso de las instalaciones se realiza bajo el propio riesgo del usuario. El Gimnasio no se hace responsable por lesiones que puedan ocurrir debido a negligencia del usuario, uso indebido de las máquinas o condiciones médicas preexistentes no reportadas. Se recomienda consultar a un médico antes de iniciar cualquier programa de ejercicios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. Modificaciones</h2>
            <p>
              El Gimnasio se reserva el derecho de modificar estos Términos y Condiciones, así como los precios de los servicios y horarios de atención, notificando a los usuarios con al menos 15 días de anticipación mediante los canales oficiales.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
