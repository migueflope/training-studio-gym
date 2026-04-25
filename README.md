# Training Studio Gym - Plataforma Web

¡Bienvenido al código fuente de tu nueva plataforma! Este documento es una guía paso a paso, escrita **desde cero**, para que puedas lanzar la página sin necesidad de ser un programador experto.

---

## 1. Crear las cuentas necesarias (Todo Gratis)
Antes de tocar el código, necesitas crear estas 4 cuentas gratuitas:
1. **GitHub**: [github.com](https://github.com) (Para guardar el código).
2. **Supabase**: [supabase.com](https://supabase.com) (Para la base de datos y usuarios).
3. **Vercel**: [vercel.com](https://vercel.com) (Para alojar la página web).
4. **Resend**: [resend.com](https://resend.com) (Para enviar correos automáticos).
5. **Google AI Studio**: [aistudio.google.com](https://aistudio.google.com) (Para conseguir la llave del chatbot Gemini).

## 2. Configurar la Base de Datos (Supabase)
1. Entra a Supabase, haz clic en "New Project". 
2. Ponle nombre "training-studio-gym". Guarda MUY BIEN la contraseña de la base de datos que inventes.
3. Ve a la sección **Project Settings > API**. Ahí verás dos textos largos que necesitamos: el `Project URL` y la `anon public API key`.
4. Ve al menú lateral izquierdo, sección **SQL Editor**. 
5. Copia todo el texto del archivo que está en la carpeta de este código: `supabase/migrations/0001_initial_schema.sql`
6. Pégalo en el SQL Editor de Supabase y dale al botón "Run". ¡Listo! Ya tienes las tablas de la base de datos creadas.

## 3. Configurar tu proyecto local (Tu Computadora)
Abre la terminal (o línea de comandos) en la carpeta del proyecto y ejecuta:
```bash
npm install
```

Luego, crea un archivo llamado `.env.local` en la raíz del proyecto y pon lo siguiente (reemplazando con tus datos reales):
```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
RESEND_API_KEY=tu_api_key_de_resend
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Probar la página en tu computadora
En la misma terminal, ejecuta:
```bash
npm run dev
```
Abre tu navegador y entra a `http://localhost:3000`. ¡Deberías ver tu página funcionando!

## 5. Subir el código a GitHub
1. Ve a GitHub y crea un nuevo repositorio llamado "training-studio-gym" (déjalo público o privado, como prefieras).
2. En tu terminal (asegúrate de parar la ejecución con Ctrl+C), escribe:
```bash
git add .
git commit -m "Mi primer código"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/training-studio-gym.git
git push -u origin main
```

## 6. Desplegar en Vercel (Ponerla en Internet)
1. Entra a Vercel. Haz clic en "Add New..." -> "Project".
2. Conecta tu cuenta de GitHub y selecciona el repositorio "training-studio-gym".
3. **¡IMPORTANTE!** Antes de darle "Deploy", abre la sección "Environment Variables".
4. Copia las mismas variables que pusiste en `.env.local` (NEXT_PUBLIC_SUPABASE_URL, etc.) pero cambia `NEXT_PUBLIC_SITE_URL` por el link final de tu web.
5. Haz clic en "Deploy". Espera 2 minutos. ¡Tu página está en vivo!

## 7. Checklist: ¿Qué falta cambiar antes de lanzar oficialmente?
Busca en el código fuente (puedes usar el buscador de Visual Studio Code) estas palabras y cámbialas por tus datos reales:
- [ ] Tu NIT y razón social real en `/app/(public)/legal/privacidad/page.tsx`
- [ ] Tu número de WhatsApp real donde el cliente agendará (buscando "wa.me").
- [ ] Tus datos bancarios reales en la pantalla de pagos MVP (`/app/api/payment/route.ts` o en las variables de entorno).

---
¡Éxitos con tu nuevo sistema! Si tienes dudas, revisa la documentación de Vercel o Supabase.
