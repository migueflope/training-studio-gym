-- Seed the biweekly ("Quincena del Gym") membership plan.
-- Same stable UUID as seed.sql so the wizard, /admin/usuarios and
-- /admin/pagos can rely on it. Idempotent via ON CONFLICT DO NOTHING.

INSERT INTO public.plans (id, name, description, price_cop, original_price_cop, duration_days, classes_per_month, days_per_week, is_popular, features)
VALUES
('e6f87c6e-f245-4cdb-8c7e-c6f87c6ef245', 'Quincena del Gym', 'Acceso al gimnasio pagando por quincenas', 30000, NULL, 15, NULL, NULL, false, jsonb_build_array('Acceso ilimitado por 15 días', 'Uso de todas las máquinas'))
ON CONFLICT (id) DO NOTHING;
