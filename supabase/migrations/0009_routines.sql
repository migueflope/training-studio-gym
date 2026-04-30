-- Sprint 6: Rutinas
--
-- Builds on the existing public.exercises table (created in 0001).
-- Adds: routines, routine_days, routine_exercises, workout_sessions, workout_sets.
-- Idempotent — safe to re-run after a partial failure (matches 0006 conventions).

-- routine_source: where the routine came from. Drives the badge in /dashboard/rutinas.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'routine_source') THEN
        CREATE TYPE routine_source AS ENUM ('user', 'trainer', 'ai');
    END IF;
END $$;

-- ROUTINES
-- A routine belongs to one user (owner). Optionally assigned by an admin/trainer.
-- The owner can edit it regardless of who assigned it (per product decision in
-- project_pending_sprints_decisions: socio puede modificar la rutina del entrenador).
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    source routine_source DEFAULT 'user'::routine_source NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS routines_owner ON public.routines (owner_user_id, updated_at DESC);
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- ROUTINE_DAYS
-- A routine has 1..N days (Día 1, Día 2, ...). day_number controls tab order.
CREATE TABLE IF NOT EXISTS public.routine_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (routine_id, day_number)
);
CREATE INDEX IF NOT EXISTS routine_days_routine ON public.routine_days (routine_id, day_number);
ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;

-- ROUTINE_EXERCISES
-- Exercises inside a day, ordered by `position`. Drag-drop in the UI updates position.
-- ON DELETE RESTRICT on exercise_id: an exercise in active use cannot be deleted from
-- the global library — admin must remove it from all routines first.
CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_day_id UUID REFERENCES public.routine_days(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE RESTRICT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER,
    rest_seconds INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS routine_exercises_day ON public.routine_exercises (routine_day_id, position);
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

-- WORKOUT_SESSIONS
-- Created when the user starts "Entrenar Ahora". finished_at NULL = in-progress.
-- routine_id / routine_day_id are SET NULL on delete so historical sessions survive
-- if the user later deletes the routine.
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
    routine_day_id UUID REFERENCES public.routine_days(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS workout_sessions_user ON public.workout_sessions (user_id, started_at DESC);
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- WORKOUT_SETS
-- One row per set logged during a session. Used for progress charts and PR detection.
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE RESTRICT NOT NULL,
    set_number INTEGER NOT NULL,
    weight_kg NUMERIC,
    reps INTEGER,
    rpe NUMERIC,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS workout_sets_session ON public.workout_sets (session_id, set_number);
CREATE INDEX IF NOT EXISTS workout_sets_exercise ON public.workout_sets (exercise_id, completed_at DESC);
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- Admin-write policy on exercises (read was already public from 0001).
-- Needed so admin/trainer can maintain the library from /admin/rutinas.
DROP POLICY IF EXISTS "Admins manage exercises." ON public.exercises;
CREATE POLICY "Admins manage exercises."
    ON public.exercises FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

-- ROUTINES policies
DROP POLICY IF EXISTS "Users manage own routines." ON public.routines;
CREATE POLICY "Users manage own routines."
    ON public.routines FOR ALL
    USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Admins manage all routines." ON public.routines;
CREATE POLICY "Admins manage all routines."
    ON public.routines FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

-- ROUTINE_DAYS policies (derived from parent routine)
DROP POLICY IF EXISTS "Users manage own routine_days." ON public.routine_days;
CREATE POLICY "Users manage own routine_days."
    ON public.routine_days FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.owner_user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.owner_user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins manage all routine_days." ON public.routine_days;
CREATE POLICY "Admins manage all routine_days."
    ON public.routine_days FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

-- ROUTINE_EXERCISES policies (derived through routine_days -> routines)
DROP POLICY IF EXISTS "Users manage own routine_exercises." ON public.routine_exercises;
CREATE POLICY "Users manage own routine_exercises."
    ON public.routine_exercises FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.routine_days d
            JOIN public.routines r ON r.id = d.routine_id
            WHERE d.id = routine_day_id AND r.owner_user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.routine_days d
            JOIN public.routines r ON r.id = d.routine_id
            WHERE d.id = routine_day_id AND r.owner_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins manage all routine_exercises." ON public.routine_exercises;
CREATE POLICY "Admins manage all routine_exercises."
    ON public.routine_exercises FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

-- WORKOUT_SESSIONS policies
DROP POLICY IF EXISTS "Users manage own workout_sessions." ON public.workout_sessions;
CREATE POLICY "Users manage own workout_sessions."
    ON public.workout_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read workout_sessions." ON public.workout_sessions;
CREATE POLICY "Admins read workout_sessions."
    ON public.workout_sessions FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );

-- WORKOUT_SETS policies (derived from session)
DROP POLICY IF EXISTS "Users manage own workout_sets." ON public.workout_sets;
CREATE POLICY "Users manage own workout_sets."
    ON public.workout_sets FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins read workout_sets." ON public.workout_sets;
CREATE POLICY "Admins read workout_sets."
    ON public.workout_sets FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
    );
