import { IBM_Plex_Mono, Montserrat } from "next/font/google";

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
}

interface Team {
  label: string;
  members: Member[];
}

const TEAMS: Team[] = [
  {
    label: "EXCO TEAM",
    members: [
      { role: "PRESIDENT", name: "JAYADIPA FUKUTARO", img: null },
      { role: "VICE PRESIDENT", name: "MICHELLE CHAN", img: null },
      { role: "SECRETARY", name: "REYNALDI ARDIANTO WIYOGO", img: null },
      { role: "TECHNICAL DIRECTOR", name: "YAN MEI WONG", img: null },
      { role: "TECHNICAL DIRECTOR", name: "DESMOND", img: null },
      { role: "MARKETING DIRECTOR", name: "VANNESS YANG", img: null },
      { role: "PARTNERSHIPS DIRECTOR", name: "WINSTON FAUSTIN", img: null },
    ],
  },
  {
    label: "DEV TEAM",
    members: [
      { role: "MEMBER", name: "LEE HAE EUN CHLOE", img: null },
      { role: "MEMBER", name: "VUN KIAN HIUNG", img: null },
      { role: "MEMBER", name: "MOE PYE SONE", img: null },
      { role: "MEMBER", name: "CHUA WEE YEE GERALD", img: null },
      { role: "MEMBER", name: "TAN WEI QUAN", img: null },
      { role: "MEMBER", name: "STANLEY LAURENZ", img: null },
      { role: "MEMBER", name: "VICKY YANG", img: null },
      { role: "MEMBER", name: "NADON PANWONG", img: null },
    ],
  },
  {
    label: "MARKETING TEAM",
    members: [
      { role: "MEMBER", name: "TEE YI JUN", img: null },
      { role: "MEMBER", name: "NITYASHRI MEKA", img: null },
      { role: "MEMBER", name: "PAING THIT XAN", img: null },
      { role: "MEMBER", name: "SWAMINATHAN SHRAVANTHIGA", img: null },
      { role: "MEMBER", name: "AGRACIA YONG YI XIN", img: null },
      { role: "MEMBER", name: "MANIKANDAN SANJUVIGASINI", img: null },
      { role: "MEMBER", name: "ALBERT LIBRANTONO", img: null },
      { role: "MEMBER", name: "KIMBERLY", img: null },
    ],
  },
  {
    label: "PARTNERSHIP & INNOVATION",
    members: [
      { role: "MEMBER", name: "PHOO PWINT WAI", img: null },
      { role: "MEMBER", name: "SHISA YOSHIHIRO", img: null },
      { role: "MEMBER", name: "EILEEN LEE", img: null },
      { role: "MEMBER", name: "SU YI MAUNG", img: null },
      { role: "MEMBER", name: "KARTHIKEYAN SURESH", img: null },
      { role: "MEMBER", name: "ANG LIJA", img: null },
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
        <div className="w-full h-px bg-[#c5bfb5] mb-16 sm:mb-24" />

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
              <div className="mb-6 sm:mb-8">
                <span className="px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-bold tracking-[0.10em] uppercase bg-[#1d1c17] text-white border border-[#1d1c17] inline-block">
                  {team.label}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4 sm:gap-5">
                {team.members.map((member, i) => (
                  <div key={`${team.label}-${i}`}>
                    <div className="w-full aspect-[3/4] bg-[#ddd8cf] border border-[#ccc7bd] flex items-center justify-center">
                      {member.img ? (
                        <img
                          src={member.img}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="mt-3 text-[10px] sm:text-[11px] font-bold tracking-[0.10em] text-[#c00000] uppercase">
                      {member.role}
                    </div>
                    <div
                      className={`${montserrat.className} mt-1 text-[13px] sm:text-[15px] font-extrabold tracking-tight text-[#1d1c17] uppercase`}
                    >
                      {member.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
