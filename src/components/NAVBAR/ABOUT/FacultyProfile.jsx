import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import snehaImage from '../../../assets/pcl_founder.png';

// Mock database for now since we only have Sneha
const facultyDatabase = {
  sneha: {
    name: 'Sneha Mulla',
    designation: 'Founder',
    department: 'Department of Legal Studies',
    specialisation: 'Constitutional Law, Human Rights',
    email: 'sneha@prudentia.edu.in',
    degrees: 'B.B.A., LL.B. (Hons.), LL.M.',
    office: 'Block A, Room 101',
    phone: '+91 XXXXX XXXXX',
    linkedin: '#',
    scholar: '#',
    image: snehaImage,
    education: [
      { degree: 'Master of Laws (LL.M.)', institution: 'Rank I' },
      { degree: 'B.B.A., LL.B. (Hons.)', institution: 'Batch Topper' },
      { degree: 'UGC-NET and KSET', institution: 'Qualified' }
    ],
    research: [
      { area: 'Cyber Law and Privacy' },
      { area: 'Competition Law' },
      { area: 'Artificial Intelligence and Law' }
    ],
    projects: [
      { title: 'Legal Aid Clinic Expansion Project', role: 'Coordinator' }
    ],
    patents: [],
    awards: [
      { title: 'Excellence in Teaching Award', year: '2023' }
    ]
  }
};

const TABS = [
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research' },
  { id: 'projects', label: 'Projects' },
  { id: 'patents', label: 'Patents' },
  { id: 'awards', label: 'Awards' }
];

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const faculty = facultyDatabase[id];
  const [activeTab, setActiveTab] = useState('education');

  if (!faculty) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg text-brand-text">
        <h2 className="text-3xl mb-4">Faculty not found</h2>
        <button onClick={() => navigate('/about/faculty')} className="text-[#FFBF00] hover:underline">Return to Faculty Directory</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-brand-bg text-brand-text overflow-x-hidden overflow-y-auto">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0" />
      
      <div className="relative z-20 pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto">
        
        <Link to="/about/faculty" className="inline-flex items-center text-brand-muted hover:text-[#FFBF00] transition-colors mb-12 uppercase tracking-widest text-sm font-semibold">
          <span className="mr-2">←</span> Back to Directory
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-1/3">
            <div className="rounded-xl overflow-hidden border border-brand-border shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <img src={faculty.image} alt={faculty.name} className="w-full h-auto aspect-[3/4] object-cover" />
            </div>
          </div>
          
          <div className="md:w-2/3 flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold text-brand-text mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {faculty.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl text-brand-text font-semibold mb-2">{faculty.designation}</h2>
              <p className="text-[#FFBF00] font-medium tracking-wide uppercase text-sm">{faculty.department}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 text-brand-muted"
            >
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 font-semibold">Specialisation :</span>
                <span className="flex-1">{faculty.specialisation}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 font-semibold">Email :</span>
                <span className="flex-1 text-brand-text">{faculty.email}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 font-semibold">Office Address :</span>
                <span className="flex-1">{faculty.office}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500 w-32 font-semibold">Contact No :</span>
                <span className="flex-1">{faculty.phone}</span>
              </div>
              
              <div className="flex gap-6 mt-8 pt-6 border-t border-brand-border">
                <a href={faculty.linkedin} className="flex items-center gap-2 text-brand-muted hover:text-[#FFBF00] transition-colors">
                  <span>LinkedIn</span>
                </a>
                <a href={faculty.scholar} className="flex items-center gap-2 text-brand-muted hover:text-[#FFBF00] transition-colors">
                  <span>Google Scholar</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="mt-16">
          <div className="flex flex-wrap border-b border-[#FFBF00]/30 mb-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold tracking-wider transition-colors relative ${
                  activeTab === tab.id ? 'text-[#FFBF00]' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFBF00]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-2"
              >
                {activeTab === 'education' && (
                  <div className="space-y-8">
                    {faculty.education.length > 0 ? faculty.education.map((edu, idx) => (
                      <div key={idx}>
                        <h4 className="text-brand-text font-bold text-lg mb-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFBF00]"></span>
                          {edu.degree}
                        </h4>
                        <p className="text-brand-muted ml-3.5">{edu.institution}</p>
                      </div>
                    )) : <p className="text-gray-500 italic">No details available.</p>}
                  </div>
                )}
                
                {activeTab === 'research' && (
                  <div className="space-y-6">
                    <h3 className="text-xl text-[#FFBF00] font-bold mb-4">Area of Specialisation</h3>
                    <ul className="space-y-4">
                      {faculty.research.length > 0 ? faculty.research.map((res, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-[#FFBF00] mt-1">•</span>
                          <span className="text-brand-muted">{res.area}</span>
                        </li>
                      )) : <p className="text-gray-500 italic">No details available.</p>}
                    </ul>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {faculty.projects.length > 0 ? faculty.projects.map((proj, idx) => (
                      <div key={idx} className="bg-brand-card border border-brand-border p-6 rounded-lg border-l-2 border-[#FFBF00]">
                        <h4 className="text-brand-text font-bold text-lg mb-2">{proj.title}</h4>
                        <p className="text-[#FFBF00] text-sm uppercase tracking-wider">{proj.role}</p>
                      </div>
                    )) : <p className="text-gray-500 italic">No projects listed.</p>}
                  </div>
                )}

                {activeTab === 'patents' && (
                  <div className="space-y-6">
                    {faculty.patents.length > 0 ? faculty.patents.map((pat, idx) => (
                       <p key={idx} className="text-brand-muted">{pat}</p>
                    )) : <p className="text-gray-500 italic">No patents listed.</p>}
                  </div>
                )}

                {activeTab === 'awards' && (
                  <div className="space-y-6">
                    {faculty.awards.length > 0 ? faculty.awards.map((award, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-brand-card border border-brand-border p-4 rounded-lg">
                        <div className="text-2xl">🏆</div>
                        <div>
                          <h4 className="text-brand-text font-bold">{award.title}</h4>
                          <p className="text-brand-muted text-sm">{award.year}</p>
                        </div>
                      </div>
                    )) : <p className="text-gray-500 italic">No awards listed.</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
