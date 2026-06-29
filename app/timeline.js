const EVENTS = [
  {
    date: 'DATES_PENDING',
    title: 'REGISTRATION DEADLINE',
    time: '',
    meta: '',
  },
  {
    date: 'DATES_PENDING',
    title: 'OPENING CEREMONY',
    time: '',
    meta: '',
  },
  {
    date: 'DATES_PENDING',
    title: 'HACKING PERIOD',
    time: '',
    meta: '',
  },
  {
    date: 'DATES_PENDING',
    title: 'SUBMISSION DEADLINE',
    time: '',
    meta: '',
  },
  {
    date: 'DATES_PENDING',
    title: 'JUDGING + WINNERS',
    time: '',
    meta: '',
  },
]

const JUDGES = [
  {
    name: 'JUDGE NAME',
    role: 'CHIEF TECHNOLOGY OFFICER',
    company: 'COMPANY NAME',
    bio: 'Industry leader with 10+ years building scalable systems. Passionate about AI and developer tooling.',
    linkedin: '#',
    img: null,
  },
  {
    name: 'JUDGE NAME',
    role: 'SENIOR ENGINEER',
    company: 'COMPANY NAME',
    bio: 'Full-stack engineer and open source contributor. Specialises in distributed systems and cloud architecture.',
    linkedin: '#',
    img: null,
  },
  {
    name: 'JUDGE NAME',
    role: 'PRODUCT MANAGER',
    company: 'COMPANY NAME',
    bio: 'Led product at multiple startups from zero to scale. Focused on developer experience and growth.',
    linkedin: '#',
    img: null,
  },
]

const SPONSORS = [
  { name: 'GOLD SPONSOR', tier: 'gold', img: null },
  { name: 'GOLD SPONSOR', tier: 'gold', img: null },
  { name: 'SILVER SPONSOR', tier: 'silver', img: null },
  { name: 'SILVER SPONSOR', tier: 'silver', img: null },
  { name: 'SILVER SPONSOR', tier: 'silver', img: null },
  { name: 'BRONZE SPONSOR', tier: 'bronze', img: null },
  { name: 'BRONZE SPONSOR', tier: 'bronze', img: null },
  { name: 'BRONZE SPONSOR', tier: 'bronze', img: null },
]

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-3 sm:gap-5 mb-3">
        <div className="flex-1 h-px bg-red-700" />
        <span className="text-xs sm:text-base md:text-xl font-bold tracking-widest text-white whitespace-nowrap font-mono">
          {title}
        </span>
        <div className="flex-1 h-px bg-red-700" />
      </div>
      {subtitle && (
        <p className="text-center text-xs tracking-widest text-gray-400 font-mono mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function Label({ children }) {
  return (
    <div className="text-red-500 text-xs tracking-widest font-mono mb-1.5">
      {children}
    </div>
  )
}

function Meta({ children }) {
  return (
    <div className="text-gray-400 text-xs tracking-widest font-mono">
      {children}
    </div>
  )
}

function ActionButton({ href, children }) {
  const cls =
    "cursor-pointer border border-gray-500 text-gray-300 text-xs tracking-widest font-mono px-4 sm:px-5 py-2 hover:border-white hover:text-white transition-all duration-200 inline-flex items-center gap-2"

  if (!href || href === '#') return null

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  )
}

function parseDateTime(dateStr, timeStr) {
  const monthMap = {
    JAN: '01',
    FEB: '02',
    MAR: '03',
    APR: '04',
    MAY: '05',
    JUN: '06',
    JUL: '07',
    AUG: '08',
    SEP: '09',
    OCT: '10',
    NOV: '11',
    DEC: '12',
  }

  const [day, mon, year] = dateStr.split(' ')
  const [startTime, endTime] = timeStr.split(' - ')

  function convert(t) {
    let [time, modifier] = t.split(' ')
    let [hours, minutes] = time.split(':')

    if (modifier === 'PM' && hours !== '12') hours = String(+hours + 12)
    if (modifier === 'AM' && hours === '12') hours = '00'

    return `${year}${monthMap[mon]}${day.padStart(2, '0')}T${hours.padStart(
      2,
      '0'
    )}${minutes}00`
  }

  return {
    start: convert(startTime),
    end: convert(endTime),
  }
}

function buildGoogleCalendarLink({ title, date, time, meta }) {
  if (!time || !date || date === 'DATES_PENDING') return '#'

  const { start, end } = parseDateTime(date, time)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}&location=${encodeURIComponent(meta)}`
}

function TimelineItem({ date, title, time, meta, isLast }) {
  const isPending = date === 'DATES_PENDING'

  const calendarLink = !isPending
    ? buildGoogleCalendarLink({ title, date, time, meta })
    : null

  return (
    <div className="flex gap-4 sm:gap-8">
      <div className="flex flex-col items-center w-4 flex-shrink-0">
        <div
          className="w-3.5 bg-red-700"
          style={{
            height: 18,
            clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)',
          }}
        />
        {!isLast && <div className="w-0.5 bg-red-700 flex-1 min-h-12" />}
      </div>

      <div className="flex-1 pb-8 sm:pb-10 pt-0.5">
        <Label>{date}</Label>

        <div className="text-white text-base sm:text-xl font-bold tracking-wider font-mono mb-1.5">
          {title}
        </div>

        {!isPending && time && <Meta>{time} // {meta}</Meta>}

        {!isPending && (
          <div className="mt-4">
            <ActionButton href={calendarLink}>
              <span className="flex items-center gap-2">
                <img src="/google_calendar.svg" className="w-4 h-4" />
                SET_REMINDER
              </span>
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  )
}

function JudgeRow({ name, role, company, bio, linkedin, img, isLast }) {
  return (
    <div className="flex gap-4 sm:gap-8">
      <div className="flex flex-col items-center w-4 flex-shrink-0">
        <div className="w-3.5 flex-shrink-0 bg-gray-600" style={{ height: 18, clipPath: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)' }} />
        {!isLast && <div className="w-0.5 bg-gray-700 flex-1 min-h-20" />}
      </div>
      <div className="flex-1 pb-12 sm:pb-16 pt-1">
        <div className="flex gap-4 sm:gap-8 md:gap-10 items-start">
          <div className="flex-shrink-0 overflow-hidden bg-gray-800 border border-gray-700 rounded-xl w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 flex items-center justify-center">
            {img ? (
              <img src={img} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500 text-xs font-mono">IMG</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label>{role}</Label>
            <div className="text-white text-lg sm:text-2xl md:text-3xl font-bold tracking-wider font-mono mb-1 leading-tight">{name}</div>
            <Meta>{company}</Meta>
            <div className="border-t border-gray-700 my-4 sm:my-5" />
            <p className="text-gray-400 text-xs sm:text-sm tracking-wide leading-relaxed font-mono mb-5">{bio}</p>
            {linkedin && <ActionButton href={linkedin}>LINKEDIN ↗</ActionButton>}
          </div>
        </div>
      </div>
    </div>
  )
}

function SponsorRow({ tier, sponsors }) {
  const tierMeta = {
    gold:   { label: 'GOLD TIER',   sub: '// PRINCIPAL SPONSORS' },
    silver: { label: 'SILVER TIER', sub: '// SUPPORTING SPONSORS' },
    bronze: { label: 'BRONZE TIER', sub: '// COMMUNITY PARTNERS' },
  }
  const { label, sub } = tierMeta[tier]
  const cardHeight = tier === 'gold' ? 'h-20 sm:h-24 md:h-28' : tier === 'silver' ? 'h-16 sm:h-20 md:h-24' : 'h-14 sm:h-16 md:h-20'

  return (
    <div className="mb-10 sm:mb-14 last:mb-0">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-8">
        <div className="flex-shrink-0 sm:w-36">
          <Label>{label}</Label>
          <Meta>{sub}</Meta>
        </div>
        <div className="flex-1 flex flex-wrap gap-3">
          {sponsors.map((s, i) => (
            <div
              key={i}
              className={`flex-1 min-w-20 border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors duration-200 ${cardHeight}`}
            >
              {s.img ? (
                <img src={s.img} alt={s.name} className="object-contain grayscale brightness-75 hover:brightness-100 transition-all duration-200 max-w-16 sm:max-w-24 max-h-8 sm:max-h-10" />
              ) : (
                <div className="text-gray-300 text-xs sm:text-sm font-bold tracking-wider font-mono text-center px-2">{s.name}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TimeLine() {
  const gold   = SPONSORS.filter(s => s.tier === 'gold')
  const silver = SPONSORS.filter(s => s.tier === 'silver')
  const bronze = SPONSORS.filter(s => s.tier === 'bronze')

  return (
    <section id="timeline" className="bg-[#1a1a1a] px-6 md:px-12 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 font-mono scroll-mt-11">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="HACKATHON_TIMELINE"
          subtitle="// DATES AND VENUE UNDER CONFIRMATION. // FULL SCHEDULE DROPS ONCE LOCKED IN."
        />

        <div className="flex flex-col">
          {EVENTS.map((event, i) => (
            <TimelineItem
              key={i}
              {...event}
              isLast={i === EVENTS.length - 1}
            />
          ))}
        </div>

        {/* <SectionHeader title="JUDGES_AND_MENTORS" subtitle="// INDUSTRY EXPERTS EVALUATING YOUR WORK" />
        <div className="flex flex-col">
          {JUDGES.map((judge, i) => (
            <JudgeRow key={i} {...judge} isLast={i === JUDGES.length - 1} />
          ))}
        </div>

        <SectionHeader title="SPONSORS_AND_PARTNERS" subtitle="// ORGANISATIONS MAKING THIS POSSIBLE" />
        {gold.length   > 0 && <SponsorRow tier="gold"   sponsors={gold}   />}
        {silver.length > 0 && <SponsorRow tier="silver" sponsors={silver} />}
        {bronze.length > 0 && <SponsorRow tier="bronze" sponsors={bronze} />} */}

        <div className="w-full h-px bg-red-700 mt-12 sm:mt-20 mb-8 sm:mb-16" />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 py-6 sm:py-8">
          <div className="flex-shrink-0 sm:w-36">
            <Label>ENQUIRIES</Label>
            <Meta>// SPONSORSHIP</Meta>
          </div>
          <div className="flex-1">
            <div className="text-white text-lg sm:text-2xl font-bold tracking-wider font-mono mb-2 sm:mb-3">
              BECOME A SPONSOR
            </div>

            <Meta>
              INTERESTED IN SUPPORTING THE NEXT GENERATION OF BUILDERS?
              <br />
              Get in touch at{' '}
              <a
                href="mailto:it@mymail.sim.edu.sg"
                className="underline text-white"
              >
                it@mymail.sim.edu.sg
              </a>
            </Meta>
          </div>
        </div>
      </div>
    </section>
  )
}