import React from "react";
import {
  HACKATHON_PRIZES,
  PRIZE_POOL_TOTAL,
  PRIZE_CURRENCY_NOTE,
  type PrizeAward,
} from "@/lib/hackathon-prizes";

const RED = "#c00000";
const DARK_BG = "#1d1c17";
const CREAM_BG = "#f2ede5";
const WHITE = "#ffffff";
const TEXT_DIM = "rgba(255, 255, 255, 0.7)";

function PrizeCard({ award }: { award: PrizeAward }) {
  return (
    <div
      className="p-6 md:p-8"
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
          <div
            key={tier.label}
            className="px-4 py-3 border border-white/15 min-w-[120px]"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: RED }}>
              {tier.label}
            </div>
            <div className="text-2xl md:text-3xl font-black mt-1">{tier.amount}</div>
            {tier.note ? (
              <div className="mt-1 text-[10px] sm:text-xs leading-relaxed opacity-70">{tier.note}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const Prizes: React.FC = () => {
  return (
    <section
      id="prizes"
      className="py-24 px-6 max-w-7xl mx-auto font-sans scroll-mt-11"
      style={{ fontFamily: "Montserrat", backgroundColor: CREAM_BG }}
    >
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
        <p className="text-base sm:text-lg opacity-80 font-medium max-w-3xl" style={{ color: DARK_BG }}>
          Over <strong>{PRIZE_POOL_TOTAL}</strong> in track prizes, sponsor awards, and community votes, across Care Forward, Friction To Flow, and special categories.
        </p>
        <p className="mt-2 font-mono text-[11px] sm:text-xs tracking-widest uppercase opacity-70" style={{ color: DARK_BG }}>
          // {PRIZE_CURRENCY_NOTE}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {HACKATHON_PRIZES.map((award) => (
          <PrizeCard key={award.id} award={award} />
        ))}
      </div>
    </section>
  );
};

export default Prizes;
