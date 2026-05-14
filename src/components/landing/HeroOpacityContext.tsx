"use client";

import { createContext, useContext, useState } from "react";

interface HeroOpacityValue {
  mobile: number;
  desktop: number;
  setMobile: (v: number) => void;
  setDesktop: (v: number) => void;
}

const HeroOpacityContext = createContext<HeroOpacityValue | null>(null);

export function HeroOpacityProvider({
  initialMobile,
  initialDesktop,
  children,
}: {
  initialMobile: number;
  initialDesktop: number;
  children: React.ReactNode;
}) {
  const [mobile, setMobile] = useState(initialMobile);
  const [desktop, setDesktop] = useState(initialDesktop);

  return (
    <HeroOpacityContext.Provider value={{ mobile, desktop, setMobile, setDesktop }}>
      {children}
    </HeroOpacityContext.Provider>
  );
}

export function useHeroOpacity(): HeroOpacityValue {
  const ctx = useContext(HeroOpacityContext);
  if (!ctx) {
    throw new Error("useHeroOpacity must be used inside <HeroOpacityProvider>");
  }
  return ctx;
}
