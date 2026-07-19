import React, { forwardRef } from 'react';
import { Briefcase, Gavel, Shield, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../ACADEMICS/Carousel';

import ladyJusticeImg from '../../../ASSETS/CAMPUS/pcl_justice.webp';

const Advantages = forwardRef(({ windowWidth, ...props }, ref) => {
  
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const advantages = [
    {
      id: 'adv-1',
      icon: <Briefcase size={22} />,
      title: "Industry Integration",
      desc: "Forged alliances with top-tier law firms and judicial bodies, ensuring continuous court exposure and elite clerkship pipelines.",
      link: "/campus/facilities/corporate-placements"
    },
    {
      id: 'adv-2',
      icon: <Gavel size={22} />,
      title: "Practical Training",
      desc: "Immersion in advanced Moot Court warfare and Alternative Dispute Resolution (ADR) simulations.",
      link: "/campus/facilities/moot-court"
    },
    {
      id: 'adv-3',
      icon: <Shield size={22} />,
      title: "Legal Aid Clinic",
      desc: "Operating a dedicated in-house clinic, deploying students to defend underserved communities.",
      link: "/campus/facilities/legal-aid-clinic"
    },
    {
      id: 'adv-4',
      icon: <Landmark size={22} />,
      title: "Integrated Civil Services",
      desc: "Exclusive partnership with Sharat Chandra Academy to forge the next generation of judicial officers.",
      link: "/campus/facilities/integrated-coaching"
    }
  ];

  const AdvantageCard = ({ item }) => (
    <Link to={item.link} className="block group w-full h-full">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl rounded-2xl p-6 md:p-8 h-full flex flex-col items-start transition-all duration-500 hover:border-[var(--primary-color)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
        
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-6 border border-[var(--primary-color)]/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
          {React.cloneElement(item.icon, { size: 24 })}
        </div>
        <div className="relative z-10 flex flex-col flex-grow">
          <h4 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>{item.title}</h4>
          <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="slide w-full relative flex items-center justify-center py-10 md:py-16" ref={ref} {...props}>
      <div className="container w-full h-full md:h-[60vh] flex flex-col md:flex-row gap-8 md:gap-0 mt-8 md:mt-0">
        
        {/* Left Side: Visual */}
        <div className="w-full md:w-1/2 h-[30vh] md:h-full relative overflow-hidden md:rounded-r-3xl md:shadow-2xl">
          <motion.div 
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center origin-center" 
            style={{ backgroundImage: `url(${ladyJusticeImg})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-10 md:p-16 z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold mb-6 text-white" 
                style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}
              >
                The Prudentia <br/>
                <span className="text-[var(--primary-color)] drop-shadow-[0_0_20px_var(--primary-glow)]">Advantage.</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link to="/campus/facilities" className="inline-block px-8 py-4 bg-[var(--primary-color)] text-black font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_20px_var(--primary-glow)] hover:scale-105 hover:shadow-[0_0_30px_var(--primary-glow)] transition-all">
                  Explore All Facilities
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Grid of Advantages */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center px-4 md:px-12 z-10">
          {windowWidth <= 768 ? (
            <div className="w-full mb-10">
              <Carousel 
                items={advantages.map(adv => ({
                  id: adv.id,
                  customRender: () => <AdvantageCard item={adv} />
                }))}
                baseWidth={windowWidth - 40}
                autoplay={true}
                loop={true}
              />
            </div>
          ) : (
            <motion.div 
              variants={containerVars}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl"
            >
              {advantages.map((adv, idx) => (
                <motion.div key={adv.id} variants={itemVars} className="h-full">
                  <AdvantageCard item={adv} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </section>
  );
});

Advantages.displayName = 'Advantages';
export default Advantages;
