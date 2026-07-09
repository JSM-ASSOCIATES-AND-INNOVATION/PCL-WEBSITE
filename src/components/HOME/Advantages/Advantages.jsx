import React, { forwardRef } from 'react';
import { Briefcase, Gavel, Shield, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import BorderGlow from './BorderGlow';
import Carousel from '../Academics/Carousel'; // Use the carousel we put there
import ladyJusticeImg from '../../../assets/pcl_justice.webp';

const Advantages = forwardRef(({ windowWidth }, ref) => {
  const advantageItems = [
    {
      id: 'adv-1',
      customRender: () => (
        <Link to="/campus/facilities/corporate-placements" className="block h-full w-full group">
          <BorderGlow className="arsenal-card-wrapper transition-transform duration-300 group-hover:scale-[1.02]" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
            <div className="arsenal-card h-full">
              <div className="arsenal-icon-wrap"><Briefcase size={28} /></div>
              <div className="arsenal-text">
                <h4 className="group-hover:text-[#FFBF00] transition-colors">Industry Integration</h4>
                <p>Forged alliances with top-tier law firms and judicial bodies, ensuring continuous court exposure and elite clerkship pipelines.</p>
              </div>
            </div>
          </BorderGlow>
        </Link>
      )
    },
    {
      id: 'adv-2',
      customRender: () => (
        <Link to="/campus/facilities/moot-court" className="block h-full w-full group">
          <BorderGlow className="arsenal-card-wrapper transition-transform duration-300 group-hover:scale-[1.02]" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
            <div className="arsenal-card h-full">
              <div className="arsenal-icon-wrap"><Gavel size={28} /></div>
              <div className="arsenal-text">
                <h4 className="group-hover:text-[#FFBF00] transition-colors">Command-Level Practical Training</h4>
                <p>Immersion in advanced Moot Court warfare and Alternative Dispute Resolution (ADR) simulations.</p>
              </div>
            </div>
          </BorderGlow>
        </Link>
      )
    },
    {
      id: 'adv-3',
      customRender: () => (
        <Link to="/campus/facilities/legal-aid-clinic" className="block h-full w-full group">
          <BorderGlow className="arsenal-card-wrapper transition-transform duration-300 group-hover:scale-[1.02]" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
            <div className="arsenal-card h-full">
              <div className="arsenal-icon-wrap"><Shield size={28} /></div>
              <div className="arsenal-text">
                <h4 className="group-hover:text-[#FFBF00] transition-colors">Legal Aid Clinic</h4>
                <p>Operating a dedicated in-house clinic, deploying students to defend underserved communities.</p>
              </div>
            </div>
          </BorderGlow>
        </Link>
      )
    },
    {
      id: 'adv-4',
      customRender: () => (
        <Link to="/campus/facilities/integrated-coaching" className="block h-full w-full group">
          <BorderGlow className="arsenal-card-wrapper transition-transform duration-300 group-hover:scale-[1.02]" borderRadius={12} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50" style={{height: '100%', width: '100%'}}>
            <div className="arsenal-card h-full">
              <div className="arsenal-icon-wrap"><Landmark size={28} /></div>
              <div className="arsenal-text">
                <h4 className="group-hover:text-[#FFBF00] transition-colors">Integrated Civil Services</h4>
                <p>Exclusive partnership with Sharat Chandra Academy to forge the next generation of judicial officers.</p>
              </div>
            </div>
          </BorderGlow>
        </Link>
      )
    }
  ];

  return (
    <section className="slide" ref={ref}>
      <div className="container split-screen">
        <div className="split-left">
          <div className="arsenal-visual" style={{ backgroundImage: `url(${ladyJusticeImg})` }}>
            <div className="dark-overlay-heavy"></div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative z-10 w-full px-6 md:px-0 md:pl-10">
              <h2 className="arsenal-headline" style={{ marginBottom: '20px' }}>The Prudentia<br/><span className="text-amber">Advantage.</span></h2>
              <Link to="/campus/facilities" className="inline-block px-6 md:px-8 py-3 md:py-4 bg-transparent border-2 border-[#FFBF00] text-[#FFBF00] font-bold uppercase tracking-widest rounded hover:bg-[#FFBF00] hover:text-black transition-colors text-sm md:text-base whitespace-nowrap md:whitespace-normal mb-8 md:mb-0">
                Explore All Facilities
              </Link>
            </div>
          </div>
        </div>
        <div className="split-right arsenal-content desktop-only">
          {advantageItems.map(item => <div key={item.id} style={{height: '100%'}}>{item.customRender()}</div>)}
        </div>
        <div className="split-right mobile-only" style={{ padding: '20px 0', overflow: 'hidden' }}>
          <Carousel 
            items={advantageItems} 
            baseWidth={Math.min(windowWidth - 40, 320)} 
            autoplay={false} 
            loop={true} 
          />
        </div>
      </div>
    </section>
  );
});

Advantages.displayName = 'Advantages';
export default Advantages;
