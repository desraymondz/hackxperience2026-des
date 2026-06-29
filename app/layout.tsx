import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Analytics from "./components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://hackxperience2026.vercel.app";
const SITE_TITLE = "HackXperience 2026: 24-Hour Agentic Sprint Hackathon at SIM";
const SITE_DESCRIPTION =
  "Join HackXperience 2026, SIM IT Club's flagship 24-hour sprint hackathon. Teams of 3–4 build and deploy agentic products around AI for Living, 24–25 July at SIM. Register by 16 July. Open to curious students.";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: "%s | HackXperience 2026",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HackXperience",
    "hackathon",
    "SIM",
    "Singapore Institute of Management",
    "2026",
    "coding",
    "React",
    "Next.js",
    "student hackathon",
    "agentic AI",
    "AI for Living",
    "IT Club",
  ],
  authors: [{ name: "SIM Information Technology Club" }],
  creator: "SIM Information Technology Club",
  publisher: "SIM Information Technology Club",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: SITE_URL,
    siteName: "HackXperience 2026",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/hero-hackxperience-2026.png", width: 1200, height: 630, alt: "HackXperience 2026: AI for Living" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/hero-hackxperience-2026.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "HackXperience 2026",
  description: SITE_DESCRIPTION,
  startDate: "2026-07-24T00:00:00+08:00",
  endDate: "2026-07-25T23:59:59+08:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Singapore Institute of Management (SIM)",
    address: {
      "@type": "PostalAddress",
      streetAddress: "461 Clementi Road",
      addressLocality: "Singapore",
      postalCode: "599491",
      addressCountry: "SG",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "SIM Information Technology Club",
    email: "it@mymail.sim.edu.sg",
    sameAs: [
      "https://www.linkedin.com/company/sim-information-technology-club/",
      "https://www.instagram.com/simitclub",
    ],
  },
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <Analytics />
        {children}
      </body>
    </html>
  );
}