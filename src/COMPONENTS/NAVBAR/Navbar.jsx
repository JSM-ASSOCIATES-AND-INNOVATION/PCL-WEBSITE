import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StaggeredMenu from './MOBILE_MENU/MobileMenu';
import NoticeBanner from '../UI/NoticeBanner';
import { useSite } from '../../CONTEXT/SiteContext';
import PremiumDropdown from '../UI/PremiumDropdown/PremiumDropdown';

// Convert existing MENU_ITEMS into the strict DropdownMenuType format
const MENU_ITEMS = [
  {
    label: 'Discover PCL',
    ariaLabel: 'About Prudentia',
    link: '/about',
    menu: {
      columns: [
        {
          title: 'About Us',
          items: [
            { label: 'Leadership & Vision', link: '/about/leadership' },
            { label: 'Affiliations', link: '/about/affiliations' },
          ],
        },
        {
          title: 'Connect & Grow',
          items: [
            { label: 'Careers with Us', link: '/careers' },
            { label: 'Placement Cell', link: '/careers/placement' },
            { label: 'Contact Us', link: '/contact' },
          ],
        },
      ]
    }
  },
  {
    label: 'Academics',
    ariaLabel: 'View academics',
    link: '/programs',
    menu: {
      columns: [
        {
          title: 'Programs',
          items: [
            { label: '5-Year BA. LL.B (Honors)', link: '/programs/ba-llb', badge: 'Popular' },
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
      ]
    }
  },
  {
    label: 'Campus Life',
    ariaLabel: 'Explore campus life',
    link: '/campus',
    menu: {
      columns: [
        {
          title: 'Infrastructure',
          items: [
            { label: 'Campus Facilities', link: '/campus/facilities' },
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
      ]
    }
  },
  {
    label: 'News & Media',
    ariaLabel: 'Campus events and blogs',
    link: '/events',
    menu: {
      columns: [
        {
          title: null,
          items: [
            { label: 'Campus Events', link: '/events', badge: 'New' },
            { label: 'Blogs', link: '/blogs' },
          ],
        },
      ]
    }
  },
];

const SOCIAL_ITEMS = [
  { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' },
];

const MOBILE_MENU_ITEMS = MENU_ITEMS.map(({ menu, ...item }) => ({
  ...item,
  subItems: menu.columns.flatMap((col) => col.items),
}));

export default function Navbar() {
  const { isAdmissionsOpen } = useSite();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

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
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
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
          style={{ transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease', overflow: 'hidden', maxHeight: scrolled ? '0px' : '100px', opacity: scrolled ? 0 : 1 }}
        >
          <NoticeBanner />
        </div>

        <nav
          className="navbar"
          style={{ position: 'relative', background: 'transparent', borderBottom: 'none', height: '60px', transition: 'height 0.3s ease', color: 'var(--text-color)' }}
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

            <div className="hidden lg:flex" style={{ flex: 1, justifyContent: 'center', gap: '16px' }}>
              {MENU_ITEMS.map((item, idx) => (
                <PremiumDropdown 
                  key={idx}
                  label={item.label}
                  link={item.link}
                  menu={item.menu}
                  isActive={isActive(item.link)}
                />
              ))}
            </div>

            <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a
                href="/erp"
                className="erp-btn hidden md:flex"
              >
                ERP Portal
              </a>

              {isAdmissionsOpen && (
                <Link to="/apply" className="apply-btn glowing-pill hidden sm:flex">Apply Now</Link>
              )}

              <div className="mobile-menu-wrapper lg:hidden">
                <StaggeredMenu
                  items={MOBILE_MENU_ITEMS}
                  socialItems={SOCIAL_ITEMS}
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
