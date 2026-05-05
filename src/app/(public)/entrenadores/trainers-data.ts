export type Trainer = {
  name: string;
  specialty: string;
  experience: string;
  image: string;
  intro: string;
  bio: string[];
  methods: string[];
  certifications: string[];
  enabled?: boolean;
};

export const FALLBACK_TRAINERS: Trainer[] = [
  {
    name: "Camilo Ortiz",
    specialty: "Hipertrofia y Fuerza",
    experience: "8 años de experiencia",
    image: "/images/camilo-ortiz.png",
    intro:
      "Especialista en biomecánica y desarrollo muscular. Si tu objetivo es ganar masa muscular de forma efectiva y segura, Camilo diseñará la estrategia perfecta para tu cuerpo.",
    bio: [
      "(PLACEHOLDER) Camilo lleva más de 8 años entrenando atletas de todos los niveles, desde principiantes que dan sus primeros pasos en el gym hasta competidores de fisicoculturismo.",
      "(PLACEHOLDER) Su filosofía: técnica primero, peso después. Cree en planes progresivos basados en evidencia que respetan la recuperación y evitan lesiones a largo plazo.",
    ],
    methods: [
      "Periodización lineal y ondulante",
      "Análisis de biomecánica y postura",
      "Planes nutricionales para volumen y definición",
      "Seguimiento semanal con métricas",
    ],
    certifications: [
      "(PLACEHOLDER) Lic. Cultura Física y Deporte",
      "(PLACEHOLDER) Cert. NSCA – CSCS",
      "(PLACEHOLDER) Especialización en Biomecánica Aplicada",
    ],
  },
  {
    name: "Juan Carlos Bork",
    specialty: "Funcional y Pérdida de Peso",
    experience: "10 años de experiencia",
    image: "/images/juan-carlos-bork.png",
    intro:
      "Experto en acondicionamiento físico integral. Transforma tu metabolismo con rutinas dinámicas que combinan fuerza y resistencia cardiovascular.",
    bio: [
      "(PLACEHOLDER) Juan Carlos ha guiado a más de 300 personas a transformar su composición corporal en los últimos 10 años, con un enfoque que combina entrenamiento funcional, HIIT y nutrición práctica.",
      "(PLACEHOLDER) Su sello: rutinas que se adaptan a la vida real, sin tortura. Cree que el mejor plan es el que puedes mantener seis meses, no el más intenso de la primera semana.",
    ],
    methods: [
      "Entrenamiento funcional con pesos libres y kettlebells",
      "HIIT y circuitos metabólicos",
      "Coaching de hábitos y nutrición sostenible",
      "Tests funcionales y reevaluación cada 4 semanas",
    ],
    certifications: [
      "(PLACEHOLDER) Lic. Educación Física",
      "(PLACEHOLDER) Cert. CrossFit Level 2 Trainer",
      "(PLACEHOLDER) Cert. Functional Movement Screen (FMS)",
    ],
  },
];
