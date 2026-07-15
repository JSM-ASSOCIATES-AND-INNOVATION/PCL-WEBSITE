/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { Link } from 'react-router-dom';
import StaggeredMenu from './MOBILEMENU/MOBILEMENU';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  const menuItems = [
    { 
      label: 'About Us', ariaLabel: 'About Prudentia', link: '/about',
      subItems: [
        { label: 'Leadership & Vision', link: '/about/leadership' },
        { label: 'Governing Body', link: '/about/governing-body' },
        { label: 'Affiliations', link: '/about/affiliations' },
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
        { label: 'Campus Gallery', link: '/campus/gallery' },
        { label: 'Moot Court Society', link: '/campus/moot-court' },
        { label: 'Legal Aid & Counselling Clinic', link: '/campus/legal-aid' },
        { label: 'Library & Infrastructure', link: '/campus/library' },
      ]
    },
    { 
      label: 'Careers', ariaLabel: 'Career opportunities', link: '/careers',
      subItems: [
        { label: 'Placement Cell', link: '/careers/placement' },
        { label: 'Industry Integration & Clerkships', link: '/careers/industry' },
        { label: 'Opportunities with us', link: '/careers/opportunities' },
      ]
    },
    {
      label: 'Contact', ariaLabel: 'Get in touch', link: '/contact'
    }
  ];

  const socialItems = [
    { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' }
  ];

  return (
    <nav className="navbar glass-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <Link to="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', transform: 'scale(1.15)', transformOrigin: 'left center', zIndex: 50 }}>
          <div className="brand-crest" style={{ transform: 'scale(1.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
            <span style={{ fontWeight: 700, letterSpacing: '1.5px', fontSize: '1.15rem' }}>PRUDENTIA</span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '1.8px', opacity: 0.9 }}>COLLEGE OF LAW</span>
          </div>
        </Link>
        
        <ul className="nav-links" style={{ flex: 1, justifyContent: 'center' }}>
          <li className="nav-item-dropdown">
            <Link to="/about">About Us <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu">
              <Link to="/about/leadership">Leadership & Vision</Link>
              <Link to="/about/governing-body">Governing Body</Link>
              <Link to="/about/affiliations">Affiliations</Link>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <Link to="/programs">Academics <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu">
              <Link to="/programs/ba-llb">5-Year BA. LL.B (Honors)</Link>
              <Link to="/programs/bba-llb">5-Year BBA. LL.B (Honors)</Link>
              <Link to="/programs/llb">3-Year LL.B (Standard)</Link>
              <Link to="/about/faculty">Faculty Profiles</Link>
              <Link to="/programs#collaborations">Educational Collaborations</Link>
              <Link to="/programs#calendar">Academic Calendar</Link>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <Link to="/campus">Campus Life <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu">
              <Link to="/campus/facilities">Campus Facilities</Link>
              <Link to="/campus/gallery">Campus Gallery</Link>
              <Link to="/campus/moot-court">Moot Court Society</Link>
              <Link to="/campus/legal-aid">Legal Aid & Clinic</Link>
              <Link to="/campus/library">Library & Infrastructure</Link>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <Link to="/careers">Careers <ChevronDown size={14} className="dropdown-icon" /></Link>
            <div className="dropdown-menu">
              <Link to="/careers/placement">Placement Cell</Link>
              <Link to="/careers/industry">Industry Integration</Link>
              <Link to="/careers/opportunities">Opportunities with us</Link>
            </div>
          </li>
          <li className="nav-item-dropdown" style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/erp" className="erp-btn" style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            ERP Portal
          </Link>
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
  );
}
