import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import snehaImage from '../../../assets/pcl_founder.png';

export default function Faculty() {
  const facultyMembers = [
    {
      id: 'sneha',
      name: 'Sneha Mulla',
      role: 'Founder',
      degrees: 'B.B.A., LL.B. (Hons.), LL.M.',
      image: snehaImage
    }
  ];

  return (
    <div className="h-screen w-full relative bg-brand-bg text-brand-text overflow-x-hidden overflow-y-auto">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-brand-text mb-6 uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our <span className="text-[#FFBF00]">Faculty</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-2xl mx-auto text-lg"
          >
            Distinguished scholars and experienced practitioners dedicated to shaping the future of legal education.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {facultyMembers.map((faculty, idx) => (
            <motion.div
              key={faculty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/about/faculty/${faculty.id}`} className="block group cursor-pointer h-full">
                <div className="bg-brand-card rounded-t-xl overflow-hidden aspect-[3/4] relative border border-brand-border border-b-0">
                  <img 
                    src={faculty.image} 
                    alt={faculty.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="bg-brand-card border border-brand-border border-t-[#FFBF00] border-t-4 p-6 rounded-b-xl group-hover:bg-[#151515] transition-colors h-[120px] flex flex-col justify-center">
                  <h3 className="text-xl text-brand-text font-bold mb-1 group-hover:text-[#FFBF00] transition-colors">{faculty.name}</h3>
                  <p className="text-brand-muted text-sm mb-1">{faculty.role}</p>
                  <p className="text-[#FFBF00]/70 text-xs uppercase tracking-widest">{faculty.degrees}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
