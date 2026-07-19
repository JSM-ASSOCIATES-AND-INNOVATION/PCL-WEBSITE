import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Award, MapPin } from 'lucide-react';
import ouLogo from '../../../ASSETS/LOGOS/ou_logo.png';
import bciLogo from '../../../ASSETS/LOGOS/bci_logo.png';

const Affiliations = () => {
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
    <div className="w-full min-h-screen pt-32 pb-32 px-6 md:px-12 relative flex flex-col items-center overflow-hidden bg-[var(--bg-color)] transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[800px] bg-[var(--primary-glow)] blur-[200px] rounded-full pointer-events-none z-0 opacity-40 transition-colors duration-500" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full text-center mb-16"
      >
        <span className="text-[var(--primary-color)] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
          Accreditations & Recognition
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-color)' }}>
          Institutional <span className="text-[var(--primary-color)] italic pr-2">Affiliations.</span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg leading-relaxed">
          Prudentia College of Law is recognized by the highest statutory bodies in India, ensuring our students receive a globally recognized, rigorous legal education.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        {/* Osmania University Card */}
        <motion.div 
          variants={itemVariants}
          className="relative group rounded-[32px] overflow-hidden p-10 flex flex-col justify-between bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:shadow-[0_0_40px_var(--primary-glow)] hover:border-[var(--primary-color)]/30 transition-all duration-500 transform hover:-translate-y-2"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-[var(--bg-color)] border border-[var(--card-border)] p-2 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <img src={ouLogo} alt="Osmania University Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-color)', fontFamily: "'Playfair Display', serif" }}>Osmania University</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-xs font-bold uppercase tracking-wider">
                Affiliated Institution
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <p className="text-[var(--text-muted)] leading-relaxed">
              Prudentia College of Law is proudly affiliated with Osmania University, one of India's oldest and most prestigious state universities, established in 1918. The Law Faculty at Osmania University has a deep-rooted history pre-dating the university itself, renowned for shaping the legal landscape of the nation.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <BookOpen className="text-[var(--primary-color)] shrink-0 mt-1" size={18} />
                <span className="text-sm md:text-base text-[var(--text-color)]">Stringent academic curriculum meeting global standards.</span>
              </li>
              <li className="flex items-start gap-3">
                <Award className="text-[var(--primary-color)] shrink-0 mt-1" size={18} />
                <span className="text-sm md:text-base text-[var(--text-color)]">Degrees recognized globally for higher education and practice.</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-[var(--card-border)] flex justify-between items-center">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">College Code</p>
                <p className="text-xl font-mono font-bold" style={{ color: 'var(--text-color)' }}>1720</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bar Council of India Card */}
        <motion.div 
          variants={itemVariants}
          className="relative group rounded-[32px] overflow-hidden p-10 flex flex-col justify-between bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-500 transform hover:-translate-y-2"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-[var(--bg-color)] border border-[var(--card-border)] p-2 shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <img src={bciLogo} alt="Bar Council of India Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-color)', fontFamily: "'Playfair Display', serif" }}>Bar Council of India</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider">
                Approved Institution
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <p className="text-[var(--text-muted)] leading-relaxed">
              We are formally approved by the Bar Council of India (BCI), the statutory body created by Parliament to regulate and represent the Indian bar. This approval certifies that our institution maintains the highest standards of legal education and infrastructure.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Shield className="text-blue-500 shrink-0 mt-1" size={18} />
                <span className="text-sm md:text-base text-[var(--text-color)]">Graduates are eligible to enroll as advocates nationwide.</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-blue-500 shrink-0 mt-1" size={18} />
                <span className="text-sm md:text-base text-[var(--text-color)]">Compliance with national statutory requirements for legal education.</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-[var(--card-border)] flex justify-between items-center">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Order No</p>
                <p className="text-xl font-mono font-bold" style={{ color: 'var(--text-color)' }}>286/2026</p>
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Affiliations;
