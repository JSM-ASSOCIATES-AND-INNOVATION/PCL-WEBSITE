/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '../../../LIB/hooks/useSiteContent';
import Preloader from '../../UI/Preloader/Preloader';
import classroom3 from '../../../ASSETS/CAMPUS/pcl_classroom_3.webp';
import styles from './Programs.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function CourseLLB() {
  const contentRef = useRef(null);

  // CMS Integration
  const { content, loading } = useSiteContent('/programs/llb', 'program_details');

  useEffect(() => {
    if (loading) return; // Wait for content before animating
    
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
  }, [loading]);

  if (loading) return <Preloader />;

  // CMS Fallbacks
  const cms = {
    badge1: content?.badge1 || "3 Years Standard",
    badge2: content?.badge2 || "Postgraduate Degree",
    title: content?.title || "LL.B",
    title_highlight: content?.title_highlight || "Standard",
    description: content?.description || "A rigorous professional law degree for graduates. Focused intensely on core legal frameworks, procedural laws, and producing court-ready advocates.",
    overview_text: content?.overview_text || "The Bachelor of Legislative Law (LL.B) is a three-year professional course exclusively for graduates of any discipline. This program skips the foundational humanities and dives straight into substantive and procedural law. It is highly intensive, focusing heavily on moot courts, legal drafting, and extensive court exposure to forge practice-ready advocates.",
    focus_1: content?.focus_1 || "Intensive Procedural Law (CrPC, CPC)",
    focus_2: content?.focus_2 || "Evidence & Substantive Laws",
    focus_3: content?.focus_3 || "Legal Drafting & Pleading",
    focus_4: content?.focus_4 || "Extensive Court Visits & Internships",
    focus_5: content?.focus_5 || "Professional Ethics & Litigation",
    curriculum_m1_title: content?.curriculum_m1_title || "Year 1",
    curriculum_m1_badge: content?.curriculum_m1_badge || "Substantive Law",
    curriculum_m1_desc: content?.curriculum_m1_desc || "Law of Contracts, Torts, Constitutional Law, Criminal Law (IPC), Family Law.",
    curriculum_m2_title: content?.curriculum_m2_title || "Year 2",
    curriculum_m2_badge: content?.curriculum_m2_badge || "Procedural Law",
    curriculum_m2_desc: content?.curriculum_m2_desc || "Jurisprudence, Property Law, Company Law, CrPC, CPC, Law of Evidence.",
    curriculum_m3_title: content?.curriculum_m3_title || "Year 3",
    curriculum_m3_badge: content?.curriculum_m3_badge || "Clinical & Practice",
    curriculum_m3_desc: content?.curriculum_m3_desc || "Drafting & Pleading, Moot Court, Alternative Dispute Resolution (ADR), Taxation.",
    fact_duration: content?.fact_duration || "3 Years (6 Semesters)",
    fact_eligibility: content?.fact_eligibility || "Graduate (10+2+3) in any discipline with 45% aggregate",
    fact_mode: content?.fact_mode || "TS LAWCET / Management"
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientBackground} />
      <div className={styles.auroraGlow} />

      <div className={styles.contentContainer} ref={contentRef}>
        
        {/* Navigation */}
        <Link to="/programs" className="inline-flex items-center text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold relative z-10 gsap-fade-up">
          <span className="mr-2">←</span> Back to Programs
        </Link>

        {/* Header */}
        <div className="mb-16 relative z-10 gsap-fade-up">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-4 py-1 border border-[var(--primary-color)]/30 rounded-full text-[var(--primary-color)] text-sm tracking-widest uppercase bg-[var(--primary-color)]/5 backdrop-blur-sm">{cms.badge1}</span>
            <span className="px-4 py-1 border border-[var(--card-border)] rounded-full text-[var(--text-muted)] text-sm tracking-widest uppercase bg-[var(--card-bg)] backdrop-blur-sm">{cms.badge2}</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {cms.title} <span className="text-[var(--primary-color)] italic">{cms.title_highlight}</span>
          </motion.h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-3xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {cms.description}
          </p>
        </div>

        {/* Image */}
        <div className="w-full h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-16 relative flex items-center justify-center group shadow-2xl gsap-fade-up z-10">
          <img src={classroom3} alt="LLB Classroom" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 ring-1 ring-inset ring-[var(--primary-color)]/30 rounded-3xl pointer-events-none"></div>
        </div>

        {/* Content Details */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10 flex-col-reverse md:flex-row">
          <div className="md:col-span-2 space-y-12">
            <section className="gsap-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Program Overview</h2>
              <p className="text-[var(--text-muted)] leading-relaxed text-base md:text-lg">
                {cms.overview_text}
              </p>
            </section>
            
            <section className="gsap-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Core Focus Areas</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[cms.focus_1, cms.focus_2, cms.focus_3, cms.focus_4, cms.focus_5].map((item, idx) => (
                  <div key={idx} className={`${styles.glassCard} !p-4 flex items-start gap-4`}>
                    <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] mt-2 shadow-[0_0_10px_var(--primary-glow)] shrink-0"></div>
                    <span className="text-[var(--text-color)] font-medium text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12 gsap-fade-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Curriculum Overview</h2>
              <div className={styles.dataGrid}>
                <div className={`hidden md:grid grid-cols-3 ${styles.gridHeader}`}>
                  <div>Semester Group</div>
                  <div className="col-span-2 text-[var(--primary-color)]">Key Subjects Covered</div>
                </div>
                
                <div className={styles.gridRow}>
                  <div className={styles.gridCellPrimary}>{cms.curriculum_m1_title}<br/><span className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mt-1">{cms.curriculum_m1_badge}</span></div>
                  <div className={`${styles.gridCellMuted} md:col-span-2`}>{cms.curriculum_m1_desc}</div>
                </div>
                <div className={styles.gridRow}>
                  <div className={styles.gridCellPrimary}>{cms.curriculum_m2_title}<br/><span className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mt-1">{cms.curriculum_m2_badge}</span></div>
                  <div className={`${styles.gridCellMuted} md:col-span-2`}>{cms.curriculum_m2_desc}</div>
                </div>
                <div className={styles.gridRow}>
                  <div className={styles.gridCellPrimary}>{cms.curriculum_m3_title}<br/><span className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mt-1">{cms.curriculum_m3_badge}</span></div>
                  <div className={`${styles.gridCellMuted} md:col-span-2`}>{cms.curriculum_m3_desc}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Facts Sidebar */}
          <div className="space-y-6 gsap-fade-up order-first md:order-last mb-8 md:mb-0">
            <div className={`${styles.glassCard} sticky top-24`}>
              <h3 className="text-xl font-bold text-[var(--primary-color)] mb-6 border-b border-[var(--card-border)] pb-4 font-['Playfair_Display']">Quick Facts</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-[var(--text-color)] font-semibold text-sm md:text-base">{cms.fact_duration}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Eligibility</p>
                  <p className="text-[var(--text-color)] font-semibold text-sm md:text-base">{cms.fact_eligibility}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Admission Mode</p>
                  <p className="text-[var(--text-color)] font-semibold text-sm md:text-base">{cms.fact_mode}</p>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col gap-4">
                <button className={`${styles.magneticBtn} ${styles.magneticBtnOutline}`}>
                  View Full Syllabus
                </button>
                <Link to="/apply" className={styles.magneticBtn}>
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
