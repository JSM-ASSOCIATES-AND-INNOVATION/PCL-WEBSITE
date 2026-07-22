import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../LIB/supabase/supabaseClient';

const ALL_TABS = [
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research & Pubs' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'awards', label: 'Awards' }
];

const SkeletonLoader = () => (
  <div className="min-h-screen w-full bg-[var(--bg-color)] flex flex-col lg:flex-row px-6 md:px-12 py-32 gap-16 max-w-7xl mx-auto">
    {/* Left Skeleton */}
    <div className="w-full lg:w-5/12 shrink-0 space-y-6">
      <div className="w-full aspect-[3/4] bg-white/[0.03] animate-pulse rounded-[2rem]"></div>
      <div className="flex gap-4">
        <div className="h-12 flex-1 bg-white/[0.03] animate-pulse rounded-xl"></div>
        <div className="h-12 flex-1 bg-white/[0.03] animate-pulse rounded-xl"></div>
      </div>
    </div>
    {/* Right Skeleton */}
    <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-6 lg:pt-12">
      <div className="h-20 w-3/4 bg-white/[0.03] animate-pulse rounded-xl"></div>
      <div className="h-8 w-1/3 bg-[#FFBF00]/20 animate-pulse rounded-lg"></div>
      <div className="w-32 h-[1px] bg-[#FFBF00]/20 my-8"></div>
      <div className="space-y-4 w-full">
        <div className="h-4 w-full bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-4/5 bg-white/[0.03] animate-pulse rounded"></div>
        <div className="h-4 w-2/3 bg-white/[0.03] animate-pulse rounded"></div>
      </div>
    </div>
  </div>
);

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function fetchFaculty() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id, full_name, department, email,
                    faculty_profiles (
                        designation, specialisation, bio, office_address, phone,
                        linkedin_url, scholar_url, education, research, projects, patents, awards, is_public, image_url
                    )
                `)
                .eq('id', id)
                .single();
                
            if (data && data.faculty_profiles && data.faculty_profiles.is_public) {
                setFaculty({
                    name: data.full_name || 'Unknown',
                    department: data.department || 'Faculty of Law',
                    email: data.email || '',
                    image: data.faculty_profiles.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    ...data.faculty_profiles
                });
            } else {
                setFaculty(null);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchFaculty();
  }, [id]);

  const availableTabs = useMemo(() => {
    if (!faculty) return [];
    return ALL_TABS.filter((tab) => {
        const val = faculty[tab.id];
        // Ensure string length > 0 if it's stored as text
        return typeof val === 'string' && val.trim().length > 0;
    });
  }, [faculty]);

  useEffect(() => {
      if (availableTabs.length > 0 && !activeTab) {
          setActiveTab(availableTabs[0].id);
      }
  }, [availableTabs, activeTab]);

  const currentTab = availableTabs.some((t) => t.id === activeTab) ? activeTab : availableTabs[0]?.id;

  if (loading) return <SkeletonLoader />;

  if (!faculty) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] px-6 text-center">
        <h2 className="text-4xl mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Profile Not Found</h2>
        <p className="text-[var(--text-muted)] mb-8 font-sans">This faculty member's profile is unavailable or private.</p>
        <button
          onClick={() => navigate('/about/faculty')}
          className="bg-[var(--primary-color)] text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Name splitting
  const nameParts = faculty.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstNames = nameParts.join(' ');

  // Parse list items from raw text (assuming newline separation)
  const renderList = (text) => {
      if (!text) return null;
      const items = text.split('\n').filter(i => i.trim().length > 0);
      return (
          <ul className="space-y-6 relative border-l border-[var(--card-border)] ml-2 pl-6 py-2">
              {items.map((item, idx) => (
                  <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="relative text-sm md:text-base text-[var(--text-color)]/90 leading-relaxed group"
                  >
                      {/* Timeline dot */}
                      <div className="absolute w-2 h-2 bg-[var(--primary-color)] rounded-full -left-[29px] top-2 shadow-[0_0_10px_var(--primary-glow)] transition-transform group-hover:scale-150"></div>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                  </motion.li>
              ))}
          </ul>
      );
  };

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden font-sans">
      
      {/* Decorative Blur (Tasteful, not cheap) */}
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-[var(--primary-color)] rounded-full blur-[200px] opacity-[0.03] pointer-events-none z-0" />

      <div className="relative z-20 pt-28 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
        
        {/* LEFT COLUMN: STICKY HERO */}
        <div className="w-full lg:w-5/12 shrink-0 lg:sticky lg:top-32 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full aspect-[3/4] relative rounded-[2rem] overflow-hidden border border-[var(--card-border)] shadow-2xl group bg-black"
          >
            <img 
              src={faculty.image} 
              alt={faculty.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
            />
            {/* Inner Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
            
            {/* Quick Badges overlaid on image bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-2">
                <p className="text-[#FFBF00] font-bold tracking-widest uppercase text-xs">{faculty.designation}</p>
                <h3 className="text-white text-3xl font-bold font-serif leading-none">{faculty.name}</h3>
            </div>
          </motion.div>

          {/* Social / Contact Actions */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            {faculty.email && (
                <a href={`mailto:${faculty.email}`} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#FFBF00]/50 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-lg">
                    <i className="fa-solid fa-envelope text-[#FFBF00]"></i> Email
                </a>
            )}
            {faculty.linkedin_url && (
                <a href={faculty.linkedin_url} target="_blank" rel="noreferrer" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#FFBF00]/50 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-lg">
                    <i className="fa-brands fa-linkedin text-[#FFBF00]"></i> LinkedIn
                </a>
            )}
            {faculty.scholar_url && (
                <a href={faculty.scholar_url} target="_blank" rel="noreferrer" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#FFBF00]/50 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-lg">
                    <i className="fa-solid fa-graduation-cap text-[#FFBF00]"></i> Scholar
                </a>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: SCROLLING DETAILS */}
        <div className="w-full lg:w-7/12 flex flex-col lg:min-h-[80vh]">
          
          <Link
            to="/about/faculty"
            className="inline-flex items-center text-[var(--text-muted)] hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-xs font-bold focus:outline-none w-max"
          >
            <i className="fa-solid fa-arrow-left mr-3 text-sm"></i> Directory
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-[5rem] font-bold text-[var(--text-color)] mb-6 uppercase leading-[1.05]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {firstNames} <span className="text-[#FFBF00] italic">{lastName}</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            animate={{ opacity: 1, scaleX: 1 }} 
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-[2px] w-24 bg-[#FFBF00] mb-12 origin-left"
          />

          {/* Bio Section */}
          {faculty.bio ? (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-[var(--text-color)]/80 leading-relaxed mb-12 font-light"
            >
              <span className="text-4xl text-[#FFBF00] font-serif float-left mr-3 leading-none mt-1">
                {faculty.bio.charAt(0)}
              </span>
              {faculty.bio.slice(1)}
            </motion.p>
          ) : (
            <div className="mb-12"></div> // spacer
          )}

          {/* Info Grid */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md"
          >
            {faculty.specialisation && (
              <div>
                  <span className="block text-[#FFBF00] uppercase tracking-widest text-[10px] font-black mb-1">Expertise</span>
                  <span className="text-[var(--text-color)] font-medium text-sm md:text-base">{faculty.specialisation}</span>
              </div>
            )}
            {faculty.department && (
              <div>
                  <span className="block text-[#FFBF00] uppercase tracking-widest text-[10px] font-black mb-1">Department</span>
                  <span className="text-[var(--text-color)] font-medium text-sm md:text-base">{faculty.department}</span>
              </div>
            )}
            {faculty.office_address && (
                <div>
                  <span className="block text-[#FFBF00] uppercase tracking-widest text-[10px] font-black mb-1">Office Location</span>
                  <span className="text-[var(--text-color)] font-medium text-sm md:text-base">{faculty.office_address}</span>
                </div>
            )}
            {faculty.phone && (
                <div>
                  <span className="block text-[#FFBF00] uppercase tracking-widest text-[10px] font-black mb-1">Direct Line</span>
                  <span className="text-[var(--text-color)] font-medium text-sm md:text-base">{faculty.phone}</span>
                </div>
            )}
          </motion.div>

          {/* Interactive Tabs */}
          {availableTabs.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex-1 flex flex-col">
              
              <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 mb-10 pb-2">
                {availableTabs.map((tab) => {
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap focus:outline-none flex-shrink-0 ${
                        isActive 
                          ? 'bg-[#FFBF00] text-black shadow-[0_0_20px_rgba(255,191,0,0.3)]' 
                          : 'bg-[var(--card-bg)] text-[var(--text-muted)] border border-[var(--card-border)] hover:border-[#FFBF00]/50 hover:text-[var(--text-color)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {renderList(faculty[currentTab])}
                  </motion.div>
                </AnimatePresence>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
