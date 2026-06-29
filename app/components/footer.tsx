import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { TELEGRAM_URL } from "@/lib/site-links";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
});

export default function Footer() {
  return (
    <footer
      className={`${ibmPlexMono.className} w-full bg-[#1e1e1e] text-[#666] px-6 sm:px-10 md:px-14 pt-14 sm:pt-20 pb-10 sm:pb-14`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-0">
          {/* Left — branding */}
          <div className="md:w-[45%]">
            <h3
              className={`${montserrat.className} text-[#c00000] text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-none uppercase`}
            >
              HACKXPERIENCE_2026
            </h3>
            <p className="mt-5 text-[13px] sm:text-[14px] leading-[1.75] tracking-[0.01em] max-w-[380px]">
              SIM IT Club&apos;s flagship hackathon. 100+ student builders, one
              24-hour sprint, agentic products built under the theme <span className="text-[#c00000]">AI for Living</span>.
            </p>
          </div>

          {/* Middle — contact */}
          <div className="md:w-[30%]">
            <div className="text-[#c00000] text-[12px] sm:text-[13px] font-bold tracking-[0.10em] uppercase mb-5">
              // CONTACT_CELL
            </div>
            <div className="text-[13px] sm:text-[14px] leading-[1.75] tracking-[0.02em]">
              <div>it@mymail.sim.edu.sg</div>
              <div className="mt-3">
                SIM 461 Clementi Road,
                <br />
                Singapore 599491
              </div>
            </div>
          </div>

          {/* Right — networks */}
          <div className="md:w-[25%]">
            <div className="text-[#c00000] text-[12px] sm:text-[13px] font-bold tracking-[0.10em] uppercase mb-5">
              // NETWORKS
            </div>
            <div className="flex flex-col gap-2.5 text-[13px] sm:text-[14px] tracking-[0.04em]">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-[#555] hover:text-white hover:decoration-white transition-colors w-fit"
              >
                TELEGRAM
              </a>
              <a
                href="https://www.linkedin.com/company/sim-information-technology-club/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-[#555] hover:text-white hover:decoration-white transition-colors w-fit"
              >
                LINKEDIN
              </a>
              <a
                href="https://www.instagram.com/simitclub"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-[#555] hover:text-white hover:decoration-white transition-colors w-fit"
              >
                INSTAGRAM
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#333] mt-16 sm:mt-24 mb-6 sm:mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 text-[10px] sm:text-[11px] tracking-[0.08em] uppercase text-[#444]">
          <div>&copy; 2026 SIM IT CLUB · HACKXPERIENCE. ALL RIGHTS RESERVED.</div>
          <div>BUILT BY SIM IT CLUB · #HACKXPERIENCE2026</div>
        </div>
      </div>
    </footer>
  );
}
