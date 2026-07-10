import React, { useState } from 'react';
import Navbar from '../../Navbar.jsx';
import CircularGallery from './CircularGallery';
import UnderConstruction from '../../../../pages/UnderConstruction';
import { motion } from 'framer-motion';

// Import images
import classroom1 from '../../../../assets/pcl_classroom_1.webp';
import classroom2 from '../../../../assets/pcl_classroom_2.webp';
import classroom3 from '../../../../assets/pcl_classroom_3.webp';
import entrance from '../../../../assets/pcl_entrance.webp';
import ladyJustice from '../../../../assets/pcl_justice.webp';
import legalCell from '../../../../assets/pcl_legal_clinic.webp';
import library from '../../../../assets/pcl_library.webp';
import outdoor from '../../../../assets/pcl_outdoor.webp';

const galleryItems = [
  { image: entrance, text: 'Campus Entrance' },
  { image: library, text: 'Library' },
  { image: classroom1, text: 'Smart Classroom' },
  { image: legalCell, text: 'Legal Cell' },
  { image: outdoor, text: 'Campus Exterior' },
  { image: classroom2, text: 'Lecture Hall' },
  { image: ladyJustice, text: 'Lady Justice' },
  { image: classroom3, text: 'Seminar Room' }
];

export default function Gallery() {
  const [view, setView] = useState('circular');

  return (
    <>
      <Navbar />
      <div className="h-screen w-full bg-brand-bg flex flex-col pt-24 font-sans text-brand-text">
        
        {/* Gallery View Toggle */}
        <div className="flex justify-center my-6 z-10 relative">
          <div className="bg-white/5 p-1 rounded-full border border-brand-border flex">
            <button
              onClick={() => setView('circular')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                view === 'circular' ? 'bg-[#FFBF00] text-black shadow-[0_0_20px_rgba(255,191,0,0.3)]' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              Circular View
            </button>
            <button
              onClick={() => setView('infinite')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                view === 'infinite' ? 'bg-[#FFBF00] text-black shadow-[0_0_20px_rgba(255,191,0,0.3)]' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Gallery Container */}
        <div className="flex-1 w-full relative overflow-hidden bg-black/50">
          <motion.div 
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            {view === 'circular' ? (
              <CircularGallery 
                items={galleryItems}
                bend={3}
                textColor="#FFBF00"
                borderRadius={0.05}
                font="bold 30px 'Playfair Display'"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <p className="text-brand-muted text-lg">
                  Grid View component code is pending. Waiting for InfiniteMenu...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
