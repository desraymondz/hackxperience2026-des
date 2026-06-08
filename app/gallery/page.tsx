"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { mockProjects, Project } from '../../lib/mock-data';
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
  const [activeYear, setActiveYear] = useState<'ALL' | '2025' | '2024'>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const { data, error } = await supabaseBrowser
          .from('submissions')
          .select('*')
          .eq('status', 'APPROVED');

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
          setProjects(mappedProjects);
        } else {
          // If no data in DB, set projects to empty array
          setProjects([]);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]); // Fallback to empty on error
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
            {(['ALL', '2025', '2024'] as const).map((year) => (
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
                {year === 'ALL' ? 'ALL_RECORDS' : `YEAR_${year}`}
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
            <h3 className="text-xl font-black uppercase text-[#1d1c17]/40">
              {projects.length === 0 ? 'NO_PROJECTS_HAVE_BEEN_ADDED_YET' : 'NO_MATCHING_RECORDS_FOUND'}
            </h3>
            {projects.length > 0 && (
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

              {/* Modal Content - Image Side */}
              <div className="w-full md:w-1/2 border-b-4 md:border-b-0 md:border-r-4 border-[#1d1c17] bg-[#1d1c17]">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>

              {/* Modal Content - Info Side */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="mb-6">
                  {/* Rank Badge Large */}
                  <RankBadge rank={selectedProject.rank} size="lg" />

                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 font-mono text-xs font-black bg-[#c00000] text-white">
                      YEAR_{selectedProject.year}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1d1c17]/40 uppercase">
                      ID: {selectedProject.id.padStart(3, '0')}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">
                    {selectedProject.title}
                  </h2>
                  <p className="font-mono text-sm font-bold text-[#c00000] uppercase mb-6">
                    TEAM: {selectedProject.teamName}
                  </p>

                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed font-medium">
                      {selectedProject.longDescription || selectedProject.description}
                    </p>

                    {selectedProject.achievements && (
                      <div className="pt-4">
                        <h4 className="font-mono text-xs font-black uppercase mb-3 border-b-2 border-[#1d1c17] inline-block">
                          ACCOLADES
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.achievements.map(achievement => (
                            <div key={achievement} className="flex items-center gap-2 bg-[#f2ede5] px-3 py-1 border border-[#1d1c17]">
                              <span className="w-2 h-2 bg-[#c00000]" />
                              <span className="text-xs font-bold uppercase">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <h4 className="font-mono text-xs font-black uppercase mb-3 border-b-2 border-[#1d1c17] inline-block">
                        TECH_STACK
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white border-2 border-[#1d1c17] text-xs font-bold uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-auto">
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
