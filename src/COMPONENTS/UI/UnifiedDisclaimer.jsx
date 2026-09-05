import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie, Check } from 'lucide-react';

export default function UnifiedDisclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if they already accepted the unified disclaimer
    const accepted = localStorage.getItem('pcl_unified_consent');
    if (!accepted) {
      // Small delay to let the preloader finish
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('pcl_unified_consent', 'all');
    setShow(false);
  };

  const handleRejectOptional = () => {
    localStorage.setItem('pcl_unified_consent', 'essential_only');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#0a0a0a] text-white max-w-2xl w-full rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-[#222222] relative"
          >
            {/* Luxury Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#111] via-[var(--primary-color)] to-[#111]"></div>
            
            <div className="p-6 md:p-8 flex flex-col gap-5">
              
              <div className="flex items-center gap-4 pb-4 border-b border-[#222222]">
                <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center shrink-0 border border-[#333]">
                  <Shield className="text-[var(--primary-color)] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-serif">Legal Disclaimer & Privacy Consent</h2>
                  <p className="text-[10px] font-black text-[var(--primary-color)] mt-1 uppercase tracking-widest">Bar Council & DPDPA Compliance</p>
                </div>
              </div>

              <div className="text-[#a1a1aa] text-sm leading-relaxed space-y-3">
                <p>
                  Welcome to Prudentia College of Law. By accessing this website, you acknowledge and agree to the following mandatory conditions:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-start gap-2 bg-[#111111] p-3 rounded-xl border border-[#222]">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-white">No Solicitation:</strong> As per Bar Council of India rules, this website provides academic information only and does not constitute solicitation or legal advice.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-[#111111] p-3 rounded-xl border border-[#222]">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-white">DPDPA (2023) Compliance:</strong> We collect and process essential personal data necessary for admissions and academic services.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-[#111111] p-3 rounded-xl border border-[#222]">
                    <Cookie className="w-4 h-4 text-[var(--primary-color)] shrink-0 mt-0.5" />
                    <span><strong className="text-white">Cookies:</strong> We use cookies to optimize site functionality. You can choose to accept all cookies or only essential ones.</span>
                  </li>
                </ul>
                <p className="text-xs text-[#666666] pt-2">
                  For more details, review our <a href="/privacy" className="text-[var(--primary-color)] hover:underline font-medium">Privacy Policy</a> and <a href="/terms" className="text-[var(--primary-color)] hover:underline font-medium">Terms of Use</a>.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-end border-t border-[#222222] mt-2">
                <button 
                  onClick={handleRejectOptional}
                  className="w-full sm:w-auto px-6 py-2.5 text-[#888888] font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-[#1a1a1a] transition-colors rounded-lg border border-[#333] bg-transparent"
                >
                  Reject Optional
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-8 py-2.5 bg-[var(--primary-color)] text-[#050505] font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all rounded-lg shadow-[0_0_20px_rgba(255,191,0,0.2)]"
                >
                  I Agree & Accept All
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
