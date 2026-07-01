"use client";

import React from "react";
import { HACKATHON_MAIN_TRACKS, HACKATHON_THEME } from "@/lib/hackathon-content";
import { REVEAL_TRACKS_AND_JUDGES } from "@/lib/event-reveal";
import { HoverLift, RevealItem, RevealStagger } from "./ui/motion-ui";
import { motion, useReducedMotion } from "framer-motion";

const RED = "#c00000";
const DARK_BG = "#1d1c17";
const CREAM_BG = "#f2ede5";
const CREAM_CARD = "#e7e2da";
const WHITE = "#ffffff";
const TEXT_DIM = "rgba(255, 255, 255, 0.7)";

function SubTrackCard({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return (
      <div className="p-4 md:p-5 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-5 border border-white/10"
      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      whileHover={{ x: 4, borderColor: "rgba(192, 0, 0, 0.45)" }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

function TracksTeaser() {
  return (
    <RevealItem>
      <HoverLift
        className="p-6 md:p-10 border-2"
        style={{ borderColor: DARK_BG, backgroundColor: CREAM_CARD, color: DARK_BG }}
        lift={-4}
      >
        <p className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase mb-3" style={{ color: RED }}>
          {"// TRACKS — REVEALED AT PRE-EVENT"}
        </p>
        <p className="text-sm md:text-base leading-relaxed opacity-80 font-medium">
          Full track breakdown and judging panel announced at the Microsoft Foundry workshop · 17 July 2026
        </p>
      </HoverLift>
    </RevealItem>
  );
}

function TracksGrid() {
  return (
    <>
      <div className="mb-8">
        <h3 className="font-mono font-bold uppercase tracking-widest text-xs sm:text-sm" style={{ color: RED }}>
          {"// TRACKS"}
        </h3>
        <p className="mt-3 text-sm md:text-base opacity-70" style={{ color: DARK_BG }}>
          Pick the track that speaks to your team. Each has sub-tracks to guide your agentic build, and you&apos;re free to explore within or across them.
        </p>
      </div>

      <RevealStagger className="grid lg:grid-cols-2 gap-8" stagger={0.12}>
        {HACKATHON_MAIN_TRACKS.map((track, trackIndex) => (
          <RevealItem key={track.name}>
            <HoverLift
              className="h-full p-6 md:p-10"
              style={{
                backgroundColor: DARK_BG,
                color: WHITE,
                boxShadow: `12px 12px 0px 0px ${RED}`,
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl md:text-3xl leading-none" aria-hidden>
                  {track.emoji}
                </span>
                <div>
                  <p className="font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase" style={{ color: RED }}>
                    {`// TRACK ${trackIndex + 1}`}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">
                    {track.name}
                  </h3>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: TEXT_DIM }}>
                {track.summary}
              </p>

              <div className="space-y-5">
                {track.subTracks.map((sub) => (
                  <SubTrackCard key={sub.code}>
                    <h4 className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase mb-3" style={{ color: RED }}>
                      {sub.code}) {sub.name}
                    </h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm leading-relaxed" style={{ color: TEXT_DIM }}>
                      {sub.ideas.map((idea) => (
                        <li key={idea} className="flex gap-2">
                          <span style={{ color: RED }} aria-hidden>
                            ›
                          </span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </SubTrackCard>
                ))}
              </div>
            </HoverLift>
          </RevealItem>
        ))}
      </RevealStagger>

      <RevealItem className="mt-10">
        <HoverLift
          className="p-5 md:p-6 border-2 font-mono text-[11px] sm:text-xs tracking-widest uppercase font-bold"
          style={{ borderColor: DARK_BG, color: DARK_BG, backgroundColor: CREAM_CARD }}
          lift={-4}
        >
          {"// BUILD AGENTIC SOLUTIONS · CHOOSE YOUR TRACK AT SUBMISSION · SUB-TRACKS ARE GUIDES, NOT LIMITS"}
        </HoverLift>
      </RevealItem>
    </>
  );
}

const Tracks: React.FC = () => {
  const themeIntro = REVEAL_TRACKS_AND_JUDGES
    ? HACKATHON_THEME.introRevealed
    : HACKATHON_THEME.intro;
  const themeClosing = REVEAL_TRACKS_AND_JUDGES
    ? HACKATHON_THEME.closingRevealed
    : HACKATHON_THEME.closing;

  return (
    <section
      id="tracks"
      className="w-full py-24 scroll-mt-11"
      style={{ fontFamily: "Montserrat", backgroundColor: CREAM_BG }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 md:px-12">
        <div className="mb-12 md:mb-16">
          <div
            className="inline-block px-3 py-1.5 font-mono uppercase text-[10px] md:text-xs tracking-widest font-bold mb-5"
            style={{ backgroundColor: RED, color: WHITE }}
          >
            {"// HACKATHON THEME"}
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-6"
            style={{ color: DARK_BG }}
          >
            {HACKATHON_THEME.title.toUpperCase()}
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed opacity-80 font-medium" style={{ color: DARK_BG }}>
            {themeIntro} {themeClosing}
          </p>
        </div>

        {REVEAL_TRACKS_AND_JUDGES ? <TracksGrid /> : <TracksTeaser />}
      </div>
    </section>
  );
};

export default Tracks;
