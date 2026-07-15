/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import classroomImg from '../../../ASSETS/CAMPUS/pcl_classroom_1.webp';
import classroom2Img from '../../../ASSETS/CAMPUS/pcl_classroom_2.webp';
import classroom3Img from '../../../ASSETS/CAMPUS/pcl_classroom_3.webp';

const Academics = forwardRef(({ windowWidth, academicGridRef }, ref) => {
  return (
    <section className="slide" ref={ref}>
      <div className="section-glow"></div>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-header" style={{ marginBottom: '10px' }}>
          <span className="section-subtitle text-sm md:text-base">Our Programs</span>
          <h2 className="section-heading text-3xl md:text-4xl">Academic Excellence</h2>
        </div>
        
        {windowWidth <= 900 ? (
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <Carousel 
              items={[
                {
                  id: 1,
                  image: classroomImg,
                  degree: "BA LL.B",
                  title: "Integrated Hons.",
                  description: "A comprehensive 5-year program merging humanities with profound legal frameworks.",
                  link: "/programs/ba-llb"
                },
                {
                  id: 2,
                  image: classroom2Img,
                  degree: "BBA LL.B",
                  title: "Corporate Hons.",
                  description: "A 5-year elite program designed for future leaders in corporate governance and law.",
                  link: "/programs/bba-llb"
                },
                {
                  id: 3,
                  image: classroom3Img,
                  degree: "LL.B Standard",
                  title: "3-Year Degree",
                  description: "An intensive 3-year foundational law degree for graduates of any discipline.",
                  link: "/programs/llb"
                }
              ]} 
              baseWidth={windowWidth - 80} 
              autoplay={false}
              loop={false}
              round={false}
            />
          </div>
        ) : (
          <div className="academic-grid" ref={academicGridRef}>
            <Link to="/programs/ba-llb" className="elegant-card block cursor-pointer group">
              <div className="card-bg" style={{ backgroundImage: `url(${classroomImg})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">5-Year Integrated</span>
                <h3>BA LL.B <span className="program-focus">Honors</span></h3>
                <p>A comprehensive program combining arts and law for a holistic understanding of the legal system and societal dynamics.</p>
                <div className="view-syllabus">Explore Program <span className="arrow group-hover:translate-x-2 transition-transform">➔</span></div>
              </div>
            </Link>

            <Link to="/programs/bba-llb" className="elegant-card block cursor-pointer group">
              <div className="card-bg" style={{ backgroundImage: `url(${classroom2Img})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">5-Year Corporate</span>
                <h3>BBA LL.B <span className="program-focus">Honors</span></h3>
                <p>Designed for future corporate leaders, integrating advanced business administration principles with corporate law.</p>
                <div className="view-syllabus">Explore Program <span className="arrow group-hover:translate-x-2 transition-transform">➔</span></div>
              </div>
            </Link>

            <Link to="/programs/llb" className="elegant-card block cursor-pointer group">
              <div className="card-bg" style={{ backgroundImage: `url(${classroom3Img})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">3-Year Graduate</span>
                <h3>LL.B <span className="program-focus">Standard</span></h3>
                <p>Intensive, rigorous legal training tailored specifically for graduates seeking to enter the legal profession swiftly.</p>
                <div className="view-syllabus">Explore Program <span className="arrow group-hover:translate-x-2 transition-transform">➔</span></div>
              </div>
            </Link>
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }} className="pb-8 md:pb-0 z-20 relative">
          <Link to="/programs" className="px-6 md:px-8 py-3 bg-[#FFBF00] font-bold uppercase tracking-widest rounded hover:bg-white transition-colors text-sm md:text-base" style={{ color: '#000000' }}>
            Explore All Programs
          </Link>
        </div>
      </div>
    </section>
  );
});

Academics.displayName = 'Academics';
export default Academics;
