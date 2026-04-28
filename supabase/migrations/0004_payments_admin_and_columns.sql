-- Sprint 3b: self-service payment uploads
--
-- Adds the columns and policies needed for users to upload a receipt that
-- admins then approve or reject. The initial schema only declared SELECT
-- policies on payments and didn't have transaction_ref or rejection_reason.

-- 1) Extra columns on payments
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS transaction_ref TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2) Users can insert their own pending payments
CREATE POLICY "Users can create own payments."
    ON public.payments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3) Admins can update payments (confirm / reject)
CREATE POLICY "Admins can update payments."
    ON public.payments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

-- 4) Tighten the existing read policy so users see only their own payments
--    (the initial schema already has "Users can view own"). Add admin-can-read
--    if it's missing.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'payments'
          AND policyname = 'Admins can view all payments.'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY "Admins can view all payments."
                ON public.payments
                FOR SELECT
                USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE id = auth.uid() AND role IN ('owner', 'partner')
                    )
                );
        $policy$;
    END IF;
END $$;
