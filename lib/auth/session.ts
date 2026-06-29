import { createHmac, timingSafeEqual } from "node:crypto";

export const PORTAL_SESSION_COOKIE = "hx_portal_session";
export const PORTAL_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type PortalRole = "admin" | "judge";
export type PortalUserId = number | string;

export type PortalSession = {
  userId: PortalUserId;
  username: string;
  role: PortalRole;
  iat: number;
  exp: number;
};

type CookieGetter = {
  get: (name: string) => { value: string } | undefined;
};

function sessionSecret() {
  const secret = process.env.PORTAL_AUTH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing PORTAL_AUTH_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback).");
  }
  return secret;
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function isPortalRole(role: unknown): role is PortalRole {
  return role === "admin" || role === "judge";
}

function isPortalUserId(value: unknown): value is PortalUserId {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

function sign(payloadB64: string) {
  return createHmac("sha256", sessionSecret()).update(payloadB64).digest("base64url");
}

export function buildSessionToken({
  userId,
  username,
  role,
}: {
  userId: PortalUserId;
  username: string;
  role: PortalRole;
}) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + PORTAL_SESSION_TTL_SECONDS;

  const payload: PortalSession = { userId, username, role, iat, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function parseSessionToken(token: string | null | undefined): PortalSession | null {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  if (!safeCompare(signature, sign(payloadB64))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const candidate = parsed as Partial<PortalSession>;
  if (
    !isPortalUserId(candidate.userId) ||
    typeof candidate.username !== "string" ||
    !isPortalRole(candidate.role) ||
    typeof candidate.iat !== "number" ||
    typeof candidate.exp !== "number"
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (candidate.exp <= now) return null;
  return candidate as PortalSession;
}

export function readSessionFromCookies(cookies: CookieGetter) {
  const token = cookies.get(PORTAL_SESSION_COOKIE)?.value;
  return parseSessionToken(token);
}

export function sessionCookieOptions(maxAgeSeconds = PORTAL_SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
