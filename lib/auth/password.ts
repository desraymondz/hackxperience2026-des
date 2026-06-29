import { createHash, timingSafeEqual } from "node:crypto";

function compareText(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function compareHex(expectedHex: string, actualHex: string) {
  if (!/^[a-f0-9]+$/i.test(expectedHex) || !/^[a-f0-9]+$/i.test(actualHex)) {
    return false;
  }
  const left = Buffer.from(expectedHex.toLowerCase(), "hex");
  const right = Buffer.from(actualHex.toLowerCase(), "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function hashHex(algorithm: "md5" | "sha1" | "sha256" | "sha512", value: string) {
  return createHash(algorithm).update(value, "utf8").digest("hex");
}

function verifyPrefixedHash(stored: string, supplied: string) {
  const normalized = stored.trim();

  for (const separator of [":", "$"] as const) {
    const idx = normalized.indexOf(separator);
    if (idx <= 0) continue;

    const algo = normalized.slice(0, idx).toLowerCase();
    const digest = normalized.slice(idx + 1);

    if (algo === "md5" || algo === "sha1" || algo === "sha256" || algo === "sha512") {
      return compareHex(digest, hashHex(algo, supplied));
    }
  }

  return null;
}

function verifyRawHexHash(stored: string, supplied: string) {
  const normalized = stored.trim();
  if (!/^[a-f0-9]+$/i.test(normalized)) return null;

  if (normalized.length === 32) return compareHex(normalized, hashHex("md5", supplied));
  if (normalized.length === 40) return compareHex(normalized, hashHex("sha1", supplied));
  if (normalized.length === 64) return compareHex(normalized, hashHex("sha256", supplied));
  if (normalized.length === 128) return compareHex(normalized, hashHex("sha512", supplied));
  return null;
}

/**
 * Supports either:
 * 1) plain text passwords (`stored = hunter2`)
 * 2) prefixed digests (`sha256:<hex>`, `sha256$<hex>`, `md5:<hex>`, etc)
 * 3) raw hex digests (32/40/64/128 chars for md5/sha1/sha256/sha512)
 */
export function verifyPassword(stored: string, supplied: string) {
  const prefixed = verifyPrefixedHash(stored, supplied);
  if (prefixed !== null) return prefixed;

  const rawHex = verifyRawHexHash(stored, supplied);
  if (rawHex !== null) return rawHex;

  return compareText(stored, supplied);
}

export function hashPasswordSha256(plainPassword: string) {
  return `sha256:${hashHex("sha256", plainPassword)}`;
}
