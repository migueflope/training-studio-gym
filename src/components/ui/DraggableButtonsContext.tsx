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
import { usePathname } from "next/navigation";
import type {
  ButtonAppearance,
  ButtonSection,
  UiButtonPositions,
} from "@/lib/cms";
import { saveButtonPosition } from "@/app/admin/contenido/actions";

export type DraggableButtonKey = keyof UiButtonPositions;

type Status = "idle" | "saving" | "saved" | "error";

const MOBILE_MAX_WIDTH = 767;
const SCALE_MIN = 0.6;
const SCALE_MAX = 1.6;

function pathnameToSection(pathname: string): ButtonSection {
  if (pathname === "/") return "landing";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/admin")) return "admin";
  return "public";
}

type Ctx = {
  isAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
  device: "desktop" | "mobile";
  section: ButtonSection;
  /** Live (possibly unsaved) appearance for a given button in the active section + device. */
  getAppearance: (key: DraggableButtonKey) => ButtonAppearance;
  /** Update in-memory appearance during a drag/pinch/slider interaction. */
  setAppearance: (key: DraggableButtonKey, appearance: ButtonAppearance) => void;
  /** Persist the active section/device slot for a button. Called on drag/pinch end or slider commit. */
  persistAppearance: (key: DraggableButtonKey) => Promise<void>;
  status: Status;
};

const DraggableButtonsContext = createContext<Ctx | null>(null);

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
  const pathname = usePathname();
  const section = pathnameToSection(pathname);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const update = () => setDevice(mq.matches ? "mobile" : "desktop");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const getAppearance = useCallback(
    (key: DraggableButtonKey): ButtonAppearance =>
      positions[key]?.[section]?.[device] ?? null,
    [positions, section, device],
  );

  const setAppearance = useCallback(
    (key: DraggableButtonKey, appearance: ButtonAppearance) => {
      setPositions((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [section]: {
            ...prev[key][section],
            [device]: appearance,
          },
        },
      }));
    },
    [section, device],
  );

  const persistAppearance = useCallback(
    async (key: DraggableButtonKey) => {
      const appearance = positions[key]?.[section]?.[device] ?? null;
      setStatus("saving");
      const res = await saveButtonPosition({
        key,
        section,
        device,
        appearance,
      });
      if (statusTimer.current) window.clearTimeout(statusTimer.current);
      if (res.ok) {
        setStatus("saved");
        statusTimer.current = window.setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("error");
        statusTimer.current = window.setTimeout(() => setStatus("idle"), 2500);
      }
    },
    [positions, section, device],
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
      section,
      getAppearance,
      setAppearance,
      persistAppearance,
      status,
    }),
    [
      isAdmin,
      editMode,
      toggleEditMode,
      device,
      section,
      getAppearance,
      setAppearance,
      persistAppearance,
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

export type DragHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
};

export type DraggableProps = {
  /** Inline style with saved coords + scale + visual cues during edit mode. */
  style: React.CSSProperties;
  /** Pointer event handlers — null when not in edit mode. */
  dragHandlers: DragHandlers | null;
  /**
   * Callback ref — pass to the button so the hook can read its on-screen
   * position when the slider is used before the admin has dragged.
   */
  ref: (el: HTMLElement | null) => void;
  /** Active appearance (live during interaction). null = button uses its CSS default. */
  appearance: ButtonAppearance;
  /** Set a new scale value programmatically (used by the desktop slider). */
  setScale: (next: number) => void;
  /** Called once the slider/pinch interaction ends to persist the latest scale. */
  commit: () => void;
  /** True only while admin is editing in this device class. */
  editing: boolean;
  /** Slider min/max so the slider UI can match clamp values. */
  scaleMin: number;
  scaleMax: number;
};

/**
 * Attach drag/pinch handlers to a fixed-positioned button so admins can
 * reposition + resize it. Position + scale are stored per (key, section,
 * device); changing route automatically swaps to that section's slot.
 */
export function useDraggableButton(key: DraggableButtonKey): DraggableProps {
  const {
    isAdmin,
    editMode,
    getAppearance,
    setAppearance,
    persistAppearance,
  } = useDraggableButtons();
  const appearance = getAppearance(key);
  const elementRef = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
  }, []);

  // Active pointers in this gesture, by pointerId.
  const pointers = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  // Snapshot taken at gesture start.
  const startState = useRef<{
    leftPct: number;
    topPct: number;
    scale: number;
    width: number;
    height: number;
    /** Center between two fingers when pinch began. */
    centerX: number;
    centerY: number;
    /** Distance between two fingers when pinch began. */
    pinchDist: number | null;
    /** "drag" if started with one finger, "pinch" if escalated to two. */
    mode: "drag" | "pinch";
  } | null>(null);

  const captureSnapshot = useCallback(
    (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      // Use getBoundingClientRect for live screen position, but compute
      // "natural" width/height by dividing out current scale so dragging
      // accounts for visual scale correctly.
      const currentScale = appearance?.scale ?? 1;
      const naturalW = rect.width / currentScale;
      const naturalH = rect.height / currentScale;
      const leftPctNow =
        appearance?.leftPct ?? (rect.left / window.innerWidth) * 100;
      const topPctNow =
        appearance?.topPct ?? (rect.top / window.innerHeight) * 100;
      return {
        leftPct: leftPctNow,
        topPct: topPctNow,
        scale: currentScale,
        width: naturalW,
        height: naturalH,
      };
    },
    [appearance],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!isAdmin || !editMode) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget;

      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}

      // First finger: begin a drag.
      if (pointers.current.size === 1) {
        const snap = captureSnapshot(el);
        startState.current = {
          ...snap,
          centerX: e.clientX,
          centerY: e.clientY,
          pinchDist: null,
          mode: "drag",
        };
        return;
      }

      // Second finger lands: escalate to pinch around the midpoint.
      if (pointers.current.size === 2) {
        const pts = Array.from(pointers.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.hypot(dx, dy);
        const snap = captureSnapshot(el);
        startState.current = {
          ...snap,
          centerX: (pts[0].x + pts[1].x) / 2,
          centerY: (pts[0].y + pts[1].y) / 2,
          pinchDist: dist,
          mode: "pinch",
        };
      }
    },
    [isAdmin, editMode, captureSnapshot],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!startState.current) return;
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const start = startState.current;

      if (start.mode === "pinch" && pointers.current.size >= 2) {
        const pts = Array.from(pointers.current.values()).slice(0, 2);
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.hypot(dx, dy);
        const startDist = start.pinchDist ?? dist;
        if (startDist <= 0) return;
        const ratio = dist / startDist;
        const nextScale = Math.max(
          SCALE_MIN,
          Math.min(SCALE_MAX, start.scale * ratio),
        );
        setAppearance(key, {
          leftPct: start.leftPct,
          topPct: start.topPct,
          scale: nextScale,
        });
        return;
      }

      // Drag mode: translate by delta of the active finger.
      const dx = e.clientX - start.centerX;
      const dy = e.clientY - start.centerY;
      const visualW = start.width * start.scale;
      const visualH = start.height * start.scale;
      const startLeftPx = (start.leftPct / 100) * window.innerWidth;
      const startTopPx = (start.topPct / 100) * window.innerHeight;
      const nextLeftPx = Math.max(
        0,
        Math.min(window.innerWidth - visualW, startLeftPx + dx),
      );
      const nextTopPx = Math.max(
        0,
        Math.min(window.innerHeight - visualH, startTopPx + dy),
      );
      setAppearance(key, {
        leftPct: (nextLeftPx / window.innerWidth) * 100,
        topPct: (nextTopPx / window.innerHeight) * 100,
        scale: start.scale,
      });
    },
    [key, setAppearance],
  );

  const endPointer = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.delete(e.pointerId);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      // Persist when the gesture fully ends (no pointers left).
      if (pointers.current.size === 0) {
        startState.current = null;
        void persistAppearance(key);
      }
    },
    [key, persistAppearance],
  );

  const setScale = useCallback(
    (nextScale: number) => {
      const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, nextScale));
      if (appearance) {
        setAppearance(key, { ...appearance, scale: clamped });
        return;
      }
      // No saved coords — read the button's current screen rect so the
      // first scale change anchors at where the button is RIGHT NOW
      // instead of jumping to (0, 0).
      const el = elementRef.current;
      if (!el) {
        setAppearance(key, { leftPct: 0, topPct: 0, scale: clamped });
        return;
      }
      const rect = el.getBoundingClientRect();
      const currentScale = 1; // appearance is null, so no transform applied yet
      const naturalW = rect.width / currentScale;
      const naturalH = rect.height / currentScale;
      // Clamp so the scaled-up button still fits.
      const newW = naturalW * clamped;
      const newH = naturalH * clamped;
      const leftPx = Math.max(0, Math.min(window.innerWidth - newW, rect.left));
      const topPx = Math.max(0, Math.min(window.innerHeight - newH, rect.top));
      setAppearance(key, {
        leftPct: (leftPx / window.innerWidth) * 100,
        topPct: (topPx / window.innerHeight) * 100,
        scale: clamped,
      });
    },
    [appearance, key, setAppearance],
  );

  const commit = useCallback(() => {
    void persistAppearance(key);
  }, [key, persistAppearance]);

  const baseStyle: React.CSSProperties = appearance
    ? {
        left: `${appearance.leftPct}%`,
        top: `${appearance.topPct}%`,
        right: "auto",
        bottom: "auto",
        transform: `scale(${appearance.scale})`,
        transformOrigin: "top left",
      }
    : {};

  if (!editMode) {
    return {
      style: baseStyle,
      dragHandlers: null,
      ref: setRef,
      appearance,
      setScale,
      commit,
      editing: false,
      scaleMin: SCALE_MIN,
      scaleMax: SCALE_MAX,
    };
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
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
    },
    ref: setRef,
    appearance,
    setScale,
    commit,
    editing: true,
    scaleMin: SCALE_MIN,
    scaleMax: SCALE_MAX,
  };
}
