/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import classroom1 from '../../../ASSETS/CAMPUS/pcl_classroom_1.webp';

export default function CourseBALLB() {
  return (
    <div className="h-screen w-full relative overflow-x-hidden overflow-y-auto bg-brand-bg text-brand-text">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        
        {/* Navigation */}
        <Link to="/programs" className="inline-flex items-center text-brand-muted hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold">
          <span className="mr-2">←</span> Back to Programs
        </Link>

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1 border border-[#FFBF00]/30 rounded-full text-[#FFBF00] text-sm tracking-widest uppercase">5 Years Integrated</span>
            <span className="px-4 py-1 border border-brand-border rounded-full text-brand-muted text-sm tracking-widest uppercase">Undergraduate</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-text mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            BA. LL.B <span className="text-[#FFBF00] italic">Honors</span>
          </motion.h1>
          <p className="text-xl text-brand-muted max-w-3xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
            An elite integrated undergraduate program merging the profound depths of Humanities with the rigorous frameworks of Law. Designed for visionary leaders.
          </p>
        </div>

        {/* Image */}
        <div className="w-full h-[400px] md:h-[500px] bg-brand-card border border-brand-border rounded-2xl overflow-hidden mb-16 relative flex items-center justify-center group">
          <img src={classroom1} alt="BA LLB Classroom" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 ring-1 ring-inset ring-[#FFBF00]/20 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Content Details */}
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>Program Overview</h2>
              <p className="text-brand-muted leading-relaxed text-lg">
                The Bachelor of Arts and Bachelor of Legislative Law (BA. LL.B) is a meticulously crafted five-year integrated program. It seamlessly blends the study of history, political science, sociology, and economics with substantive and procedural law. This holistic approach ensures our graduates possess deep socio-legal awareness, crucial for effective advocacy, policy-making, and judicial roles.
              </p>
            </section>
            
            <section>
              <h2 className="text-3xl font-bold mb-4 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>Core Focus Areas</h2>
              <ul className="space-y-4">
                {[
                  "Constitutional Law & Governance",
                  "Human Rights & International Law",
                  "Criminal Law & Criminology",
                  "Sociology & Political Science Integration",
                  "Advanced Moot Court & Mock Trials"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-brand-card border border-brand-border p-4 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[#FFBF00]"></div>
                    <span className="text-brand-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-brand-text" style={{ fontFamily: "'Playfair Display', serif" }}>Curriculum Overview</h2>
              <div className="border border-brand-border rounded-xl bg-brand-bg overflow-hidden shadow-sm">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 bg-brand-card border-b border-brand-border p-4">
                  <div className="text-brand-text font-semibold">Semester Group</div>
                  <div className="col-span-2 text-[#FFBF00] font-semibold">Key Subjects Covered</div>
                </div>
                
                {/* Rows */}
                <div className="divide-y divide-brand-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-brand-card transition-colors gap-2 md:gap-4">
                    <div className="text-brand-muted font-semibold">
                      <span className="md:hidden text-brand-text text-sm block mb-1 uppercase tracking-wider">Semester Group</span>
                      Years 1 & 2 (Foundational)
                    </div>
                    <div className="md:col-span-2 text-brand-muted text-sm flex flex-col justify-center">
                      <span className="md:hidden text-[#FFBF00] font-semibold block mb-1 mt-2 uppercase tracking-wider">Key Subjects Covered</span>
                      Political Science, Sociology, Economics, English, Law of Contracts, Torts.
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-brand-card transition-colors gap-2 md:gap-4">
                    <div className="text-brand-muted font-semibold">
                      <span className="md:hidden text-brand-text text-sm block mb-1 uppercase tracking-wider">Semester Group</span>
                      Years 3 & 4 (Core Law)
                    </div>
                    <div className="md:col-span-2 text-brand-muted text-sm flex flex-col justify-center">
                      <span className="md:hidden text-[#FFBF00] font-semibold block mb-1 mt-2 uppercase tracking-wider">Key Subjects Covered</span>
                      Constitutional Law, Criminal Law, Family Law, Property Law, Environmental Law.
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-brand-card transition-colors gap-2 md:gap-4">
                    <div className="text-brand-muted font-semibold">
                      <span className="md:hidden text-brand-text text-sm block mb-1 uppercase tracking-wider">Semester Group</span>
                      Year 5 (Clinical & Advanced)
                    </div>
                    <div className="md:col-span-2 text-brand-muted text-sm flex flex-col justify-center">
                      <span className="md:hidden text-[#FFBF00] font-semibold block mb-1 mt-2 uppercase tracking-wider">Key Subjects Covered</span>
                      Moot Court, Drafting & Pleading, Public International Law, Human Rights, Professional Ethics.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Facts Sidebar */}
          <div className="space-y-6">
            <div className="bg-brand-card border border-brand-border p-8 rounded-2xl sticky top-24">
              <h3 className="text-xl font-bold text-[#FFBF00] mb-6 border-b border-brand-border pb-4">Quick Facts</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-brand-text font-semibold">5 Years (10 Semesters)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Eligibility</p>
                  <p className="text-brand-text font-semibold">10+2 (Intermediate) with 45% aggregate</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Admission Mode</p>
                  <p className="text-brand-text font-semibold">TS LAWCET / Management</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <button className="w-full py-4 bg-transparent border-2 border-[#FFBF00] text-[#FFBF00] font-bold uppercase tracking-widest rounded hover:bg-[#FFBF00] hover:text-black transition-colors">
                  View Curriculum
                </button>
                <button className="w-full py-4 bg-[#FFBF00] text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
