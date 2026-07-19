import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PremiumFooter.module.css';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function CTASection() {
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
        <Link to="/apply" className="group flex items-center justify-center gap-3 px-8 py-4 bg-[var(--primary-color)] text-black font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 hover:shadow-[0_0_30px_var(--primary-glow)] transition-all">
          Apply Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/campus/gallery" className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/5 hover:border-white/40 transition-all hover:scale-105">
          Campus Tour <ArrowUpRight size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
