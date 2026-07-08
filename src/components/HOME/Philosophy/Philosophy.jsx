import React, { forwardRef } from 'react';
import entranceImg from '../../../assets/pcl_entrance.webp';

const Philosophy = forwardRef((props, ref) => {
  return (
    <section className="slide" ref={ref}>
      <div className="container split-screen">
        <div className="split-left philosophy-visual" style={{ backgroundImage: `url(${entranceImg})` }}>
          <div className="dark-overlay"></div>
        </div>
        <div className="split-right philosophy-content">
          <div className="glass-container">
            <h2 className="dramatic-title">Forging Legal<br/><span className="text-gradient">Excellence.</span></h2>
            <p className="dramatic-sub" style={{ marginBottom: '30px' }}>
              Located in the strategic heart of Hyderabad, Prudentia transcends traditional education. We are an institution built on uncompromising rigor, designed to forge analytical minds capable of commanding courtrooms and navigating complex corporate governance.
            </p>

            <div>
              <a href="/about" className="explore-legacy-btn">
                Explore Our Legacy <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Philosophy.displayName = 'Philosophy';
export default Philosophy;
