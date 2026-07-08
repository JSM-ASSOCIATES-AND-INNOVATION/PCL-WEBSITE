import StaggeredMenu from './StaggeredMenu';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  // Mobile menu needs the full nested structure for accordions
  const menuItems = [
    { 
      label: 'About Us', ariaLabel: 'About Prudentia', link: '/about',
      subItems: [
        { label: 'Leadership & Vision', link: '/about/leadership' },
        { label: 'Faculty Profiles', link: '/about/faculty' },
        { label: 'Governing Body', link: '/about/governing-body' },
        { label: 'Affiliations', link: '/about/affiliations' },
      ]
    },
    { 
      label: 'Programs', ariaLabel: 'View academic programs', link: '/programs',
      subItems: [
        { label: '5-Year BA LL.B (Integrated)', link: '/programs/ba-llb' },
        { label: '5-Year BBA LL.B (Corporate)', link: '/programs/bba-llb' },
        { label: '3-Year LL.B', link: '/programs/llb' },
        { label: 'Judiciary & UPSC Prep', link: '/programs/judiciary' },
      ]
    },
    { 
      label: 'Campus Life', ariaLabel: 'Explore campus life', link: '/campus',
      subItems: [
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
  ];

  const socialItems = [
    { label: 'Instagram', link: 'https://www.instagram.com/prudentiacollegeoflaw?utm_source=qr' }
  ];

  return (
    <nav className="navbar glass-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <a href="/" className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', transform: 'scale(1.15)', transformOrigin: 'left center', zIndex: 50 }}>
          <div className="brand-crest" style={{ transform: 'scale(1.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
            <span style={{ fontWeight: 700, letterSpacing: '1.5px', fontSize: '1.15rem' }}>PRUDENTIA</span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '1.8px', opacity: 0.9 }}>COLLEGE OF LAW</span>
          </div>
        </a>
        
        <ul className="nav-links" style={{ flex: 1, justifyContent: 'center' }}>
          <li className="nav-item-dropdown">
            <a href="/about">About Us <ChevronDown size={14} className="dropdown-icon" /></a>
            <div className="dropdown-menu">
              <a href="/about/leadership">Leadership & Vision</a>
              <a href="/about/faculty">Faculty Profiles</a>
              <a href="/about/governing-body">Governing Body</a>
              <a href="/about/affiliations">Affiliations (BCI & Osmania University)</a>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <a href="/programs">Programs <ChevronDown size={14} className="dropdown-icon" /></a>
            <div className="dropdown-menu">
              <a href="/programs/ba-llb">5-Year BA LL.B (Integrated)</a>
              <a href="/programs/bba-llb">5-Year BBA LL.B (Corporate)</a>
              <a href="/programs/llb">3-Year LL.B</a>
              <a href="/programs/judiciary">Judiciary & UPSC Prep</a>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <a href="/campus">Campus Life <ChevronDown size={14} className="dropdown-icon" /></a>
            <div className="dropdown-menu">
              <a href="/campus/moot-court">Moot Court Society</a>
              <a href="/campus/legal-aid">Legal Aid & Counselling Clinic</a>
              <a href="/campus/library">Library & Infrastructure</a>
            </div>
          </li>
          <li className="nav-item-dropdown">
            <a href="/careers">Careers <ChevronDown size={14} className="dropdown-icon" /></a>
            <div className="dropdown-menu">
              <a href="/careers/placement">Placement Cell</a>
              <a href="/careers/industry">Industry Integration & Clerkships</a>
              <a href="/careers/opportunities">Opportunities with us</a>
            </div>
          </li>
        </ul>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/apply" className="apply-btn glowing-pill">Apply Now</a>
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
