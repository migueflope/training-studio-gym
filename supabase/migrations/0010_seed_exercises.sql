-- Sprint 6: Seed de la biblioteca de ejercicios
--
-- Inserta ~40 ejercicios cubriendo todos los grupos musculares principales.
-- Idempotente: re-ejecutar no duplica filas (ON CONFLICT name DO NOTHING).
--
-- Pre-requisito: nombre único. Usamos un constraint condicional para que la
-- migración sea segura aunque ya se haya corrido el seed legacy en seed.sql
-- (que insertaba 8 ejercicios sin restricción).

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exercises_name_unique') THEN
        ALTER TABLE public.exercises ADD CONSTRAINT exercises_name_unique UNIQUE (name);
    END IF;
END $$;

INSERT INTO public.exercises (name, muscle_group, equipment, difficulty, description)
VALUES
    -- Pecho (6)
    ('Press de Banca', 'Pecho', 'Barra', 'Intermedio', 'Ejercicio compuesto para desarrollo pectoral.'),
    ('Press Inclinado con Mancuernas', 'Pecho', 'Mancuernas', 'Intermedio', 'Énfasis en la porción superior del pectoral.'),
    ('Press Declinado con Mancuernas', 'Pecho', 'Mancuernas', 'Intermedio', 'Énfasis en la porción inferior del pectoral.'),
    ('Aperturas con Mancuernas', 'Pecho', 'Mancuernas', 'Principiante', 'Aislamiento del pectoral con estiramiento profundo.'),
    ('Fondos en Paralelas', 'Pecho', 'Peso Corporal', 'Avanzado', 'Pecho y tríceps según inclinación del torso.'),
    ('Flexiones de Pecho', 'Pecho', 'Peso Corporal', 'Principiante', 'Movimiento básico para todo el tren superior.'),

    -- Espalda (6)
    ('Peso Muerto', 'Espalda', 'Barra', 'Avanzado', 'Ejercicio de fuerza global, eje cadera.'),
    ('Dominadas', 'Espalda', 'Peso Corporal', 'Intermedio', 'Desarrollo de amplitud de espalda.'),
    ('Remo con Barra', 'Espalda', 'Barra', 'Intermedio', 'Densidad y grosor del dorsal.'),
    ('Remo con Mancuerna a una Mano', 'Espalda', 'Mancuernas', 'Principiante', 'Aislamiento unilateral del dorsal.'),
    ('Jalón al Pecho', 'Espalda', 'Polea', 'Principiante', 'Alternativa accesible a las dominadas.'),
    ('Remo en Polea Baja', 'Espalda', 'Polea', 'Principiante', 'Trabajo del dorsal con tensión constante.'),

    -- Piernas (8)
    ('Sentadilla Libre', 'Piernas', 'Barra', 'Avanzado', 'El rey de los ejercicios de tren inferior.'),
    ('Sentadilla Frontal', 'Piernas', 'Barra', 'Avanzado', 'Mayor énfasis en cuádriceps y core.'),
    ('Prensa de Piernas', 'Piernas', 'Máquina', 'Principiante', 'Desarrollo seguro de cuádriceps y glúteos.'),
    ('Peso Muerto Rumano', 'Piernas', 'Barra', 'Intermedio', 'Aislamiento de isquiotibiales y glúteos.'),
    ('Zancadas con Mancuernas', 'Piernas', 'Mancuernas', 'Intermedio', 'Trabajo unilateral del tren inferior.'),
    ('Hip Thrust', 'Piernas', 'Barra', 'Intermedio', 'El mejor movimiento para activar glúteos.'),
    ('Sentadilla Búlgara', 'Piernas', 'Mancuernas', 'Avanzado', 'Trabajo unilateral con énfasis en glúteo.'),
    ('Elevación de Pantorrillas', 'Piernas', 'Máquina', 'Principiante', 'Aislamiento del gemelo y sóleo.'),

    -- Hombros (5)
    ('Press Militar', 'Hombros', 'Barra', 'Intermedio', 'Fuerza en tren superior.'),
    ('Press Arnold', 'Hombros', 'Mancuernas', 'Intermedio', 'Recorrido completo del deltoides.'),
    ('Elevaciones Laterales', 'Hombros', 'Mancuernas', 'Principiante', 'Aislamiento del deltoides medio.'),
    ('Pájaros', 'Hombros', 'Mancuernas', 'Principiante', 'Aislamiento del deltoides posterior.'),
    ('Encogimientos de Hombros', 'Hombros', 'Mancuernas', 'Principiante', 'Desarrollo del trapecio superior.'),

    -- Brazos (6)
    ('Curl de Bíceps', 'Brazos', 'Mancuernas', 'Principiante', 'Aislamiento clásico del bíceps.'),
    ('Curl Martillo', 'Brazos', 'Mancuernas', 'Principiante', 'Énfasis en braquial y antebrazo.'),
    ('Curl en Banco Predicador', 'Brazos', 'Barra', 'Intermedio', 'Aislamiento estricto del bíceps.'),
    ('Press Francés', 'Brazos', 'Barra', 'Intermedio', 'Aislamiento del tríceps en estiramiento.'),
    ('Extensiones de Tríceps en Polea', 'Brazos', 'Polea', 'Principiante', 'Tríceps con tensión constante.'),
    ('Fondos para Tríceps en Banco', 'Brazos', 'Peso Corporal', 'Principiante', 'Tríceps usando solo peso corporal.'),

    -- Core (5)
    ('Plancha Abdominal', 'Core', 'Peso Corporal', 'Principiante', 'Estabilidad del core.'),
    ('Crunch Abdominal', 'Core', 'Peso Corporal', 'Principiante', 'Aislamiento del recto del abdomen.'),
    ('Russian Twist', 'Core', 'Peso Corporal', 'Principiante', 'Trabajo de oblicuos con rotación.'),
    ('Elevación de Piernas Colgado', 'Core', 'Peso Corporal', 'Avanzado', 'Abdomen inferior en barra.'),
    ('Hiperextensiones Lumbares', 'Core', 'Peso Corporal', 'Principiante', 'Fortalecimiento de la zona lumbar.'),

    -- Cardio / Funcional (4)
    ('Burpees', 'Cardio', 'Peso Corporal', 'Intermedio', 'Cuerpo completo, alta intensidad.'),
    ('Mountain Climbers', 'Cardio', 'Peso Corporal', 'Principiante', 'Cardio y core en plancha.'),
    ('Saltos al Cajón', 'Cardio', 'Peso Corporal', 'Intermedio', 'Potencia explosiva del tren inferior.'),
    ('Sentadilla con Salto', 'Cardio', 'Peso Corporal', 'Intermedio', 'Pliométrico para cuádriceps y glúteo.')
ON CONFLICT (name) DO NOTHING;
