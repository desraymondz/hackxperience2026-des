export const DUMMY_AUTH_DOMAIN = "hackxperience.local";

export function normalizePortalUsername(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function toSupabaseAuthEmail(usernameOrEmail: string) {
  const normalized = normalizePortalUsername(usernameOrEmail);
  if (!normalized) return "";
  return normalized.includes("@") ? normalized : `${normalized}@${DUMMY_AUTH_DOMAIN}`;
}

export function usernameFromSupabaseEmail(email: string | null | undefined) {
  const normalized = normalizePortalUsername(email);
  if (!normalized) return "";
  const suffix = `@${DUMMY_AUTH_DOMAIN}`;
  if (normalized.endsWith(suffix)) {
    return normalized.slice(0, -suffix.length);
  }
  return normalized;
}
