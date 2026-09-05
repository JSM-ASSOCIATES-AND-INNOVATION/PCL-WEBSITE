/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useRef } from 'react';
import Hero from './HERO/Hero';
import Philosophy from './PHILOSOPHY/Philosophy';
import Academics from './ACADEMICS/Academics';
import Advantages from './ADVANTAGES/Advantages';
import EventsPreview from './EVENTS/EventsPreview';
import HomeContact from './CONTACT/HomeContact';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Enable scroll snapping only on the homepage
    document.documentElement.classList.add('home-snap');
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.classList.remove('home-snap');
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          // Add half window height to trigger change midway through the scroll
          const newActiveSlide = Math.floor((scrollPosition + windowHeight / 2) / windowHeight);
          setActiveSlide(Math.max(0, Math.min(newActiveSlide, TOTAL_SLIDES - 1)));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSlide = (index) => {
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
      const slideHeight = slides[0].offsetHeight;
      window.scrollTo({
        top: index * slideHeight,
        behavior: 'smooth'
      });
    }
  };

  const TOTAL_SLIDES = 6;

  return (
    <div ref={containerRef} className="snap-container bg-[var(--bg-color)]">
       {/* Pagination */}
       <div className="hidden md:flex fixed right-2 lg:right-4 top-1/2 -translate-y-1/2 z-[99999] flex-col gap-3">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => scrollToSlide(i)}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 shadow-sm ${activeSlide === i ? 'bg-[var(--primary-color)] scale-125' : 'bg-gray-400/40 hover:bg-[var(--primary-color)]/60'}`}
          />
        ))}
      </div>

      <Hero windowWidth={windowWidth} data-index="0" />
      <Philosophy data-index="1" />
      <Academics windowWidth={windowWidth} data-index="2" />
      <Advantages windowWidth={windowWidth} data-index="3" />
      <EventsPreview data-index="4" />
      <HomeContact data-index="5" />
    </div>
  );
}
