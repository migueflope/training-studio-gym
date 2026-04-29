export type RoutineSource = "user" | "trainer" | "ai";

export type ExerciseLibItem = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  difficulty: string | null;
};

export type EditorExercise = {
  id: string;
  position: number;
  sets: number;
  reps: number | null;
  rest_seconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment: string | null;
    difficulty: string | null;
  };
};

export type EditorDay = {
  id: string;
  day_number: number;
  title: string | null;
  exercises: EditorExercise[];
};

export type EditorRoutine = {
  id: string;
  title: string;
  description: string | null;
  source: RoutineSource;
  days: EditorDay[];
};
