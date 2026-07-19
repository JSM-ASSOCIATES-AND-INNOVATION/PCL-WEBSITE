import React, { forwardRef } from 'react';
import entranceImg from '../../../ASSETS/CAMPUS/pcl_entrance.webp';
import { motion } from 'framer-motion';

const Philosophy = forwardRef((props, ref) => {
  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  return (
    <section className="slide w-full relative flex items-center justify-center py-10 md:py-12" ref={ref} {...props}>
      <div className="container w-full h-full md:h-[60vh] flex flex-col md:flex-row items-center gap-8 md:gap-0 mt-8 md:mt-0">
        
        {/* Left Side: Visual */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2 h-[30vh] md:h-full relative rounded-3xl md:rounded-r-none md:rounded-l-3xl overflow-hidden shadow-2xl"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center origin-center hover:scale-105 transition-transform duration-[2s]" 
            style={{ backgroundImage: `url(${entranceImg})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </motion.div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-4 md:px-16 z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="glass-card bg-[var(--card-bg)]/80 backdrop-blur-2xl border border-[var(--card-border)] p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
          >
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <motion.h2 variants={textVariants} className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Forging Legal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-light)]">
                Excellence.
              </span>
            </motion.h2>

            <motion.p variants={textVariants} className="text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed mb-8 italic text-justify">
              Located in the strategic heart of Hyderabad, Prudentia transcends traditional education. We are an institution built on uncompromising rigor, designed to forge analytical minds capable of commanding courtrooms and navigating complex corporate governance.
            </motion.p>

            <motion.div variants={textVariants}>
              <a href="/about" className="inline-flex items-center gap-3 text-[var(--primary-color)] font-bold tracking-widest uppercase text-xs hover:text-[var(--primary-hover)] transition-colors group/link pb-2 border-b border-[var(--primary-color)]/30 hover:border-[var(--primary-color)]">
                Explore Our Legacy 
                <span className="group-hover/link:translate-x-2 transition-transform">→</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
});

Philosophy.displayName = 'Philosophy';
export default Philosophy;
