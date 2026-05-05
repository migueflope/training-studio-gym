-- =============================================================
-- 0013 — Notifications system
-- =============================================================
-- In-app notifications for both members (membership activated, payment
-- confirmed/rejected, custom admin messages, expiring memberships) and
-- admins (new user, new payment, etc.). Realtime-enabled so the bell
-- updates without polling.
--
-- Most notifications are inserted automatically by triggers on the
-- relevant tables. Admins can also insert custom notifications via the
-- "Send message" UI in CMS Web.

-- 1) Type enum
CREATE TYPE notification_type AS ENUM (
  'membership_activated',
  'payment_confirmed',
  'payment_rejected',
  'membership_expiring',
  'admin_new_user',
  'admin_new_payment',
  'admin_message',
  'broadcast',
  'system'
);

-- 2) Table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3) Index for the bell query: unread first, recent first, scoped to user
CREATE INDEX idx_notifications_user_recent
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read)
  WHERE read = false;

-- 4) RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see and mark-as-read their own notifications.
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications (mark as read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins (owner/partner) can insert notifications for anyone (custom message,
-- broadcast). System triggers run as SECURITY DEFINER and bypass RLS, so they
-- don't need a separate policy.
CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'partner')
    )
  );

-- Admins can read all notifications (for an audit/history view in CMS).
CREATE POLICY "Admins see all notifications"
  ON public.notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'partner')
    )
  );

-- 5) Realtime publication — required so the client can subscribe via
--    supabase.channel() to inserts/updates on this table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =============================================================
-- TRIGGERS
-- =============================================================

-- Helper: insert one notification for every admin (owner/partner).
CREATE OR REPLACE FUNCTION public.notify_admins(
  p_type notification_type,
  p_title TEXT,
  p_body TEXT,
  p_link TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT id, p_type, p_title, p_body, p_link
  FROM public.profiles
  WHERE role IN ('owner', 'partner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- 1. New user signs up → notify admins
CREATE OR REPLACE FUNCTION public.on_profile_inserted_notify_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify when an admin profile is created (initial seed).
  IF NEW.role = 'member' THEN
    PERFORM public.notify_admins(
      'admin_new_user',
      'Nuevo usuario registrado',
      NEW.full_name || ' acaba de crear cuenta.',
      '/admin/usuarios'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_profiles_notify_admins
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_profile_inserted_notify_admins();

-- ---- 2. New payment uploaded → notify admins
CREATE OR REPLACE FUNCTION public.on_payment_inserted_notify_admins()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_plan_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT full_name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;
    SELECT name INTO v_plan_name FROM public.plans WHERE id = NEW.plan_id;

    PERFORM public.notify_admins(
      'admin_new_payment',
      'Nuevo pago a validar',
      COALESCE(v_user_name, 'Un usuario') || ' subió comprobante de ' || COALESCE(v_plan_name, 'un plan') || '.',
      '/admin/pagos'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_payments_notify_admins
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_payment_inserted_notify_admins();

-- ---- 3. Payment status changes → notify the user
CREATE OR REPLACE FUNCTION public.on_payment_status_change_notify_user()
RETURNS TRIGGER AS $$
DECLARE
  v_plan_name TEXT;
  v_end_date DATE;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'confirmed' THEN
    SELECT p.name, m.end_date INTO v_plan_name, v_end_date
    FROM public.plans p
    LEFT JOIN public.memberships m ON m.plan_id = p.id AND m.user_id = NEW.user_id AND m.status = 'active'
    WHERE p.id = NEW.plan_id
    ORDER BY m.created_at DESC NULLS LAST
    LIMIT 1;

    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'membership_activated',
      '¡Membresía activada!',
      'Tu plan "' || COALESCE(v_plan_name, 'membresía') || '" ya está activo' ||
      CASE WHEN v_end_date IS NOT NULL THEN ' hasta el ' || to_char(v_end_date, 'DD/MM/YYYY') || '.' ELSE '.' END,
      '/dashboard/membresia'
    );

  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (
      NEW.user_id,
      'payment_rejected',
      'Pago rechazado',
      COALESCE('Motivo: ' || NEW.rejection_reason, 'El equipo rechazó tu comprobante. Contactanos para más detalle.'),
      '/dashboard/membresia'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_payments_status_notify_user
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_payment_status_change_notify_user();
