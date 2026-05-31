"use client";

import { useEffect, useState } from "react";
import { loadProfiles } from "./savedProfiles";

/**
 * Returns whether this device has any saved accounts.
 *   - `null`  → not determined yet (still mounting; avoids hydration flash)
 *   - `true`  → returning user (show the AuthWall quick-login)
 *   - `false` → brand-new visitor (let them browse / register at checkout)
 *
 * Re-reads on cross-tab `storage` events so logging out elsewhere keeps it
 * in sync.
 */
export function useHasSavedProfiles(): boolean | null {
  const [hasSaved, setHasSaved] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => setHasSaved(loadProfiles().length > 0);
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return hasSaved;
}
