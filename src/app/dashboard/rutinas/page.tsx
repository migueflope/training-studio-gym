"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Save, PlayCircle, Library } from "lucide-react";

// Fallback to simpler implementation if react-hello-dnd fails
const availableExercises = [
  { id: "ex-1", name: "Press de Banca", muscle: "Pecho", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80" },
  { id: "ex-2", name: "Sentadilla Libre", muscle: "Piernas", img: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&q=80" },
  { id: "ex-3", name: "Dominadas", muscle: "Espalda", img: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=200&q=80" },
  { id: "ex-4", name: "Curl de Bíceps", muscle: "Brazos", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&q=80" },
  { id: "ex-5", name: "Press Militar", muscle: "Hombros", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=80" },
];

export default function RutinasPage() {
  const [routineTitle, setRoutineTitle] = useState("Nueva Rutina de Hipertrofia");
  const [myRoutine, setMyRoutine] = useState<any[]>([]);

  const addExercise = (exercise: any) => {
    setMyRoutine([...myRoutine, { ...exercise, uniqueId: `item-${Date.now()}`, sets: 4, reps: 12, rest: 60 }]);
  };

  const removeExercise = (id: string) => {
    setMyRoutine(myRoutine.filter(ex => ex.uniqueId !== id));
  };

  const updateExercise = (id: string, field: string, value: number) => {
    setMyRoutine(myRoutine.map(ex => ex.uniqueId === id ? { ...ex, [field]: value } : ex));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Editor de Rutinas</h1>
          <p className="text-muted-foreground">Construye o modifica tu plan de entrenamiento.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            <Library className="w-4 h-4" /> Plantillas IA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all">
            <Save className="w-4 h-4" /> Guardar Rutina
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Available Exercises */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-border p-6 h-[80vh] flex flex-col">
          <h3 className="text-xl font-display font-bold mb-4">Ejercicios</h3>
          <input 
            type="text" 
            placeholder="Buscar por músculo o nombre..." 
            className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
            {availableExercises.map(ex => (
              <div key={ex.id} className="flex gap-3 p-3 bg-secondary/30 border border-border rounded-xl hover:border-primary/50 transition-colors group">
                <div className="w-16 h-16 rounded-lg bg-background overflow-hidden shrink-0">
                  <img src={ex.img} alt={ex.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-1">{ex.muscle}</p>
                  <h4 className="text-sm font-bold leading-tight">{ex.name}</h4>
                  <button 
                    onClick={() => addExercise(ex)}
                    className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
                  >
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Routine Builder */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-border p-6 h-[80vh] flex flex-col">
          <div className="mb-6">
            <input 
              type="text" 
              value={routineTitle}
              onChange={e => setRoutineTitle(e.target.value)}
              className="w-full bg-transparent border-b border-border text-2xl font-display font-bold focus:outline-none focus:border-primary pb-2 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {myRoutine.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <Library className="w-12 h-12 mb-4 opacity-20" />
                <p>Añade ejercicios desde el panel izquierdo</p>
                <p className="text-sm">o selecciona una plantilla generada por IA</p>
              </div>
            ) : (
              myRoutine.map((ex, index) => (
                <div key={ex.uniqueId} className="bg-secondary/50 border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0">
                      <img src={ex.img} alt={ex.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold">{ex.name}</h4>
                      <p className="text-xs text-muted-foreground">{ex.muscle}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-center">
                      <label className="text-[10px] text-muted-foreground block mb-1">SERIES</label>
                      <input 
                        type="number" value={ex.sets} min={1} max={10}
                        onChange={e => updateExercise(ex.uniqueId, 'sets', parseInt(e.target.value))}
                        className="w-12 bg-background border border-border rounded p-1 text-center font-mono text-sm focus:border-primary outline-none"
                      />
                    </div>
                    <div className="text-center">
                      <label className="text-[10px] text-muted-foreground block mb-1">REPS</label>
                      <input 
                        type="number" value={ex.reps} min={1} max={50}
                        onChange={e => updateExercise(ex.uniqueId, 'reps', parseInt(e.target.value))}
                        className="w-12 bg-background border border-border rounded p-1 text-center font-mono text-sm focus:border-primary outline-none"
                      />
                    </div>
                    <div className="text-center">
                      <label className="text-[10px] text-muted-foreground block mb-1">DESCANSO</label>
                      <div className="flex items-center">
                        <input 
                          type="number" value={ex.rest} step={15} min={0} max={300}
                          onChange={e => updateExercise(ex.uniqueId, 'rest', parseInt(e.target.value))}
                          className="w-16 bg-background border border-border rounded-l p-1 text-center font-mono text-sm focus:border-primary outline-none"
                        />
                        <span className="bg-secondary border border-l-0 border-border rounded-r p-1 text-[10px] text-muted-foreground">seg</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeExercise(ex.uniqueId)}
                    className="sm:ml-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {myRoutine.length > 0 && (
             <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
               <div className="text-sm text-muted-foreground">
                 <span className="font-bold text-foreground">{myRoutine.length}</span> ejercicios | 
                 Tiempo est.: <span className="font-bold text-foreground">~{myRoutine.reduce((acc, curr) => acc + ((curr.sets * curr.reps * 4) + (curr.sets * curr.rest)), 0) / 60 | 0} min</span>
               </div>
               <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 transition-all">
                 <PlayCircle className="w-5 h-5" /> Entrenar Ahora
               </button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
