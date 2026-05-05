import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { getCmsContent } from "@/lib/cms";

export async function Footer() {
  const cms = await getCmsContent();
  return (
    <footer className="bg-secondary/30 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <Image
                src="/assets/logo-transparent.png"
                alt="Training Studio Gym"
                width={928}
                height={1105}
                className="h-11 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105"
              />
              <span className="font-display font-bold text-lg tracking-tight">
                TRAINING STUDIO
                <span className="text-primary ml-1">GYM</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              No somos un gimnasio más, somos tu estudio de entrenamiento personalizado. Entrena la mente. Transforma el cuerpo.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/trainingstudiogym/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/share/1CTu4s3t3F/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Explorar</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/planes" className="hover:text-primary transition-colors">Planes y Precios</Link></li>
              <li><Link href="/entrenadores" className="hover:text-primary transition-colors">Nuestros Entrenadores</Link></li>
              <li><Link href="/rutinas" className="hover:text-primary transition-colors">Biblioteca de Rutinas</Link></li>
              <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Portal de Miembros</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Contacto</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{cms.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <WhatsAppIcon className="w-5 h-5 text-primary shrink-0" />
                <a href={`https://wa.me/${cms.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {cms.whatsapp_display}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>{cms.contact_email}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display font-bold text-lg mb-6">Horarios</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-primary" /> Lunes a Viernes
                </span>
                <span className="pl-6">{cms.hours_weekdays}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-primary" /> Sábado
                </span>
                <span className="pl-6">{cms.hours_saturday}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="w-4 h-4 text-primary" /> Dom. y Festivos
                </span>
                <span className="pl-6">{cms.hours_sunday}</span>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Training Studio Gym. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/legal/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="/legal/terminos" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="/legal/tratamiento-datos" className="hover:text-primary transition-colors">Tratamiento de Datos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
