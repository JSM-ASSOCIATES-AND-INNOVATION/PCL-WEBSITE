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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.5 
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          setActiveSlide(index);
        }
      });
    }, options);

    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => observer.observe(slide));

    return () => observer.disconnect();
  }, []);

  const scrollToSlide = (index) => {
    const slides = document.querySelectorAll('.slide');
    if (slides[index]) {
      slides[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const TOTAL_SLIDES = 6;

  return (
    <div ref={containerRef} className="snap-container bg-[var(--bg-color)]">
       {/* Pagination */}
       <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[99999] flex flex-col gap-3">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            onClick={() => scrollToSlide(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${activeSlide === i ? 'bg-[var(--primary-color)] scale-125' : 'bg-gray-400/30 hover:bg-[var(--primary-color)]/60'}`}
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
