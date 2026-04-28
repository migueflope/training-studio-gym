-- Allow admins (owner / partner) to manage memberships from /admin/usuarios.
-- The initial schema only declared SELECT policies; this adds INSERT and UPDATE
-- restricted to admin roles, so members still cannot self-activate.

CREATE POLICY "Admins can insert memberships."
    ON public.memberships
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE POLICY "Admins can update memberships."
    ON public.memberships
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );
