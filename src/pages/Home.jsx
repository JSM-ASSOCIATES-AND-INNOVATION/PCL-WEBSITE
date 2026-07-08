import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Gavel, Shield, Landmark, MapPin, Phone, Mail, Clock } from 'lucide-react';
import BorderGlow from '../components/BorderGlow';
import outdoorImg from '../assets/outdoor.webp';
import entranceImg from '../assets/entrance.webp';
import campusLogoImg from '../assets/campus_logo.webp';
import classroomImg from '../assets/classroom.webp';
import classroom2Img from '../assets/classroom_2.webp';
import classroom3Img from '../assets/classroom_3.webp';
import ladyJusticeImg from '../assets/lady_justice.webp';
import Carousel from '../components/Carousel';
import LightRays from '../components/LightRays';
import CountUp from '../components/CountUp';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLightMode, setIsLightMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const slideRefs = useRef([]);
  const academicGridRef = useRef(null);
  const TOTAL_SLIDES = 6;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    // Detect system theme preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      setIsLightMode(mediaQuery.matches);
      
      const themeChangeHandler = (e) => {
        setIsLightMode(e.matches);
      };
      mediaQuery.addEventListener('change', themeChangeHandler);
      return () => {
        mediaQuery.removeEventListener('change', themeChangeHandler);
        window.removeEventListener('resize', handleResize);
      };
    }
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
    
    // Slide 2 is the Academics slide (index 2)
    if (activeSlide === 2) {
      intervalId = setInterval(() => {
        if (academicGridRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = academicGridRef.current;
          // If we reached the end, snap back to start
          if (scrollLeft + clientWidth >= scrollWidth - 20) {
            academicGridRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll by one card width (~80vw)
            academicGridRef.current.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });
          }
        }
      }, 3500);
    } else {
      // If we leave the Academics slide, reset the scroll position immediately
      if (academicGridRef.current) {
        academicGridRef.current.scrollTo({ left: 0, behavior: 'instant' });
      }
    }

    return () => clearInterval(intervalId);
  }, [activeSlide]);

  const advantageItems = [
    {
      id: 'adv-1',
      customRender: () => (
        <BorderGlow className="arsenal-card-wrapper" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
          <div className="arsenal-card">
            <div className="arsenal-icon-wrap"><Briefcase size={28} /></div>
            <div className="arsenal-text">
              <h4>Industry Integration</h4>
              <p>Forged alliances with top-tier law firms and judicial bodies, ensuring continuous court exposure and elite clerkship pipelines.</p>
            </div>
          </div>
        </BorderGlow>
      )
    },
    {
      id: 'adv-2',
      customRender: () => (
        <BorderGlow className="arsenal-card-wrapper" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
          <div className="arsenal-card">
            <div className="arsenal-icon-wrap"><Gavel size={28} /></div>
            <div className="arsenal-text">
              <h4>Command-Level Practical Training</h4>
              <p>Immersion in advanced Moot Court warfare and Alternative Dispute Resolution (ADR) simulations.</p>
            </div>
          </div>
        </BorderGlow>
      )
    },
    {
      id: 'adv-3',
      customRender: () => (
        <BorderGlow className="arsenal-card-wrapper" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
          <div className="arsenal-card">
            <div className="arsenal-icon-wrap"><Shield size={28} /></div>
            <div className="arsenal-text">
              <h4>Legal Aid Clinic</h4>
              <p>Operating a dedicated in-house clinic, deploying students to defend underserved communities.</p>
            </div>
          </div>
        </BorderGlow>
      )
    },
    {
      id: 'adv-4',
      customRender: () => (
        <BorderGlow className="arsenal-card-wrapper" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
          <div className="arsenal-card">
            <div className="arsenal-icon-wrap"><Landmark size={28} /></div>
            <div className="arsenal-text">
              <h4>Integrated Civil Services</h4>
              <p>Exclusive partnership with Sharat Chandra Academy to forge the next generation of judicial officers.</p>
            </div>
          </div>
        </BorderGlow>
      )
    }
  ];

  return (
    <div className="snap-container">
      
      {/* Pagination Dots */}
      <div className="pagination">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div 
            key={i} 
            className={`dot ${activeSlide === i ? 'active' : ''}`}
            onClick={() => scrollToSlide(i)}
          />
        ))}
      </div>

      {/* Slide 1: The Hero Section */}
      <section 
        className="slide" 
        ref={el => slideRefs.current[0] = el}
      >
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

      {/* Slide 2: The Philosophy */}
      <section className="slide" ref={el => slideRefs.current[1] = el}>
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

      {/* Slide 3: The Academic Core */}
      <section className="slide" ref={el => slideRefs.current[2] = el}>
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
                    link: "/programs/ballb"
                  },
                  {
                    id: 2,
                    image: classroom2Img,
                    degree: "BBA LL.B",
                    title: "Corporate Hons.",
                    description: "A 5-year elite program designed for future leaders in corporate governance and law.",
                    link: "/programs/bballb"
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

      {/* Slide 4: The Arsenal (Replacing Practical Edge) */}
      <section className="slide" ref={el => slideRefs.current[3] = el}>
        <div className="container split-screen">
          <div className="split-left">
            <div className="arsenal-visual" style={{ backgroundImage: `url(${ladyJusticeImg})` }}>
              <div className="dark-overlay-heavy"></div>
              <h2 className="arsenal-headline">The Prudentia<br/><span className="text-amber">Advantage.</span></h2>
            </div>
          </div>
          <div className="split-right arsenal-content desktop-only">
            {advantageItems.map(item => <div key={item.id} style={{height: '100%'}}>{item.customRender()}</div>)}
          </div>
          <div className="split-right mobile-only" style={{ padding: '20px 0', overflow: 'hidden' }}>
            <Carousel 
              items={advantageItems} 
              baseWidth={Math.min(window.innerWidth - 40, 320)} 
              autoplay={false} 
              loop={true} 
            />
          </div>
        </div>
      </section>

      {/* Slide 5: Metrics & Admissions */}
      <section className="slide" ref={el => slideRefs.current[4] = el}>
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

      {/* Slide 6: Contact & Footer */}
      <section className="slide" ref={el => slideRefs.current[5] = el} style={{ background: '#050505' }}>
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
    </div>
  );
}
