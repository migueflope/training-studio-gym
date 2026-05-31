"use client";

import { AuthWall } from "./AuthWall";
import { useHasSavedProfiles } from "@/lib/auth/useHasSavedProfiles";

interface GuestGateProps {
  mensualidad: {
    price: number;
    discount_percentage: number;
  };
}

/**
 * Shown to logged-out visitors on the landing route. The AuthWall now appears
 * ONLY for returning users — those with a saved account on this device — so
 * they can quick-login or add another account. Brand-new visitors see the
 * landing instead and register later at the checkout's "Datos" step.
 */
export function GuestGate({ mensualidad }: GuestGateProps) {
  const hasSaved = useHasSavedProfiles();

  // null (still loading) or false (new visitor) → no wall, show the landing.
  if (!hasSaved) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-black">
      <AuthWall mensualidad={mensualidad} />
    </div>
  );
}
