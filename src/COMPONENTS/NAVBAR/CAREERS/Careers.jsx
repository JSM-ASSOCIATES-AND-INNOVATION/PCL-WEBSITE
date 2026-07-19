import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../LIB/supabaseClient';

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_careers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Could not fetch jobs:", error);
      } else {
        setJobs(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full text-center mb-20 relative z-10"
      >
        <span className="text-[var(--primary-color)] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
          Join Our Legacy
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Careers at Prudentia
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
          We are always looking for passionate educators, researchers, and administrators to help shape the next generation of legal vanguards.
        </p>
      </motion.div>

      {/* Why Join Us */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
            A Culture of Excellence
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>
            At Prudentia College of Law, you are not just an employee; you are a vital part of a prestigious academic community. We foster an environment of uncompromising integrity, rigorous scholarship, and intellectual freedom.
          </p>
          <ul className="space-y-4 font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {['State-of-the-art Infrastructure', 'Research Grants & Support', 'Competitive Compensation', 'Vibrant Academic Community'].map((perk, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="text-[var(--primary-color)]" size={20} />
                <span className="text-[var(--text-color)]">{perk}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-[32px] overflow-hidden relative min-h-[300px] border border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-color)_0%,transparent_60%)] opacity-10"></div>
           <div className="absolute inset-0 flex flex-col justify-center items-center p-10 text-center">
              <Briefcase className="text-[var(--primary-color)] mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2 text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>Don't see a perfect fit?</h3>
              <p className="text-[var(--text-muted)] mb-8" style={{ fontFamily: "'Outfit', sans-serif" }}>We are always eager to meet outstanding talent.</p>
              <a 
                href="mailto:careers@prudentiacollege.edu" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--text-color)] text-[var(--bg-color)] font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
              >
                Submit Open Application <ArrowRight size={16} />
              </a>
           </div>
        </motion.div>
      </div>

      {/* Open Positions Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10"
      >
        <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Current <span className="text-[var(--primary-color)] italic">Openings</span>
            </h2>
            <div className="h-[1px] w-24 bg-[var(--primary-color)]/50 mt-6" />
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : jobs.length === 0 ? (
            <div className="text-center py-20 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-[24px]">
                <p className="text-[var(--text-muted)] text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    There are currently no open positions. Please check back later or submit an open application!
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
                <motion.div 
                key={job.id}
                variants={itemVariants}
                className="group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex flex-col"
                >
                <div className="flex justify-between items-start mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20">
                    {job.department}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{job.type}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-color)] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{job.title}</h3>
                
                <div className="flex flex-col gap-2 mb-8 mt-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">
                        <MapPin size={14} className="text-[var(--primary-color)]" /> {job.location}
                    </div>
                </div>

                <a 
                    href={`mailto:careers@prudentiacollege.edu?subject=Application for ${job.title}`}
                    className="flex items-center justify-between w-full pt-4 border-t border-[var(--card-border)] text-[var(--text-color)] group-hover:text-[var(--primary-color)] transition-colors"
                >
                    <span className="text-xs font-bold uppercase tracking-widest">Apply via Email</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform" />
                </a>
                </motion.div>
            ))}
            </div>
        )}
      </motion.div>

    </div>
  );
};

export default Careers;
