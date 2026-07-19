import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from './Carousel';
import classroomImg from '../../../ASSETS/CAMPUS/pcl_classroom_1.webp';
import classroom2Img from '../../../ASSETS/CAMPUS/pcl_classroom_2.webp';
import classroom3Img from '../../../ASSETS/CAMPUS/pcl_classroom_3.webp';

const Academics = forwardRef(({ windowWidth, academicGridRef, ...props }, ref) => {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="slide h-full w-full relative flex items-center justify-center py-10 md:py-16 bg-[var(--bg-color)]" ref={ref} {...props}>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none opacity-50 z-0"></div>
      
      <div className="container relative z-10 w-full">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVars} 
          className="text-center mb-10 md:mb-16"
        >
          <span className="block text-sm md:text-base uppercase tracking-widest text-[var(--primary-color)] font-bold mb-3">Our Programs</span>
          <h2 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Academic Excellence</h2>
        </motion.div>
        
        {windowWidth <= 900 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Carousel 
              items={[
                {
                  id: 1,
                  image: classroomImg,
                  degree: "BA LL.B",
                  title: "Integrated Hons.",
                  description: "A comprehensive 5-year program merging humanities with profound legal frameworks.",
                  link: "/programs/ba-llb"
                },
                {
                  id: 2,
                  image: classroom2Img,
                  degree: "BBA LL.B",
                  title: "Corporate Hons.",
                  description: "A 5-year elite program designed for future leaders in corporate governance and law.",
                  link: "/programs/bba-llb"
                },
                {
                  id: 3,
                  image: classroom3Img,
                  degree: "LL.B Standard",
                  title: "3-Year Degree",
                  description: "An intensive 3-year foundational law degree for graduates of any discipline.",
                  link: "/programs/llb"
                }
              ]} 
              baseWidth={windowWidth - 60} 
              autoplay={false}
              loop={false}
              round={false}
            />
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" 
            ref={academicGridRef}
          >
            {[
              {
                img: classroomImg,
                duration: "5-Year Integrated",
                title: "BA LL.B",
                focus: "Honors",
                desc: "A comprehensive program combining arts and law for a holistic understanding of the legal system and societal dynamics.",
                link: "/programs/ba-llb"
              },
              {
                img: classroom2Img,
                duration: "5-Year Corporate",
                title: "BBA LL.B",
                focus: "Honors",
                desc: "Designed for future corporate leaders, integrating advanced business administration principles with corporate law.",
                link: "/programs/bba-llb"
              },
              {
                img: classroom3Img,
                duration: "3-Year Graduate",
                title: "LL.B",
                focus: "Standard",
                desc: "Intensive, rigorous legal training tailored specifically for graduates seeking to enter the legal profession swiftly.",
                link: "/programs/llb"
              }
            ].map((prog, idx) => (
              <motion.div key={idx} variants={itemVars}>
                <Link to={prog.link} className="block group relative bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl h-full flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:border-[var(--primary-color)]">
                  {/* Card Background Image (Hidden by default, fades in on hover) */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-40 transition-opacity duration-500 z-0" style={{ backgroundImage: `url(${prog.img})`, WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}></div>
                  
                  {/* Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-[var(--primary-color)] group-hover:to-transparent transition-all duration-500 z-10"></div>
                  
                  <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                    <span className="text-xs md:text-sm uppercase tracking-[3px] text-[var(--text-muted)] mb-3">{prog.duration}</span>
                    <h3 className="text-2xl md:text-3xl font-semibold leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {prog.title} <br/><span className="text-[var(--primary-color)] italic font-normal text-xl md:text-2xl">{prog.focus}</span>
                    </h3>
                    <p className="text-[var(--text-muted)] font-light italic text-xs md:text-sm leading-relaxed mt-3 mb-6">
                      {prog.desc}
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-3 text-xs uppercase tracking-[2px] text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors">
                      Explore Program <span className="text-[var(--primary-color)] group-hover:translate-x-2 transition-transform">➔</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center pb-8 md:pb-0 z-20 relative"
        >
          <Link to="/programs" className="px-8 py-4 bg-[var(--primary-color)] text-black font-black uppercase tracking-widest text-xs rounded-full shadow-[0_0_20px_var(--primary-glow)] hover:scale-105 transition-all">
            Explore All Programs
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

Academics.displayName = 'Academics';
export default Academics;
