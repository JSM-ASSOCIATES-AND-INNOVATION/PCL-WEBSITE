import React, { forwardRef } from 'react';
import Carousel from './Carousel';
import classroomImg from '../../../assets/pcl_classroom_1.webp';
import classroom2Img from '../../../assets/pcl_classroom_2.webp';
import classroom3Img from '../../../assets/pcl_classroom_3.webp';

const Academics = forwardRef(({ windowWidth, academicGridRef }, ref) => {
  return (
    <section className="slide" ref={ref}>
      <div className="section-glow"></div>
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-header">
          <span className="section-subtitle">Our Programs</span>
          <h2 className="section-heading">Academic Excellence</h2>
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
            <div className="elegant-card">
              <div className="card-bg" style={{ backgroundImage: `url(${classroomImg})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">5-Year Integrated</span>
                <h3>BA LL.B <span className="program-focus">Honors</span></h3>
                <p>A comprehensive program combining arts and law for a holistic understanding of the legal system and societal dynamics.</p>
                <div className="view-syllabus">Explore Program <span className="arrow">➔</span></div>
              </div>
            </div>

            <div className="elegant-card">
              <div className="card-bg" style={{ backgroundImage: `url(${classroom2Img})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">5-Year Corporate</span>
                <h3>BBA LL.B <span className="program-focus">Honors</span></h3>
                <p>Designed for future corporate leaders, integrating advanced business administration principles with corporate law.</p>
                <div className="view-syllabus">Explore Program <span className="arrow">➔</span></div>
              </div>
            </div>

            <div className="elegant-card">
              <div className="card-bg" style={{ backgroundImage: `url(${classroom3Img})` }}></div>
              <div className="card-accent"></div>
              <div className="card-content">
                <span className="program-duration">3-Year Graduate</span>
                <h3>LL.B <span className="program-focus">Standard</span></h3>
                <p>Intensive, rigorous legal training tailored specifically for graduates seeking to enter the legal profession swiftly.</p>
                <div className="view-syllabus">Explore Program <span className="arrow">➔</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

Academics.displayName = 'Academics';
export default Academics;
