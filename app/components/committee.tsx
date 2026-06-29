"use client";

import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { HoverScale, RevealItem, RevealStagger } from "./ui/motion-ui";

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

function MemberPhoto({ member }: { member: Member }) {
  const frame = member.frame ?? "full";
  const { scale: frameScale, objectPosition: framePosition } = PHOTO_FRAMES[frame];
  const scale = member.scale ?? frameScale;
  const objectPosition = member.objectPosition ?? framePosition;
  const reduceMotion = useReducedMotion();

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

  if (reduceMotion) {
    return (
      <div className="w-full aspect-[3/4] bg-[#ddd8cf] border border-[#ccc7bd] overflow-hidden">
        {photo}
      </div>
    );
  }

  return (
    <motion.div
      className="w-full aspect-[3/4] bg-[#ddd8cf] border border-[#ccc7bd] overflow-hidden"
      whileHover={{ scale: 1.03, borderColor: "#c00000" }}
      transition={{ type: "spring", stiffness: 380, damping: 20 }}
    >
      <motion.div
        className="w-full h-full"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.35 }}
      >
        {photo}
      </motion.div>
    </motion.div>
  );
}

const TEAMS: Team[] = [
  {
    label: "EXCO TEAM",
    members: [
      { role: "PRESIDENT", name: "JAYADIPA FUKUTARO", img: "/committee/jayadipa-fukutaro.jpg" },
      { role: "VICE PRESIDENT", name: "MICHELLE CHAN", img: "/committee/michelle-chan.jpg" },
      { role: "SECRETARY", name: "REYNALDI ARDIANTO WIYOGO", img: "/committee/reynaldi-ardianto.jpg", frame: "tight" },
      { role: "TECHNICAL DIRECTOR", name: "YAN MEI WONG", img: "/committee/yan-mei-wong.jpg", frame: "tight" },
      { role: "TECHNICAL DIRECTOR", name: "DESMOND", img: "/committee/desmond.jpg" },
      { role: "MARKETING DIRECTOR", name: "VANNESS YANG", img: "/committee/vanness-yang.jpg" },
      { role: "PARTNERSHIPS DIRECTOR", name: "WINSTON FAUSTIN", img: "/committee/winston-faustin.jpg" },
    ],
  },
  {
    label: "DEV TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "LEE HAE EUN CHLOE", img: "/committee/chloe.jpg" },
      { role: "SUBCOMMITTEE", name: "VUN KIAN HIUNG", img: "/committee/vun-kian-hiung.jpg" },
      { role: "SUBCOMMITTEE", name: "MOE PYE SONE", img: "/committee/moe-pye-sone.jpg" },
      { role: "SUBCOMMITTEE", name: "CHUA WEE YEE GERALD", img: "/committee/gerald.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "TAN WEI QUAN", img: "/committee/wei-quan.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "STANLEY LAURENZ", img: "/committee/stanley-laurenz.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "VICKY YANG", img: "/committee/vicky-yang.jpg" },
      { role: "SUBCOMMITTEE", name: "NADON PANWONG", img: "/committee/nadon-panwong.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "AMEER", img: "/committee/ameer.jpg" },
    ],
  },
  {
    label: "MARKETING TEAM",
    members: [
      { role: "SUBCOMMITTEE", name: "TEE YI JUN", img: "/committee/tee-yi-jun.jpg" },
      { role: "SUBCOMMITTEE", name: "NITYASHRI MEKA", img: "/committee/nityashri-meka.jpg" },
      { role: "SUBCOMMITTEE", name: "PAING THIT XAN", img: "/committee/paing-thit-xan.jpg" },
      { role: "SUBCOMMITTEE", name: "SWAMINATHAN SHRAVANTHIGA", img: "/committee/shravanthiga.jpg" },
      { role: "SUBCOMMITTEE", name: "AGRACIA YONG YI XIN", img: "/committee/agracia.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "MANIKANDAN SANJUVIGASINI", img: "/committee/sanju.jpg" },
      { role: "SUBCOMMITTEE", name: "ALBERT LIBRANTONO", img: "/committee/albert.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "KIMBERLY", img: "/committee/kimberly.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "HELEN PRIYATNA", img: "/committee/helen.jpg" },
    ],
  },
  {
    label: "PARTNERSHIP & INNOVATION",
    members: [
      { role: "SUBCOMMITTEE", name: "PHOO PWINT WAI", img: "/committee/phoo-pwint-wai.jpg", frame: "tight", objectPosition: "50% 58%" },
      { role: "SUBCOMMITTEE", name: "SHISA YOSHIHIRO", img: "/committee/shisa-yoshihiro.jpg", scale: 1.85 },
      { role: "SUBCOMMITTEE", name: "EILEEN LEE", img: "/committee/eileen-lee.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "SU YI MAUNG", img: "/committee/su-yi-maung.jpg", scale: 1.85 },
      { role: "SUBCOMMITTEE", name: "KARTHIKEYAN SURESH", img: "/committee/karthik.jpg", frame: "tight" },
      { role: "SUBCOMMITTEE", name: "ANG LIJA", img: "/committee/lija.jpg", frame: "tight" },
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
                    <HoverScale scale={1.02}>
                      <MemberPhoto member={member} />
                      <div className="mt-3 text-[10px] sm:text-[11px] font-bold tracking-[0.10em] text-[#c00000] uppercase">
                        {member.role}
                      </div>
                      <div
                        className={`${montserrat.className} mt-1 text-[13px] sm:text-[15px] font-extrabold tracking-tight text-[#1d1c17] uppercase`}
                      >
                        {member.name}
                      </div>
                    </HoverScale>
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
