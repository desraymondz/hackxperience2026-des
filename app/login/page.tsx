"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { normalizePortalUsername, toSupabaseAuthEmail } from "@/lib/auth/portal-identity";

const C = {
  pageBg: "#F5F0E8",
  cardBg: "#FFFFFF",
  panelBg: "#F5F0E8",
  activeRoleBg: "#CC0000",
  inputBg: "#FFFFFF",
  red: "#CC0000",
  muted: "#888888",
  offWhite: "#F5F0E8",
  dark: "#1A1A1A",
} as const;

const FM = "var(--font-admin-mono, var(--font-ibm-plex-mono, 'IBM Plex Mono')), monospace";
const FB = "var(--font-admin-display, var(--font-bebas-neue, 'Bebas Neue')), sans-serif";
const SPRING = { type: "spring" as const, stiffness: 400, damping: 20 };
type PortalRole = "judge" | "admin";

type UserRoleRow = {
  id: number | string;
  role: string;
};

function normalizeRole(value: unknown): PortalRole | null {
  if (typeof value !== "string") return null;
  const role = value.trim().toLowerCase();
  if (role === "admin" || role === "judge") return role;
  return null;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromQuery = normalizeRole(searchParams.get("role")) ?? "admin";

  const [activeRole, setActiveRole] = useState<PortalRole>(roleFromQuery);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = activeRole === "admin";
  const idLabel = isAdmin ? "admin_id" : "judge_id";
  const pwLabel = isAdmin ? "admin_password" : "judge_password";
  const idPlaceholder = isAdmin ? "Enter admin username..." : "Enter judge username...";
  const dashRoute = isAdmin ? "/admin/dashboard" : "/judge/dashboard";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const normalizedUsername = normalizePortalUsername(userId);
    if (!normalizedUsername || !password.trim()) {
      setError("// ERROR: all fields required");
      return;
    }

    const supabaseEmail = toSupabaseAuthEmail(normalizedUsername);

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email: supabaseEmail,
        password,
      });

      if (authError || !authData.user || !authData.session) {
        setError(`// ERROR: ${authError?.message ?? "authentication failed"}`);
        return;
      }

      const { data: roleRows, error: roleError } = await supabaseBrowser
        .from("user_roles")
        .select("id,role")
        .eq("user_id", authData.user.id);

      if (roleError) {
        await supabaseBrowser.auth.signOut();
        setError(`// ERROR: ${roleError.message}`);
        return;
      }

      const matchedRole = ((roleRows ?? []) as UserRoleRow[]).find(
        (row) => normalizeRole(row.role) === activeRole
      );

      if (!matchedRole) {
        await supabaseBrowser.auth.signOut();
        setError("// ERROR: Unauthorized role for this portal");
        return;
      }

      const syncResponse = await fetch("/api/auth/portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          accessToken: authData.session.access_token,
          username: normalizedUsername,
        }),
      });

      const syncPayload = await syncResponse.json().catch(() => ({} as { error?: string }));
      if (!syncResponse.ok) {
        await supabaseBrowser.auth.signOut();
        setError(`// ERROR: ${syncPayload.error ?? "Unable to establish portal session"}`);
        return;
      }

      router.replace(dashRoute);
    } catch {
      await supabaseBrowser.auth.signOut();
      setError("// ERROR: network failure, try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .portal-input::placeholder {
          color: #888888;
          font-size: 10px;
          opacity: 1;
        }
        .portal-input:hover:not(:focus) {
          border-color: #CC0000 !important;
          box-shadow: 2px 2px 0 0 #CC0000 !important;
        }
        .portal-input:focus {
          outline: none;
          border-color: #CC0000 !important;
          box-shadow: 2px 2px 0 0 #CC0000 !important;
        }
        .login-card {
          box-sizing: border-box;
          width: min(420px, calc(100vw - 32px));
        }
        @media (max-width: 460px) {
          .login-card   { padding: 36px 24px 32px !important; }
          .login-heading{ font-size: 30px !important; }
          .login-btn    { font-size: 18px !important; }
        }
        @media (max-width: 1024px) {
          .admin-login-close {
            width: 44px !important;
            height: 44px !important;
            margin-top: -10px !important;
            margin-right: -10px !important;
          }
          .admin-role-btn,
          .admin-portal-input {
            min-height: 44px !important;
            height: 44px !important;
          }
          .admin-login-btn {
            min-height: 52px !important;
          }
        }
        @media (max-width: 768px) {
          .admin-login-close:active {
            background: #3a0808 !important;
            transform: scale(0.96) !important;
          }
          .admin-role-btn {
            font-size: 12px !important;
            line-height: 1.2 !important;
          }
          .admin-role-btn:active {
            background: #f5f0e8 !important;
            transform: scale(0.98) !important;
          }
          .admin-portal-input {
            font-size: 16px !important;
            line-height: 20px !important;
          }
          .admin-login-btn:active {
            background: #aa0000 !important;
            transform: scale(0.98) !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          backgroundImage: `
            linear-gradient(rgba(26,26,26,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,26,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="login-card"
          style={{
            background: C.cardBg,
            border: `1px solid ${C.red}`,
            padding: "48px 52px 48px 48px",
            boxShadow: "6px 6px 0 0 #CC0000",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: C.red,
            }}
          />

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span
                style={{
                  fontFamily: FM,
                  fontSize: 10,
                  color: C.red,
                  lineHeight: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {"// HACKXPERIENCE 2026"}
              </span>
              <motion.button
                onClick={() => router.push("/")}
                aria-label="Close portal"
                className={undefined}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                transition={SPRING}
                style={{
                  width: 18,
                  height: 18,
                  background: C.panelBg,
                  border: `0.2px solid ${C.red}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  marginLeft: 8,
                  transition: "border-color 0.15s",
                }}
              >
                <span
                  style={{
                    fontFamily: FM,
                    fontSize: 11,
                    color: C.red,
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  ×
                </span>
              </motion.button>
            </div>

            <h1
              className="login-heading"
              style={{
                fontFamily: FB,
                fontSize: 36,
                fontWeight: 400,
                color: C.dark,
                margin: "2px 0 0",
                lineHeight: "43px",
                letterSpacing: "0.02em",
              }}
            >
              {isAdmin ? "ADMIN " : "JUDGE "}
              <span style={{ color: C.red }}>PORTAL</span>
            </h1>
            <p
              style={{
                fontFamily: FM,
                fontSize: 10,
                color: C.muted,
                margin: 0,
                lineHeight: "13px",
                letterSpacing: "0.02em",
              }}
            >
              {"// RESTRICTED ACCESS — AUTHORISED PERSONNEL ONLY"}
            </p>
          </div>

          <div style={{ display: "flex", marginBottom: 22 }}>
            <button
              type="button"
              onClick={() => setActiveRole("admin")}
              className={`admin-role-btn flex-1 h-[34px] border border-[#cc0000] text-[11px] tracking-[0.08em] transition-colors duration-150 ${
                activeRole === "admin"
                  ? "bg-black text-white font-bold"
                  : "bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#ede8e0]"
              }`}
              style={{ fontFamily: FM }}
            >
              ADMIN
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("judge")}
              className={`admin-role-btn flex-1 h-[34px] border border-l-0 border-[#cc0000] text-[11px] tracking-[0.08em] transition-colors duration-150 ${
                activeRole === "judge"
                  ? "bg-black text-white font-bold"
                  : "bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#ede8e0]"
              }`}
              style={{ fontFamily: FM }}
            >
              JUDGE
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="portal-id"
                style={{
                  display: "block",
                  fontFamily: FM,
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.dark,
                  lineHeight: "13px",
                  marginBottom: 7,
                }}
              >
                {idLabel}
              </label>
              <input
                id="portal-id"
                type="text"
                className="portal-input"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={idPlaceholder}
                autoComplete="username"
                style={{
                  display: "block",
                  width: "100%",
                  height: 38,
                  background: C.inputBg,
                  border: "1.5px solid #1A1A1A",
                  color: C.dark,
                  fontFamily: FM,
                  fontSize: 12,
                  fontWeight: 700,
                  paddingLeft: 12,
                  paddingRight: 8,
                  boxSizing: "border-box",
                  outline: "none",
                  borderRadius: 0,
                  boxShadow: "2px 2px 0 0 #888888",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
            </div>

            <div style={{ marginBottom: error ? 12 : 22 }}>
              <label
                htmlFor="portal-password"
                style={{
                  display: "block",
                  fontFamily: FM,
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.dark,
                  lineHeight: "13px",
                  marginBottom: 7,
                }}
              >
                {pwLabel}
              </label>
              <input
                id="portal-password"
                type="password"
                className="portal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAdmin ? "Enter admin password..." : "Enter judge password..."}
                autoComplete="current-password"
                style={{
                  display: "block",
                  width: "100%",
                  height: 38,
                  background: C.inputBg,
                  border: "1.5px solid #1A1A1A",
                  color: C.dark,
                  fontFamily: FM,
                  fontSize: 12,
                  fontWeight: 700,
                  paddingLeft: 12,
                  paddingRight: 8,
                  boxSizing: "border-box",
                  outline: "none",
                  borderRadius: 0,
                  boxShadow: "2px 2px 0 0 #888888",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: FM,
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.red,
                  margin: "0 0 12px",
                  lineHeight: "13px",
                }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              transition={SPRING}
              className="login-btn"
              style={{
                display: "block",
                width: "100%",
                height: 52,
                background: C.red,
                border: "none",
                fontFamily: FB,
                fontSize: 20,
                fontWeight: 400,
                color: C.offWhite,
                cursor: loading ? "wait" : "pointer",
                letterSpacing: "0.15em",
                opacity: loading ? 0.85 : 1,
                boxShadow: "4px 4px 0 0 #1A1A1A",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "AUTHENTICATING..." : "> AUTHENTICATE"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
