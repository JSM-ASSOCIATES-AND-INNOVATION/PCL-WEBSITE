import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Bug } from 'lucide-react';
import SEO from '../SEO/SEO';

export default function NotFound404() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = () => {
      navigate('/');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleCrashReport = () => {
    const subject = encodeURIComponent("Website 404 / Crash Report");
    const body = encodeURIComponent(`I encountered a 404 error.\n\nURL I was trying to reach: ${window.location.href}\n\nPlease look into this.`);
    window.location.href = `mailto:contact.jsminnovations@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col justify-center items-center relative overflow-hidden font-['Outfit'] select-none">
      <SEO title="404 | Lost But Not Forgotten" description="Page not found on Prudentia College of Law website." />
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,191,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-color)] opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        
        {/* Giant 404 */}
        <motion.div 
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="text-[8rem] md:text-[15rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-color)] to-[var(--text-color)]/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--primary-color)]/20 blur-xl">
            <h1 className="text-[8rem] md:text-[15rem] font-black leading-none tracking-tighter">404</h1>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-4 md:mt-8 mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-['Playfair_Display'] italic text-[var(--text-color)] mb-4">
            Lost, But Not Forgotten.
          </h2>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-md mx-auto uppercase tracking-widest leading-relaxed">
            The page you are looking for has been moved, deleted, or never existed in the first place.
          </p>
        </motion.div>

        {/* Interactive "Press any key" */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-8 w-full"
        >
          <div className="flex items-center gap-3 text-[var(--primary-color)] font-mono text-sm md:text-base animate-pulse cursor-pointer" onClick={() => navigate('/')}>
            <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>
            PRESS ANY KEY TO RETURN HOME
            <span className="w-2 h-4 bg-[var(--primary-color)] inline-block opacity-70"></span>
          </div>

          <div className="h-px w-24 bg-[var(--card-border)]"></div>

          {/* Crash Report Button */}
          <button 
            onClick={handleCrashReport}
            className="group flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)]/50 hover:bg-[var(--card-bg)] hover:border-[var(--text-color)]/30 transition-all duration-300"
          >
            <Bug size={14} className="text-[var(--text-muted)] group-hover:text-[var(--primary-color)] transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors">
              Send Crash Report
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
