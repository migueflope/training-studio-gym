-- Public storage bucket for user-uploaded avatars.
-- Each user owns the folder named after their auth uid: avatars/{user_id}/...
-- Reads are public (so the avatar URL works without signing).

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload to own avatar folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatars"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatars"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
