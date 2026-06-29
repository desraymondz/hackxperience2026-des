import "server-only";

import { supabaseServer } from "@/lib/supabase-server";
import type { PortalRole, PortalUserId } from "./session";

type UserRoleRow = {
  role: string;
};

function normalizeRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  if (role === "admin" || role === "judge") return role;
  return null;
}

function toDatabaseRoleId(userRoleId: PortalUserId): string | number {
  if (typeof userRoleId === "number") return userRoleId;

  const trimmed = userRoleId.trim();
  if (/^\d+$/.test(trimmed)) {
    const asNumber = Number(trimmed);
    if (Number.isSafeInteger(asNumber)) return asNumber;
  }

  return trimmed;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function verifyRoleMapping({
  userRoleId,
  expectedRole,
}: {
  userRoleId: PortalUserId;
  expectedRole: PortalRole;
}) {
  // Primary path: session user id is auth.users.id.
  if (typeof userRoleId === "string") {
    const authUserId = userRoleId.trim();
    if (isUuid(authUserId)) {
      const byUserId = await supabaseServer
        .from("user_roles")
        .select("role")
        .eq("user_id", authUserId)
        .maybeSingle<UserRoleRow>();

      if (byUserId.error) {
        return { ok: false as const, status: 500 as const, error: byUserId.error.message };
      }

      if (byUserId.data) {
        if (normalizeRole(byUserId.data.role) === expectedRole) {
          return { ok: true as const };
        }
        return { ok: false as const, status: 403 as const, error: "Unauthorized role for this portal." };
      }
    }
  }

  // Backward compatibility path: older sessions may still carry user_roles.id.
  const byRoleId = await supabaseServer
    .from("user_roles")
    .select("role")
    .eq("id", toDatabaseRoleId(userRoleId))
    .maybeSingle<UserRoleRow>();

  if (byRoleId.error) {
    return { ok: false as const, status: 500 as const, error: byRoleId.error.message };
  }

  if (!byRoleId.data || normalizeRole(byRoleId.data.role) !== expectedRole) {
    return { ok: false as const, status: 403 as const, error: "Unauthorized role for this portal." };
  }

  return { ok: true as const };
}
