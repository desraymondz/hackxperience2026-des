import { IBM_Plex_Mono, Montserrat } from "next/font/google";

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

export default function TimelineCta() {
  return (
    <section id="join-us" className={`${ibmPlexMono.className} w-full bg-[#d10000] text-white scroll-mt-11`}>
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 py-24 sm:py-32 md:py-40">
        {/* Heading — Montserrat, heavy */}
        <h2
          className={`${montserrat.className} text-center uppercase text-[52px] sm:text-[80px] md:text-[96px] font-extrabold leading-[0.92] tracking-[-0.02em]`}
        >
          OWN THE FUTURE.
        </h2>

        {/* Subtitle — IBM Plex Mono, italic, muted white */}
        <p className="mx-auto mt-6 sm:mt-8 max-w-[520px] text-center italic text-[15px] sm:text-[17px] leading-[1.55] font-normal tracking-[0.02em] text-white/70">
          This is where ambition meets execution. Will you be in the room when
          the next breakthrough happens?
        </p>

        {/* CTA row */}
        <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6">
          {/* Button */}
          <a
            href="https://t.me/+M4VYyn6OxJY0OGI1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#1a1a1a] px-10 sm:px-14 py-5 text-[13px] sm:text-[15px] font-bold tracking-[0.12em] uppercase cursor-pointer shadow-[5px_5px_0_0_rgba(255,255,255,0.25)] hover:brightness-125 active:translate-y-[1px] transition text-center inline-block"
          >
            JOIN TELEGRAM CHANNEL
          </a>

          {/* Right info */}
          <div className="sm:border-l border-white/30 sm:pl-6 text-left">
            <div className="text-[11px] sm:text-[13px] leading-[1.9] font-semibold tracking-[0.10em] uppercase whitespace-nowrap">
              <div>// INSTANT UPDATES</div>
              <div>// EXCLUSIVE RESOURCES</div>
              <div>// DIRECT ACCESS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
