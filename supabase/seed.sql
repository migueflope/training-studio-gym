-- SEED DATA PARA TRAINING STUDIO GYM

-- 1. Crear Planes (Plans)
INSERT INTO public.plans (id, name, description, price_cop, original_price_cop, duration_days, classes_per_month, days_per_week, is_popular, features)
VALUES 
('d5f76b5d-e134-4bc9-bb7d-b5f76b5de134', 'Mensualidad del Gym', 'Acceso básico al gimnasio', 60000, 90000, 30, NULL, NULL, false, '["Acceso a máquinas", "Uso de instalaciones"]'),
('c4e65a4c-d023-3ab8-aa6c-a4e65a4cd023', 'Paquete 12 Clases', 'Entrenamiento personalizado 3 días/semana', 150000, 240000, 30, 12, 3, false, '["12 sesiones", "Rutina IA", "Valoración"]'),
('b3d5493b-c912-29a7-995b-93d5493bc912', 'Paquete 15 Clases', 'Entrenamiento personalizado 4 días/semana', 200000, 320000, 30, 15, 4, true, '["15 sesiones", "Rutina Premium", "Valoración mensual"]'),
('a2c4382a-b801-1896-884a-82c4382ab801', 'Paquete 20 Clases', 'Entrenamiento personalizado 5 días/semana', 250000, 400000, 30, 20, 5, false, '["20 sesiones", "Resultados acelerados", "Valoración quincenal"]')
ON CONFLICT DO NOTHING;

-- 2. Crear Ejercicios (Exercises)
INSERT INTO public.exercises (id, name, muscle_group, equipment, difficulty, description)
VALUES
(uuid_generate_v4(), 'Press de Banca', 'Pecho', 'Barra', 'Intermedio', 'Ejercicio compuesto para desarrollo pectoral.'),
(uuid_generate_v4(), 'Sentadilla Libre', 'Piernas', 'Barra', 'Avanzado', 'El rey de los ejercicios de tren inferior.'),
(uuid_generate_v4(), 'Peso Muerto', 'Espalda', 'Barra', 'Avanzado', 'Ejercicio de fuerza global.'),
(uuid_generate_v4(), 'Dominadas', 'Espalda', 'Peso Corporal', 'Intermedio', 'Desarrollo de amplitud de espalda.'),
(uuid_generate_v4(), 'Curl de Bíceps', 'Brazos', 'Mancuernas', 'Principiante', 'Aislamiento para el bíceps.'),
(uuid_generate_v4(), 'Prensa de Piernas', 'Piernas', 'Máquina', 'Principiante', 'Desarrollo seguro de cuádriceps.'),
(uuid_generate_v4(), 'Press Militar', 'Hombros', 'Mancuernas', 'Intermedio', 'Fuerza en tren superior.'),
(uuid_generate_v4(), 'Plancha Abdominal', 'Core', 'Peso Corporal', 'Principiante', 'Estabilidad del core.')
ON CONFLICT DO NOTHING;

-- Nota: Los usuarios, membresías y progreso deben insertarse después de crear usuarios en auth.users,
-- por lo que en el entorno de desarrollo se generan dinámicamente vía la app, o se insertan usando scripts específicos.
