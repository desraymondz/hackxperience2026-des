import type { Metadata } from "next";
import { IBM_Plex_Mono, Bebas_Neue } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["100", "400", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Judge Portal | HackXperience 2026",
  description: "Restricted access — authorised judges only.",
  robots: { index: false, follow: false },
};

export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${ibmPlexMono.variable} ${bebasNeue.variable}`}
      style={{ flex: "1", minHeight: "100vh", background: "#f2ede5" }}
    >
      {children}
    </div>
  );
}
