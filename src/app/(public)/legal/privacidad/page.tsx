import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>
      
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-border">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-6">Política de Privacidad y Tratamiento de Datos</h1>
        <p className="text-sm text-muted-foreground mb-12">Última actualización: Mayo 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Identificación del Responsable</h2>
            <p>
              TRAINING STUDIO GYM (en adelante "El Gimnasio"), con domicilio en Urb. Villa Sol 2 Mz. E22 Variante Mamonal Calle Principal, Cartagena, Colombia, y correo electrónico info@trainingstudiogym.com, es el responsable del tratamiento de los datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Finalidades del Tratamiento</h2>
            <p className="mb-2">Sus datos personales serán utilizados para las siguientes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gestión de membresías, facturación y cobro.</li>
              <li>Envío de rutinas, planes de entrenamiento y seguimiento de progreso físico.</li>
              <li>Comunicación sobre cambios de horario, nuevas clases o promociones (marketing).</li>
              <li>Análisis estadístico interno para mejorar el servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Derechos del Titular (Ley 1581 de 2012)</h2>
            <p className="mb-2">Como titular de sus datos personales, usted tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato.</li>
              <li>Acceder en forma gratuita a sus datos personales.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Procedimiento para ejercer derechos</h2>
            <p>
              Para ejercer sus derechos, el titular debe enviar una solicitud al correo info@trainingstudiogym.com. El área encargada responderá a la solicitud en un término máximo de quince (15) días hábiles, conforme a la Ley Estatutaria 1581 de 2012.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. Transferencia a Terceros</h2>
            <p>
              El Gimnasio utiliza proveedores tecnológicos internacionales (como Supabase, Vercel, y Google LLC) para el alojamiento de datos y la funcionalidad de IA. Al aceptar esta política, usted autoriza la transmisión internacional de sus datos bajo estándares de seguridad informática aplicables.
            </p>
          </section>
        </div>

        {/* RNBD Warning TODO */}
        <div className="mt-12 p-6 bg-accent/10 border border-accent/20 rounded-xl">
          <h3 className="text-accent font-bold mb-2 flex items-center gap-2">
            Nota para la Administración (Registro RNBD)
          </h3>
          <p className="text-sm text-muted-foreground">
            TODO: Una vez el gimnasio alcance los activos requeridos o el volumen de datos estipulado por la SIC (Superintendencia de Industria y Comercio), se debe registrar esta base de datos en el RNBD y agregar el logo oficial aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
