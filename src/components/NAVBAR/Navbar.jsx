import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaggeredMenu from './MobileMenu/MobileMenu';
import { ChevronDown } from 'lucide-react';
import NoticeBanner from '../UI/NoticeBanner';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const menuItems = [
    { 
      label: 'Discover PCL', ariaLabel: 'About Prudentia', link: '/about',
      subItems: [
        { label: 'Leadership & Vision', link: '/about/leadership' },
        { label: 'Governing Body', link: '/about/governing-body' },
        { label: 'Affiliations', link: '/about/affiliations' },
        { label: 'Contact Us', link: '/contact' },
      ]
    },
    { 
      label: 'Academics', ariaLabel: 'View academics', link: '/programs',
      subItems: [
        { label: '5-Year BA. LL.B (Honors)', link: '/programs/ba-llb' },
        { label: '5-Year BBA. LL.B (Honors)', link: '/programs/bba-llb' },
        { label: '3-Year LL.B (Standard)', link: '/programs/llb' },
        { label: 'Faculty Profiles', link: '/about/faculty' },
        { label: 'Educational Collaborations', link: '/programs#collaborations' },
        { label: 'Academic Calendar', link: '/programs#calendar' },
      ]
    },
    { 
      label: 'Campus Life', ariaLabel: 'Explore campus life', link: '/campus',
      subItems: [
        { label: 'Campus Facilities', link: '/campus/facilities' },
        { label: 'Library & Infrastructure', link: '/campus/library' },
        { label: 'Campus Gallery', link: '/campus/gallery' },
        { label: 'Moot Court Society', link: '/campus/moot-court' },
        { label: 'Legal Aid & Clinic', link: '/campus/legal-aid' },
      ]
    },
    {
      label: 'News & Media', ariaLabel: 'Campus events and blogs', link: '/events',
      subItems: [
        { label: 'Campus Events', link: '/events' },
        { label: 'Blogs & Announcements', link: '/blogs' },
      ]
    }
  ];

  const socialItems = [
    { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' }
  ];

  return (
    <header style={{ position: 'fixed', top: scrolled ? '20px' : '0', left: 0, right: 0, zIndex: 50, display: 'flex', flexDirection: 'column', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className={`combined-nav-wrapper glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className={`notice-wrapper ${scrolled ? 'hidden' : ''}`} style={{ transition: 'all 0.3s ease', overflow: 'hidden', height: scrolled ? '0' : 'auto', opacity: scrolled ? 0 : 1 }}>
          <NoticeBanner />
        </div>
        <nav className="navbar" style={{ position: 'relative', background: 'transparent', borderBottom: 'none', height: '60px', transition: 'height 0.3s ease' }}>

        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', transform: 'scale(1.15)', transformOrigin: 'left center', zIndex: 50 }}>
          <div className="brand-crest" style={{ transform: 'scale(1.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
            <span style={{ fontWeight: 700, letterSpacing: '1.5px', fontSize: '1.15rem' }}>PRUDENTIA</span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '1.8px', opacity: 0.9 }}>COLLEGE OF LAW</span>
          </div>
        </Link>
        
        <ul className="nav-links" style={{ flex: 1, justifyContent: 'center', gap: '30px' }}>
          <li className="nav-item-dropdown">
            <Link to="/about">Discover PCL <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu mega-menu">
              <div className="mega-menu-column">
                <div className="mega-menu-title">About Us</div>
                <Link to="/about/leadership">Leadership & Vision</Link>
                <Link to="/about/governing-body">Governing Body</Link>
                <Link to="/about/affiliations">Affiliations</Link>
              </div>
              <div className="mega-menu-column">
                <div className="mega-menu-title">Connect & Grow</div>
                <Link to="/careers/placement">Placement Cell</Link>
                <Link to="/careers/industry">Industry Integration</Link>
                <Link to="/careers/opportunities">Careers with us</Link>
                <Link to="/contact">Contact Us</Link>
              </div>
            </div>
          </li>
          
          <li className="nav-item-dropdown">
            <Link to="/programs">Academics <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu mega-menu">
              <div className="mega-menu-column">
                <div className="mega-menu-title">Programs</div>
                <Link to="/programs/ba-llb">5-Year BA. LL.B (Honors)</Link>
                <Link to="/programs/bba-llb">5-Year BBA. LL.B (Honors)</Link>
                <Link to="/programs/llb">3-Year LL.B (Standard)</Link>
              </div>
              <div className="mega-menu-column">
                <div className="mega-menu-title">Resources</div>
                <Link to="/about/faculty">Faculty Profiles</Link>
                <Link to="/programs#collaborations">Educational Collaborations</Link>
                <Link to="/programs#calendar">Academic Calendar</Link>
              </div>
            </div>
          </li>
          
          <li className="nav-item-dropdown">
            <Link to="/campus">Campus Life <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu mega-menu">
              <div className="mega-menu-column">
                <div className="mega-menu-title">Infrastructure</div>
                <Link to="/campus/facilities">Campus Facilities</Link>
                <Link to="/campus/library">Library & Infrastructure</Link>
                <Link to="/campus/gallery">Campus Gallery</Link>
              </div>
              <div className="mega-menu-column">
                <div className="mega-menu-title">Student Life</div>
                <Link to="/campus/moot-court">Moot Court Society</Link>
                <Link to="/campus/legal-aid">Legal Aid & Clinic</Link>
              </div>
            </div>
          </li>
          
          <li className="nav-item-dropdown">
            <Link to="/events">News & Media <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu">
              <Link to="/events">Campus Events</Link>
              <Link to="/blogs">Blogs & Announcements</Link>
            </div>
          </li>
        </ul>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/erp" className="erp-btn" style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            ERP Portal
          </a>
          <Link to="/apply" className="apply-btn glowing-pill">Apply Now</Link>
          <div className="mobile-menu-wrapper">
            <StaggeredMenu 
              items={menuItems} 
              socialItems={socialItems} 
              displaySocials={true}
              displayItemNumbering={false}
              position="right"
            />
          </div>
        </div>
      </div>
    </nav>
      </div>
    </header>
  );
}
