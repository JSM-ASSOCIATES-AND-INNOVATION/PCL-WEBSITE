/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import CountUp from '../CountUp';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const HomeContact = forwardRef(({ activeSlide }, ref) => {
  const [activeCard, setActiveCard] = useState(0);
  const [activeMetric, setActiveMetric] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
      setActiveMetric((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <>
      {/* Slide 4: Admissions & Metrics */}
      <section className="slide bg-[var(--bg-color)] flex items-center justify-center relative overflow-hidden" ref={(el) => { if(ref.current) ref.current[4] = el; }}>
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="container relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-0 flex flex-col justify-center h-full">
          
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 lg:gap-20 items-center justify-center h-full">
            
            {/* Left: Narrative */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3 md:gap-8">
              <div className="w-10 md:w-16 h-1 bg-[var(--primary-color)]"></div>
              
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-color)' }}>
                Uncompromising <br/>
                <span className="text-[var(--primary-color)]">Excellence.</span><br/>
                Accessible to All.
              </h2>
              
              <p className="text-xs md:text-xl text-brand-muted font-light leading-relaxed max-w-lg">
                Experience world-class legal education with an unparalleled fee structure of <strong className="text-brand-text">₹20,000 per annum</strong>. Admissions are strictly merit-based, governed by Osmania University Counseling (80%) and select Management Quotas (20%).
              </p>
              
              <div className="mt-1 md:mt-4">
                <a href="/apply" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-[var(--primary-color)] rounded-full font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-[var(--primary-hover)] transition-transform duration-300 hover:-translate-y-1 shadow-lg shadow-[var(--primary-glow)] text-center w-max" style={{ backgroundColor: '#facc15' }}>
                  <span className="text-black block w-full h-full leading-none mt-1" style={{ color: '#000000' }}>Begin Your Journey ➔</span>
                </a>
              </div>
            </div>

            {/* Right: Floating Metrics Grid Desktop */}
            <div className="hidden md:grid w-full lg:w-1/2 grid-cols-2 gap-6 relative">
              
              {/* Card 1 */}
              <div className="bg-brand-card border border-brand-border rounded-3xl p-8 col-span-2 shadow-[0_20px_50px_var(--glass-shadow)] backdrop-blur-xl relative overflow-hidden group hover:border-[var(--primary-color)] transition-colors duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-6xl md:text-7xl font-light text-brand-text mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <CountUp to={240} duration={2} startWhen={activeSlide >= 4} />
                </h3>
                <p className="text-[var(--primary-color)] uppercase tracking-widest text-sm font-bold">Elite Phase I Scholars</p>
              </div>

              {/* Card 2 */}
              <div className="bg-brand-card border border-brand-border rounded-3xl p-8 shadow-[0_20px_50px_var(--glass-shadow)] backdrop-blur-xl group hover:border-[var(--primary-color)] transition-colors duration-500 relative overflow-hidden">
                <h3 className="text-5xl md:text-6xl font-light text-brand-text mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <CountUp to={100} duration={2} startWhen={activeSlide >= 4} /><span className="text-brand-muted">%</span>
                </h3>
                <p className="text-brand-muted uppercase tracking-widest text-xs font-semibold">Distinguished Legal Faculty</p>
              </div>

              {/* Card 3 */}
              <div className="bg-brand-card border border-brand-border rounded-3xl p-8 shadow-[0_20px_50px_var(--glass-shadow)] backdrop-blur-xl group hover:border-[var(--primary-color)] transition-colors duration-500 relative overflow-hidden">
                <h3 className="text-5xl md:text-6xl font-light text-brand-text mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <CountUp to={1200} duration={2} startWhen={activeSlide >= 4} separator="," /><span className="text-[var(--primary-color)]">+</span>
                </h3>
                <p className="text-brand-muted uppercase tracking-widest text-xs font-semibold">Future Campus Capacity</p>
              </div>
            </div>

            {/* Right: Metrics Carousel Mobile */}
            <div 
              className="md:hidden w-full relative h-[160px] flex justify-center mt-4"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                {activeMetric === 0 && (
                  <motion.div 
                    key="m0"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveMetric(1);
                      else if (offset.x > 30) setActiveMetric(2);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-[var(--primary-color)] rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden touch-pan-y"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-glow)] rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                    <h3 className="text-5xl font-light text-brand-text mb-2 tracking-tighter relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <CountUp to={240} duration={2} startWhen={activeSlide >= 4} />
                    </h3>
                    <p className="text-[var(--primary-color)] uppercase tracking-widest text-xs font-bold relative z-10 text-center">Elite Phase I Scholars</p>
                  </motion.div>
                )}
                {activeMetric === 1 && (
                  <motion.div 
                    key="m1"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveMetric(2);
                      else if (offset.x > 30) setActiveMetric(0);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl touch-pan-y"
                  >
                    <h3 className="text-5xl font-light text-brand-text mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <CountUp to={100} duration={2} startWhen={activeSlide >= 4} /><span className="text-brand-muted">%</span>
                    </h3>
                    <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold text-center">Distinguished Legal Faculty</p>
                  </motion.div>
                )}
                {activeMetric === 2 && (
                  <motion.div 
                    key="m2"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveMetric(0);
                      else if (offset.x > 30) setActiveMetric(1);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center shadow-xl touch-pan-y"
                  >
                    <h3 className="text-5xl font-light text-brand-text mb-2 tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <CountUp to={1200} duration={2} startWhen={activeSlide >= 4} separator="," /><span className="text-[var(--primary-color)]">+</span>
                    </h3>
                    <p className="text-brand-muted uppercase tracking-widest text-[10px] font-semibold text-center">Future Campus Capacity</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute -bottom-6 flex justify-center gap-2">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${activeMetric === idx ? 'bg-[var(--primary-color)]' : 'bg-brand-border'}`} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Slide 5: Campus Visit / Contact Footer */}
      <section className="slide bg-[var(--bg-color)] relative" ref={(el) => { if(ref.current) ref.current[5] = el; }}>
        
        {/* Decorative subtle top border */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-30"></div>

        <div className="container relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 text-center flex flex-col justify-between h-full py-6 md:py-8">
          
          <div className="flex-grow flex flex-col justify-center pt-16 md:pt-20">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-2 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>
              Visit Our Campus
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto mb-4 md:mb-6 text-xs md:text-base px-2">
              Experience the vibrant academic atmosphere and state-of-the-art facilities at Prudentia College of Law.
            </p>

            {/* Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-6 md:mb-6 text-brand-text">
              
              <div className="bg-brand-card border border-brand-border md:rounded-2xl p-4 md:p-6 flex flex-col items-center hover:-translate-y-1 transition-transform duration-500 shadow-xl">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-2 md:mb-4 border border-[var(--primary-color)]/30">
                  <Phone size={18} />
                </div>
                <h4 className="text-lg font-bold mb-1">Call Us</h4>
                <p className="text-brand-muted text-sm">+91 8599000777</p>
              </div>

              <div className="bg-brand-card border border-[var(--primary-color)] md:rounded-2xl p-4 md:p-6 flex flex-col items-center hover:-translate-y-1 transition-transform duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--primary-glow)] to-transparent opacity-20 pointer-events-none"></div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary-color)] text-[#050505] flex items-center justify-center mb-2 md:mb-4 shadow-lg shadow-[var(--primary-glow)] relative z-10">
                  <MapPin size={18} />
                </div>
                <h4 className="text-lg font-bold mb-1 relative z-10">Our Location</h4>
                <p className="text-brand-muted text-xs relative z-10 leading-relaxed">3-23, Gurramguda,<br/>Opp Badangpet Municipal Office,<br/>Balapur Mandal, Hyderabad - 501510</p>
              </div>

              <div className="bg-brand-card border border-brand-border md:rounded-2xl p-4 md:p-6 flex flex-col items-center hover:-translate-y-1 transition-transform duration-500 shadow-xl">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-2 md:mb-4 border border-[var(--primary-color)]/30">
                  <Mail size={18} />
                </div>
                <h4 className="text-lg font-bold mb-1">Email Us</h4>
                <p className="text-brand-muted text-sm">info@prudentiacollegeoflaw.com</p>
              </div>

            </div>

            {/* Mobile Carousel */}
            <div 
              className="md:hidden w-full relative h-[160px] mt-2 mb-6 text-brand-text flex justify-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              <AnimatePresence mode="wait">
                {activeCard === 0 && (
                  <motion.div 
                    key="c0"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveCard(1);
                      else if (offset.x > 30) setActiveCard(2);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-brand-border rounded-2xl p-4 flex flex-col items-center shadow-xl justify-center touch-pan-y"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-2 border border-[var(--primary-color)]/30">
                      <Phone size={16} />
                    </div>
                    <h4 className="text-base font-bold mb-1">Call Us</h4>
                    <p className="text-brand-muted text-[10px]">+91 8599000777</p>
                  </motion.div>
                )}
                {activeCard === 1 && (
                  <motion.div 
                    key="c1"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveCard(2);
                      else if (offset.x > 30) setActiveCard(0);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-[var(--primary-color)] rounded-2xl p-4 flex flex-col items-center shadow-2xl justify-center overflow-hidden touch-pan-y"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--primary-glow)] to-transparent opacity-20 pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-[#050505] flex items-center justify-center mb-2 shadow-lg shadow-[var(--primary-glow)] relative z-10">
                      <MapPin size={16} />
                    </div>
                    <h4 className="text-base font-bold mb-1 relative z-10">Our Location</h4>
                    <p className="text-brand-muted text-[9px] relative z-10 leading-tight">3-23, Gurramguda,<br/>Opp Badangpet Municipal Office, Balapur Mandal,<br/>Hyderabad - 501510</p>
                  </motion.div>
                )}
                {activeCard === 2 && (
                  <motion.div 
                    key="c2"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -30) setActiveCard(0);
                      else if (offset.x > 30) setActiveCard(1);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-brand-card border border-brand-border rounded-2xl p-4 flex flex-col items-center shadow-xl justify-center touch-pan-y"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-2 border border-[var(--primary-color)]/30">
                      <Mail size={16} />
                    </div>
                    <h4 className="text-base font-bold mb-1">Email Us</h4>
                    <p className="text-brand-muted text-[10px]">info@prudentiacollegeoflaw.com</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute -bottom-5 flex justify-center gap-2">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${activeCard === idx ? 'bg-[var(--primary-color)]' : 'bg-brand-border'}`} />
                ))}
              </div>
            </div>
          </div>
          
          <footer className="w-full border-t border-brand-border pt-3 md:pt-5 flex flex-col items-center text-center mt-auto pb-2 md:pb-0">
            
            {/* Desktop Brand Logo */}
            <a href="/" className="hidden md:flex items-center gap-3 text-brand-text mb-3">
              <div className="w-8 h-8 bg-center bg-contain bg-no-repeat brand-crest"></div>
              <div className="flex flex-col text-left leading-none">
                <span className="font-bold tracking-wider text-sm">PRUDENTIA</span>
                <span className="text-[9px] tracking-widest opacity-80 mt-0.5 uppercase">College of Law</span>
              </div>
            </a>

            {/* Desktop Full Links */}
            <div className="hidden md:flex flex-wrap justify-center gap-x-6 gap-y-3 mb-4 text-xs font-bold tracking-widest uppercase text-brand-muted max-w-4xl">
               <a href="/" className="hover:text-[var(--primary-color)] transition-colors">Home</a>
               <a href="/about" className="hover:text-[var(--primary-color)] transition-colors">About</a>
               <a href="/about/leadership" className="hover:text-[var(--primary-color)] transition-colors">Leadership</a>
               <a href="/about/faculty" className="hover:text-[var(--primary-color)] transition-colors">Faculty</a>
               <a href="/programs/ba-llb" className="hover:text-[var(--primary-color)] transition-colors">BA-LLB</a>
               <a href="/programs/bba-llb" className="hover:text-[var(--primary-color)] transition-colors">BBA-LLB</a>
               <a href="/programs/llb" className="hover:text-[var(--primary-color)] transition-colors">LLB</a>
               <a href="/campus/facilities" className="hover:text-[var(--primary-color)] transition-colors">Facilities</a>
               <a href="/campus/gallery" className="hover:text-[var(--primary-color)] transition-colors">Gallery</a>
               <a href="/contact" className="hover:text-[var(--primary-color)] transition-colors">Contact</a>
               <a href="/terms" className="hover:text-[var(--primary-color)] transition-colors">Terms</a>
               <a href="/privacy" className="hover:text-[var(--primary-color)] transition-colors">Privacy</a>
               <a href="/apply" className="text-[var(--primary-color)] hover:text-white transition-colors">Apply Now</a>
            </div>

            {/* Desktop Socials */}
            <div className="hidden md:flex justify-center gap-3 mb-3">
              <a href="#" className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-[#050505] hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all">
                <FaInstagram className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-[#050505] hover:bg-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all">
                <FaWhatsapp className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile Compact Footer Layout */}
            <div className="md:hidden w-full flex flex-col items-center">
              <div className="flex w-full justify-between items-center px-4 mb-2.5">
                <a href="/" className="flex items-center gap-2 text-brand-text">
                  <div className="w-5 h-5 bg-center bg-contain bg-no-repeat brand-crest"></div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-bold tracking-wider text-[11px]">PRUDENTIA</span>
                    <span className="text-[7px] tracking-widest opacity-80 mt-[2px] uppercase">College of Law</span>
                  </div>
                </a>
                <div className="flex gap-2">
                  <a href="#" className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-[#050505] hover:bg-[var(--primary-color)] transition-all">
                    <FaInstagram size={11} />
                  </a>
                  <a href="#" className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-[#050505] hover:bg-[var(--primary-color)] transition-all">
                    <FaWhatsapp size={11} />
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2.5 text-[8px] font-bold tracking-widest uppercase text-brand-muted">
                 <a href="/terms" className="hover:text-[var(--primary-color)] transition-colors">Terms</a>
                 <a href="/privacy" className="hover:text-[var(--primary-color)] transition-colors">Privacy</a>
                 <a href="/apply" className="text-[var(--primary-color)] hover:text-white transition-colors">Apply Now</a>
              </div>
            </div>
            
            <div className="text-[6.5px] md:text-[10px] uppercase tracking-widest text-brand-muted flex flex-col md:flex-row gap-0.5 md:gap-1.5 opacity-60">
              <p>© {new Date().getFullYear()} Prudentia College of Law. All rights reserved.</p>
              <p>JSM Associates & Innovations <span className="mx-0.5 md:mx-2 text-[var(--primary-color)]">×</span> Prudentia</p>
            </div>
            
          </footer>

        </div>
      </section>
    </>
  );
});

HomeContact.displayName = 'Contact';
export default HomeContact;
