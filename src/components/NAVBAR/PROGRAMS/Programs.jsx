import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import outdoorImg from '../../../ASSETS/CAMPUS/pcl_outdoor.webp';
import saratChandraLogo from '../../../ASSETS/LOGOS/pcl_sarat_chandra_logo.png';
import classroom1 from '../../../ASSETS/CAMPUS/pcl_classroom_1.webp';
import classroom2 from '../../../ASSETS/CAMPUS/pcl_classroom_2.webp';
import classroom3 from '../../../ASSETS/CAMPUS/pcl_classroom_3.webp';
import './Programs.css';

const TABS = [
  { id: 'courses', label: 'Academic Courses' },
  { id: 'admissions', label: 'Admissions & Fees' },
  { id: 'documents', label: 'Documents Required' },
  { id: 'calendar', label: 'Academic Calendar' },
  { id: 'collaborations', label: 'Educational Collaborations' }
];

export default function Programs() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (TABS.find(t => t.id === hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  return (
    <div className="programs-container h-screen w-full overflow-x-hidden overflow-y-auto">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-[#FFBF00]/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="programs-content-wrapper z-20 relative pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-brand-text mb-6 uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Academic <span className="text-[#FFBF00]">Excellence</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted max-w-2xl mx-auto text-lg"
          >
            Where rigorous scholarship meets uncompromising integrity. 
            Shaping the vanguards of modern jurisprudence.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="programs-tabs flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md text-xs md:text-sm tracking-wider font-semibold transition-all duration-300 border ${
                activeTab === tab.id 
                ? 'border-[#FFBF00] bg-[#FFBF00]/10 text-[#FFBF00] shadow-[0_0_15px_rgba(255,191,0,0.2)]' 
                : 'border-brand-border text-brand-muted hover:border-white/30 hover:text-brand-text'
              }`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content-area relative min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                <div className="mb-12 text-center md:text-left">
                  <h2 className="text-3xl text-brand-text mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Approved Academic Courses</h2>
                  <p className="text-brand-muted leading-relaxed text-lg mb-8 max-w-3xl">
                    Prudentia College of Law offers integrated and professional law programs approved by the Bar Council of India. Our curriculum is designed to bridge the rural-urban gap, integrating academic rigor with practical legal training starting from year one.
                  </p>
                  
                  {/* Campus Exterior Image */}
                  <div className="w-full h-[300px] md:h-[400px] bg-brand-card border border-brand-border rounded-xl overflow-hidden mb-12 relative flex items-center justify-center group">
                    <img src={outdoorImg} alt="Prudentia College of Law Campus" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-[#FFBF00]/20 rounded-xl pointer-events-none"></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  <Link to="/programs/ba-llb" className="course-card block bg-brand-card border border-brand-border p-6 md:p-8 rounded-xl hover:border-[#FFBF00]/50 hover:bg-[#FFBF00]/5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00] opacity-0 group-hover:opacity-5 rounded-bl-full transition-all duration-500"></div>
                    <h3 className="text-[#FFBF00] text-xl font-bold mb-4 flex items-center justify-between">
                      <span>BA. LL.B <span className="block text-xs text-brand-muted font-normal mt-1">(5 Years)</span></span>
                      <span className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">➔</span>
                    </h3>
                    <p className="text-brand-muted leading-relaxed text-sm md:text-base">
                      An integrated undergraduate program combining Humanities with Law. It focuses on socio-legal awareness, preparing students for leadership in Governance and Advocacy.
                    </p>
                  </Link>
                  <Link to="/programs/bba-llb" className="course-card block bg-brand-card border border-brand-border p-6 md:p-8 rounded-xl hover:border-[#FFBF00]/50 hover:bg-[#FFBF00]/5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00] opacity-0 group-hover:opacity-5 rounded-bl-full transition-all duration-500"></div>
                    <h3 className="text-[#FFBF00] text-xl font-bold mb-4 flex items-center justify-between">
                      <span>BBA. LL.B <span className="block text-xs text-brand-muted font-normal mt-1">(5 Years)</span></span>
                      <span className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">➔</span>
                    </h3>
                    <p className="text-brand-muted leading-relaxed text-sm md:text-base">
                      This program merges Business Administration with Legal Education. It is tailored for students aiming for careers in Corporate Law, Legal Consultancy, and Management.
                    </p>
                  </Link>
                  <Link to="/programs/llb" className="course-card block bg-brand-card border border-brand-border p-6 md:p-8 rounded-xl hover:border-[#FFBF00]/50 hover:bg-[#FFBF00]/5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBF00] opacity-0 group-hover:opacity-5 rounded-bl-full transition-all duration-500"></div>
                    <h3 className="text-[#FFBF00] text-xl font-bold mb-4 flex items-center justify-between">
                      <span>LL.B <span className="block text-xs text-brand-muted font-normal mt-1">(3 Years)</span></span>
                      <span className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">➔</span>
                    </h3>
                    <p className="text-brand-muted leading-relaxed text-sm md:text-base">
                      A purely professional course for graduates. It emphasizes core legal subjects, procedural laws, and court exposure to create practice-ready advocates.
                    </p>
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === 'admissions' && (
              <motion.div
                key="admissions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl text-brand-text mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Admissions & Fee Structure</h2>
                  <p className="text-brand-muted text-lg max-w-3xl mx-auto italic">
                    "We are committed to offering quality legal education at affordable fees to underserved communities."
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                  {/* Seat Matrix Table */}
                  <div className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-8">
                    <h3 className="text-xl text-[#FFBF00] font-bold mb-6 flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-[#FFBF00]"></span> Admission Process
                    </h3>
                    <div className="border border-brand-border rounded-xl bg-brand-bg overflow-hidden shadow-sm">
                      <div className="hidden md:grid grid-cols-3 bg-brand-card border-b border-brand-border p-4">
                        <div className="text-brand-text font-semibold text-sm">Quota Type</div>
                        <div className="text-brand-text font-semibold text-sm">Allocation</div>
                        <div className="text-brand-text font-semibold text-sm">Admission Route</div>
                      </div>
                      
                      <div className="divide-y divide-brand-border">
                        <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-brand-card transition-colors gap-2 md:gap-4">
                          <div className="font-semibold text-brand-text text-sm">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Quota Type</span>
                            State Counselling
                          </div>
                          <div className="text-[#FFBF00] text-sm flex flex-col justify-center">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Allocation</span>
                            80% Seats
                          </div>
                          <div className="text-brand-muted text-sm flex flex-col justify-center">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Admission Route</span>
                            OU Counselling (TS LAWCET)
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 p-4 hover:bg-brand-card transition-colors gap-2 md:gap-4">
                          <div className="font-semibold text-brand-text text-sm">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Quota Type</span>
                            Management
                          </div>
                          <div className="text-[#FFBF00] text-sm flex flex-col justify-center">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Allocation</span>
                            20% Seats
                          </div>
                          <div className="text-brand-muted text-sm flex flex-col justify-center">
                            <span className="md:hidden text-brand-muted text-xs block mb-1 uppercase tracking-wider">Admission Route</span>
                            Management Quota
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Structure */}
                  <div className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-8">
                    <h3 className="text-xl text-[#FFBF00] font-bold mb-6 flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-[#FFBF00]"></span> Fee Structure
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 bg-brand-card p-4 rounded-lg border border-brand-border">
                        <span className="text-brand-text font-semibold text-sm">Counselling Students</span>
                        <span className="text-[#FFBF00] font-bold">Rs. 20,000</span>
                      </div>
                      <div className="bg-brand-card p-4 rounded-lg border border-brand-border">
                        <span className="text-brand-text font-semibold block mb-2 text-sm">Management Quota</span>
                        <p className="text-brand-muted text-sm leading-relaxed">
                          Fees are subject to incurring expenditure and demand.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-12 text-center md:text-left">
                  <h3 className="text-xl text-[#FFBF00] font-bold mb-8 flex items-center justify-center md:justify-start gap-3">
                    <span className="w-8 h-[1px] bg-[#FFBF00] hidden md:block"></span> Eligibility & Entrance
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-brand-text font-semibold mb-3">5-Year Courses (BA. LL.B / BBA. LL.B)</h4>
                      <p className="text-brand-muted text-sm leading-relaxed">
                        Pass in Intermediate (10+2) with min 45% marks (40% for SC/ST).
                      </p>
                    </div>
                    <div>
                      <h4 className="text-brand-text font-semibold mb-3">3-Year Course (LL.B)</h4>
                      <p className="text-brand-muted text-sm leading-relaxed">
                        Graduate in any discipline (10+2+3 pattern) with min 45% marks.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-brand-border">
                    <p className="text-brand-text font-semibold">
                      <span className="text-[#FFBF00] mr-2">Entrance Requirement:</span>
                      Qualification in TS LAWCET is mandatory for Convenor Quota seats.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl text-brand-text mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Documents Required</h2>
                  <p className="text-brand-muted text-lg max-w-2xl mx-auto">
                    Applicants are required to submit the following documents in original along with photocopies at the time of admission.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl mx-auto mb-16">
                  {[
                    "SSC / 10th Class Certificate",
                    "Intermediate / 12th Class Certificate",
                    "Degree Certificate & Marks Memos (for LL.B 3 Yrs)",
                    "TS LAWCET Hall Ticket and Rank Card",
                    "Transfer Certificate (TC)",
                    "Conduct / Character Certificate",
                    "Aadhaar Card Copy",
                    "Recent Passport Size Photographs",
                    "Caste & Income Certificate (if applicable)"
                  ].map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-brand-card p-4 rounded-lg border border-brand-border hover:border-[#FFBF00]/30 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#FFBF00]/10 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#FFBF00]"></div>
                      </div>
                      <span className="text-brand-muted text-sm md:text-base">{doc}</span>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-8 bg-brand-card rounded-full border border-[#FFBF00]/30 flex items-center justify-center">
                  <span className="text-3xl">📅</span>
                </div>
                <h2 className="text-3xl text-brand-text mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Academic Calendar</h2>
                <p className="text-brand-muted text-lg max-w-2xl mx-auto mb-8">
                  The academic calendar for the upcoming session is currently being finalized in accordance with university guidelines. It will be published here shortly.
                </p>
                <button className="px-8 py-3 bg-[#FFBF00] text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-colors">
                  Download PDF (Coming Soon)
                </button>
              </motion.div>
            )}

            {activeTab === 'collaborations' && (
              <motion.div
                key="collaborations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                  <div className="md:w-2/3 text-center md:text-left">
                    <h2 className="text-3xl text-brand-text mb-4 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Educational Collaborations</h2>
                    <h3 className="text-xl text-[#FFBF00] font-semibold mb-6">Career Focus & Coaching</h3>
                    <p className="text-brand-muted leading-relaxed text-base md:text-lg mb-6">
                      We provide specialized coaching integrated with the curriculum to ensure career readiness in public service and the judiciary. Prudentia College of Law, in collaboration with <span className="text-[#FFBF00] font-semibold">Sarat Chandra IAS Academy</span>, seeks to create a dynamic learning ecosystem that blends legal education with competitive and career-focused training.
                    </p>
                    <p className="text-brand-muted leading-relaxed text-base md:text-lg">
                      Renowned for its structured coaching and academic mentorship, Sarat Chandra Academy brings valuable expertise that supports students in developing analytical ability, leadership skills, and broader career readiness.
                    </p>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                     <div className="w-48 h-48 md:w-56 md:h-56 bg-white rounded-full border-4 border-[#FFBF00] flex items-center justify-center p-6 shadow-[0_0_30px_rgba(255,191,0,0.3)] relative overflow-hidden group">
                        <img src={saratChandraLogo} alt="Sarat Chandra IAS Academy" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                     </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-brand-card border border-brand-border p-6 rounded-lg border-l-4 border-l-[#FFBF00] hover:-translate-y-1 transition-transform">
                    <h4 className="text-brand-text font-bold text-lg mb-2">Judicial Orientation</h4>
                    <p className="text-brand-muted text-sm">Coaching for Junior Civil Judge examinations.</p>
                  </div>
                  <div className="bg-brand-card border border-brand-border p-6 rounded-lg border-l-4 border-l-[#FFBF00] hover:-translate-y-1 transition-transform">
                    <h4 className="text-brand-text font-bold text-lg mb-2">Civil Services</h4>
                    <p className="text-brand-muted text-sm">Preparation for UPSC and Group Services.</p>
                  </div>
                  <div className="bg-brand-card border border-brand-border p-6 rounded-lg border-l-4 border-l-[#FFBF00] hover:-translate-y-1 transition-transform">
                    <h4 className="text-brand-text font-bold text-lg mb-2">Industry Integration</h4>
                    <p className="text-brand-muted text-sm">Orientation with Law Firms and Court Exposure.</p>
                  </div>
                </div>

                <div className="w-full h-[300px] md:h-[400px] bg-brand-card border border-brand-border rounded-xl overflow-hidden relative flex items-center justify-center group">
                  <img src={classroom1} alt="Collaborative Learning" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-[#FFBF00]/20 rounded-xl pointer-events-none"></div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
