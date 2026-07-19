import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../LIB/supabase/supabaseClient';

const ALL_TABS = [
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'awards', label: 'Awards' }
];

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaculty() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    avatar_url,
                    faculty_profiles (
                        designation,
                        specialisation,
                        bio,
                        office,
                        email,
                        phone,
                        linkedin,
                        scholar,
                        education,
                        research,
                        projects,
                        patents,
                        awards,
                        is_public
                    )
                `)
                .eq('id', id)
                .single();
                
            if (data && data.faculty_profiles && data.faculty_profiles.is_public) {
                // Flatten the data for easier rendering
                setFaculty({
                    name: data.full_name || 'Unknown',
                    image: data.avatar_url || 'https://via.placeholder.com/600x800?text=No+Photo',
                    department: 'Faculty of Law', // Defaulting since we don't fetch department relations right now
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
        if (Array.isArray(val)) return val.length > 0;
        return val != null; // For safety
    });
  }, [faculty]);

  const [activeTab, setActiveTab] = useState('');
  useEffect(() => {
      if (availableTabs.length > 0 && !activeTab) {
          setActiveTab(availableTabs[0].id);
      }
  }, [availableTabs, activeTab]);

  const currentTab = availableTabs.some((t) => t.id === activeTab) ? activeTab : availableTabs[0]?.id;

  if (loading) {
      return (
          <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white px-6 text-center">
              <i className="fa-solid fa-circle-notch fa-spin text-[#FFBF00] text-4xl"></i>
          </div>
      );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white px-6 text-center">
        <h2 className="text-4xl mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Faculty Not Found</h2>
        <p className="text-gray-400 mb-8 font-sans">We couldn't find a profile for this faculty member, or their profile is private.</p>
        <button
          onClick={() => navigate('/about/faculty')}
          className="text-[#FFBF00] font-bold uppercase tracking-widest text-sm hover:text-white transition-colors focus:outline-none"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Split name for styling the last word
  const nameParts = faculty.name.split(' ');
  const lastName = nameParts.pop();
  const firstNames = nameParts.join(' ');

  return (
    <div className="min-h-screen w-full relative bg-[#050505] text-white overflow-x-hidden pb-32">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">

        <Link
          to="/about/faculty"
          className="inline-flex items-center text-gray-500 hover:text-[#FFBF00] transition-colors mb-16 uppercase tracking-widest text-xs font-bold focus:outline-none"
        >
          <span className="mr-3 text-lg leading-none">←</span> BACK TO DIRECTORY
        </Link>

        {/* Cinematic Profile Header */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-32 items-center lg:items-start">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full sm:w-2/3 lg:w-5/12"
          >
            <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative aspect-[3/4] bg-white/[0.02]">
              <img src={faculty.image} alt={faculty.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          <div className="w-full lg:w-7/12 flex flex-col justify-center lg:pt-12">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase leading-[1.05]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {firstNames} <br/>
              <span className="text-[#FFBF00] italic">{lastName}</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }} 
              animate={{ opacity: 1, scaleX: 1 }} 
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[1px] w-32 bg-[#FFBF00]/50 mb-10 origin-left"
            />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-12">
              <h2 className="text-2xl text-white font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{faculty.designation}</h2>
              <p className="text-[#FFBF00] font-bold tracking-widest uppercase text-sm">{faculty.department}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-400 text-sm"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {faculty.specialisation && (
                <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Specialisation</span>
                    <span className="text-white font-medium text-base">{faculty.specialisation}</span>
                </div>
              )}
              {faculty.office && (
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Office Address</span>
                    <span className="text-white font-medium text-base">{faculty.office}</span>
                  </div>
              )}
              {faculty.email && (
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Email</span>
                    <a href={`mailto:${faculty.email}`} className="text-white hover:text-[#FFBF00] transition-colors font-medium text-base">
                      {faculty.email}
                    </a>
                  </div>
              )}
              {faculty.phone && (
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Contact No</span>
                    <a href={`tel:${faculty.phone.replace(/\s/g, '')}`} className="text-white hover:text-[#FFBF00] transition-colors font-medium text-base">
                      {faculty.phone}
                    </a>
                  </div>
              )}
            </motion.div>

            {(faculty.linkedin || faculty.scholar) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                {faculty.linkedin && (
                  <a href={faculty.linkedin} target="_blank" rel="noopener noreferrer" className="text-white uppercase tracking-widest text-xs font-bold hover:text-[#FFBF00] transition-colors flex items-center gap-2">
                    LinkedIn <span className="text-[#FFBF00]">↗</span>
                  </a>
                )}
                {faculty.scholar && (
                  <a href={faculty.scholar} target="_blank" rel="noopener noreferrer" className="text-white uppercase tracking-widest text-xs font-bold hover:text-[#FFBF00] transition-colors flex items-center gap-2">
                    Google Scholar <span className="text-[#FFBF00]">↗</span>
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Details Tabs */}
        {availableTabs.length > 0 && (
          <div className="mt-24 w-full">
            <div className="flex flex-nowrap overflow-x-auto border-b border-white/10 mb-16 hide-scrollbar gap-8 md:gap-16">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-6 text-sm md:text-base font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap focus:outline-none ${
                    currentTab === tab.id ? 'text-[#FFBF00]' : 'text-gray-600 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {currentTab === tab.id && (
                    <motion.div layoutId="activeProfileTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFBF00]" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="px-2 max-w-4xl"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {currentTab === 'education' && faculty.education && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {faculty.education.map((edu, idx) => (
                        <div key={idx} className="relative pl-6 border-l border-white/10">
                          <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-[#FFBF00]" />
                          <h4 className="text-white font-bold text-xl md:text-2xl mb-2 leading-snug">{edu.degree}</h4>
                          <p className="text-gray-400 text-base">{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentTab === 'research' && faculty.research && (
                    <div className="space-y-8">
                      <h3 className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-6">Areas of Specialisation</h3>
                      <div className="flex flex-wrap gap-4">
                        {faculty.research.map((res, idx) => (
                          <div key={idx} className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-white text-base hover:border-[#FFBF00]/50 hover:bg-[#FFBF00]/5 transition-all">
                            {res.area || res}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === 'projects' && faculty.projects && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {faculty.projects.map((proj, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 p-8 rounded-[24px] hover:border-[#FFBF00]/30 transition-colors">
                          <h4 className="text-white font-bold text-xl mb-4 leading-snug">{proj.title}</h4>
                          <p className="inline-block px-3 py-1 rounded bg-[#FFBF00]/10 text-[#FFBF00] text-xs uppercase tracking-widest font-bold">
                            {proj.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentTab === 'patents' && faculty.patents && (
                    <div className="space-y-6">
                      {faculty.patents.map((pat, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <span className="text-[#FFBF00] text-xl mt-1">✦</span>
                          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">{pat.title || pat}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentTab === 'awards' && faculty.awards && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {faculty.awards.map((award, idx) => (
                        <div key={idx} className="flex items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[24px]">
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FFBF00]/10 text-[#FFBF00]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 15l-3.46 1.82.66-3.86L6.37 10.2l3.87-.56L12 6l1.76 3.64 3.87.56-2.83 2.76.66 3.86z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg mb-1">{award.title}</h4>
                            <p className="text-gray-500 font-medium">{award.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
