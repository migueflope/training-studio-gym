export type SavedProfile = {
  email: string;
  name: string;
  avatarUrl?: string | null;
};

export const SAVED_PROFILES_KEY = "ts_saved_profiles";
export const LEGACY_PROFILE_KEY = "ts_saved_profile";

export function loadProfiles(): SavedProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && typeof p.email === "string" && p.email);
      }
    }
    // Migrate legacy single-profile storage.
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.email) {
        const migrated: SavedProfile[] = [
          { email: parsed.email, name: parsed.name ?? "", avatarUrl: parsed.avatarUrl ?? null },
        ];
        localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(migrated));
        localStorage.removeItem(LEGACY_PROFILE_KEY);
        return migrated;
      }
    }
  } catch {}
  return [];
}

export function upsertProfile(profile: SavedProfile): SavedProfile[] {
  if (typeof window === "undefined") return [];
  const current = loadProfiles();
  const existing = current.find((p) => p.email.toLowerCase() === profile.email.toLowerCase());
  // Keep the old avatar/name if the new payload doesn't include them.
  const merged: SavedProfile = {
    email: profile.email,
    name: profile.name || existing?.name || "",
    avatarUrl: profile.avatarUrl ?? existing?.avatarUrl ?? null,
  };
  const filtered = current.filter((p) => p.email.toLowerCase() !== profile.email.toLowerCase());
  const next = [merged, ...filtered];
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(next));
  localStorage.removeItem(LEGACY_PROFILE_KEY);
  return next;
}

export function removeProfile(email: string): SavedProfile[] {
  if (typeof window === "undefined") return [];
  const current = loadProfiles();
  const next = current.filter((p) => p.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(next));
  return next;
}

// Asks the browser/OS to save the credential. The native "Save password?"
// prompt is shown by the browser (Chrome, Safari/iCloud Keychain, etc.).
export async function requestCredentialSave(email: string, password: string, name?: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    PasswordCredential?: new (data: { id: string; password: string; name?: string }) => Credential;
  };
  if (!("credentials" in navigator) || !w.PasswordCredential) return;
  try {
    const cred = new w.PasswordCredential({ id: email, password, name });
    await navigator.credentials.store(cred);
  } catch {
    // Browsers without support, or user denied — silently ignore.
  }
}
