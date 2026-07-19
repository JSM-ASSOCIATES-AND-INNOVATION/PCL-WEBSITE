/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StaggeredMenu from './MOBILE_MENU/MobileMenu';
import { ChevronDown } from 'lucide-react';
import NoticeBanner from '../UI/NoticeBanner';
import { useSite } from '../../CONTEXT/SiteContext';

// Single source of truth for the whole menu. Desktop renders it as
// multi-column mega-menus; mobile flattens the columns into subItems.
// (Previously the desktop markup was hand-coded separately from this
// array and had drifted out of sync with it.)
const MENU_ITEMS = [
  {
    label: 'Discover PCL',
    ariaLabel: 'About Prudentia',
    link: '/about',
    columns: [
      {
        title: 'About Us',
        items: [
          { label: 'Leadership & Vision', link: '/about/leadership' },
          { label: 'Governing Body', link: '/about/governing-body' },
          { label: 'Affiliations', link: '/about/affiliations' },
        ],
      },
      {
        title: 'Connect & Grow',
        items: [
          { label: 'Placement Cell', link: '/careers/placement' },
          { label: 'Industry Integration', link: '/careers/industry' },
          { label: 'Careers with us', link: '/careers/opportunities' },
          { label: 'Contact Us', link: '/contact' },
        ],
      },
    ],
  },
  {
    label: 'Academics',
    ariaLabel: 'View academics',
    link: '/programs',
    columns: [
      {
        title: 'Programs',
        items: [
          { label: '5-Year BA. LL.B (Honors)', link: '/programs/ba-llb' },
          { label: '5-Year BBA. LL.B (Honors)', link: '/programs/bba-llb' },
          { label: '3-Year LL.B (Standard)', link: '/programs/llb' },
        ],
      },
      {
        title: 'Resources',
        items: [
          { label: 'Faculty Profiles', link: '/about/faculty' },
          { label: 'Educational Collaborations', link: '/programs#collaborations' },
          { label: 'Academic Calendar', link: '/programs#calendar' },
        ],
      },
    ],
  },
  {
    label: 'Campus Life',
    ariaLabel: 'Explore campus life',
    link: '/campus',
    columns: [
      {
        title: 'Infrastructure',
        items: [
          { label: 'Campus Facilities', link: '/campus/facilities' },
          { label: 'Library & Infrastructure', link: '/campus/library' },
          { label: 'Campus Gallery', link: '/campus/gallery' },
        ],
      },
      {
        title: 'Student Life',
        items: [
          { label: 'Moot Court Society', link: '/campus/moot-court' },
          { label: 'Legal Aid & Clinic', link: '/campus/legal-aid' },
        ],
      },
    ],
  },
  {
    label: 'News & Media',
    ariaLabel: 'Campus events and blogs',
    link: '/events',
    columns: [
      {
        title: null,
        items: [
          { label: 'Campus Events', link: '/events' },
          { label: 'Blogs & Announcements', link: '/blogs' },
        ],
      },
    ],
  },
];

const SOCIAL_ITEMS = [
  { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' },
];

// Flatten columns into a single subItems list for the mobile staggered menu.
const MOBILE_MENU_ITEMS = MENU_ITEMS.map(({ columns, ...item }) => ({
  ...item,
  subItems: columns.flatMap((col) => col.items),
}));

export default function Navbar() {
  const { isAdmissionsOpen } = useSite();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const navRef = useRef(null);

  // rAF-throttled scroll handler instead of firing on every scroll event.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close any open dropdown on outside click or Escape, so it isn't
  // stuck open (relevant once we allow click/keyboard toggling below).
  useEffect(() => {
    if (openIndex === null) return;

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenIndex(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenIndex(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openIndex]);

  // Close the dropdown whenever the route changes.
  useEffect(() => {
    setOpenIndex(null);
  }, [location.pathname]);

  const toggleDropdown = useCallback((idx) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  }, []);

  const isActive = (link) => {
    const path = link.split('#')[0];
    return path !== '/' && location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: scrolled ? '20px' : '0',
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: 100,
          background: '#fff',
          color: '#000',
          padding: '10px 16px',
          borderRadius: '6px',
        }}
        onFocus={(e) => { e.currentTarget.style.left = '20px'; e.currentTarget.style.top = '20px'; }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px'; }}
      >
        Skip to main content
      </a>

      <div className={`combined-nav-wrapper glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div
          className={`notice-wrapper ${scrolled ? 'hidden' : ''}`}
          style={{ transition: 'all 0.3s ease', overflow: 'hidden', height: scrolled ? '0' : 'auto', opacity: scrolled ? 0 : 1 }}
        >
          <NoticeBanner />
        </div>

        <nav
          ref={navRef}
          className="navbar"
          style={{ position: 'relative', background: 'transparent', borderBottom: 'none', height: '60px', transition: 'height 0.3s ease' }}
        >
          <div
            className="container"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}
          >
            <Link
              to="/"
              className="brand-logo"
              style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', transform: 'scale(1.15)', transformOrigin: 'left center', zIndex: 50 }}
            >
              <div className="brand-crest" style={{ transform: 'scale(1.1)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                <span style={{ fontWeight: 700, letterSpacing: '1.5px', fontSize: '1.15rem' }}>PRUDENTIA</span>
                <span style={{ fontSize: '0.7rem', letterSpacing: '1.8px', opacity: 0.9 }}>COLLEGE OF LAW</span>
              </div>
            </Link>

            <ul className="nav-links" style={{ flex: 1, justifyContent: 'center', gap: '30px' }}>
              {MENU_ITEMS.map((item, idx) => {
                const open = openIndex === idx;
                const menuId = `nav-dropdown-${idx}`;
                return (
                  <li
                    key={item.link}
                    className="nav-item-dropdown"
                    onMouseEnter={() => setOpenIndex(idx)}
                    onMouseLeave={() => setOpenIndex((current) => (current === idx ? null : current))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Link
                        to={item.link}
                        aria-label={item.ariaLabel}
                        aria-current={isActive(item.link) ? 'page' : undefined}
                        style={isActive(item.link) ? { color: 'var(--primary-color, #D97757)' } : undefined}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-haspopup="true"
                        aria-controls={menuId}
                        aria-label={`Toggle ${item.label} submenu`}
                        onClick={() => toggleDropdown(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'inline-flex', color: 'inherit' }}
                      >
                        <ChevronDown
                          size={14}
                          className="dropdown-icon"
                          style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                    </div>

                    <div
                      id={menuId}
                      role="menu"
                      className={item.columns.length > 1 ? 'dropdown-menu mega-menu' : 'dropdown-menu'}
                      style={{ display: open ? 'flex' : undefined }}
                    >
                      {item.columns.map((col) => (
                        <div className="mega-menu-column" key={col.title || 'main'}>
                          {col.title && <div className="mega-menu-title">{col.title}</div>}
                          {col.items.map((sub) => (
                            <Link to={sub.link} key={sub.link} role="menuitem">
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a
                href="/erp"
                className="erp-btn"
                style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              >
                ERP Portal
              </a>

              {isAdmissionsOpen && (
                <Link to="/apply" className="apply-btn glowing-pill">Apply Now</Link>
              )}

              <div className="mobile-menu-wrapper">
                <StaggeredMenu
                  items={MOBILE_MENU_ITEMS}
                  socialItems={SOCIAL_ITEMS}
                  displaySocials={true}
                  displayItemNumbering={false}
                  position="right"
                  showApplyButton={isAdmissionsOpen}
                />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
