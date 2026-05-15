"use client";

import { useEffect, useState } from "react";
import {
  useDraggableButton,
  type DraggableButtonKey,
} from "./DraggableButtonsContext";

export function DraggableScaleSliderRow({
  buttonKey,
  label,
}: {
  buttonKey: DraggableButtonKey;
  label: string;
}) {
  const { editing, appearance, setScale, commit, scaleMin, scaleMax } =
    useDraggableButton(buttonKey);
  const [localScale, setLocalScale] = useState(appearance?.scale ?? 1);

  useEffect(() => {
    setLocalScale(appearance?.scale ?? 1);
  }, [appearance?.scale]);

  if (!editing) return null;

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="font-bold uppercase tracking-wider text-muted-foreground w-14 shrink-0">
        {label}
      </span>
      <input
        type="range"
        min={scaleMin}
        max={scaleMax}
        step={0.05}
        value={localScale}
        onChange={(e) => {
          const v = Number(e.target.value);
          setLocalScale(v);
          setScale(v);
        }}
        onPointerUp={commit}
        onKeyUp={commit}
        className="flex-1 h-1 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
      />
      <span className="font-mono text-primary font-bold w-10 text-right">
        {Math.round(localScale * 100)}%
      </span>
    </div>
  );
}
