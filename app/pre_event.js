const PRE_EVENTS = [
  {
    date: '15 APR 2026',
    time: '12:00 PM - 04:00 PM',
    title: 'PROJECT SHOWCASE',
    meta: 'STUDENT HUB, SIM BLOCK B LEVEL 1',
  },
  {
    date: 'DATES_PENDING',
    time: '07:00 PM - 10:00 PM',
    title: 'REACT & NEXT.JS WORKSHOP',
    meta: 'SIM CAMPUS',
  }
]

const TELEGRAM_LINK = 'https://t.me/+o_3QtjEFmNFhYmFl'

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex items-center gap-3 sm:gap-5 mb-3">
        <div className="flex-1 h-px bg-red-700" />
        <span className="text-base sm:text-xl font-bold tracking-widest text-white whitespace-nowrap font-mono">
          {title}
        </span>
        <div className="flex-1 h-px bg-red-700" />
      </div>

      {subtitle && (
        <p className="text-center text-[10px] sm:text-xs tracking-widest text-gray-400 font-mono mt-2">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function Label({ children }) {
  return (
    <div className="text-red-500 text-[10px] sm:text-xs tracking-widest font-mono mb-1.5">
      {children}
    </div>
  )
}

function Meta({ children }) {
  return (
    <div className="text-gray-400 text-[10px] sm:text-xs tracking-widest font-mono">
      {children}
    </div>
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

  function convert(time) {
    let [t, modifier] = time.split(' ')
    let [hours, minutes] = t.split(':')

    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours) + 12)
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00'
    }

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
  const { start, end } = parseDateTime(date, time)

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}&location=${encodeURIComponent(meta)}`
}

function ActionButton({ href, children }) {
  const cls =
    'cursor-pointer border border-gray-500 text-gray-300 text-[10px] sm:text-xs tracking-widest font-mono px-3 sm:px-5 py-2 hover:border-white hover:text-white transition-all duration-200 inline-flex items-center gap-2'

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  }

  return (
    <button className={cls} disabled>
      {children}
    </button>
  )
}

function PreEventItem({ date, time, title, meta, isLast }) {
  const isPending = date === 'DATES_PENDING'

  const link = isPending
    ? TELEGRAM_LINK
    : buildGoogleCalendarLink({ date, time, title, meta })

  return (
    <div className="flex gap-4 sm:gap-8">
      <div className="flex flex-col items-center w-3 sm:w-4 flex-shrink-0">
        <div
          className="w-3 sm:w-3.5 bg-red-700"
          style={{
            height: 18,
            clipPath:
              'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)',
          }}
        />
        {!isLast && (
          <div className="w-0.5 bg-red-700 flex-1 min-h-14 sm:min-h-16" />
        )}
      </div>

      <div className="flex-1 pb-6 sm:pb-8 pt-0.5">
        <Label>{date}</Label>

        <div className="text-white text-lg sm:text-xl lg:text-2xl font-bold tracking-wider font-mono mb-1.5">
          {title}
        </div>

        {!isPending && (
          <Meta>
            {time} // {meta}
          </Meta>
        )}

        <div className="mt-3 sm:mt-4">
          <ActionButton href={link}>
            <img
              src={isPending ? '/telegram.svg' : '/google_calendar.svg'}
              className="w-4 h-4"
              alt="icon"
            />
            {isPending ? 'GET_NOTIFIED' : 'SET_REMINDER'}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

export default function PreEvent() {
  return (
    <section id="pre-events" className="bg-[#1a1a1a] px-6 md:px-12 pt-14 sm:pt-20 pb-10 font-mono scroll-mt-11">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title="PRE_EVENTS"
          subtitle="// GET INSPIRED> GET SKILLED. GET READY."
        />

        <div className="flex flex-col">
          {PRE_EVENTS.map((event, i) => (
            <PreEventItem
              key={i}
              {...event}
              isLast={i === PRE_EVENTS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}