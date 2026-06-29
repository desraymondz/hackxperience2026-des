import React, { useState, useEffect } from 'react';
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
// import DecryptedTimerText from './ui/DecryptedText';

const Hero: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hrs: 0,
    min: 0,
    sec: 0
  });

  useEffect(() => {
    const targetDate = new Date("May 22, 2026 00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hrs: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          sec: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const RED = "#c00000";
  const DARK_RED = "#A20000";
  const CREAM_BG = "#f2ede5";
  const DARK_TEXT = "#1d1c17";
  const OFF_WHITE = "#fef9f1";

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-6 md:p-12" 
      style={{ backgroundColor: CREAM_BG, fontFamily: 'Montserrat, sans-serif'}}
    >
      
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(${DARK_TEXT} 1px, transparent 1px), linear-gradient(90deg, ${DARK_TEXT} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
      </div>

      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 z-10 pt-10 lg:pt-0">
        
        {/* Left Side: CRT Monitor Box */}
        <div 
          className="relative w-full lg:w-1/2 aspect-video bg-[#1d1c17] border-4 p-2 overflow-hidden group shadow-[8px_8px_0px_#1d1c17]"
          style={{ borderColor: RED }}
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: RED }}></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: RED }}></div>
          
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-screen opacity-50 grayscale" 
          ></div>

          <div className="relative h-full flex flex-col justify-end p-4 md:p-6 bg-linear-to-t from-black/90 to-transparent">
            <div className="font-mono text-[10px] md:text-xs mb-2 animate-pulse tracking-widest" style={{ color: RED }}>
              STATUS: INITIALIZING...
            </div>
            <div className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[0.9] tracking-normal">
              HackXperience<br/>2026
            </div>
          </div>
        </div>

        {/* Right Side: Content & Countdown */}
        <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 flex flex-col items-start text-left">
          
          <div 
            className="inline-block px-3 py-1.5 font-mono uppercase text-[10px] md:text-xs tracking-widest font-bold"
            style={{ backgroundColor: RED, color: OFF_WHITE }}
          >
            // INITIATING HACKXPERIENCE
          </div>
          
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-[0.95] tracking-normal"
            style={{ color: DARK_TEXT }}
          >
            THE ARCHITECTS OF THE <span style={{ color: RED }}>UNDERGROUND</span>
          </h1>

          <div className="pt-2">
              <p 
                className="text-base md:text-xl leading-relaxed opacity-80 font-medium mb-6"
                style={{ color: DARK_TEXT }}
              >
                Be the first to get updates & secure your slot 👀
              </p>

              {/* Buttons */}
              <a 
                  href="https://t.me/+M4VYyn6OxJY0OGI1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <button 
                    className="w-full sm:w-auto px-8 md:px-10 py-4 font-black uppercase text-xs md:text-sm tracking-widest transition-transform active:translate-y-1"
                    style={{ 
                      backgroundColor: RED, 
                      color: OFF_WHITE,
                      boxShadow: `4px 4px 0px ${DARK_TEXT}` // Slightly smaller shadow on mobile
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DARK_RED}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = RED}
                  >
                    join ITClub telegram
                  </button>
              </a>
                
            </div>
          </div>
          
        </div>
      </div>
  );
};

export default Hero;
