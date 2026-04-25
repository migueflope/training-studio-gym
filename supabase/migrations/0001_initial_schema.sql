-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE (Extends auth.users)
CREATE TYPE user_role AS ENUM ('owner', 'partner', 'member');

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'member'::user_role NOT NULL,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- PLANS TABLE
CREATE TABLE public.plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_cop NUMERIC NOT NULL,
    original_price_cop NUMERIC,
    duration_days INTEGER NOT NULL,
    classes_per_month INTEGER,
    days_per_week INTEGER,
    is_popular BOOLEAN DEFAULT false,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone." ON public.plans FOR SELECT USING (true);
CREATE POLICY "Only admins can modify plans." ON public.plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
);

-- MEMBERSHIPS TABLE
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'pending');

CREATE TABLE public.memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status membership_status DEFAULT 'pending'::membership_status NOT NULL,
    payment_id UUID, -- Reference added later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memberships." ON public.memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all memberships." ON public.memberships FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
);

-- PAYMENTS TABLE
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    amount_cop NUMERIC NOT NULL,
    method TEXT NOT NULL,
    proof_url TEXT,
    status payment_status DEFAULT 'pending'::payment_status NOT NULL,
    confirmed_by UUID REFERENCES public.profiles(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments." ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments." ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view and update all payments." ON public.payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
);

-- EXERCISES TABLE
CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    difficulty TEXT,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises viewable by everyone." ON public.exercises FOR SELECT USING (true);

-- PROGRESS LOGS
CREATE TABLE public.progress_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    weight_kg NUMERIC,
    body_fat_percent NUMERIC,
    measurements JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress." ON public.progress_logs FOR ALL USING (auth.uid() = user_id);

-- GOALS
CREATE TABLE public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    deadline DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals." ON public.goals FOR ALL USING (auth.uid() = user_id);

-- CONTENT (Key-Value for editable site text)
CREATE TABLE public.content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content viewable by everyone." ON public.content FOR SELECT USING (true);
CREATE POLICY "Only admins can modify content." ON public.content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'partner'))
);
