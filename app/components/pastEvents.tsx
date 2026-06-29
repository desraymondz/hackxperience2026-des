import React, { useState, useEffect } from 'react';
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { div } from 'framer-motion/client';

const PastEvents: React.FC = () => {
  const [activeYear, setActiveYear] = useState<'2025' | '2024'>('2025');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Color Palette Constants
  const RED = "#c00000";
  const DARK_TEXT = "#1d1c17";
  const CREAM_BG = "#f2ede5";
  const WHITE = "#ffffff";

  const eventData = {
    '2025': {
      title: <>HACK<wbr/><span style={{ color: RED }}>EXPERIENCE</span></>,
      desc: "In 2025, Hackexperience brought together 90+ participants to develop 20 distinct projects within a 24-hour sprint. The event focused on practical execution and collaborative prototyping among students and early-career developers. Our efforts in coordinating this technical exchange were recognized with SIM’s 2025 Outstanding Event Award (Silver).",
      imgs: [
        "PastYear1.jpg",
        "PastYear2.jpg"
      ],
      tag: "PROJECT_LOG_025",
      stats: [
        { label: 'sign ups', value: '120' },
        { label: 'participants', value: '90' },
        { label: 'teams', value: '20' }
      ]
    },
    '2024': {
      title: <>OMNITOOL <span style={{ color: RED }}>HACKATHON</span> 2024</>,
      desc: "Omnitool Hackathon 2024 focused on building versatile utility tools for students. It served as our foundational event, establishing the core community of developers and designers that would go on to build the Architects of the Underground.",
      imgs: [
        "OmniTool1.jpg",
        "OmniTool3.jpg",
        "OmniTool4.jpg",
        "OmniTool5.jpg"
      ], 
      tag: "PROJECT_LOG_024",
      stats: [
        { label: 'sign ups', value: '85' },
        { label: 'participants', value: '60' },
        { label: 'teams', value: '12' }
      ]
    }
  };

  const current = eventData[activeYear];

  // Reset to the first image when the year tab is changed
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeYear]);

  // Carousel Timer Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % eventData[activeYear].imgs.length
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentImageIndex, activeYear]);

  return (
    <div id="past-events" className="scroll-mt-11">
      <div
        className="w-full py-6 border-4 shadow-[6px_6px_0px_#c00000]"
        style={{ backgroundColor: DARK_TEXT, borderColor: DARK_TEXT, fontFamily: 'Montserrat'}}
      >
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-center text-white">
          PAST EVENTS
        </h2>
      </div>

      <section className="py-10 px-6 mx-auto font-sans" style={{ backgroundColor: CREAM_BG, fontFamily: 'Montserrat, sans-serif' }}>

        {/* Tabs / Year Selector */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
          {(['2025', '2024'] as const).map((year) => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className="px-8 py-2 font-mono text-sm uppercase font-bold border-2 transition-transform active:translate-y-1 rounded-full whitespace-nowrap"
              style={{ 
                borderColor: DARK_TEXT,
                backgroundColor: activeYear === year ? RED : WHITE,
                color: activeYear === year ? WHITE : DARK_TEXT,
                boxShadow: activeYear === year ? `0px 0px 0px ${DARK_TEXT}` : `3px 3px 0px ${DARK_TEXT}`
              }}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-10">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
            
            {/* Image Container */}
            <div className="relative w-full lg:w-[40%] shrink-0">
              {/* Brutalist Red Offset Shadow */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 -z-10" style={{ backgroundColor: RED }}></div>
              
              {/* Inner container to hold absolute images and hide overflow */}
              <div className="relative w-full aspect-video border-4 overflow-hidden" style={{ borderColor: DARK_TEXT }}>
                
                {/* Image Stack for Fade Effect */}
                {current.imgs.map((imgSrc, index) => (
                  <img 
                    key={index}
                    src={imgSrc}
                    alt={`${activeYear} Event image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                      index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                ))}

                {/* Dot Overlay Navigation */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
                  {current.imgs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-500 ease-out shadow-[1px_1px_0px_rgba(0,0,0,0.5)] ${
                        index === currentImageIndex 
                          ? 'w-7 bg-white' 
                          : 'w-2.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

            {/* Stats Container */}
            <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-3 gap-6">
              {current.stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="py-10 px-4 border-2 flex flex-col items-center justify-center transition-transform hover:translate-y-1 bg-white"
                  style={{ 
                    borderColor: DARK_TEXT,
                    boxShadow: `4px 4px 0px ${DARK_TEXT}`
                  }}
                >
                  <span className="text-4xl lg:text-5xl xl:text-6xl font-black" style={{ color: DARK_TEXT }}>
                    {stat.value}
                  </span>
                  <span className="font-mono text-xs uppercase font-bold mt-3 text-center" style={{ color: DARK_TEXT }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Section: Branding & Description */}
          <div className="flex flex-col md:flex-row gap-8 items-start pt-6">
            <div className="w-full md:w-[40%] max-w-md space-y-4">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none wrap-break-words" style={{ color: DARK_TEXT }}>
                {current.title}
              </h3>
              <div className="inline-block px-4 py-1 font-mono text-sm font-bold border-2" style={{ borderColor: RED, color: RED }}>
                {current.tag}
              </div>

              {/* View Projects CTA — only 2025 has an archived project gallery */}
              {activeYear === '2025' && (
                <div className="pt-2">
                  <a href="/gallery?year=2025" className="inline-block">
                    <button
                      className="flex items-center gap-2 px-8 py-3 font-black uppercase text-xs tracking-widest transition-transform active:translate-y-1"
                      style={{
                        backgroundColor: RED,
                        color: WHITE,
                        boxShadow: `4px 4px 0px ${DARK_TEXT}`,
                      }}
                    >
                      View Projects
                      <span aria-hidden>&rarr;</span>
                    </button>
                  </a>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-[60%]">
              <p className="text-base sm:text-lg leading-relaxed font-medium" style={{ color: DARK_TEXT }}>
                {current.desc}
              </p>
            </div>
          </div>

        </div>
      </section>
  </div>
  );
};

export default PastEvents;