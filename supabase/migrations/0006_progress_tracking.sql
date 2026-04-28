-- Sprint 4: Progreso y Metas
--
-- Five new tables that the user fills manually from /dashboard/progreso:
--   body_metrics      — weight + body measurements over time
--   personal_records  — best lift per exercise
--   attendances       — one row per gym visit (for streak tracking)
--   progress_photos   — photo gallery
--   goals             — user-defined objectives with target + progress

CREATE TABLE public.body_metrics (
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
CREATE INDEX body_metrics_user_date ON public.body_metrics (user_id, measured_on DESC);

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own body_metrics."
    ON public.body_metrics
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read body_metrics."
    ON public.body_metrics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'partner')
        )
    );

CREATE TABLE public.personal_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    weight_kg NUMERIC NOT NULL,
    reps INTEGER NOT NULL DEFAULT 1,
    achieved_on DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX personal_records_user_date ON public.personal_records (user_id, achieved_on DESC);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own personal_records."
    ON public.personal_records
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    attended_on DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, attended_on)
);
CREATE INDEX attendances_user_date ON public.attendances (user_id, attended_on DESC);

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attendances."
    ON public.attendances
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.progress_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    taken_on DATE NOT NULL,
    photo_path TEXT NOT NULL,
    label TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX progress_photos_user_date ON public.progress_photos (user_id, taken_on DESC);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress_photos."
    ON public.progress_photos
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TYPE goal_status AS ENUM ('active', 'achieved', 'cancelled');

CREATE TABLE public.goals (
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
CREATE INDEX goals_user_status ON public.goals (user_id, status);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals."
    ON public.goals
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
