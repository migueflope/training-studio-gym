-- Trainer config in the CMS: name + photo per trainer.
-- Two seeded entries map to the two trainers shipped with the landing.

INSERT INTO public.content (key, value) VALUES
    ('trainer_1', '{"name":"Camilo Ortiz","photo_path":null,"enabled":true}'::jsonb),
    ('trainer_2', '{"name":"Juan Carlos Bork","photo_path":null,"enabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Public bucket for trainer profile photos uploaded from /admin/contenido.
-- Path layout: trainer-photos/{trainer_id}.{ext}
INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-photos', 'trainer-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read trainer photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'trainer-photos');

CREATE POLICY "Admins upload trainer photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'trainer-photos'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE POLICY "Admins update trainer photos"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'trainer-photos'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE POLICY "Admins delete trainer photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'trainer-photos'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );
