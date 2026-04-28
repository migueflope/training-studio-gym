-- Private bucket for progress photos.
-- Path: progress-photos/{user_id}/{filename}

INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own progress photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'progress-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users read own progress photos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'progress-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users delete own progress photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'progress-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
