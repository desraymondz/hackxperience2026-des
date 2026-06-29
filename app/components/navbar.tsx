"use client";

import { useEffect, useState } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Homepage section jump links, in page order. The logo (left) is "MAIN".
const NAV_ITEMS = [
  { label: "OVERVIEW", target: "overview" },                 // About
  { label: "PAST-EVENTS", target: "past-events" },           // Past Events
  { label: "PRE-EVENTS", target: "pre-events" },             // Pre-events
  { label: "TIMELINE", target: "timeline" },                 // Timeline
  { label: "FAQ", target: "faq" },                           // FAQ
  { label: "ORGANISE_MEMBERS", target: "organise-members" }, // Committee
  { label: "JOIN_US!", target: "join-us" },                  // Final CTA
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (item: { label: string; target: string }) => {
    // Every item is an in-page section anchor. If we're on another route,
    // route home with the hash; otherwise smooth-scroll in place.
    if (pathname !== "/") {
      router.push(`/#${item.target}`);
    } else {
      scrollTo(item.target);
    }
  };

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <nav
      className={`${ibmPlexMono.className} fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-10 h-11 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.5)]" : ""
      }`}
      style={{ backgroundColor: "#1d1c17" }}
    >
      {/* Left — Logo */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-0 text-white text-[13px] sm:text-[14px] font-bold tracking-wide cursor-pointer whitespace-nowrap"
      >
        <span className="text-[#c00000] mr-1">&gt;_</span>
        HACK_TERMINAL
      </button>

      {/* Center — Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className="text-[12px] font-medium tracking-[0.08em] cursor-pointer px-2.5 py-1 transition-colors duration-150 whitespace-nowrap text-white/70 hover:text-white"
          >
            [{item.label}]
          </button>
        ))}
      </div>

      {/* Right — Login button + mobile menu toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="login_secure"
          onClick={() => router.push("/login")}
          className="login_secure bg-[#c00000] hover:bg-[#a00000] text-white text-[11px] sm:text-[12px] font-bold tracking-[0.10em] px-4 py-1.5 cursor-pointer transition-colors duration-150 whitespace-nowrap"
        >
          LOGIN_SECURE
        </button>
        {/* Hamburger — only below md, where the center links are hidden */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center text-white cursor-pointer p-1"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
              <rect width="18" height="2" />
              <rect y="6" width="18" height="2" />
              <rect y="12" width="18" height="2" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown — replaces the hidden center links below md */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-11 left-0 right-0 flex flex-col border-t border-white/10"
          style={{ backgroundColor: "#1d1c17" }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => { handleNavClick(item); setMenuOpen(false); }}
              className="text-left text-[12px] font-medium tracking-[0.08em] px-4 sm:px-6 py-3 border-b border-white/5 transition-colors duration-150 text-white/70 hover:text-white"
            >
              [{item.label}]
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
