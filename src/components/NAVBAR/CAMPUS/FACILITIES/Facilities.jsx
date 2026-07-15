import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { facilitiesData } from './facilitiesData.jsx';

export default function Facilities() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen w-full relative bg-brand-bg text-brand-text">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-brand-text mb-6 uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Campus <span className="text-[#FFBF00]">Facilities</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-3xl mx-auto text-lg leading-relaxed"
          >
            Experience a top-tier institutional environment. We offer highly logical, categorized themes mapping out an impactful campus experience, designed to project prestige, authority, and modernity.
          </motion.p>
        </div>

        {Object.entries(facilitiesData).map(([categoryKey, category], categoryIdx) => (
          <div key={categoryKey} className="mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-10 flex flex-col items-center md:items-start"
            >
              <h2 className="text-3xl font-bold text-brand-text mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {category.title}
              </h2>
              <div className="h-[2px] w-24 bg-[#FFBF00] mb-4"></div>
              <p className="text-brand-muted text-center md:text-left">{category.description}</p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {category.facilities.map((facility) => (
                <motion.div key={facility.id} variants={itemVariants} className="h-full">
                  <Link to={`/campus/facilities/${facility.id}`} className="block h-full group">
                    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden h-full flex flex-col group-hover:border-[#FFBF00]/50 transition-all duration-300 relative group-hover:shadow-[0_0_30px_rgba(255,191,0,0.1)]">
                      <div className="h-48 relative overflow-hidden">
                        <img 
                          src={facility.image} 
                          alt={facility.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                        <div className="absolute bottom-4 left-6 bg-brand-card border border-brand-border rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-lg">
                          {facility.icon}
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <h3 className="text-xl text-brand-text font-bold mb-3 group-hover:text-[#FFBF00] transition-colors">{facility.title}</h3>
                        <p className="text-brand-muted text-sm leading-relaxed flex-1">{facility.summary}</p>
                        
                        <div className="mt-6 flex items-center text-[#FFBF00] text-sm font-semibold tracking-wider uppercase">
                          <span>Explore Details</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
