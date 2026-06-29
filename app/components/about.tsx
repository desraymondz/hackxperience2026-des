"use client";

import React from "react";
import { HoverLift, RevealItem, RevealStagger } from "./ui/motion-ui";

const About: React.FC = () => {
  const RED = "#c00000";
  const DARK_BG = "#1d1c17";
  const CREAM_CARD = "#e7e2da";
  const WHITE = "#ffffff";
  const TEXT_DIM = "rgba(255, 255, 255, 0.7)";

  return (
    <section id="overview" className="w-full py-24 scroll-mt-11" style={{ fontFamily: "Montserrat" }}>
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 md:px-12">
        <RevealStagger className="grid lg:grid-cols-3 gap-8" stagger={0.1}>
          <RevealItem className="lg:col-span-2">
            <HoverLift
              className="h-full p-6 md:p-14 relative"
              style={{
                backgroundColor: DARK_BG,
                color: WHITE,
                boxShadow: `12px 12px 0px 0px ${RED}`,
              }}
            >
              <h2 className="text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl font-black mb-6 md:mb-8 tracking-tight">
                HACKATHON_<wbr />
                OVERVIEW
              </h2>

              <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-10 md:mb-12 opacity-80 font-medium">
                Welcome to HackXperience, a 24-hour sprint hackathon for curious students to build and deploy agentic products. SIM IT Club&apos;s flagship event brings together 100+ participants on 24–25 July under the theme <strong>AI for Living</strong>, easing the tension between work and life through care or automation. Register your team of 3–4 by <strong>16 July 2026</strong>.
              </p>

              <div className="grid md:grid-cols-2 gap-8 md:gap-10 pt-8 md:pt-10 border-t border-white/10">
                <div>
                  <h4 className="font-mono font-bold mb-3 uppercase tracking-widest text-xs sm:text-sm" style={{ color: RED }}>
                    // WHO SHOULD JOIN
                  </h4>
                  <ul className="space-y-2 text-sm md:text-base leading-relaxed" style={{ color: TEXT_DIM }}>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>Web devs, AI engineers, designers, product thinkers, business analysts</span></li>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>Any SIM student, Year 1 to Year 3</span></li>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>No minimum skill level, just the drive to ship in 24 hours</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-mono font-bold mb-3 uppercase tracking-widest text-xs sm:text-sm" style={{ color: RED }}>
                    // WHAT YOU GET
                  </h4>
                  <ul className="space-y-2 text-sm md:text-base leading-relaxed" style={{ color: TEXT_DIM }}>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>Pre-event workshops to get you hackathon-ready</span></li>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>On-site mentorship from industry professionals</span></li>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>A stage to demo your agentic build</span></li>
                    <li className="flex gap-2"><span style={{ color: RED }} aria-hidden>›</span><span>Prizes worth fighting for</span></li>
                  </ul>
                </div>
              </div>
            </HoverLift>
          </RevealItem>

          <div className="flex flex-col gap-8 mt-4 lg:mt-0">
            <RevealItem>
              <HoverLift
                className="border-2 p-8 flex-1 flex flex-col justify-center h-full"
                style={{
                  backgroundColor: CREAM_CARD,
                  borderColor: DARK_BG,
                }}
              >
                <span className="text-5xl md:text-6xl font-black" style={{ color: RED }}>
                  24
                </span>
                <span className="font-mono text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] mt-3" style={{ color: DARK_BG }}>
                  Hours To Build
                </span>
              </HoverLift>
            </RevealItem>

            <RevealItem>
              <HoverLift
                className="p-8 flex-1 flex flex-col justify-center h-full"
                style={{ backgroundColor: RED, color: WHITE }}
              >
                <span className="text-5xl md:text-6xl font-black">
                  100+
                </span>
                <span className="font-mono text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] mt-3 opacity-70">
                  BUILDERS EXPECTED
                </span>
              </HoverLift>
            </RevealItem>
          </div>
        </RevealStagger>
      </div>
    </section>
  );
};

export default About;
