/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { supabase } from '../../../../LIB/supabase/supabaseClient';
import styles from '../../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

// Eager load all images in ASSETS/CAMPUS
const imageImports = import.meta.glob('../../../../ASSETS/CAMPUS/*.{webp,png,jpg,jpeg}', { eager: true, import: 'default' });

const getImage = (filename) => {
  if (!filename) return null;
  const match = Object.keys(imageImports).find(path => path.includes(filename));
  return match ? imageImports[match] : null;
};

function ModuleFigure({ iconName, tag, image }) {
  const IconComponent = Icons[iconName] || Icons.Building;
  
  return (
    <div className="relative h-56 overflow-hidden border-b border-[var(--card-border)] group-hover:border-[var(--primary-color)]/50 transition-colors duration-500">
      {image ? (
        <>
          <img 
            src={image} 
            alt={tag} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
        </>
      ) : (
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(var(--primary-color) 1px, transparent 1px), linear-gradient(90deg, var(--primary-color) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(120px 90px at 30% 40%, var(--primary-glow), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <span className="absolute top-4 right-5 font-mono text-[10px] tracking-widest text-[var(--primary-color)] uppercase z-10 bg-[var(--bg-color)]/70 px-3 py-1.5 rounded-full backdrop-blur-md border border-[var(--primary-color)]/30 font-bold shadow-lg">
        {tag}
      </span>
      <div className="absolute bottom-5 left-5 z-10">
        <div className="w-14 h-14 rounded-2xl border border-[var(--primary-color)]/40 flex items-center justify-center bg-[var(--bg-color)]/80 backdrop-blur-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-[0_0_25px_var(--primary-glow)]">
          <IconComponent className="w-6 h-6 text-[var(--primary-color)]" />
        </div>
      </div>
    </div>
  );
}

export default function Facilities() {
  const containerRef = useRef(null);
  const [facilitiesData, setFacilitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFacilities() {
      try {
        const { data, error } = await supabase
          .from('campus_facilities')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        // Group data by category_key
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.category_key]) {
            acc[curr.category_key] = {
              title: curr.category_title,
              description: curr.category_desc,
              facilities: []
            };
          }
          acc[curr.category_key].facilities.push(curr);
          return acc;
        }, {});
        
        setFacilitiesData(Object.entries(grouped));
      } catch (err) {
        console.error("Error fetching facilities:", err);
        setError("Failed to load facilities data. Please check connection.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (loading || error || facilitiesData.length === 0) return;
    
    const ctx = gsap.context(() => {
      // Stagger animate category headers
      gsap.utils.toArray('.category-header').forEach((header) => {
        gsap.fromTo(header,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // Stagger animate cards
      gsap.utils.toArray('.facilities-grid').forEach((grid) => {
        gsap.fromTo(grid.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, error, facilitiesData]);

  if (error) {
    return (
      <div className={`${styles.pageWrapper} flex items-center justify-center min-h-[60vh]`}>
        <div className="text-center p-8 bg-[var(--card-bg)] border border-red-500/30 rounded-2xl backdrop-blur-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-[var(--text-color)] font-bold mb-2">Error Loading Facilities</h2>
          <p className="text-[var(--text-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer} ref={containerRef}>
        <div className="text-center mb-24 relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-[var(--primary-color)] font-bold"
          >
            World-Class Infrastructure
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-color)] mb-8 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Where rigorous legal theory<br className="hidden md:block" /> meets practice
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            From fully-equipped Moot Courts replicating High Court environments to an expansive digital Law Library. Discover the facilities shaping the next generation of legal luminaries.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <Loader2 className="w-12 h-12 text-[var(--primary-color)] animate-spin mb-4" />
            <p className="text-[var(--text-muted)] tracking-widest uppercase text-sm font-bold">Loading Infrastructure...</p>
          </div>
        ) : (
          facilitiesData.map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-32 last:mb-0 relative z-10">
              <div className="category-header mb-12 flex flex-col items-center md:items-start opacity-0">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {category.title}
                </h2>
                <div className="h-[3px] w-20 mb-5 bg-gradient-to-r from-[var(--primary-color)] to-transparent rounded-full" />
                <p className="text-[var(--text-muted)] text-center md:text-left max-w-2xl text-lg">{category.description}</p>
              </div>

              <div className="facilities-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
                {category.facilities.map((facility) => (
                  <div key={facility.id} className="opacity-0">
                    <Link to={`/campus/facilities/${facility.id}`} className="block h-full group">
                      <div className={`${styles.glassCard} h-full p-0 flex flex-col transition-all duration-500 hover:border-[var(--primary-color)]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 overflow-hidden`}>
                        <ModuleFigure 
                          iconName={facility.icon} 
                          tag={facility.tag} 
                          image={getImage(facility.image)} 
                        />

                        <div className="p-8 flex-1 flex flex-col bg-[var(--card-bg)]/40">
                          <h3 className="text-xl md:text-2xl text-[var(--text-color)] font-bold mb-4 group-hover:text-[var(--primary-color)] transition-colors font-['Playfair_Display'] leading-snug">
                            {facility.title}
                          </h3>
                          <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed flex-1">
                            {facility.summary}
                          </p>

                          <div className="mt-8 flex items-center text-xs font-bold tracking-widest uppercase text-[var(--primary-color)] group-hover:text-[var(--text-color)] transition-colors">
                            <span>Explore Facility</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
