import React, { forwardRef } from 'react';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import CountUp from '../CountUp';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomeContact = forwardRef((props, ref) => {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="slide w-full relative flex flex-col overflow-hidden bg-[var(--bg-color)]" ref={ref} {...props}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-[radial-gradient(ellipse_at_top_left,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none opacity-30 z-0"></div>

      <div className="container relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col h-full justify-between pt-6 md:pt-10 pb-3">
        
        {/* --- TOP SECTION: ADMISSIONS & METRICS --- */}
        <motion.div 
          variants={containerVars}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center"
        >
          {/* Left Text */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div variants={itemVars} className="w-12 h-1 bg-[var(--primary-color)] mb-6"></motion.div>
            <motion.h2 variants={itemVars} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6 text-[var(--text-color)] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Uncompromising <br/>
              <span className="text-[var(--primary-color)] font-medium italic">Excellence.</span><br/>
              Accessible to All.
            </motion.h2>
            <motion.p variants={itemVars} className="text-sm md:text-base text-[var(--text-muted)] font-light leading-relaxed max-w-md mb-8">
              Experience world-class legal education at just <strong className="text-[var(--text-color)] font-bold">₹20,000/annum</strong>. Strictly merit-based admissions governed by OU Counseling.
            </motion.p>
            <motion.div variants={itemVars}>
              <Link to="/apply" className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--primary-color)] text-black font-bold uppercase tracking-[0.15em] text-xs rounded-full shadow-[0_10px_30px_rgba(255,191,0,0.2)] hover:shadow-[0_15px_40px_rgba(255,191,0,0.3)] hover:-translate-y-1 transition-all">
                Apply Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Metrics Grid */}
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6">
            <motion.div variants={itemVars} className="col-span-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl group hover:border-[var(--primary-color)]/50 transition-all duration-700 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--primary-color)] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
              <h3 className="text-6xl md:text-8xl font-light text-[var(--text-color)] mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <CountUp to={240} duration={2} />
              </h3>
              <p className="text-[var(--primary-color)] uppercase tracking-[0.2em] text-xs font-bold">Elite Phase I Scholars</p>
            </motion.div>
            
            <motion.div variants={itemVars} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 md:p-8 backdrop-blur-2xl group hover:border-[var(--primary-color)]/50 transition-all duration-700 relative overflow-hidden shadow-xl flex flex-col items-center text-center">
              <h3 className="text-4xl md:text-5xl font-light text-[var(--text-color)] mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <CountUp to={100} duration={2} /><span className="text-[var(--primary-color)] text-3xl md:text-4xl">%</span>
              </h3>
              <p className="text-[var(--text-muted)] uppercase tracking-[0.2em] text-[10px] font-bold">Distinguished Faculty</p>
            </motion.div>
            
            <motion.div variants={itemVars} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2rem] p-6 md:p-8 backdrop-blur-2xl group hover:border-[var(--primary-color)]/50 transition-all duration-700 relative overflow-hidden shadow-xl flex flex-col items-center text-center">
              <h3 className="text-4xl md:text-5xl font-light text-[var(--text-color)] mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <CountUp to={1200} duration={2} separator="," /><span className="text-[var(--primary-color)] text-3xl md:text-4xl">+</span>
              </h3>
              <p className="text-[var(--text-muted)] uppercase tracking-[0.2em] text-[10px] font-bold">Future Capacity</p>
            </motion.div>
          </div>
        </motion.div>

        {/* --- BOTTOM SECTION: CONTACT & FOOTER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 flex flex-col w-full"
        >
          {/* Divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent mb-10"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
            
            {/* Logo area */}
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-center bg-contain bg-no-repeat brand-crest"></div>
              <div className="flex flex-col">
                <span className="font-black tracking-widest text-2xl text-[var(--text-color)] leading-none">PRUDENTIA</span>
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--primary-color)] font-bold mt-2">College of Law</span>
              </div>
            </div>

            {/* Compact Contact Info */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="tel:+918599000777" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors shadow-md"><Phone size={18} /></div>
                <span className="hidden md:inline font-medium tracking-wide">+91 8599000777</span>
              </a>
              <a href="mailto:info@prudentiacollegeoflaw.com" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors shadow-md"><Mail size={18} /></div>
                <span className="hidden md:inline font-medium tracking-wide">info@prudentiacollegeoflaw.com</span>
              </a>
              <a href="/about" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center group-hover:border-[var(--primary-color)] transition-colors shadow-md"><MapPin size={18} /></div>
                <span className="hidden md:inline font-medium tracking-wide">Gurramguda, Hyderabad</span>
              </a>
            </div>
            
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-[var(--text-muted)] opacity-60 w-full pt-4 border-t border-[var(--card-border)]">
            <p>© {new Date().getFullYear()} Prudentia College of Law.</p>
            <div className="flex gap-4 mt-2 md:mt-0 font-bold">
              <a href="/" className="hover:text-[var(--primary-color)] transition-colors">Home</a>
              <a href="/about" className="hover:text-[var(--primary-color)] transition-colors">About</a>
              <a href="/apply" className="hover:text-[var(--primary-color)] transition-colors">Apply</a>
            </div>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
});

HomeContact.displayName = 'HomeContact';
export default HomeContact;
