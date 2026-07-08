import React, { forwardRef } from 'react';
import campusLogoImg from '../../../assets/pcl_campus_logo.webp';
import outdoorImg from '../../../assets/pcl_outdoor.webp';

const Hero = forwardRef(({ windowWidth }, ref) => {
  return (
    <section className="slide" ref={ref}>
      <div className="hero-bg" style={{ backgroundImage: `url(${windowWidth <= 900 ? campusLogoImg : outdoorImg})` }}></div>
      <div className="hero-glow"></div>
      <div className="grid-bg"></div>
      
      <div className="hero-content">
        <div className="badge">Admissions Open 2026 - 2027</div>
        <h1 className="hero-title">Advancing <br/><span className="text-gradient">Integrated Legal Education</span></h1>
        <p className="hero-sub">Where rigorous scholarship meets uncompromising integrity. Shaping the vanguards of modern jurisprudence.</p>
      </div>

      <div className="dashboard glass-panel">
        <div className="dash-item">
          <h4>BCI Approved</h4>
          <p>Order No: 286/2026</p>
        </div>
        <div className="dash-item">
          <h4>Osmania University</h4>
          <p>College Code: 1720</p>
        </div>
        <div className="dash-item">
          <h4>Phase I Intake</h4>
          <p>Regulated 240 Seats</p>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
export default Hero;
