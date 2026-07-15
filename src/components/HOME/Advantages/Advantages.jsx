/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { forwardRef } from 'react';
import { Briefcase, Gavel, Shield, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import BorderGlow from './BorderGlow';
import Carousel from '../ACADEMICS/Carousel';

import ladyJusticeImg from '../../../ASSETS/CAMPUS/pcl_justice.webp';

const Advantages = forwardRef(({ windowWidth }, ref) => {
  const advantageItems = [
    {
      id: 'adv-1',
      customRender: () => (
        <Link to="/campus/facilities/corporate-placements" className="block h-full w-full group">
          <BorderGlow className="h-full w-full transition-transform duration-300 group-hover:-translate-y-1" borderRadius={16} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 h-full flex flex-col items-start transition-colors duration-500 group-hover:border-[var(--primary-color)] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-4 border border-[var(--primary-color)]/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
                <Briefcase size={22} />
              </div>
              <div className="relative z-10 flex flex-col flex-grow">
                <h4 className="text-xl font-bold mb-2 text-brand-text group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>Industry Integration</h4>
                <p className="text-sm text-brand-muted leading-relaxed">Forged alliances with top-tier law firms and judicial bodies, ensuring continuous court exposure and elite clerkship pipelines.</p>
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
          <BorderGlow className="h-full w-full transition-transform duration-300 group-hover:-translate-y-1" borderRadius={16} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 h-full flex flex-col items-start transition-colors duration-500 group-hover:border-[var(--primary-color)] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-4 border border-[var(--primary-color)]/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
                <Gavel size={22} />
              </div>
              <div className="relative z-10 flex flex-col flex-grow">
                <h4 className="text-xl font-bold mb-2 text-brand-text group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>Practical Training</h4>
                <p className="text-sm text-brand-muted leading-relaxed">Immersion in advanced Moot Court warfare and Alternative Dispute Resolution (ADR) simulations.</p>
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
          <BorderGlow className="h-full w-full transition-transform duration-300 group-hover:-translate-y-1" borderRadius={16} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 h-full flex flex-col items-start transition-colors duration-500 group-hover:border-[var(--primary-color)] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-4 border border-[var(--primary-color)]/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
                <Shield size={22} />
              </div>
              <div className="relative z-10 flex flex-col flex-grow">
                <h4 className="text-xl font-bold mb-2 text-brand-text group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>Legal Aid Clinic</h4>
                <p className="text-sm text-brand-muted leading-relaxed">Operating a dedicated in-house clinic, deploying students to defend underserved communities.</p>
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
          <BorderGlow className="h-full w-full transition-transform duration-300 group-hover:-translate-y-1" borderRadius={16} backgroundColor="transparent" colors={['#eab308', '#d97706', '#b45309']} glowColor="40 80 50">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 h-full flex flex-col items-start transition-colors duration-500 group-hover:border-[var(--primary-color)] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-glow)] rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-glow)] text-[var(--primary-color)] flex items-center justify-center mb-4 border border-[var(--primary-color)]/30 group-hover:scale-110 transition-transform duration-500 shadow-sm relative z-10">
                <Landmark size={22} />
              </div>
              <div className="relative z-10 flex flex-col flex-grow">
                <h4 className="text-xl font-bold mb-2 text-brand-text group-hover:text-[var(--primary-color)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>Integrated Civil Services</h4>
                <p className="text-sm text-brand-muted leading-relaxed">Exclusive partnership with Sharat Chandra Academy to forge the next generation of judicial officers.</p>
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
              <Link to="/campus/facilities" className="inline-block px-6 py-3 md:px-8 md:py-4 bg-[var(--primary-color)] rounded-full font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-[var(--primary-hover)] transition-transform duration-300 shadow-lg shadow-[var(--primary-glow)] hover:-translate-y-1 text-black" style={{ color: '#000000' }}>
                Explore All Facilities
              </Link>
            </div>
          </div>
        </div>
        <div className="split-right arsenal-content desktop-only">
          {advantageItems.map(item => <div key={item.id} style={{height: '100%'}}>{item.customRender()}</div>)}
        </div>
        <div className="split-right mobile-only" style={{ padding: '10px 0', overflow: 'hidden' }}>
          <Carousel 
            items={advantageItems} 
            baseWidth={Math.min(windowWidth - 32, 320)} 
            autoplay={true} 
            loop={true} 
          />
        </div>
      </div>
    </section>
  );
});

Advantages.displayName = 'Advantages';
export default Advantages;
