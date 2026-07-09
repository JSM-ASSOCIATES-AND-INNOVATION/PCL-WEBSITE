import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFacilityById } from './facilitiesData';

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const facility = getFacilityById(id);

  if (!facility) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white">
        <h2 className="text-3xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Facility not found</h2>
        <button onClick={() => navigate('/campus/facilities')} className="text-[#FFBF00] hover:underline uppercase tracking-widest text-sm">Return to Facilities</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-[#050505] text-white overflow-x-hidden overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111] to-[#000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#FFBF00]/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        <Link to="/campus/facilities" className="inline-flex items-center text-gray-400 hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold">
          <span className="mr-2">←</span> Back to Facilities
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Hero Image Area */}
          <div className="relative w-full h-[400px] md:h-[500px]">
            <img 
              src={facility.image} 
              alt={facility.title} 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl bg-[#111] p-3 rounded-full border border-[#FFBF00]/30 shadow-[0_0_15px_rgba(255,191,0,0.2)]">
                  {facility.icon}
                </span>
                <span className="text-[#FFBF00] uppercase tracking-widest text-sm font-bold">
                  {facility.categoryTitle}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                {facility.title}
              </h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg md:text-xl font-light">
                {facility.content}
              </p>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-6 justify-between items-center">
              <p className="text-gray-500 text-sm">Experience the Prudentia Advantage.</p>
              <Link to="/apply" className="px-8 py-3 bg-[#FFBF00] text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-colors">
                Apply Now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
