"use client"
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import About from "./components/about";
import Tracks from "./components/tracks";
import Prizes from "./components/prizes";
import PastEvents from "./components/pastEvents";
import TimeLine from './timeline'
import PreEvent from './pre_event'
import TimelineCta from "./components/timelineCta";
import Faq from "./components/faq";
import Committee from "./components/committee";
import Footer from "./components/footer";
import SubmitProjectButton from "./components/ui/submit-project-button";
import ScrollToTopButton from "./components/ui/scroll-to-top-button";
import Reveal from "./components/ui/reveal";


export default function Home() {
  return (
    <main className="pt-11">
      <Navbar/>
      <Hero/>
      <Reveal><About/></Reveal>
      <Reveal delay={0.05}><Tracks/></Reveal>
      <Reveal delay={0.05}><Prizes/></Reveal>
      <Reveal delay={0.05}><PastEvents/></Reveal>
      <Reveal delay={0.05}><PreEvent/></Reveal>
      <Reveal delay={0.05} y={48}><TimeLine/></Reveal>
      <Reveal delay={0.05}><Faq/></Reveal>
      <Reveal delay={0.05}><Committee/></Reveal>
      <Reveal delay={0.05} scale={0.95}><TimelineCta/></Reveal>
      <Footer/>

      {/* Floating action stack — Submit CTA sits above the scroll-to-top button */}
      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
        <SubmitProjectButton/>
        <ScrollToTopButton/>
      </div>
    </main>
  )
}
