export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
}
// Milestone 1 boundary: replace this with the selected identity-provider adapter.
export async function getCurrentUser(): Promise<AuthUser | null> {
  return null;
}
