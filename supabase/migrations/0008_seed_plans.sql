-- Seed the 4 real membership plans into production.
-- These are the same UUIDs used by seed.sql so the rest of the codebase
-- (wizard, /admin/usuarios, /admin/pagos) can rely on them being stable.
-- Idempotent via ON CONFLICT DO NOTHING.

INSERT INTO public.plans (id, name, description, price_cop, original_price_cop, duration_days, classes_per_month, days_per_week, is_popular, features)
VALUES
('d5f76b5d-e134-4bc9-bb7d-b5f76b5de134', 'Mensualidad del Gym',  'Acceso básico al gimnasio',                       60000,  90000,  30, NULL, NULL, false, '["Acceso a máquinas", "Uso de instalaciones"]'),
('c4e65a4c-d023-3ab8-aa6c-a4e65a4cd023', 'Paquete 12 Clases',    'Entrenamiento personalizado 3 días/semana',       150000, 240000, 30, 12,   3,    false, '["12 sesiones", "Rutina IA", "Valoración"]'),
('b3d5493b-c912-29a7-995b-93d5493bc912', 'Paquete 15 Clases',    'Entrenamiento personalizado 4 días/semana',       200000, 320000, 30, 15,   4,    true,  '["15 sesiones", "Rutina Premium", "Valoración mensual"]'),
('a2c4382a-b801-1896-884a-82c4382ab801', 'Paquete 20 Clases',    'Entrenamiento personalizado 5 días/semana',       250000, 400000, 30, 20,   5,    false, '["20 sesiones", "Resultados acelerados", "Valoración quincenal"]')
ON CONFLICT (id) DO NOTHING;
