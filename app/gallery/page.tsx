"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import type { Project } from '@/lib/types';
import { mockProjects } from '@/lib/mock';
import { supabaseBrowser } from '../../lib/supabase-browser';
import { IBM_Plex_Mono, Montserrat } from "next/font/google";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Trophy, Medal, Star, Loader2 } from 'lucide-react';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const RED = "#c00000";
const DARK_TEXT = "#1d1c17";
const CREAM_BG = "#f2ede5";
const WHITE = "#ffffff";

const ITEMS_PER_PAGE = 6;

// Static 2025 showcase — the projects teams shipped at HackXperience 2025.
// These are always shown in the gallery (merged with any DB rows below).
const SHOWCASE_2025: Project[] = [
  {
    id: 's1',
    title: 'Kitchen CoPilot: Dine & Dash',
    teamName: 'CodeWave',
    description:
      'A highly interactive, gamified version of the Kitchen CoPilot app designed to make cooking feel like a game rather than a chore.',
    longDescription:
      'A highly interactive, gamified version of the Kitchen CoPilot app designed to make cooking feel like a game rather than a chore.\n\nKey Features: Players complete fun challenges and mini-games to unlock real-life recipes. As users progress, they level up their cooking skills and discover new cuisines accompanied by step-by-step guides. The app is built to promote home-cooked meals, encourage healthier eating habits through curated recipes, and support specific dietary goals like weight loss or low-sodium diets.',
    image:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200',
    year: '2025',
    tags: ['React Native', 'Firebase', 'TypeScript'],
    features: [
      'Complete fun challenges and mini-games to unlock real-life recipes',
      'Level up cooking skills and discover new cuisines with step-by-step guides',
      'Promotes home-cooked meals and healthier eating via curated recipes',
      'Supports dietary goals like weight loss or low-sodium diets',
    ],
    createdAt: '2025-05-22T10:00:00Z',
  },
  {
    id: 's2',
    title: 'Smart Gifter',
    teamName: 'HackerX',
    description:
      'An AI-powered platform designed to take the guesswork and stress out of gift-giving.',
    longDescription:
      'An AI-powered platform designed to take the guesswork and stress out of gift-giving.\n\nKey Features: Smart Gifter introduces collaborative gifting pools where groups can chat and decide on gifts together. It features an auto-deducting digital wallet system for recurring events and a community media feed where givers can post videos and track real-time unboxing excitement. The platform utilizes AI to scan retailers for the best deals, analyze user profiles for personalized gift suggestions, and even act as an "Agentic Support" to moderate group discussions and propose gift compromises.',
    image:
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=1200',
    year: '2025',
    tags: ['Next.js', 'OpenAI API', 'Stripe', 'Tailwind'],
    features: [
      'Collaborative gifting pools where groups chat and decide together',
      'Auto-deducting digital wallet for recurring events',
      'Community media feed to post videos and track real-time unboxing',
      'AI scans retailers for the best deals and personalizes suggestions',
      '“Agentic Support” moderates group chats and proposes gift compromises',
    ],
    createdAt: '2025-05-22T11:00:00Z',
  },
  {
    id: 's3',
    title: 'KitchenKonnet',
    teamName: 'Lucky7',
    description:
      'A social networking and utility app built to help people share recipes, track their health, and build a vibrant cooking community.',
    longDescription:
      'A social networking and utility app built to help people share recipes, track their health, and build a vibrant cooking community.\n\nKey Features: Users can join communities, post recipes with photos, and interact by liking and saving other people’s posts. The app includes gamified elements like All-Time and Weekly Leaderboards. On the utility side, it features an automatic shopping list generator and robust health-conscious tools, including an AI feature that generates nutritional ratings and tracks calories simply by having the user upload a photo of their meal.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200',
    year: '2025',
    tags: ['React', 'Supabase', 'TensorFlow'],
    features: [
      'Join communities and post recipes with photos',
      'Like and save other people’s posts',
      'Gamified All-Time and Weekly leaderboards',
      'Automatic shopping list generator',
      'AI nutritional ratings & calorie tracking from a meal photo',
    ],
    createdAt: '2025-05-22T12:00:00Z',
  },
  {
    id: 's4',
    title: 'Kitchen Copilot: Final Boss',
    teamName: 'Powerpuff Girls',
    description:
      'An engaging, feature-rich expansion to the Kitchen Copilot ecosystem that introduces travel-based gamification, strict dietary personalization, and social rating systems.',
    longDescription:
      'An engaging, feature-rich expansion to the Kitchen Copilot ecosystem that introduces travel-based gamification, strict dietary personalization, and social rating systems.\n\nKey Features: The "World Journey" feature allows users to earn points by completing daily health challenges (like drinking water) to unlock new cities—such as Tokyo or Rome—and their local recipes. It includes a smart AI Chatbot backed by the Health Promotion Board’s data to answer nutritional questions and provide portion guidance. Finally, the "Cook To Impress" social feed lets users upload homemade meals so friends can rate their dishes from 1 to 5 stars, adding a fun competitive element.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
    year: '2025',
    tags: ['Flutter', 'Node.js', 'OpenAI API'],
    features: [
      '“World Journey”: earn points from daily health challenges to unlock cities & local recipes',
      'Smart AI chatbot backed by Health Promotion Board data for nutrition guidance',
      '“Cook To Impress” social feed with 1–5 star dish ratings',
    ],
    createdAt: '2025-05-22T13:00:00Z',
  },
  {
    id: 's5',
    title: 'Smart Kitchen Hub',
    teamName: 'Group 8888',
    description:
      'A utility and engagement add-on aimed at boosting app adoption by making the kitchen more interactive and organized.',
    longDescription:
      'A utility and engagement add-on aimed at boosting app adoption by making the kitchen more interactive and organized.\n\nKey Features: Introduces a "Smart Fridge Inventory & Alarm" system that allows users to easily track their ingredients and receive expiry alerts, promoting organized and healthy cooking. To boost engagement, it incorporates gamification via a "Blind Box" feature, a community feed, a built-in timer, and a calorie counter for health-conscious users.',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&q=80&w=1200',
    year: '2025',
    tags: ['React', 'Tailwind', 'Node.js'],
    features: [
      '“Smart Fridge Inventory & Alarm” with ingredient tracking and expiry alerts',
      'Gamified “Blind Box” feature to boost engagement',
      'Community feed, built-in timer, and calorie counter',
    ],
    createdAt: '2025-05-22T14:00:00Z',
  },
];

const RankBadge = ({ rank, size = 'sm' }: { rank: Project['rank'], size?: 'sm' | 'lg' }) => {
  if (!rank) return null;

  const config = {
    WINNER: { label: 'CHAMPION', color: '#c00000', icon: Trophy },
    RUNNER_UP: { label: '1ST_RUNNER_UP', color: '#1d1c17', icon: Medal },
    SECOND_RUNNER_UP: { label: '2ND_RUNNER_UP', color: '#1d1c17', icon: Medal },
    SPECIAL_MENTION: { label: 'SPECIAL_MENTION', color: '#1d1c17', icon: Star },
  };

  // Safe access for dynamic ranks
  const rankKey = rank as keyof typeof config;
  if (!config[rankKey]) return null;

  const { label, color, icon: Icon } = config[rankKey];

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-3 bg-white border-4 border-[#1d1c17] px-6 py-3 mb-6" style={{ boxShadow: `6px 6px 0px ${color}` }}>
        <Icon className="w-6 h-6" style={{ color }} />
        <span className="font-mono text-sm font-black uppercase tracking-tighter">{label}</span>
      </div>
    );
  }

  return (
    <div 
      className="absolute -top-3 -right-3 z-20 bg-white border-2 border-[#1d1c17] p-2 flex items-center justify-center"
      style={{ boxShadow: `3px 3px 0px ${color}` }}
      title={label}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
  );
};

export default function GalleryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState<'ALL' | '2025' | '2026'>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Honour a ?year= deep link (e.g. the "View Projects" button on the landing
  // page links to /gallery?year=2025 to open straight on that tab).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('year');
    if (param === '2025' || param === '2026') {
      setActiveYear(param);
    }
  }, []);

  // Fetch Projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        // Reads the safe `public_projects` view (approved rows, no PII), not the
        // base `submissions` table — the anon key has no access to that table.
        const { data, error } = await supabaseBrowser
          .from('public_projects')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedProjects: Project[] = data.map(item => ({
            id: item.id,
            title: item.project_name,
            description: item.description,
            longDescription: item.pitch,
            image: item.thumbnail_url || '/next.svg',
            year: item.year || '2025', // Fallback to current year if not present
            teamName: item.team_id,
            tags: item.tech_stack || [],
            links: {
              github: item.github_repo_url,
              demo: item.live_demo_url
            },
            rank: item.rank || null,
            createdAt: item.submitted_at
          }));
          setProjects([...SHOWCASE_2025, ...mappedProjects]);
        } else {
          // No DB rows yet — still show the static 2025 showcase.
          setProjects(SHOWCASE_2025);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects(SHOWCASE_2025); // Fallback to the static showcase on error
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Filter and Sort Projects (Alphabetical by default)
  const processedProjects = useMemo(() => {
    let result = [...projects];

    // Filter by Year
    if (activeYear !== 'ALL') {
      result = result.filter(p => p.year === activeYear);
    }

    // Filter by Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.teamName.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Default Alphabetical Sort
    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [projects, activeYear, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(processedProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = processedProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeYear, searchQuery]);

  return (
    <main className={`pt-11 min-h-screen ${montserrat.className}`} style={{ backgroundColor: CREAM_BG }}>
      <Navbar />
      
      {/* Header Section */}
      <div 
        className="w-full py-12 border-b-4 shadow-[0px_4px_0px_#c00000] relative z-10" 
        style={{ backgroundColor: DARK_TEXT, borderColor: DARK_TEXT }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            PROJECT <span style={{ color: RED }}>GALLERY</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto font-mono text-sm uppercase">
            EXPLORING THE ARCHIVE OF INNOVATION: FROM PROTOTYPES TO SOLUTIONS.
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="sticky top-11 z-20 bg-[#f2ede5]/95 backdrop-blur-sm py-6 border-b-2 border-[#1d1c17]/10">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Top Controls: Search Bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-between">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1d1c17]/40" />
              <input 
                type="text"
                placeholder="SEARCH_BY_TITLE_TEAM_OR_TAG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#1d1c17] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c00000] transition-all"
                style={{ boxShadow: `4px 4px 0px ${DARK_TEXT}` }}
              />
            </div>
          </div>

          {/* Bottom Controls: Year Filters */}
          <div className="flex flex-wrap gap-3 items-center justify-center lg:justify-start">
            {(['ALL', '2025', '2026'] as const).map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className="px-6 py-2 font-mono text-[10px] sm:text-xs uppercase font-bold border-2 transition-all active:translate-y-1 rounded-full"
                style={{
                  borderColor: DARK_TEXT,
                  backgroundColor: activeYear === year ? RED : WHITE,
                  color: activeYear === year ? WHITE : DARK_TEXT,
                  boxShadow: activeYear === year ? `0px 0px 0px ${DARK_TEXT}` : `3px 3px 0px ${DARK_TEXT}`
                }}
              >
                {year === 'ALL'
                  ? 'ALL_RECORDS'
                  : year === '2026'
                    ? 'YEAR_2026 (COMING SOON)'
                    : `YEAR_${year}`}
              </button>
            ))}
            
            {/* Results Count */}
            <div className="ml-auto font-mono text-[10px] font-bold text-[#1d1c17]/40 uppercase tracking-widest">
              {processedProjects.length} RECORDS_FOUND
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto py-12 px-6 min-h-[60vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#c00000] animate-spin mb-4" />
            <p className="font-mono text-sm font-bold uppercase text-[#1d1c17]/40">INITIALIZING_DATABASE_LINK...</p>
          </div>
        ) : paginatedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode='popLayout'>
              {paginatedProjects.map((project) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col bg-white border-4 border-[#1d1c17] transition-transform hover:-translate-y-2 cursor-pointer"
                  style={{ boxShadow: `8px 8px 0px ${DARK_TEXT}` }}
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Rank Badge */}
                  <RankBadge rank={project.rank} />

                  {/* Year Badge */}
                  <div 
                    className="absolute top-4 left-4 z-10 px-3 py-1 font-mono text-[10px] font-black bg-white border-2 border-[#1d1c17]"
                    style={{ color: DARK_TEXT }}
                  >
                    {project.year}
                  </div>

                  {/* Project Image */}
                  <div className="relative aspect-video overflow-hidden border-b-4 border-[#1d1c17]">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Project Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2">
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-1 group-hover:text-[#c00000] transition-colors">
                        {project.title}
                      </h3>
                      <p className="font-mono text-[11px] font-bold text-black/50 uppercase">
                        BY: {project.teamName}
                      </p>
                    </div>
                    
                    <p className="text-sm leading-relaxed mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#1d1c17]/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div 
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: RED }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="square"/>
                    </svg>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-[#1d1c17]/20">
            <Search className="w-12 h-12 text-[#1d1c17]/20 mb-4" />
            {activeYear === '2026' && !searchQuery ? (
              <>
                <h3 className="text-xl font-black uppercase text-[#1d1c17]/40 text-center">
                  HACKXPERIENCE_2026 // COMING_SOON
                </h3>
                <p className="mt-3 font-mono text-xs font-bold text-[#1d1c17]/40 uppercase text-center max-w-md">
                  Projects from this year&apos;s build will land here once submissions close.
                </p>
              </>
            ) : (
              <h3 className="text-xl font-black uppercase text-[#1d1c17]/40">
                {projects.length === 0 ? 'NO_PROJECTS_HAVE_BEEN_ADDED_YET' : 'NO_MATCHING_RECORDS_FOUND'}
              </h3>
            )}
            {projects.length > 0 && activeYear !== '2026' && (
              <button
                onClick={() => {setSearchQuery(''); setActiveYear('ALL');}}
                className="mt-4 text-[#c00000] font-mono text-xs font-bold underline underline-offset-4"
              >
                RESET_ALL_FILTERS
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 border-2 border-[#1d1c17] bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f2ede5] transition-colors"
              style={{ boxShadow: currentPage === 1 ? 'none' : `4px 4px 0px ${DARK_TEXT}` }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 font-mono text-sm font-bold border-2 border-[#1d1c17] transition-all ${
                    currentPage === i + 1 ? 'bg-[#c00000] text-white' : 'bg-white hover:bg-[#f2ede5]'
                  }`}
                  style={{ boxShadow: currentPage === i + 1 ? 'none' : `4px 4px 0px ${DARK_TEXT}` }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 border-2 border-[#1d1c17] bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#f2ede5] transition-colors"
              style={{ boxShadow: currentPage === totalPages ? 'none' : `4px 4px 0px ${DARK_TEXT}` }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-[#1d1c17]/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white border-4 border-[#1d1c17] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              style={{ boxShadow: `12px 12px 0px ${RED}` }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 bg-white border-2 border-[#1d1c17] p-2 hover:bg-[#c00000] hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content - Image Side (16:9 presentation screenshot, never cropped) */}
              <div className="w-full md:w-1/2 shrink-0 flex items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-[#1d1c17] bg-[#1d1c17] aspect-video md:aspect-auto">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Content - Info Side */}
              <div className="w-full md:w-1/2 flex flex-col p-5 sm:p-6 overflow-y-auto">
                {/* Rank Badge Large */}
                <RankBadge rank={selectedProject.rank} size="lg" />

                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 font-mono text-[10px] font-black bg-[#c00000] text-white">
                    YEAR_{selectedProject.year}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#1d1c17]/40 uppercase">
                    ID: {selectedProject.id.padStart(3, '0')}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                  {selectedProject.title}
                </h2>
                <p className="font-mono text-xs font-bold text-[#c00000] uppercase mb-3">
                  TEAM: {selectedProject.teamName}
                </p>

                {/* Overview + scannable Key Features */}
                {selectedProject.features && selectedProject.features.length > 0 ? (
                  <>
                    <p className="text-sm leading-relaxed mb-3">
                      {selectedProject.description}
                    </p>
                    <h4 className="font-mono text-[11px] font-black uppercase mb-2 border-b-2 border-[#1d1c17] inline-block self-start">
                      KEY_FEATURES
                    </h4>
                    <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-snug marker:text-[#c00000] mb-3">
                      {selectedProject.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm leading-relaxed mb-3 whitespace-pre-line">
                    {selectedProject.longDescription || selectedProject.description}
                  </p>
                )}

                {selectedProject.achievements && (
                  <div className="mb-3">
                    <h4 className="font-mono text-[11px] font-black uppercase mb-2 border-b-2 border-[#1d1c17] inline-block">
                      ACCOLADES
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.achievements.map(achievement => (
                        <div key={achievement} className="flex items-center gap-2 bg-[#f2ede5] px-2.5 py-0.5 border border-[#1d1c17]">
                          <span className="w-2 h-2 bg-[#c00000]" />
                          <span className="text-[11px] font-bold uppercase">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech stack — actual technologies, with empty-state fallback */}
                <div className="mb-3">
                  <h4 className="font-mono text-[11px] font-black uppercase mb-2 border-b-2 border-[#1d1c17] inline-block">
                    TECH_STACK
                  </h4>
                  {selectedProject.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 bg-white border-2 border-[#1d1c17] text-[11px] font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Tech Stack: None mentioned</span>
                  )}
                </div>

                <div className="flex gap-3 pt-3 mt-auto">
                  {selectedProject.links?.github && (
                    <a 
                      href={selectedProject.links.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-3 bg-[#1d1c17] text-white font-mono text-xs font-bold uppercase hover:bg-[#c00000] transition-colors"
                    >
                      SOURCE_CODE
                    </a>
                  )}
                  {selectedProject.links?.demo && (
                    <a 
                      href={selectedProject.links.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-3 border-4 border-[#1d1c17] font-mono text-xs font-bold uppercase hover:bg-[#f2ede5] transition-colors"
                    >
                      LIVE_DEMO
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
