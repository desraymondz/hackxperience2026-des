"use client";

import { useRef, useState, type MouseEvent } from "react";
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { useReducedMotion } from "framer-motion";
import { RevealItem, RevealStagger } from "./ui/motion-ui";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

interface Member {
  role: string;
  name: string;
  img: string | null;
  linkedinUrl?: string;
  frame?: "full" | "medium" | "tight";
  scale?: number;
  objectPosition?: string;
}

interface Team {
  label: string;
  members: Member[];
}

const PHOTO_FRAMES = {
  full: { scale: 1.72, objectPosition: "50% 36%" },
  medium: { scale: 1.1, objectPosition: "50% 42%" },
  tight: { scale: 1, objectPosition: "50% 46%" },
} as const;

function LinkedInButton({ member }: { member: Member }) {
  const href = member.linkedinUrl?.trim();
  if (!href) return null;

  return (
    <div
      className="absolute bottom-2 right-2 z-20 pointer-events-auto"
      style={{ transform: "translateZ(30px)" }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[2rem] h-[2rem] sm:w-[2.2rem] sm:h-[2.2rem] bg-[#f2ede5] rounded-full flex justify-center items-center relative z-10 border-[1.5px] border-[#1d1c17] overflow-hidden group shadow-md"
        aria-label={`${member.name} LinkedIn`}
      >
        <div className="absolute inset-0 w-full h-full bg-[#0077b5] scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
        <span className="text-[1rem] text-[#1d1c17] transition-all duration-500 ease-in-out z-[2] group-hover:text-white group-hover:rotate-[360deg]">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[1em] h-[1em] fill-current">
            <path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 9.89H5.65V18H8.34V9.89ZM6.99 5.6A1.56 1.56 0 1 0 6.99 8.72A1.56 1.56 0 0 0 6.99 5.6ZM18 13.34C18 10.89 16.69 9.74 14.95 9.74C13.54 9.74 12.91 10.52 12.55 11.07V9.89H9.86V18H12.55V13.98C12.55 12.92 12.75 11.9 14.07 11.9C15.37 11.9 15.39 13.12 15.39 14.05V18H18V13.34Z" />
          </svg>
        </span>
      </a>
    </div>
  );
}

function MemberPhoto({ member }: { member: Member }) {
  const frame = member.frame ?? "full";
  const { scale: frameScale, objectPosition: framePosition } = PHOTO_FRAMES[frame];
  const scale = member.scale ?? frameScale;
  const objectPosition = member.objectPosition ?? framePosition;
  const photo = member.img ? (
    <img
      src={member.img}
      alt={member.name}
      className="w-full h-full object-cover transition-transform duration-300"
      style={{
        objectPosition,
        transform: `scale(${scale})`,
        transformOrigin: objectPosition,
      }}
    />
  ) : null;

  return (
    <div className="w-full aspect-[3/4] bg-[#ddd8cf] border border-[#ccc7bd] overflow-hidden relative [transform-style:preserve-3d]">
      {photo}
      <LinkedInButton member={member} />
    </div>
  );
}

function Member3DCard({ member }: { member: Member }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltSurfaceRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;

    const rect = (tiltSurfaceRef.current ?? cardRef.current).getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 9;

    setRotateX(((centerY - y) / centerY) * maxTilt);
    setRotateY(((x - centerX) / centerX) * maxTilt);
  };

  const handleMouseEnter = () => {
    if (reduceMotion) return;
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className="w-full"
      style={{ perspective: "1000px" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
    >
      <div
        className="transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovering ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
        }}
      >
        <div ref={tiltSurfaceRef}>
          <MemberPhoto member={member} />
        </div>
        <div
          className="mt-3 text-[10px] sm:text-[11px] font-bold tracking-[0.10em] text-[#c00000] uppercase"
          style={{ transform: "translateZ(20px)" }}
        >
          {member.role}
        </div>
        <div
          className={`${montserrat.className} mt-1 text-[13px] sm:text-[15px] font-extrabold tracking-tight text-[#1d1c17] uppercase`}
          style={{ transform: "translateZ(20px)" }}
        >
          {member.name}
        </div>
      </div>
    </div>
  );
}

const TEAMS: Team[] = [
  {
    label: "EXCO TEAM",
    members: [
      { role: "PRESIDENT", name: "JAYADIPA FUKUTARO", img: "/committee/jayadipa-fukutaro.jpg", linkedinUrl: "https://www.linkedin.com/in/fukutaro/" },
      { role: "VICE PRESIDENT", name: "MICHELLE CHAN", img: "/committee/michelle-chan.jpg", linkedinUrl: "https://www.linkedin.com/in/mchellechan/" },
      { role: "SECRETARY", name: "REYNALDI ARDIANTO WIYOGO", img: "/committee/reynaldi-ardianto.jpg", linkedinUrl: "https://www.linkedin.com/in/reynaldi-ardianto-wiyogo/", frame: "tight" },
      { role: "TECHNICAL DIRECTOR", name: "YAN MEI WONG", img: "/committee/yan-mei-wong.jpg", linkedinUrl: "https://www.linkedin.com/in/wong-yan-mei888/", frame: "tight" },
      { role: "TECHNICAL DIRECTOR", name: "DESMOND", img: "/committee/desmond.jpg", linkedinUrl: "https://www.linkedin.com/in/desmond05/" },
      { role: "MARKETING DIRECTOR", name: "VANNESS YANG", img: "/committee/vanness-yang.jpg", linkedinUrl: "https://www.linkedin.com/in/vanness-yang-53bb31293/" },
      { role: "PARTNERSHIPS DIRECTOR", name: "WINSTON FAUSTIN", img: "/committee/winston-faustin.jpg", linkedinUrl: "https://www.linkedin.com/in/winstonfaustin/" },
    ],
  },
  {
    label: "DEV TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "LEE HAE EUN CHLOE", img: "/committee/chloe.jpg", linkedinUrl: "https://www.linkedin.com/in/hae-eun-lee-169baa2b2/" },
      { role: "SUBCOMMITTEE", name: "ALEX VUN", img: "/committee/alex-vun.jpg", linkedinUrl: "https://www.linkedin.com/in/alexvun/" },
      { role: "SUBCOMMITTEE", name: "MOE PYE SONE", img: "/committee/moe-pye-sone.jpg", linkedinUrl: "https://www.linkedin.com/in/moecrosoft/" },
      { role: "SUBCOMMITTEE", name: "CHUA WEE YEE GERALD", img: "/committee/gerald.jpg", linkedinUrl: "", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "TAN WEI QUAN", img: "/committee/wei-quan.jpg", linkedinUrl: "", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "STANLEY LAURENZ", img: "/committee/stanley-laurenz.jpg", linkedinUrl: "https://www.linkedin.com/in/stanleylaurenz/", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "VICKY YANG", img: "/committee/vicky-yang.jpg", linkedinUrl: "https://www.linkedin.com/in/vicky-yang-344845248/" },
      { role: "SUBCOMMITTEE", name: "NADON PANWONG", img: "/committee/nadon-panwong.jpg", linkedinUrl: "https://www.linkedin.com/in/nadon-panwong-9a4646364/", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "AMEER", img: "/committee/ameer.jpg", linkedinUrl: "https://www.linkedin.com/in/mohamed-ameerrr/" },
    ],
  },
  {
    label: "MARKETING TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "TEE YI JUN", img: "/committee/tee-yi-jun.jpg", linkedinUrl: "" },
      { role: "SUBCOMMITTEE", name: "NITYASHRI MEKA", img: "/committee/nityashri-meka.jpg", linkedinUrl: "https://www.linkedin.com/in/nityashrimeka04/" },
      { role: "SUBCOMMITTEE", name: "PAING THIT XAN", img: "/committee/paing-thit-xan.jpg", linkedinUrl: "https://www.linkedin.com/in/paingthitxan/" },
      { role: "SUBCOMMITTEE", name: "SWAMINATHAN SHRAVANTHIGA", img: "/committee/shravanthiga.jpg", linkedinUrl: "https://www.linkedin.com/in/shravanthiga-swaminathan/" },
      { role: "SUBCOMMITTEE", name: "AGRACIA YONG YI XIN", img: "/committee/agracia.jpg", linkedinUrl: "https://www.linkedin.com/in/agracia-yong-2355751a7/", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "MANIKANDAN SANJUVIGASINI", img: "/committee/sanju.jpg", linkedinUrl: "" },
      { role: "SUBCOMMITTEE", name: "ALBERT LIBRANTONO", img: "/committee/albert.jpg", linkedinUrl: "https://www.linkedin.com/in/albert-librantono/", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "KIMBERLY", img: "/committee/kimberly.jpg", linkedinUrl: "https://www.linkedin.com/in/kimberly-goh-k/", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "HELEN PRIYATNA", img: "/committee/helen.jpg", linkedinUrl: "https://www.linkedin.com/in/helen-priyatna-260393376/" },
    ],
  },
  {
    label: "PARTNERSHIP & INNOVATION",
    members: [
      { role: "SUBCOMMITTEE", name: "PHOO PWINT WAI", img: "/committee/phoo-pwint-wai.jpg", linkedinUrl: "https://www.linkedin.com/in/phoo-pwint-wai-80794b347/", frame: "tight", objectPosition: "50% 58%" },
      { role: "SUBCOMMITTEE", name: "SHISA YOSHIHIRO", img: "/committee/shisa-yoshihiro.jpg", linkedinUrl: "https://www.linkedin.com/in/shisayoshihiro/", scale: 1.85 },
      { role: "SUBCOMMITTEE", name: "EILEEN LEE", img: "/committee/eileen-lee.jpg", linkedinUrl: "", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "SU YI MAUNG", img: "/committee/su-yi-maung.jpg", linkedinUrl: "", scale: 1.85 },
      { role: "SUBCOMMITTEE", name: "KARTHIKEYAN SURESH", img: "/committee/karthik.jpg", linkedinUrl: "", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "ANG LIJA", img: "/committee/lija.jpg", linkedinUrl: "https://www.linkedin.com/in/lijaang/", frame: "tight" },
    ],
  },
];

export default function Committee() {
  return (
    <section
      id="organise-members"
      className={`${ibmPlexMono.className} w-full bg-[#f2ede5] px-6 sm:px-10 md:px-14 py-16 sm:py-24 scroll-mt-11`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-6 mb-10 sm:mb-14">
          <h2
            className={`${montserrat.className} text-[26px] sm:text-[34px] md:text-[40px] font-extrabold tracking-tight text-[#1d1c17] uppercase whitespace-nowrap`}
          >
            ORGANIZING COMMITTEE
          </h2>
          <div className="flex-1 h-px bg-[#c5bfb5]" />
        </div>

        <div className="space-y-12 sm:space-y-16">
          {TEAMS.map((team) => (
            <div key={team.label}>
              <RevealItem>
                <div className="mb-6 sm:mb-8">
                  <span className="px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-bold tracking-[0.10em] uppercase bg-[#1d1c17] text-white border border-[#1d1c17] inline-block">
                    {team.label}
                  </span>
                </div>
              </RevealItem>

              <RevealStagger
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4 sm:gap-5"
                stagger={0.04}
              >
                {team.members.map((member, i) => (
                  <RevealItem key={`${team.label}-${i}`}>
                    <Member3DCard member={member} />
                  </RevealItem>
                ))}
              </RevealStagger>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
