"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AuthModal } from "./AuthModal";

export type AuthMode = "login" | "signup";

interface AuthModalState {
  open: boolean;
  mode: AuthMode;
  next: string | null;
}

interface AuthModalContextValue {
  openAuth: (mode?: AuthMode, options?: { next?: string }) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
  state: AuthModalState;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthModalState>({
    open: false,
    mode: "login",
    next: null,
  });

  const openAuth = useCallback<AuthModalContextValue["openAuth"]>(
    (mode = "login", options) => {
      setState({ open: true, mode, next: options?.next ?? null });
    },
    [],
  );

  const closeAuth = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const setMode = useCallback((mode: AuthMode) => {
    setState((s) => ({ ...s, mode }));
  }, []);

  const value = useMemo(
    () => ({ openAuth, closeAuth, setMode, state }),
    [openAuth, closeAuth, setMode, state],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used inside <AuthModalProvider>");
  }
  return ctx;
}
