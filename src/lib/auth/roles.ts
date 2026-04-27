export type UserRole = "owner" | "partner" | "member";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  initials: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "owner" || role === "partner";
}
