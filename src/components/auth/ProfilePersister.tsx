"use client";

import { useEffect } from "react";
import { upsertProfile } from "@/lib/auth/savedProfiles";

interface ProfilePersisterProps {
  email: string;
  name: string;
  avatarUrl?: string | null;
}

// Invisible component that adds the authenticated user's profile to the
// localStorage account list so the AuthWall can show it as a quick-login
// option after sign-out. Works for ALL auth methods: Google OAuth,
// email/password, etc. Upserts into the array — never overwrites.
export function ProfilePersister({ email, name, avatarUrl }: ProfilePersisterProps) {
  useEffect(() => {
    if (!email) return;
    upsertProfile({ email, name, avatarUrl: avatarUrl ?? null });
  }, [email, name, avatarUrl]);

  return null;
}
