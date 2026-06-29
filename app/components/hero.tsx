"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TEAM_REGISTRATION_URL, TELEGRAM_URL } from "@/lib/site-links";
import { HACKATHON_THEME } from "@/lib/hackathon-content";
import { BRUTAL_EASE } from "./ui/motion-ui";

const Hero: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hrs: 0,
    min: 0,
    sec: 0,
  });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const targetDate = new Date("July 24, 2026 00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hrs: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          sec: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const RED = "#c00000";
  const DARK_RED = "#A20000";
  const CREAM_BG = "#f2ede5";
  const DARK_TEXT = "#1d1c17";
  const OFF_WHITE = "#fef9f1";

  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: BRUTAL_EASE, delay },
        };

  const CrtBox = reduceMotion ? "div" : motion.div;
  const MotionBtn = reduceMotion ? "button" : motion.button;

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-6 md:p-12"
      style={{ backgroundColor: CREAM_BG, fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${DARK_TEXT} 1px, transparent 1px), linear-gradient(90deg, ${DARK_TEXT} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 z-10 pt-10 lg:pt-0">
        <CrtBox
          className="relative w-full lg:w-1/2 aspect-video bg-[#1d1c17] border-4 p-2 overflow-hidden group shadow-[8px_8px_0px_#1d1c17]"
          style={{ borderColor: RED }}
          {...fadeUp(0.05)}
          {...(!reduceMotion && {
            whileHover: { y: -6, boxShadow: "12px 12px 0px #1d1c17" },
            transition: { type: "spring", stiffness: 380, damping: 22 },
          })}
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: RED }} />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: RED }} />

          <div className="absolute inset-0 bg-[url('/hero-hackxperience-2026.png')] bg-cover bg-center mix-blend-screen opacity-70 group-hover:opacity-85 transition-opacity duration-500" />

          <div className="relative h-full flex flex-col justify-end p-4 md:p-6 bg-linear-to-t from-black/90 to-transparent">
            <div className="font-mono text-[10px] md:text-xs mb-2 animate-pulse tracking-widest" style={{ color: RED }}>
              STATUS: INITIALIZING...
            </div>
            <div className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[0.9] tracking-normal">
              HackXperience
              <br />
              2026
            </div>
          </div>
        </CrtBox>

        <motion.div
          className="w-full lg:w-1/2 space-y-6 md:space-y-8 flex flex-col items-start text-left"
          {...fadeUp(0.15)}
        >
          <motion.div
            className="inline-block px-3 py-1.5 font-mono uppercase text-[10px] md:text-xs tracking-widest font-bold"
            style={{ backgroundColor: RED, color: OFF_WHITE }}
            {...(!reduceMotion && {
              animate: { boxShadow: ["0 0 0 0 rgba(192,0,0,0)", "0 0 0 6px rgba(192,0,0,0.12)", "0 0 0 0 rgba(192,0,0,0)"] },
              transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            })}
          >
            // 24-HOUR SPRINT HACKATHON
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-normal"
            style={{ color: DARK_TEXT }}
          >
            AI FOR <span style={{ color: RED }}>LIVING</span>
          </h1>

          <div className="pt-2 w-full">
            <p
              className="text-base md:text-xl leading-relaxed opacity-80 font-medium mb-6"
              style={{ color: DARK_TEXT }}
            >
              {HACKATHON_THEME.tagline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {TEAM_REGISTRATION_URL ? (
                <a
                  href={TEAM_REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <MotionBtn
                    className="w-full sm:w-auto px-8 md:px-10 py-4 font-black uppercase text-xs md:text-sm tracking-widest"
                    style={{
                      backgroundColor: RED,
                      color: OFF_WHITE,
                      boxShadow: `4px 4px 0px ${DARK_TEXT}`,
                    }}
                    {...(!reduceMotion && {
                      whileHover: { y: -3, boxShadow: `6px 6px 0px ${DARK_TEXT}`, backgroundColor: DARK_RED },
                      whileTap: { y: 2, boxShadow: `2px 2px 0px ${DARK_TEXT}` },
                    })}
                  >
                    register your team
                  </MotionBtn>
                </a>
              ) : null}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto"
              >
                <MotionBtn
                  className="w-full sm:w-auto px-8 md:px-10 py-4 font-black uppercase text-xs md:text-sm tracking-widest border-2"
                  style={{
                    backgroundColor: TEAM_REGISTRATION_URL ? "transparent" : RED,
                    color: TEAM_REGISTRATION_URL ? DARK_TEXT : OFF_WHITE,
                    borderColor: DARK_TEXT,
                    boxShadow: `4px 4px 0px ${DARK_TEXT}`,
                  }}
                  {...(!reduceMotion && {
                    whileHover: {
                      y: -3,
                      boxShadow: `6px 6px 0px ${DARK_TEXT}`,
                      backgroundColor: TEAM_REGISTRATION_URL ? DARK_TEXT : DARK_RED,
                      color: OFF_WHITE,
                    },
                    whileTap: { y: 2, boxShadow: `2px 2px 0px ${DARK_TEXT}` },
                  })}
                >
                  join SIM ITCommunity
                </MotionBtn>
              </a>
            </div>

            <p
              className="mt-5 font-mono text-[11px] md:text-xs uppercase tracking-widest font-bold"
              style={{ color: DARK_TEXT, opacity: 0.55 }}
            >
              {"// TEAMS OF 3–4 · FREE TO JOIN · REG CLOSES 16 JUL"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
