"use client";

import Link from "next/link";

interface MonthlyPricing {
  price: number;
  discount_percentage: number;
}

interface VerPlanesCTAProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  isLoggedIn: boolean;
  mensualidad: MonthlyPricing;
}

export function VerPlanesCTA({
  href,
  className,
  children,
}: VerPlanesCTAProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
