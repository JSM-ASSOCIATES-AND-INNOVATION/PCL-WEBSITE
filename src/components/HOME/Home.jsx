import { useState, useEffect, useRef } from 'react';

import Hero from './Hero/Hero';
import Philosophy from './Philosophy/Philosophy';
import Academics from './Academics/Academics';
import Advantages from './Advantages/Advantages';
import Contact from './Contact/HomeContact';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const slideRefs = useRef([]);
  const academicGridRef = useRef(null);
  const TOTAL_SLIDES = 6;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = slideRefs.current.indexOf(entry.target);
          if (index !== -1) setActiveSlide(index);
        }
      });
    }, { threshold: 0.5 });

    slideRefs.current.forEach(slide => {
      if (slide) observer.observe(slide);
    });

    return () => {
      slideRefs.current.forEach(slide => {
        if (slide) observer.unobserve(slide);
      });
    };
  }, []);

  const scrollToSlide = (index) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let intervalId;
    if (activeSlide === 2) {
      intervalId = setInterval(() => {
        if (academicGridRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = academicGridRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 20) {
            academicGridRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            academicGridRef.current.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });
          }
        }
      }, 3500);
    } else {
      if (academicGridRef.current) {
        academicGridRef.current.scrollTo({ left: 0, behavior: 'instant' });
      }
    }
    return () => clearInterval(intervalId);
  }, [activeSlide]);

  return (
    <div className="snap-container">
      
      <div className="pagination">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            className={`dot ${activeSlide === i ? 'active' : ''}`}
            onClick={() => scrollToSlide(i)}
          />
        ))}
      </div>

      <Hero windowWidth={windowWidth} ref={el => slideRefs.current[0] = el} />
      <Philosophy ref={el => slideRefs.current[1] = el} />
      <Academics windowWidth={windowWidth} academicGridRef={academicGridRef} ref={el => slideRefs.current[2] = el} />
      <Advantages windowWidth={windowWidth} ref={el => slideRefs.current[3] = el} />
      <Contact activeSlide={activeSlide} ref={slideRefs} />

    </div>
  );
}
