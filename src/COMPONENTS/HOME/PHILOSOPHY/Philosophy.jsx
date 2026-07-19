/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { forwardRef } from 'react';
import entranceImg from '../../../ASSETS/CAMPUS/pcl_entrance.webp';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../../../LIB/hooks/useSiteContent';

const Philosophy = forwardRef((props, ref) => {
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const { content } = useSiteContent('/', 'about_snippet');

  const tagline = content?.tagline || "Our Philosophy";
  const heading1 = content?.heading1 || "Forging Legal";
  const heading2 = content?.heading2 || "Excellence.";
  const desc = content?.description || "Located in the strategic heart of Hyderabad, Prudentia transcends traditional education. We are an institution built on uncompromising rigor, designed to forge analytical minds capable of commanding courtrooms and navigating complex corporate governance.";
  const btnText = content?.btn_text || "Explore Our Legacy";
  const btnLink = content?.btn_link || "/about";

  return (
    <section className="slide w-full h-full relative flex items-center justify-center bg-[var(--bg-color)] overflow-hidden" ref={ref} {...props}>
      <div className="container relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-6 md:gap-16 pt-[80px] md:pt-[140px] pb-6 md:pb-10">
        
        {/* Left Side: Clean Image Box */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2 h-[30vh] md:h-[55vh] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] shrink-0 group relative"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center origin-center group-hover:scale-105 transition-transform duration-[3s] ease-out" 
            style={{ backgroundImage: `url(${entranceImg})` }}
          ></div>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700"></div>
        </motion.div>

        {/* Right Side: Clean Typography (No muddy cards) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "100px" }}
          className="w-full md:w-1/2 flex flex-col justify-center text-left"
        >
          <motion.div variants={textVariants} className="mb-3">
            <span className="block text-[10px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-bold">{tagline}</span>
          </motion.div>

          <motion.h2 variants={textVariants} className="text-[2.25rem] sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[var(--text-color)] leading-[1.1] mb-4 md:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            {heading1} <br/>
            <span className="italic font-medium text-[var(--primary-color)]">
              {heading2}
            </span>
          </motion.h2>

          <motion.p variants={textVariants} className="text-xs sm:text-sm md:text-base lg:text-[15px] text-[var(--text-muted)] font-light leading-[1.6] md:leading-[1.8] mb-6 md:mb-10 text-justify">
            {desc}
          </motion.p>

          <motion.div variants={textVariants}>
            <Link 
              to={btnLink} 
              className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-transparent border border-[var(--primary-color)]/50 rounded-full hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              
              <span className="relative z-10 text-[var(--text-color)] group-hover/btn:!text-black font-extrabold uppercase tracking-[0.15em] text-[10px] transition-colors duration-500 flex items-center gap-2">
                {btnText} 
                <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform duration-500" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
});

Philosophy.displayName = 'Philosophy';
export default Philosophy;
