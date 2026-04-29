-- Private bucket where users upload their payment receipts.
-- Path layout: payment-receipts/{user_id}/{filename}
-- Only the owner (auth.uid() = first folder) and admins can read.

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Owner can upload to own folder
CREATE POLICY "Users upload payment receipts to own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'payment-receipts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Owner can read own receipts
CREATE POLICY "Users read own payment receipts"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'payment-receipts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admins can read every receipt
CREATE POLICY "Admins read all payment receipts"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'payment-receipts'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

-- Owner can delete (in case they re-upload)
CREATE POLICY "Users delete own payment receipts"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payment-receipts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
