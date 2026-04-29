-- Sprint 4: Progreso y Metas
--
-- Five new tables that the user fills manually from /dashboard/progreso.
-- Idempotent: safe to re-run after a partial failure. Uses IF NOT EXISTS
-- on tables/indexes and DO-blocks for types/policies, since CREATE POLICY
-- and CREATE TYPE don't accept IF NOT EXISTS in PostgreSQL.

CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    measured_on DATE NOT NULL,
    weight_kg NUMERIC,
    body_fat_pct NUMERIC,
    waist_cm NUMERIC,
    chest_cm NUMERIC,
    hip_cm NUMERIC,
    arm_cm NUMERIC,
    thigh_cm NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS body_metrics_user_date ON public.body_metrics (user_id, measured_on DESC);
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    weight_kg NUMERIC NOT NULL,
    reps INTEGER NOT NULL DEFAULT 1,
    achieved_on DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS personal_records_user_date ON public.personal_records (user_id, achieved_on DESC);
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attended_on DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, attended_on)
);
CREATE INDEX IF NOT EXISTS attendances_user_date ON public.attendances (user_id, attended_on DESC);
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    taken_on DATE NOT NULL,
    photo_path TEXT NOT NULL,
    label TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS progress_photos_user_date ON public.progress_photos (user_id, taken_on DESC);
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'goal_status') THEN
        CREATE TYPE goal_status AS ENUM ('active', 'achieved', 'cancelled');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_value NUMERIC,
    start_value NUMERIC,
    current_value NUMERIC,
    unit TEXT,
    target_date DATE,
    status goal_status DEFAULT 'active'::goal_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS goals_user_status ON public.goals (user_id, status);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policies: drop-and-create so re-running is safe.
DROP POLICY IF EXISTS "Users manage own body_metrics." ON public.body_metrics;
CREATE POLICY "Users manage own body_metrics."
    ON public.body_metrics FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read body_metrics." ON public.body_metrics;
CREATE POLICY "Admins read body_metrics."
    ON public.body_metrics FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

DROP POLICY IF EXISTS "Users manage own personal_records." ON public.personal_records;
CREATE POLICY "Users manage own personal_records."
    ON public.personal_records FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own attendances." ON public.attendances;
CREATE POLICY "Users manage own attendances."
    ON public.attendances FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own progress_photos." ON public.progress_photos;
CREATE POLICY "Users manage own progress_photos."
    ON public.progress_photos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own goals." ON public.goals;
CREATE POLICY "Users manage own goals."
    ON public.goals FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
