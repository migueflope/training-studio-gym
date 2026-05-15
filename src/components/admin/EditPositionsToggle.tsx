"use client";

import { useDraggableButtons } from "@/components/ui/DraggableButtonsContext";
import { Move, Check, AlertCircle, Loader2 } from "lucide-react";

/**
 * Floating admin-only toggle that enables drag mode on the chatbot, hero
 * audio and hero opacity buttons. Each drag is saved to the slot matching
 * the current device class (mobile <768px / desktop ≥768px).
 */
export function EditPositionsToggle() {
  const { isAdmin, editMode, toggleEditMode, device, status } =
    useDraggableButtons();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-20 left-3 z-[60] flex items-center gap-2 pointer-events-none">
      <button
        type="button"
        onClick={toggleEditMode}
        className={`pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full backdrop-blur-md text-xs font-bold transition-all ${
          editMode
            ? "bg-primary text-primary-foreground shadow-[0_0_25px_rgba(212,175,55,0.65)]"
            : "bg-black/80 text-primary border border-primary/40 shadow-[0_0_18px_rgba(212,175,55,0.3)] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)]"
        }`}
      >
        <Move className="w-4 h-4" />
        <span className="hidden md:inline">
          {editMode ? "Soltar para guardar" : "Mover botones"}
        </span>
      </button>
      {editMode && (
        <span className="pointer-events-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-border text-[11px] font-medium text-muted-foreground">
          {device === "mobile" ? "Editando móvil" : "Editando escritorio"}
        </span>
      )}
      {status === "saving" && (
        <span className="pointer-events-none inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-black/70 px-2 py-1 rounded-full backdrop-blur-md">
          <Loader2 className="w-3 h-3 animate-spin" />
          Guardando
        </span>
      )}
      {status === "saved" && (
        <span className="pointer-events-none inline-flex items-center gap-1 text-[11px] font-medium text-success bg-black/70 px-2 py-1 rounded-full backdrop-blur-md">
          <Check className="w-3 h-3" />
          Guardado
        </span>
      )}
      {status === "error" && (
        <span className="pointer-events-none inline-flex items-center gap-1 text-[11px] font-medium text-destructive bg-black/70 px-2 py-1 rounded-full backdrop-blur-md">
          <AlertCircle className="w-3 h-3" />
          Error
        </span>
      )}
    </div>
  );
}
