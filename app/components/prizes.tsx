"use client";

import React from "react";
import {
  HACKATHON_PRIZES,
  PRIZE_POOL_WORTH,
  PRIZE_CURRENCY_NOTE,
  toLandingPrize,
  type PrizeAward,
} from "@/lib/hackathon-prizes";
import { REVEAL_TRACKS_AND_JUDGES } from "@/lib/event-reveal";
import { HoverLift, RevealItem, RevealStagger } from "./ui/motion-ui";
import { motion, useReducedMotion } from "framer-motion";

const RED = "#c00000";
const DARK_BG = "#1d1c17";
const CREAM_BG = "#f2ede5";
const WHITE = "#ffffff";
const TEXT_DIM = "rgba(255, 255, 255, 0.7)";

function TierPill({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className="px-4 py-3 border border-white/15 min-w-[120px]" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="px-4 py-3 border border-white/15 min-w-[120px]"
      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      whileHover={{ scale: 1.04, borderColor: "rgba(192, 0, 0, 0.5)" }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

function PrizeCard({ award }: { award: PrizeAward }) {
  return (
    <HoverLift
      className="h-full p-6 md:p-8"
      style={{
        backgroundColor: DARK_BG,
        color: WHITE,
        boxShadow: `8px 8px 0px 0px ${RED}`,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xl md:text-2xl" aria-hidden>
          {award.emoji}
        </span>
        <div>
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-tight">
            {award.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: TEXT_DIM }}>
            {award.summary}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {award.tiers.map((tier) => (
          <TierPill key={tier.label}>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: RED }}>
              {tier.label}
            </div>
            <div className="text-2xl md:text-3xl font-black mt-1">{tier.amount}</div>
            {tier.note ? (
              <div className="mt-1 text-[10px] sm:text-xs leading-relaxed opacity-70">{tier.note}</div>
            ) : null}
          </TierPill>
        ))}
      </div>
    </HoverLift>
  );
}

const Prizes: React.FC = () => {
  const visiblePrizes = HACKATHON_PRIZES.map(toLandingPrize);

  return (
    <section
      id="prizes"
      className="w-full py-24 scroll-mt-11"
      style={{ fontFamily: "Montserrat", backgroundColor: CREAM_BG }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 md:px-12">
        <div className="mb-10 md:mb-14">
          <div
            className="inline-block px-3 py-1.5 font-mono uppercase text-[10px] md:text-xs tracking-widest font-bold mb-5"
            style={{ backgroundColor: RED, color: WHITE }}
          >
            // PRIZE POOL
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-4"
            style={{ color: DARK_BG }}
          >
            WIN BIG. BUILD BOLD.
          </h2>
          <p className="text-base sm:text-lg opacity-80 font-medium" style={{ color: DARK_BG }}>
            {REVEAL_TRACKS_AND_JUDGES ? (
              <>
                Prize pool <strong>{PRIZE_POOL_WORTH}</strong> in track prizes, sponsor awards, and community votes, across Care Forward, Friction To Flow, and special categories.
              </>
            ) : (
              <>
                Prize pool <strong>{PRIZE_POOL_WORTH}</strong> in track prizes, sponsor awards, community votes, and special categories. Tracks and judges announced at the pre-event on 17 July 2026.
              </>
            )}
          </p>
          <p className="mt-2 font-mono text-[11px] sm:text-xs tracking-widest uppercase opacity-70" style={{ color: DARK_BG }}>
            // {PRIZE_CURRENCY_NOTE}
          </p>
        </div>

        <RevealStagger className="grid md:grid-cols-2 gap-6 md:gap-8" stagger={0.09}>
          {visiblePrizes.map((award) => (
            <RevealItem key={award.id}>
              <PrizeCard award={award} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
};

export default Prizes;
