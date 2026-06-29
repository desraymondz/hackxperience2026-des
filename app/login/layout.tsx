import { Bebas_Neue, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

const adminDisplay = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-admin-display",
});

const adminMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "400", "700"],
  variable: "--font-admin-mono",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${adminDisplay.variable} ${adminMono.variable}`}>
      {children}
    </div>
  );
}
