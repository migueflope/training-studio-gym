"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WelcomeOfferDialog } from "./WelcomeOfferDialog";

interface MonthlyPricing {
  price: number;
  discount_percentage: number;
}

interface VerPlanesCTAProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** True if a member/admin is already logged in — skip the gate entirely. */
  isLoggedIn: boolean;
  mensualidad: MonthlyPricing;
}

/**
 * Wraps a "Ver Planes" CTA. For logged-out visitors it intercepts the click
 * and shows the welcome offer modal instead of navigating. If the visitor
 * dismisses the modal we let them through to /planes anyway (it is a nudge,
 * not a wall).
 */
export function VerPlanesCTA({
  href,
  className,
  children,
  isLoggedIn,
  mensualidad,
}: VerPlanesCTAProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(
    (reason: "dismiss" | "action") => {
      setOpen(false);
      if (reason === "dismiss") router.push(href);
    },
    [router, href],
  );

  if (isLoggedIn) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <WelcomeOfferDialog
        mode="planes-gate"
        mensualidad={mensualidad}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}
