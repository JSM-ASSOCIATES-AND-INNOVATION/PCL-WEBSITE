/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';

import { useSiteContent } from '../../../../LIB/hooks/useSiteContent';
import mootCourtImg from '../../../../ASSETS/CAMPUS/moot1.png';
import styles from '../../PROGRAMS/Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function MootCourt() {
  const contentRef = useRef(null);
  const { content, loading, error } = useSiteContent('/campus/moot-court', 'moot-court-society');

  useEffect(() => {
    if (loading || error || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-fade-up',
        { opacity: 0, y: 40 },
        {
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [loading, error, content]);

  if (error) {
    return (
      <div className={`${styles.pageWrapper} flex flex-col items-center justify-center min-h-screen bg-[var(--bg-color)]`}>
        <div className={styles.ambientBackground} />
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 relative z-10" />
        <h2 className="text-4xl mb-4 font-bold relative z-10 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Content Error</h2>
        <p className="text-[var(--text-muted)] max-w-md text-center relative z-10">Failed to load Moot Court Society content from CMS.</p>
        <Link to="/campus" className="relative z-10 mt-6 text-[var(--primary-color)] font-bold tracking-widest uppercase text-sm hover:underline">
          Return to Campus Life
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer} ref={contentRef}>
        
        {/* Navigation */}
        <Link to="/campus" className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold relative z-10 gsap-fade-up">
          <span className="mr-2">←</span> Back to Campus Life
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-[var(--primary-color)] animate-spin mb-4" />
            <p className="text-[var(--text-muted)] tracking-widest uppercase text-sm font-bold">Loading CMS Content...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-16 relative z-10 gsap-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1 border border-[var(--primary-color)]/30 rounded-full text-[var(--primary-color)] text-sm tracking-widest uppercase bg-[var(--primary-color)]/10 backdrop-blur-sm font-bold">Practical Learning</span>
                <span className="px-4 py-1 border border-[var(--card-border)] rounded-full text-[var(--text-muted)] text-sm tracking-widest uppercase bg-[var(--card-bg)]/30 backdrop-blur-sm font-bold">Experiential</span>
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {content?.heroTitle || 'Moot Court Society'}
              </motion.h1>
              <p className="text-xl text-[var(--text-muted)] max-w-3xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {content?.heroSubtitle}
              </p>
            </div>

            {/* Hero Image */}
            <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-20 relative flex items-center justify-center group shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-[var(--card-border)] gsap-fade-up z-10">
              <img src={mootCourtImg} alt="Moot Court Hall" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-[var(--primary-color)]/20 rounded-3xl pointer-events-none"></div>
            </div>

            {/* Grid Section */}
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {content?.cards?.map((card, index) => {
                const IconComponent = Icons[card.icon] || Icons.Gavel;
                
                return (
                  <div key={index} className={`${styles.glassCard} gsap-fade-up p-8 border border-[var(--card-border)] hover:border-[var(--primary-color)]/50 transition-colors duration-500 overflow-hidden relative group`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, var(--primary-color), transparent 70%)' }} />
                    <div className="w-16 h-16 rounded-2xl border border-[var(--primary-color)]/40 flex items-center justify-center bg-[var(--bg-color)]/80 mb-8 shadow-[0_0_30px_var(--primary-glow)] group-hover:scale-110 transition-transform duration-500">
                      <IconComponent className="w-8 h-8 text-[var(--primary-color)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4 leading-tight group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {card.title}
                    </h3>
                    <p className="text-[var(--text-muted)] leading-relaxed text-lg font-light">
                      {card.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="mt-24 text-center gsap-fade-up relative z-10 flex flex-col items-center">
              <Link to="/campus/gallery" className={styles.magneticBtn} style={{ maxWidth: '300px' }}>
                View Campus Gallery
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
