/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PremiumFooter.module.css';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useSite } from "../../../CONTEXT/SiteContext";

export default function CTASection() {
  const siteContext = useSite();
  const isAdmissionsOpen = siteContext?.isAdmissionsOpen;

  return (
    <div className={`relative rounded-[32px] bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden p-8 md:p-12 lg:p-16 mb-16 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left`}>
      {/* Background Effects */}
      <div className={styles.aurora}></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 max-w-2xl">
        <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white">
          Let's create your <br className="hidden lg:block" /><span className="text-[var(--primary-color)]">future in law.</span>
        </h2>
        <p className="text-[var(--text-muted)] text-base md:text-lg max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
          Join Prudentia College of Law. Crafting premium legal minds with precision, analytical rigor, and an unwavering commitment to excellence.
        </p>
      </div>
      
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0 justify-center">
        {isAdmissionsOpen ? (
          <Link to="/apply" className={`${styles.magneticBtn} ${styles.primaryBtn}`}>
            Apply Now <ArrowRight size={16} />
          </Link>
        ) : (
          <Link to="/contact" className={`${styles.magneticBtn} ${styles.primaryBtn}`}>
            Enquire Now <ArrowRight size={16} />
          </Link>
        )}
        <Link to="/campus/gallery" className={`${styles.magneticBtn} ${styles.secondaryBtn}`}>
          Campus Tour <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
