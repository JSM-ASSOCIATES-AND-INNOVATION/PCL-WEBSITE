import React from 'react';
import { motion } from 'framer-motion';

export default function FacultyCard({ faculty, onClick }) {
  const fProfile = faculty.faculty_profiles || {};
  const image = fProfile.image_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  const designation = fProfile.designation || faculty.department || 'Faculty Member';
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden backdrop-blur-md cursor-pointer group flex shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all"
    >
      <div className="w-28 md:w-36 shrink-0 relative overflow-hidden bg-black/20">
        <img 
          src={image} 
          alt={faculty.full_name} 
          className="absolute w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--card-bg)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="p-5 flex flex-col justify-center flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg md:text-xl font-bold text-[var(--text-color)] font-serif leading-tight">
            {faculty.full_name}
          </h3>
          <i className="fa-solid fa-circle-check text-[var(--primary-color)] text-[10px]"></i>
        </div>
        
        <p className="text-xs md:text-sm font-bold text-[var(--primary-color)] mb-2 tracking-wide uppercase">
          {designation}
        </p>
        
        {fProfile.degrees && (
          <p className="text-[10px] md:text-xs text-[var(--text-muted)] line-clamp-2">
            {fProfile.degrees}
          </p>
        )}
        
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-color)] opacity-50 group-hover:opacity-100 group-hover:text-[var(--primary-color)] transition-colors flex items-center gap-1">
            View Profile <i className="fa-solid fa-arrow-right text-[8px]"></i>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
