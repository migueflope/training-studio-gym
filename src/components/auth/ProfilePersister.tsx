"use client";

import { useEffect } from "react";

const SAVED_PROFILE_KEY = "ts_saved_profile";

interface ProfilePersisterProps {
  email: string;
  name: string;
  avatarUrl?: string | null;
}

/**
 * Invisible component that saves the authenticated user's profile to
 * localStorage so the AuthWall can show the "quick login" saved-profile
 * view the next time they visit after signing out.
 * Works for ALL auth methods: Google OAuth, email/password, etc.
 */
export function ProfilePersister({ email, name, avatarUrl }: ProfilePersisterProps) {
  useEffect(() => {
    if (email) {
      localStorage.setItem(
        SAVED_PROFILE_KEY,
        JSON.stringify({ email, name, avatarUrl: avatarUrl ?? null })
      );
    }
  }, [email, name, avatarUrl]);

  return null;
}
