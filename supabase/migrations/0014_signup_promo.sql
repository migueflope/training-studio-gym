-- Welcome signup promo: 10% extra discount on first "mensualidad" for users
-- who registered via the welcome modal on the public site.
--
-- profiles.signup_promo_pct:
--   NULL  = no promo
--   10    = 10% extra off available on first mensualidad
--
-- profiles.signup_promo_used_at:
--   NULL  = promo is still claimable
--   <ts>  = a payment was created using the promo
--
-- payments.signup_promo_applied marks which payment consumed the promo, so we
-- can reactivate it if admin rejects that payment later.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_promo_pct INT,
  ADD COLUMN IF NOT EXISTS signup_promo_used_at TIMESTAMPTZ;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS signup_promo_applied BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark the promo as used as soon as a payment is created with it.
CREATE OR REPLACE FUNCTION public.on_payment_inserted_consume_signup_promo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signup_promo_applied THEN
    UPDATE public.profiles
       SET signup_promo_used_at = COALESCE(signup_promo_used_at, NEW.created_at)
     WHERE id = NEW.user_id
       AND signup_promo_pct IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_payments_consume_signup_promo ON public.payments;
CREATE TRIGGER trg_payments_consume_signup_promo
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_payment_inserted_consume_signup_promo();

-- If admin rejects a payment that consumed the promo, reactivate the promo.
-- Confirmed payments keep the promo used (one-shot).
CREATE OR REPLACE FUNCTION public.on_payment_status_change_signup_promo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.signup_promo_applied
     AND OLD.status = 'pending'
     AND NEW.status = 'rejected' THEN
    UPDATE public.profiles
       SET signup_promo_used_at = NULL
     WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_payments_status_signup_promo ON public.payments;
CREATE TRIGGER trg_payments_status_signup_promo
  AFTER UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.on_payment_status_change_signup_promo();
