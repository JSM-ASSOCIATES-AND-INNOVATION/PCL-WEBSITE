import React, { forwardRef } from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import CountUp from '../CountUp';
import LightRays from '../LightRays';

const Contact = forwardRef(({ activeSlide }, ref) => {
  return (
    <>
      <section className="slide" ref={(el) => { if(ref.current) ref.current[4] = el; }}>
        <div className="metrics-bg" style={{ backgroundImage: 'none', zIndex: 0, opacity: 1, maskImage: 'none', WebkitMaskImage: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.8 }}>
            <LightRays
              raysOrigin="top-center"
              raysColor="#FFBF00"
              raysSpeed={1.5}
              lightSpread={1.2}
              rayLength={2.0}
              followMouse={true}
              mouseInfluence={0.2}
              noiseAmount={0.05}
              distortion={0.1}
              fadeDistance={1.0}
              pulsating={true}
            />
          </div>
        </div>
        <div className="container metrics-container" style={{ position: 'relative', zIndex: 2 }}>
          
          <div className="metrics-row">
            <div className="metric-item">
              <h3 className="metric-number">
                <CountUp to={240} duration={2} startWhen={activeSlide >= 4} />
              </h3>
              <p>Elite Phase I Scholars</p>
            </div>
            <div className="metric-item">
              <h3 className="metric-number">
                <CountUp to={100} duration={2} startWhen={activeSlide >= 4} />%
              </h3>
              <p>Distinguished Legal Faculty</p>
            </div>
            <div className="metric-item">
              <h3 className="metric-number">
                <CountUp to={1200} duration={2} startWhen={activeSlide >= 4} separator="," />+
              </h3>
              <p>Future Campus Capacity</p>
            </div>
          </div>

          <div className="admissions-cta">
            <h2 className="admissions-title">Uncompromising Excellence. Accessible to All.</h2>
            <p className="admissions-body">
              Experience world-class legal education with an unparalleled fee structure of ₹20,000 per annum. Admissions are strictly merit-based, governed by Osmania University Counseling (80%) and select Management Quotas (20%).
            </p>
            <a href="#" className="btn-amber-glow">Begin Your Journey ➔</a>
          </div>

        </div>
      </section>

      <section className="slide" ref={(el) => { if(ref.current) ref.current[5] = el; }} style={{ background: '#050505' }}>
        <div className="container gateway-content" style={{ maxWidth: '1000px', textAlign: 'center' }}>
          
          <h2 className="section-heading">Visit Our Campus</h2>
          <p className="dramatic-sub gateway-sub">Experience the legacy of Prudentia College of Law in person. Schedule a campus tour or connect with our admissions desk today.</p>

          <div className="contact-grid">
            <div className="contact-box">
              <div className="icon-wrapper"><Phone size={24} /></div>
              <h4>Contact & Support</h4>
              <a href="tel:+918599000777" style={{ marginBottom: '8px', fontSize: '1rem', color: '#FFBF00' }}>+91 8599000777</a>
              <a href="mailto:info@prudentiacollegeoflaw.com">info@prudentiacollegeoflaw.com</a>
            </div>
            
            <div className="contact-box highlight">
              <div className="icon-wrapper"><MapPin size={24} /></div>
              <h4>Campus Location</h4>
              <p>
                3-23, Gurramguda,<br/>
                Opp Badangpet Municipal Office,<br/>
                Balapur Mandal, R.R. Dist,<br/>
                Hyderabad - Telangana 501510
              </p>
              <a href="https://maps.app.goo.gl/aCfDvfHMxqbucLnT8" target="_blank" rel="noopener noreferrer" className="map-link">Get Directions ➔</a>
            </div>

            <div className="contact-box">
              <div className="icon-wrapper"><Clock size={24} /></div>
              <h4>Operating Hours</h4>
              <p className="hours-days">Monday – Saturday</p>
              <p className="hours-time">9:00 AM – 4:00 PM</p>
            </div>
          </div>

          <div className="tiny-footer">
            <div className="tf-left">
              &copy; {new Date().getFullYear()} Prudentia College of Law. All Rights Reserved.
            </div>
            <div className="tf-right">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
              <a href="#">BCI Disclosures</a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
});

Contact.displayName = 'Contact';
export default Contact;
