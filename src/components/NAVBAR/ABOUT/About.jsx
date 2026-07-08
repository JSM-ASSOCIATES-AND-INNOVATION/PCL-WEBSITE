import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PixelCard from './LeadershipProfile/PixelCard';

import founderImg from '../../../assets/pcl_founder.png';
import coFounderImg from "../../../assets/pcl_cofounder.png";

const tabs = [
  {
    id: 'mission',
    label: 'Mission',
    content: 'To provide an elite, integrated legal environment that merges academic brilliance with uncompromising practical training, fostering critical thinkers who will redefine jurisprudence.'
  },
  {
    id: 'vision',
    label: 'Vision',
    content: 'To stand as the definitive institution of legal education in India—nurturing advocates, judges, and policy architects who uphold the Constitution with courage and social conscience.'
  },
  {
    id: 'motto',
    label: 'Motto',
    content: 'Excellence in Theory. Command in Practice.'
  }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative flex flex-col items-center bg-[#050505] overflow-x-hidden overflow-y-auto font-sans text-white scroll-smooth pb-32">
      {/* Clean Abstract Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      
      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-5xl px-6 md:px-12 flex flex-col items-center pt-24 md:pt-32 pb-12">
        
        {/* Top Intro Section */}
        <div className="w-full text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-white mb-12 uppercase leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Shaping the Future of <br className="hidden md:block" />
            <span className="text-[#FFBF00]">Legal Professionals.</span>
          </motion.h1>
          
          <div className="text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed text-justify space-y-6 mx-auto" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <span className="text-[#FFBF00] font-semibold text-xl">Prudentia College of Law, Gurramguda, Hyderabad</span> is established with a vision to nurture a new generation of legal professionals equipped with knowledge, integrity, and leadership. The institution is dedicated to creating an academic environment where law is not merely studied as a subject but understood as a powerful instrument of justice, social transformation, and nation-building.
            </motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
              At Prudentia College of Law, we believe that legal education must go beyond classrooms and textbooks. Our approach combines strong academic foundations with practical exposure through moot courts, legal aid initiatives, internships, ADR training, court visits, and skill-oriented learning. The college aims to bridge the gap between legal theory and professional practice, enabling students to develop analytical thinking, advocacy skills, and ethical responsibility.
            </motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
              The name “Prudentia” signifies wisdom, prudence, and sound judgment—values that form the core of our institution. We strive to inspire students to uphold constitutional values, respect the rule of law, and pursue justice with compassion and professionalism. With dedicated faculty, student-centered learning, and a commitment to academic excellence, Prudentia College of Law seeks to prepare future advocates, judges, legal advisors, policymakers, and socially conscious leaders who will contribute meaningfully to society.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[#FFBF00] text-center text-xl md:text-2xl mt-12 font-bold italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "At Prudentia, we do not merely educate law students—we shape the future of legal professionals."
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (index * 0.2), ease: "easeOut" }}
              className="relative p-8 md:p-10 bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl hover:border-[#FFBF00]/30 hover:bg-[#111] hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col items-center text-center"
            >
              {/* Card Hover Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFBF00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <h3 className="relative z-10 text-2xl lg:text-3xl text-[#FFBF00] uppercase tracking-widest font-semibold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                {tab.label}
              </h3>
              <p className="relative z-10 text-gray-400 leading-relaxed text-base lg:text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                "{tab.content}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Leadership Section */}
        <div className="w-full mt-16 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white mb-16 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our <span className="text-[#FFBF00]">Leadership</span>
          </motion.h2>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center justify-center w-full">
            
            {/* Founder Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[320px]"
            >
              <div 
                onClick={() => navigate('/about/leadership/founder')}
                className="w-full h-full cursor-pointer relative group"
              >
                <PixelCard 
                  variant="yellow" 
                  gap={8} 
                  speed={30} 
                >
                  <img 
                    src={founderImg} 
                    alt="Founder" 
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl z-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent rounded-[20px] z-10 pointer-events-none" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex flex-col pointer-events-none">
                    <h3 className="text-xl md:text-2xl text-white font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Ms. Mula Sneha Goud
                    </h3>
                    <p className="text-[#FFBF00] uppercase tracking-widest text-xs md:text-sm font-semibold mb-3">
                      Founder & Chairman – Prudentia College of Law
                    </p>
                    
                    {/* Hover Read More */}
                    <div className="flex items-center gap-2 text-white/0 group-hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-sm font-semibold">Read More</span>
                      <span className="text-lg">➔</span>
                    </div>
                  </div>
                </PixelCard>
              </div>
            </motion.div>

            {/* Co-Founder Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-[320px]"
            >
              <div 
                onClick={() => navigate('/about/leadership/co-founder')}
                className="w-full h-full cursor-pointer relative group"
              >
                <PixelCard 
                  variant="yellow" 
                  gap={8} 
                  speed={30} 
                >
                  <img 
                    src={coFounderImg} 
                    alt="Co-Founder" 
                    className="absolute inset-0 w-full h-full object-cover rounded-[18px] z-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent rounded-2xl z-10 pointer-events-none" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex flex-col pointer-events-none">
                    <h3 className="text-xl md:text-2xl text-white font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Mr. Bharat Krishna Buddala
                    </h3>
                    <p className="text-[#FFBF00] uppercase tracking-widest text-xs md:text-sm font-semibold mb-3">
                      Co-Founder & Managing Director, Prudentia College of Law
                    </p>
                    
                    {/* Hover Read More */}
                    <div className="flex items-center gap-2 text-white/0 group-hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <span className="text-sm font-semibold">Read More</span>
                      <span className="text-lg">➔</span>
                    </div>
                  </div>
                </PixelCard>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
