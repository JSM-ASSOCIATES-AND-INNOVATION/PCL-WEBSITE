import React, { forwardRef } from 'react';
import { Briefcase, Gavel, Shield, Landmark } from 'lucide-react';
import BorderGlow from './BorderGlow';
import Carousel from '../Academics/Carousel'; // Use the carousel we put there
import ladyJusticeImg from '../../../assets/pcl_justice.webp';
import legalClinicImg from '../../../assets/pcl_legal_clinic.webp';

const Advantages = forwardRef(({ windowWidth }, ref) => {
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
            <div className="arsenal-icon-wrap" style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '50%' }}>
              <img src={legalClinicImg} alt="Legal Aid Clinic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
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
    <section className="slide" ref={ref}>
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
