import type { Metadata } from "next";
import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { AdminShellFrame, AdminShellProvider } from "./components/AdminShell";
import { PortalSettingsProvider } from "./components/PortalSettingsContext";

const adminDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-admin-display",
});

const adminMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-admin-mono",
});

export const metadata: Metadata = {
  title: "HACKX ADMIN",
  description: "HackXperience 2026 admin submission portal.",
  // Restricted area — keep it out of search engines (mirrors the judge portal).
  robots: { index: false, follow: false },
};

// Warm brand palette (matches the judge portal in app/judge/dashboard/constants.ts).
// Scoped to the admin subtree so the global shadcn `--muted` token elsewhere is untouched.
const adminTheme = {
  "--cream-bg": "#f2ede5",
  "--dark-bg": "#1d1c17",
  "--off-white": "#fef9f1",
  "--muted": "#7a7669",
  "--line": "#d8d2c5",
  "--red": "#cc0000",
  "--dark-red": "#aa0000",
  "--green": "#3a9e6a",
} as CSSProperties;

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className={`${adminDisplay.variable} ${adminMono.variable} min-h-screen`}
      style={adminTheme}
    >
      <PortalSettingsProvider>
        <AdminShellProvider>
          <AdminShellFrame>{children}</AdminShellFrame>
        </AdminShellProvider>
      </PortalSettingsProvider>
    </div>
  );
}
