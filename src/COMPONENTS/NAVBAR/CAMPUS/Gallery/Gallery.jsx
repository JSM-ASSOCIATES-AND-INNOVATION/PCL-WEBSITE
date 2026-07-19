import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../Navbar.jsx';
import styles from '../../PROGRAMS/Programs.module.css';

import CircularGallery from '../../../UI/CircularGallery/CircularGallery.jsx';
import Masonry from '../../../UI/Masonry/Masonry.jsx';
import InfiniteMenu from '../../../UI/InfiniteMenu/InfiniteMenu.jsx';

// Import all campus images
import imgClassroom1 from '../../../../ASSETS/CAMPUS/PCL_CLASSROOM.webp';
import imgClassroom2 from '../../../../ASSETS/CAMPUS/PCL_CLASSROOM2.webp';
import imgClassroom3 from '../../../../ASSETS/CAMPUS/PCL_CLASSROOM3.webp';
import imgLegalAid from '../../../../ASSETS/CAMPUS/PCL_LEGAL_AID_CELL.webp';
import imgLibrary from '../../../../ASSETS/CAMPUS/pcl_library.webp';
import imgLobby from '../../../../ASSETS/CAMPUS/PCL_LOBBY.webp';
import imgOutside from '../../../../ASSETS/CAMPUS/PCL_OUTSIDE.webp';
import imgCampus from '../../../../ASSETS/CAMPUS/PCL_CAMPUS.webp';
import imgMoot1 from '../../../../ASSETS/CAMPUS/moot1.png';
import imgMoot2 from '../../../../ASSETS/CAMPUS/moot2.png';
import imgJustice from '../../../../ASSETS/CAMPUS/pcl_justice.webp';

const circularItems = [
  { image: imgCampus, text: 'PCL Campus' },
  { image: imgLibrary, text: 'Law Library' },
  { image: imgMoot1, text: 'Moot Court Hall' },
  { image: imgLobby, text: 'Main Lobby' },
  { image: imgClassroom1, text: 'Smart Classroom' },
  { image: imgLegalAid, text: 'Legal Aid Cell' },
  { image: imgJustice, text: 'Justice' },
  { image: imgMoot2, text: 'ADR Cell' }
];

const masonryItems = [
  { id: "1", img: imgCampus, url: "", height: 500 },
  { id: "2", img: imgLibrary, url: "", height: 700 },
  { id: "3", img: imgMoot1, url: "", height: 600 },
  { id: "4", img: imgLobby, url: "", height: 550 },
  { id: "5", img: imgClassroom1, url: "", height: 400 },
  { id: "6", img: imgLegalAid, url: "", height: 450 },
  { id: "7", img: imgJustice, url: "", height: 600 },
  { id: "8", img: imgMoot2, url: "", height: 500 },
  { id: "9", img: imgOutside, url: "", height: 650 },
  { id: "10", img: imgClassroom2, url: "", height: 450 },
  { id: "11", img: imgClassroom3, url: "", height: 550 }
];


const TOUR_DATA = [
  {
    id: 'outside',
    label: 'Campus Exterior',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784449903004!6m8!1m7!1sCAoSHENJQUJJaER4MGMxeXl5TEJJSmxLMGtmWF9FMHc.!2m2!1d17.29359537151621!2d78.56574644000146!3f320!4f20!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  },
  {
    id: 'lobby',
    label: 'Main Lobby',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784449983374!6m8!1m7!1sCAoSHENJQUJJaEFlUWZ6RE13aUpvZzJkOElOMG10UWE.!2m2!1d17.29366017366905!2d78.56555981388078!3f20!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  },
  {
    id: 'classrooms',
    label: 'Classrooms',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784449938991!6m8!1m7!1sCAoSHENJQUJJaEFBTFRBeXg4aW1Fell4TnkxZFNMbXY.!2m2!1d17.29369924218892!2d78.5655099082302!3f180!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450054947!6m8!1m7!1sCAoSHENJQUJJaENNQS1CMHYtT3RXcDhVRVdyZmpRTWo.!2m2!1d17.29372186617063!2d78.56547377860319!3f140!4f10!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450130556!6m8!1m7!1sCAoSHENJQUJJaENPZzZuRFBwcUgzNXpKcFdwSGZ6N08.!2m2!1d17.29377281131918!2d78.5656617045075!3f20!4f10!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  },
  {
    id: 'moot',
    label: 'Moot Court',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450084674!6m8!1m7!1sCAoSHENJQUJJaEFwY3NPbmtoTF8td0owTlZTdjB4bmw.!2m2!1d17.29381710280643!2d78.56568111223427!3f260!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784449993975!6m8!1m7!1sCAoSHENJQUJJaEMxSDVBbzJDX0NMeS1uMEFTZFNiVnY.!2m2!1d17.29372454014391!2d78.56566118465763!3f40!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450004407!6m8!1m7!1sCAoSHENJQUJJaENRckVPbFZUYUNEMFFWN1p2bEhIRzg.!2m2!1d17.2937424962214!2d78.56566135794093!3f100!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784449958007!6m8!1m7!1sCAoSHENJQUJJaEFuMFZ1Nll1V1F3aF9lUXpXODc5amI.!2m2!1d17.29379515977369!2d78.56566101137435!3f180!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  },
  {
    id: 'library',
    label: 'Law Library',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450041657!6m8!1m7!1sCAoSHENJQUJJaER5UzZtU09PRURQMVI3LXhNeGhwMlc.!2m2!1d17.29377980064065!2d78.56561786382528!3f180!4f20!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450073608!6m8!1m7!1sCAoSHENJQUJJaEFMaGdreVNlTDh6MEZ4eF96cExRcFY.!2m2!1d17.29380262689914!2d78.56560382787161!3f180!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450098840!6m8!1m7!1sCAoSHENJQUJJaEMyclpOazV6VVpJZzcwdUtBODVJR0E.!2m2!1d17.29373129347443!2d78.56561942337555!3f0!4f0!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450118824!6m8!1m7!1sCAoSHENJQUJJaEFWSlFfbVR4VUpNUFN2LVJhU1VJd0c.!2m2!1d17.29382020993432!2d78.56559750302766!3f313.14282!4f0.8369500000000016!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  },
  {
    id: 'first-floor',
    label: '1st Floor',
    iframes: [
      '<iframe src="https://www.google.com/maps/embed?pb=!4v1784450030107!6m8!1m7!1sCAoSHENJQUJJaER5R1lpcFdIOWhFR3U3akdEWG1sZ0E.!2m2!1d17.29375022046456!2d78.56561639091665!3f100!4f10!5f0.7820865974627469" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
    ]
  }
];

const infiniteItems = [
  { image: imgCampus, link: '#', title: 'PCL Campus', description: 'The Heart of Legal Education' },
  { image: imgLibrary, link: '#', title: 'Law Library', description: 'Vast Legal Resources' },
  { image: imgMoot1, link: '#', title: 'Moot Court', description: 'Real-World Trial Advocacy' },
  { image: imgLobby, link: '#', title: 'Main Lobby', description: 'Grand Entrance' },
  { image: imgClassroom1, link: '#', title: 'Smart Classroom', description: 'Interactive Learning' },
  { image: imgJustice, link: '#', title: 'Justice', description: 'The Scales of Truth' }
];

export default function Gallery() {
  const [viewMode, setViewMode] = useState('virtual-tour'); // 'virtual-tour', 'circular', 'masonry', 'infinite'
  const [activeTab, setActiveTab] = useState(TOUR_DATA[0].id);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      {!selectedImage && <Navbar />}
      <div className={styles.pageWrapper} style={{ paddingTop: '30px' }}>
        <div className={styles.ambientBackground} />
        <div className={styles.auroraGlow} />

        <div className={`${styles.contentContainer} max-w-7xl`}>
          <div className="text-center mb-10 relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-xs tracking-[0.3em] uppercase mb-4 text-[#FFBF00]"
            >
              Explore Prudentia
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Campus <span className="text-[#FFBF00] italic">Gallery</span>
            </motion.h1>
            
            {/* View Mode Toggle */}
            <div className="inline-flex mt-6 bg-white/5 rounded-full p-1 backdrop-blur-md border border-white/10">
              <button
                onClick={() => setViewMode('virtual-tour')}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${viewMode === 'virtual-tour' ? 'bg-[#FFBF00] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                3D Virtual Tour
              </button>
              <button
                onClick={() => setViewMode('circular')}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${viewMode === 'circular' ? 'bg-[#FFBF00] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Interactive Wheel
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${viewMode === 'masonry' ? 'bg-[#FFBF00] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Photo Grid
              </button>
              <button
                onClick={() => setViewMode('infinite')}
                className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors ${viewMode === 'infinite' ? 'bg-[#FFBF00] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Infinite Menu
              </button>
            </div>
          </div>

          {/* VIRTUAL TOUR VIEW */}
          {viewMode === 'virtual-tour' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-10">
                {TOUR_DATA.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-5 py-2 rounded-full text-xs uppercase font-bold tracking-widest transition-colors"
                    style={{
                      color: activeTab === tab.id ? '#000000' : '#9ca3af',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTourPill"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative z-10 min-h-[600px]">
                <AnimatePresence mode="wait">
                  {TOUR_DATA.map(
                    (tab) =>
                      activeTab === tab.id && (
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                          {tab.iframes.map((iframeStr, idx) => (
                            <div 
                              key={idx} 
                              className={`${styles.glassCard} p-2 aspect-[4/3] w-full relative overflow-hidden transition-all duration-500 hover:border-[#FFBF00]/50`}
                            >
                              <div 
                                className="w-full h-full rounded-2xl overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: iframeStr }}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* CIRCULAR GALLERY VIEW */}
          {viewMode === 'circular' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full h-[700px] rounded-3xl overflow-hidden border border-white/10"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,191,0,0.05), transparent 70%)' }}
            >
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-gray-500 text-sm font-mono tracking-widest text-center pointer-events-none">
                DRAG OR SCROLL TO EXPLORE
              </div>
              <CircularGallery 
                items={circularItems} 
                bend={3}
                textColor="#ffffff"
                borderRadius={0.05}
                font="bold 24px 'Playfair Display'"
              />
            </motion.div>
          )}

          {/* MASONRY VIEW */}
          {viewMode === 'masonry' && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -40 }}
              className="relative z-10 w-full h-[1200px]"
            >
              <Masonry 
                items={masonryItems.map(item => ({ ...item, onImageClick: (i) => setSelectedImage(i.img) }))} 
                colorShiftOnHover={true}
              />
            </motion.div>
          )}

          {/* INFINITE MENU VIEW */}
          {viewMode === 'infinite' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full h-[700px] rounded-3xl overflow-hidden border border-white/10"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,191,0,0.05), transparent 70%)' }}
            >
              <InfiniteMenu items={infiniteItems} />
            </motion.div>
          )}

          {/* LIGHTBOX */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out backdrop-blur-sm"
              >
                <motion.img 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={selectedImage}
                  alt="Enlarged Campus View"
                  className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain border border-white/10"
                  onClick={(e) => e.stopPropagation()} // Prevent click from closing immediately if they click the image itself
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 text-white bg-black/50 hover:bg-white/20 p-3 rounded-full transition-colors border border-white/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
}
