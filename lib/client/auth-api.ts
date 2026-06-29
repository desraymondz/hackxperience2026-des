"use client";

export async function logoutPortal() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Ignore network failure and let caller continue local redirect.
  }
}
