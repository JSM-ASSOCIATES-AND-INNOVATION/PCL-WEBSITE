import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { supabase } from '../../../lib/supabase/supabaseClient';
import PremiumCard from '../../UI/PremiumCard/PremiumCard';

export default function Faculty() {
  const [query, setQuery] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            department,
            faculty_profiles (
              designation,
              specialisation,
              degrees,
              image_url,
              is_public
            )
          `)
          .eq('role', 'faculty');

        if (error) throw error;
        
        // Filter out those who are not public
        const publicFaculty = data.filter(f => f.faculty_profiles && f.faculty_profiles.is_public);
        setFacultyList(publicFaculty);
      } catch (err) {
        console.error("Error fetching faculty data: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const filteredFaculty = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facultyList;
    return facultyList.filter(
      (f) =>
        f.full_name?.toLowerCase().includes(q) ||
        f.faculty_profiles?.designation?.toLowerCase().includes(q) ||
        f.department?.toLowerCase().includes(q)
    );
  }, [query, facultyList]);

  useEffect(() => {
    if (gridRef.current && filteredFaculty.length > 0) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto"
        }
      );
    }
  }, [filteredFaculty]);

  return (
    <div className="min-h-screen w-full relative bg-[var(--bg-color)] text-[var(--text-color)] overflow-x-hidden pb-32">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--bg-color)] via-[var(--bg-color)] to-[var(--bg-color)] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[var(--primary-glow)] blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 md:pt-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-widest text-[var(--text-color)] mb-8 uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            OUR <span className="text-[var(--primary-color)] italic">FACULTY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg mb-16"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Distinguished scholars and experienced practitioners dedicated to shaping the future of legal education.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or department..."
              aria-label="Search faculty"
              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full py-4 px-8 text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            />
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : filteredFaculty.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {filteredFaculty.map((faculty) => {
              const fProfile = faculty.faculty_profiles;
              
              return (
                <PremiumCard
                  key={faculty.id}
                  id={faculty.id}
                  title={faculty.full_name}
                  subtitle={fProfile?.designation || faculty.department || 'Faculty Member'}
                  description={fProfile?.specialisation || `${faculty.full_name} is a distinguished member of the ${faculty.department || 'faculty'} at Prudentia College of Law.`}
                  image={fProfile?.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                  verified={true}
                  status="online"
                  variant="default"
                  stats={[
                    { label: 'Degrees', value: fProfile?.degrees ? fProfile.degrees.split(',').length : 1 },
                    { label: 'Department', value: faculty.department ? faculty.department.substring(0, 10) + (faculty.department.length > 10 ? '...' : '') : 'Law' }
                  ]}
                  onProfile={() => navigate(`/about/faculty/${faculty.id}`)}
                  onMessage={() => alert(`Messaging ${faculty.full_name} is not available right now.`)}
                />
              );
            })}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <p className="text-[var(--text-muted)] text-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>No faculty members match "{query}".</p>
            <button
              onClick={() => setQuery('')}
              className="mt-6 text-[var(--primary-color)] hover:text-[var(--primary-hover)] transition-colors text-sm font-bold uppercase tracking-widest focus:outline-none"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
