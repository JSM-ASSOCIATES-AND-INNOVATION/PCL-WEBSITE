/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer } from 'lucide-react';
import SEO from '../COMPONENTS/SEO/SEO';

export default function UnderConstruction({ title }) {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen w-full bg-brand-bg flex flex-col items-center justify-center font-sans text-brand-text px-6">
      <SEO title={title || "Under Construction"} description="This page is currently being crafted." />

      
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 p-6 rounded-full bg-[#FFBF00]/10 border border-[#FFBF00]/20"
        >
          <Hammer size={48} className="text-[#FFBF00]" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4" 
         
        >
          {title || "Page Under Construction"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-brand-muted text-lg md:text-xl mb-12 max-w-xl leading-relaxed"
        >
          We are currently crafting this section to bring you an unparalleled experience. Please check back soon.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-brand-border rounded-full text-brand-text font-semibold transition-all"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Previous Page</span>
        </motion.button>
        
      </div>
    </div>
  );
}
