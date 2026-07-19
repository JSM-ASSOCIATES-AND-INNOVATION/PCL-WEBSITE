import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, FileText, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import campusLogoImg from '../../../ASSETS/LOGOS/pcl_campus_logo.webp';
import outdoorImg from '../../../ASSETS/CAMPUS/pcl_outdoor.webp';
import { useSite } from '../../../CONTEXT/SiteContext';

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

const paragraphVariants = {
  hidden: { opacity: 0, filter: "blur(4px)", y: 20 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const metricsVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.6 }
  }
};

// --- COMPONENTS ---

const AnimatedHeadline = ({ text, className, style }) => {
  const words = text.split(" ");
  return (
    <h1 className={`flex flex-wrap justify-center overflow-hidden ${className}`} style={style}>
      {words.map((word, idx) => (
        <motion.span 
          key={idx} 
          variants={wordVariants}
          className="inline-block mr-[0.25em] mb-[-0.15em] pb-[0.15em]"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
};

const Hero = forwardRef(({ windowWidth, ...props }, ref) => {
  const { isAdmissionsOpen } = useSite();
  const isMobile = windowWidth <= 768;

  return (
    <section 
      ref={ref} 
      {...props} 
      className="relative w-full min-h-screen pt-[120px] pb-[80px] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* BACKGROUND SCENE */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <motion.div
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="w-full h-full bg-cover bg-center origin-center"
          style={{ backgroundImage: `url(${windowWidth <= 900 ? campusLogoImg : outdoorImg})` }}
        />
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.55)] via-[rgba(0,0,0,0.35)] to-transparent mix-blend-multiply"></div>
        
        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* CONTENT FOREGROUND */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center text-center mt-auto"
      >
        
        {/* Badge (24px mb = mb-6) */}
        {isAdmissionsOpen && (
          <motion.div 
            variants={badgeVariants}
            className="mb-[24px] inline-flex items-center gap-3 px-5 py-2 h-[44px] rounded-full border border-white/20 bg-black/40 text-[var(--primary-color)] text-xs font-semibold uppercase tracking-widest backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] animate-pulse shadow-[0_0_10px_var(--primary-color)]"></span>
            Admissions Open 2026 - 2027
          </motion.div>
        )}

        {/* Headline (28px mb = mb-[28px]) */}
        <div className="mb-[28px] text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          <AnimatedHeadline 
            text="Advancing" 
            className="text-[38px] md:text-[52px] lg:text-[64px] xl:text-[72px] font-bold leading-[1.05] tracking-[-0.04em] drop-shadow-2xl" 
          />
          <AnimatedHeadline 
            text="Integrated Legal Education" 
            className="text-[38px] md:text-[52px] lg:text-[64px] xl:text-[72px] font-medium italic leading-[1.05] tracking-[-0.04em] text-[var(--primary-color)] drop-shadow-[0_0_30px_rgba(255,191,0,0.3)]" 
          />
        </div>

        {/* Paragraph (40px mb = mb-[40px]) */}
        <motion.p 
          variants={paragraphVariants}
          className="mb-[40px] text-[15px] md:text-[17px] text-gray-200 font-light max-w-[700px] mx-auto drop-shadow-md"
          style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1.9 }}
        >
          Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence at Prudentia College of Law.
        </motion.p>

        {/* Buttons (60px mb = mb-[60px]) */}
        <motion.div 
          variants={containerVariants}
          className="mb-[60px] flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 w-full sm:w-auto px-2"
        >
          {isAdmissionsOpen && (
            <motion.div variants={buttonVariants} className="w-full sm:w-auto">
              <Link to="/apply" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-[56px] px-8 bg-[var(--primary-color)] text-black font-bold uppercase tracking-[0.1em] text-sm rounded-[18px] transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,191,0,0.25)]">
                Apply Now
              </Link>
            </motion.div>
          )}

          <motion.div variants={buttonVariants} className="w-full sm:w-auto">
            <Link to="/programs" className="group w-full sm:w-auto flex items-center justify-center gap-2 h-[56px] px-8 bg-white/10 border border-white/20 text-white font-bold uppercase tracking-[0.1em] text-sm rounded-[18px] backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40">
              Explore Programs
            </Link>
          </motion.div>

          <motion.div variants={buttonVariants} className="w-full sm:w-auto hidden md:block">
            <Link to="/campus/facilities" className="group flex items-center justify-center gap-2 h-[56px] px-4 text-white/70 hover:text-white font-semibold uppercase tracking-wider text-sm transition-colors">
              Campus <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

      </motion.div>

      {/* METRICS (Desktop: Glass Strip, Mobile: Swipeable Cards) */}
      <motion.div 
        variants={metricsVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full mt-auto"
      >
        {isMobile ? (
          /* Mobile Metrics - Swipeable Horizontal Scroll */
          <div className="w-full overflow-x-auto pb-4 px-4 snap-x hide-scrollbar">
            <div className="flex gap-4 min-w-max justify-center">
              <div className="snap-center shrink-0 w-[110px] h-[80px] bg-white/5 border border-white/10 backdrop-blur-[16px] rounded-[16px] flex flex-col items-center justify-center p-2 text-center">
                <h4 className="text-white font-bold text-[11px] mb-1">BCI</h4>
                <p className="text-gray-400 text-[9px]">Approved</p>
              </div>
              <div className="snap-center shrink-0 w-[110px] h-[80px] bg-white/5 border border-white/10 backdrop-blur-[16px] rounded-[16px] flex flex-col items-center justify-center p-2 text-center">
                <h4 className="text-white font-bold text-[11px] mb-1">OU</h4>
                <p className="text-gray-400 text-[9px]">Affiliated</p>
              </div>
              <div className="snap-center shrink-0 w-[110px] h-[80px] bg-white/5 border border-white/10 backdrop-blur-[16px] rounded-[16px] flex flex-col items-center justify-center p-2 text-center">
                <h4 className="text-white font-bold text-[11px] mb-1">240</h4>
                <p className="text-gray-400 text-[9px]">Seats</p>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Metrics - Unified Glass Strip */
          <div className="max-w-5xl mx-auto px-6">
            <div className="w-full h-[92px] rounded-[22px] bg-white/5 border border-white/10 backdrop-blur-[16px] shadow-2xl flex items-center justify-around px-10 relative overflow-hidden">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-[44px] h-[44px] rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wide text-sm">BCI Approved</h4>
                  <p className="text-gray-400 text-[11px] tracking-widest mt-0.5">ORDER: 286/2026</p>
                </div>
              </div>

              <div className="w-px h-[40px] bg-white/10 relative z-10"></div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-[44px] h-[44px] rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/20">
                  <Landmark size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wide text-sm">OU Affiliated</h4>
                  <p className="text-gray-400 text-[11px] tracking-widest mt-0.5">CODE: 1720</p>
                </div>
              </div>

              <div className="w-px h-[40px] bg-white/10 relative z-10"></div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-[44px] h-[44px] rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center border border-[var(--primary-color)]/20">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wide text-sm">Phase I Intake</h4>
                  <p className="text-gray-400 text-[11px] tracking-widest mt-0.5">240 SEATS</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </motion.div>

      {/* Hide scrollbar styles for mobile swipeable cards */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
});

Hero.displayName = 'Hero';
export default Hero;
