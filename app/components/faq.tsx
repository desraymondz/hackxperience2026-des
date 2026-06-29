"use client";

import { useState, type ReactNode } from "react";
import { IBM_Plex_Mono, Montserrat } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800", "900"],
});

const TELEGRAM_URL = "https://t.me/+M4VYyn6OxJY0OGI1";

const TelegramLink = () => (
  <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[#c00000] underline underline-offset-2 hover:text-[#a00000]">
    Telegram group
  </a>
);

interface FaqItem {
  question: string;
  answer: ReactNode;
}

interface FaqCategory {
  label: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    label: "REGISTRATION",
    items: [
      {
        question: "HOW DO I REGISTER FOR HACKXPERIENCE 2026?",
        answer: <>Registration details will be announced in our <TelegramLink />. Join to be the first to know when registration opens.</>,
      },
      {
        question: "IS THERE A REGISTRATION FEE?",
        answer: "No. HackXperience 2026 is free to participate.",
      },
      {
        question: "WHO IS ELIGIBLE TO PARTICIPATE?",
        answer: "All SIM students are welcome to participate. All years welcome.",
      },
    ],
  },
  {
    label: "PRE-EVENTS",
    items: [
      {
        question: "WHAT ARE THE PRE-EVENTS?",
        answer: (
          <>
            There are two pre-events leading up to the main hackathon:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>IT Club Project Showcase</strong> — 15 April 2026, 12PM–4PM @ SIM Student Hub, Blk B Level 1</li>
              <li><strong>React & Next.js Workshop</strong> — Dates TBA, 7PM–10PM @ SIM Campus</li>
            </ul>
            <span className="block mt-2">Join our <TelegramLink /> for date announcements and updates.</span>
          </>
        ),
      },
      {
        question: "WHAT IS THE PROJECT SHOWCASE?",
        answer: "Our IT Club subcommittees spent months building projects collaboratively. On 15 April, they showcase what they've built. Come get inspiration on what a typical project looks like, and consult with our subcommittees on tech stack, process, tips, and more.",
      },
      {
        question: "WHAT IS THE REACT & NEXT.JS WORKSHOP ABOUT?",
        answer: <>A two-part hands-on workshop taught by our trained committee members. It covers React and Next.js — popular, industry-standard development tools — designed to equip you with web development skills and prepare you for the hackathon. Attendees who complete both sessions will receive a free e-Certificate. More details will be announced in our <TelegramLink />.</>,
      },
      {
        question: "DO I NEED TO ATTEND THE PRE-EVENTS TO JOIN THE HACKATHON?",
        answer: "No, they are not mandatory but highly recommended.",
      },
    ],
  },
  {
    label: "MAIN EVENT",
    items: [
      {
        question: "WHEN AND WHERE IS THE HACKATHON?",
        answer: <>Dates are still tentative, but it will span 2 days on SIM Campus. Stay tuned to our <TelegramLink /> for confirmed dates.</>,
      },
      {
        question: "WHAT ARE THE PROBLEM STATEMENTS?",
        answer: "Problem statements are revealed during the opening ceremony on Day 1.",
      },
      {
        question: "HOW WILL PROJECTS BE JUDGED?",
        answer: "Teams will present their projects to industry judges, followed by the winner announcement at the closing ceremony.",
      },
    ],
  },
  {
    label: "GENERAL",
    items: [
      {
        question: "WHAT IS HACKXPERIENCE?",
        answer: "HackXperience is SIM IT Club's hackathon — a 24-hour challenge with workshops, mentorship, and presentations. In 2025, it brought together 90+ participants across 20 projects and won SIM's Outstanding Event Award (Silver).",
      },
      {
        question: "HOW MANY PARTICIPANTS ARE EXPECTED?",
        answer: "150 students across 30–38 teams.",
      },
      {
        question: "I HAVE MORE QUESTIONS. WHO DO I CONTACT?",
        answer: (
          <>
            Email us at{" "}
            <a href="mailto:it@mymail.sim.edu.sg" className="text-[#c00000] underline underline-offset-2 hover:text-[#a00000]">it@mymail.sim.edu.sg</a>
            , ask in our <TelegramLink />, or PM{" "}
            <a href="https://web.telegram.org/k/#@FukutaroJFS" target="_blank" rel="noopener noreferrer" className="text-[#c00000] underline underline-offset-2 hover:text-[#a00000]">@FukutaroJFS</a>
            {" "}on Telegram.
          </>
        ),
      },
    ],
  },
];

export default function Faq() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <section id="faq" className={`${ibmPlexMono.className} w-full bg-[#f2ede5] py-16 sm:py-24 px-6 sm:px-10 scroll-mt-11`}>
      <div className="mx-auto max-w-4xl">
        <h2 className={`${montserrat.className} text-[28px] sm:text-[36px] md:text-[42px] font-extrabold tracking-tight text-[#1d1c17] mb-10 sm:mb-14`}>
          FAQ_QUERY_MODULE
        </h2>

        <div className="flex flex-col gap-10 sm:gap-12">
          {FAQ_DATA.map((category) => (
            <div key={category.label}>
              <div className="mb-4 sm:mb-5">
                <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.12em] text-[#c00000] uppercase">
                  // {category.label}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {category.items.map((item, i) => {
                  const key = `${category.label}-${i}`;
                  return (
                    <div key={key} className="border border-[#d5d0c8] rounded-sm">
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 cursor-pointer text-left"
                      >
                        <span className="min-w-0 text-[13px] sm:text-[15px] font-semibold tracking-[0.04em] text-[#1d1c17]">
                          &gt; {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 text-[#1d1c17] transition-transform duration-200 ${
                            openKey === key ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openKey === key && (
                        <div className="px-5 sm:px-6 pb-5 text-[13px] sm:text-[14px] leading-[1.7] text-[#1d1c17]/70 tracking-[0.02em]">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
