"use client";

import { useAuthModal } from "@/components/auth/AuthModalProvider";

export function FooterAuthLink({ label }: { label: string }) {
  const { openAuth } = useAuthModal();
  return (
    <button
      type="button"
      onClick={() => openAuth("login")}
      className="hover:text-primary transition-colors text-left"
    >
      {label}
    </button>
  );
}
