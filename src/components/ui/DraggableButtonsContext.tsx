"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ButtonCoords,
  UiButtonPositions,
} from "@/lib/cms";
import { saveButtonPosition } from "@/app/admin/contenido/actions";

export type DraggableButtonKey = keyof UiButtonPositions;

type Status = "idle" | "saving" | "saved" | "error";

type Ctx = {
  /** True if the current user can drag and edit positions. */
  isAdmin: boolean;
  /** True if drag mode is currently active. */
  editMode: boolean;
  toggleEditMode: () => void;
  /** Width-based device class used to pick which slot to read/write. */
  device: "desktop" | "mobile";
  /** Live (possibly unsaved) position for a given button. null = CSS default. */
  getPosition: (key: DraggableButtonKey) => ButtonCoords;
  /**
   * Update the in-memory position for a button. Used by drag handlers
   * during dragging. Pass `null` to revert to CSS default.
   */
  setPosition: (key: DraggableButtonKey, coords: ButtonCoords) => void;
  /**
   * Persist the current position to CMS for the active device class.
   * Called on drag end.
   */
  persistPosition: (key: DraggableButtonKey) => Promise<void>;
  status: Status;
};

const DraggableButtonsContext = createContext<Ctx | null>(null);

const MOBILE_MAX_WIDTH = 767;

export function DraggableButtonsProvider({
  isAdmin,
  initialPositions,
  children,
}: {
  isAdmin: boolean;
  initialPositions: UiButtonPositions;
  children: React.ReactNode;
}) {
  const [positions, setPositions] = useState<UiButtonPositions>(initialPositions);
  const [editMode, setEditMode] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [status, setStatus] = useState<Status>("idle");
  const statusTimer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const update = () => setDevice(mq.matches ? "mobile" : "desktop");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const getPosition = useCallback(
    (key: DraggableButtonKey): ButtonCoords => positions[key][device],
    [positions, device],
  );

  const setPosition = useCallback(
    (key: DraggableButtonKey, coords: ButtonCoords) => {
      setPositions((prev) => ({
        ...prev,
        [key]: { ...prev[key], [device]: coords },
      }));
    },
    [device],
  );

  const persistPosition = useCallback(
    async (key: DraggableButtonKey) => {
      const coords = positions[key][device];
      setStatus("saving");
      const res = await saveButtonPosition({ key, device, coords });
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
      if (res.ok) {
        setStatus("saved");
        statusTimer.current = window.setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        statusTimer.current = window.setTimeout(() => setStatus("idle"), 2500);
      }
    },
    [positions, device],
  );

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    setEditMode((v) => !v);
  }, [isAdmin]);

  const value = useMemo<Ctx>(
    () => ({
      isAdmin,
      editMode,
      toggleEditMode,
      device,
      getPosition,
      setPosition,
      persistPosition,
      status,
    }),
    [
      isAdmin,
      editMode,
      toggleEditMode,
      device,
      getPosition,
      setPosition,
      persistPosition,
      status,
    ],
  );

  return (
    <DraggableButtonsContext.Provider value={value}>
      {children}
    </DraggableButtonsContext.Provider>
  );
}

export function useDraggableButtons(): Ctx {
  const ctx = useContext(DraggableButtonsContext);
  if (!ctx) {
    throw new Error(
      "useDraggableButtons must be used inside <DraggableButtonsProvider>",
    );
  }
  return ctx;
}

/**
 * Pointer event handlers wired up to the drag flow. Typed narrowly (not
 * via HTMLAttributes) so it can be spread onto framer-motion components
 * without clashing on prop names motion overrides (onAnimationStart,
 * onDrag, etc.).
 */
export type DragHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
};

export type DraggableProps = {
  /** Inline style with saved coords + visual cues during edit mode. */
  style: React.CSSProperties;
  /**
   * Pointer event handlers — null when not in edit mode. Spread onto the
   * element that should act as the drag handle (the whole button, or a
   * header inside a larger panel).
   */
  dragHandlers: DragHandlers | null;
};

/**
 * Attach drag handlers to a button so admins can reposition it in editMode.
 * The element MUST be `position: fixed`. When `coords` is null, no left/top
 * is injected so the element keeps its CSS-defined position.
 */
export function useDraggableButton(key: DraggableButtonKey): DraggableProps {
  const { isAdmin, editMode, getPosition, setPosition, persistPosition } =
    useDraggableButtons();
  const coords = getPosition(key);
  const elementRef = useRef<HTMLElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    width: number;
    height: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isAdmin || !editMode) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget;
      elementRef.current = el;
      const rect = el.getBoundingClientRect();
      dragState.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originLeft: rect.left,
        originTop: rect.top,
        width: rect.width,
        height: rect.height,
      };
      el.setPointerCapture(e.pointerId);
    },
    [isAdmin, editMode],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      // Clamp so the button always stays fully on screen.
      const left = Math.max(
        0,
        Math.min(window.innerWidth - drag.width, drag.originLeft + dx),
      );
      const top = Math.max(
        0,
        Math.min(window.innerHeight - drag.height, drag.originTop + dy),
      );
      setPosition(key, { left, top });
    },
    [key, setPosition],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      dragState.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      void persistPosition(key);
    },
    [key, persistPosition],
  );

  const baseStyle: React.CSSProperties = coords
    ? { left: coords.left, top: coords.top, right: "auto", bottom: "auto" }
    : {};

  if (!editMode) {
    return { style: baseStyle, dragHandlers: null };
  }

  return {
    style: {
      ...baseStyle,
      cursor: "grab",
      touchAction: "none",
      outline: "2px dashed rgba(212,175,55,0.85)",
      outlineOffset: 4,
    },
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
