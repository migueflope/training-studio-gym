-- CMS seed values and bucket for payment QR images.
-- The `content` table already exists (0001_initial_schema.sql) and is
-- read by the public site / chatbot through `lib/cms.ts`. Each value is
-- stored as JSONB so we can hold strings, numbers, and small objects
-- (e.g. bank cards) under the same column.

INSERT INTO public.content (key, value) VALUES
    ('hero_title',              to_jsonb('Tu mejor versión empieza acá'::text)),
    ('hero_subtitle',           to_jsonb('Entrenamos con propósito. Resultados reales en Cartagena.'::text)),
    ('about_text',              to_jsonb('Somos un gimnasio boutique en Cartagena enfocado en entrenamiento personalizado, hipertrofia, fuerza y funcional. Nuestro equipo te acompaña paso a paso para que llegues a tu meta sin frustrarte en el camino.'::text)),
    ('address',                 to_jsonb('Urb. Villa Sol 2 Mz. E22, Variante Mamonal Calle Principal, Cartagena'::text)),
    ('hours_weekdays',          to_jsonb('Lunes a Viernes 5:00am – 11:00am y 2:30pm – 9:00pm'::text)),
    ('hours_saturday',          to_jsonb('Sábados 6:30am – 11:00am y 2:30pm – 6:00pm'::text)),
    ('hours_sunday',            to_jsonb('Domingos y festivos 7:00am – 12:00pm'::text)),
    ('price_monthly',           to_jsonb(60000)),
    ('price_session',           to_jsonb(5000)),
    ('price_assessment',        to_jsonb(30000)),
    ('contact_email',           to_jsonb('hola@trainingstudio.com'::text)),
    ('whatsapp_number',         to_jsonb('573122765732'::text)),
    ('whatsapp_display',        to_jsonb('+57 312 276 5732'::text)),
    ('chatbot_system_prompt',   to_jsonb($prompt$Eres el asistente virtual oficial de Training Studio Gym, un gimnasio ubicado en Urb. Villa Sol 2 Mz. E22 Variante Mamonal Calle Principal, Cartagena, Colombia. Tu tono es motivador, cercano, profesional y usa expresiones costeñas suaves cuando aplique ("mi llave", "bacano").

INFORMACIÓN DEL GIMNASIO:
Horarios: L-V 5-11am y 2:30-9pm | Sáb 6:30-11am y 2:30-6pm | Dom/Festivos 7am-12pm
Servicios: Mensualidad $60.000, Sesión de entrenamiento $5.000, Valoración física $30.000
Paquetes personalizados: 20 clases $250.000 / 15 clases $200.000 / 12 clases $150.000
Entrenadores: Camilo Ortiz (especialidad: hipertrofia y fuerza) y Juan Carlos Bork (especialidad: funcional y pérdida de peso)
Métodos de pago: Bancolombia, Nequi, Daviplata, efectivo en sede

CAPACIDADES:
Responder dudas sobre el gym, horarios, precios, servicios
Recomendar el plan ideal según el objetivo del usuario
Sugerir rutinas de entrenamiento básicas
Dar consejos de nutrición generales (sin ser médico)
Ayudar a agendar la valoración física inicial (pedir datos y generar link a WhatsApp)
Motivar al usuario

REGLAS:
NUNCA des consejos médicos específicos. Deriva al entrenador o médico.
Si preguntan algo fuera del contexto del gym, redirige amablemente.
Respuestas cortas (máx 4 líneas) salvo que pidan explicación detallada.
Siempre termina con una pregunta abierta para seguir la conversación.$prompt$::text)),
    ('bank_bancolombia',        '{"name":"Bancolombia","holder":"Training Studio S.A.S.","account":"Ahorros 123-456789-00","qr_path":null,"enabled":true}'::jsonb),
    ('bank_nequi',              '{"name":"Nequi","holder":"Training Studio","account":"300 123 4567","qr_path":null,"enabled":true}'::jsonb),
    ('bank_daviplata',          '{"name":"Daviplata","holder":"Training Studio","account":"300 123 4567","qr_path":null,"enabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Public bucket for QR images uploaded by admins from /admin/contenido.
-- Path layout: payment-qrs/{bank_id}.{ext}
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qrs', 'payment-qrs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read payment qrs"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payment-qrs');

CREATE POLICY "Admins upload payment qrs"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'payment-qrs'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE POLICY "Admins update payment qrs"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'payment-qrs'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE POLICY "Admins delete payment qrs"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payment-qrs'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );
