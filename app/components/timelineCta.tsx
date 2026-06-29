"use client";

import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { TEAM_REGISTRATION_URL, LOOKING_FOR_TEAM_URL, TELEGRAM_URL } from "@/lib/site-links";
import { RevealItem, RevealStagger } from "./ui/motion-ui";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["normal", "italic"],
});

function CtaButton({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-block">
      <motion.span
        className={`block w-full sm:w-auto text-center cursor-pointer ${className}`}
        whileHover={reduceMotion ? undefined : { y: -4, scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { y: 1, scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {children}
      </motion.span>
    </a>
  );
}

export default function TimelineCta() {
  return (
    <section id="join-us" className={`${ibmPlexMono.className} w-full bg-[#d10000] text-white scroll-mt-11 overflow-hidden`}>
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 py-24 sm:py-32 md:py-40">
        <RevealItem>
          <h2
            className={`${montserrat.className} text-center uppercase text-[52px] sm:text-[80px] md:text-[96px] font-extrabold leading-[0.92] tracking-[-0.02em]`}
          >
            BUILD AI FOR LIVING.
          </h2>
        </RevealItem>

        <RevealItem>
          <p className="mx-auto mt-6 sm:mt-8 max-w-[560px] text-center italic text-[15px] sm:text-[17px] leading-[1.55] font-normal tracking-[0.02em] text-white/70">
            Join 100+ curious students on 24–25 July. Deploy agentic products
            that matter, not just keep up with the trends.
          </p>
        </RevealItem>

        <RevealStagger
          className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
          stagger={0.1}
        >
          <RevealItem className="w-full sm:w-auto">
            {TEAM_REGISTRATION_URL ? (
              <CtaButton
                href={TEAM_REGISTRATION_URL}
                className="bg-[#1a1a1a] px-10 sm:px-14 py-5 text-[13px] sm:text-[15px] font-bold tracking-[0.12em] uppercase shadow-[5px_5px_0_0_rgba(255,255,255,0.25)] hover:brightness-125"
              >
                REGISTER YOUR TEAM
              </CtaButton>
            ) : (
              <CtaButton
                href={TELEGRAM_URL}
                className="bg-[#1a1a1a] px-10 sm:px-14 py-5 text-[13px] sm:text-[15px] font-bold tracking-[0.12em] uppercase shadow-[5px_5px_0_0_rgba(255,255,255,0.25)] hover:brightness-125"
              >
                JOIN SIM ITCOMMUNITY
              </CtaButton>
            )}
          </RevealItem>

          {LOOKING_FOR_TEAM_URL ? (
            <RevealItem className="w-full sm:w-auto">
              <CtaButton
                href={LOOKING_FOR_TEAM_URL}
                className="border-2 border-white/80 px-10 sm:px-14 py-5 text-[13px] sm:text-[15px] font-bold tracking-[0.12em] uppercase shadow-[5px_5px_0_0_rgba(255,255,255,0.15)] hover:bg-white/10"
              >
                SOLO / PAIR REGISTRATION
              </CtaButton>
            </RevealItem>
          ) : null}

          <RevealItem>
            <div className="sm:border-l border-white/30 sm:pl-6 text-left">
              <div className="text-[11px] sm:text-[13px] leading-[1.9] font-semibold tracking-[0.10em] uppercase whitespace-nowrap">
                <div>// TEAMS OF 3–4</div>
                <div>// REG CLOSES 16 JUL</div>
                <div>// FREE TO JOIN</div>
              </div>
            </div>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
