/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './COMPONENTS/NAVBAR/Navbar';
import Footer from './COMPONENTS/UI/FOOTER/FOOTER';
import Home from './COMPONENTS/HOME/Home';
import About from './COMPONENTS/NAVBAR/ABOUT/About';
import LeadershipProfile from './COMPONENTS/NAVBAR/ABOUT/LEADERSHIPPROFILE/LEADERSHIPPROFILE';
import UnderConstruction from './PAGES/UnderConstruction';
import Gallery from './COMPONENTS/NAVBAR/CAMPUS/GALLERY/GALLERY';
import Preloader from './COMPONENTS/UI/PRELOADER/PRELOADER';
import ScrollToTop from './COMPONENTS/UI/ScrollToTop';
import Programs from './COMPONENTS/NAVBAR/PROGRAMS/Programs';
import CourseBALLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseBALLB';
import CourseBBALLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseBBALLB';
import CourseLLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseLLB';
import Faculty from './COMPONENTS/NAVBAR/ABOUT/FACULTY';
import FacultyProfile from './COMPONENTS/NAVBAR/ABOUT/FacultyProfile';
import Facilities from './COMPONENTS/NAVBAR/CAMPUS/FACILITIES/FACILITIES';
import FacilityDetail from './COMPONENTS/NAVBAR/CAMPUS/FACILITIES/FacilityDetail';
import Contact from './COMPONENTS/NAVBAR/CONTACT/CONTACT';
import EventsPage from './COMPONENTS/NAVBAR/EVENTS/EventsPage';
import ApplyNow from './COMPONENTS/NAVBAR/APPLYNOW/APPLYNOW';
import TermsAndConditions from './COMPONENTS/LEGAL/TermsAndConditions';
import PrivacyPolicy from './COMPONENTS/LEGAL/PrivacyPolicy';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <Preloader />
      <Routes>
        <Route path="/" element={<><Navbar /><main><Home /></main></>} />
        
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<><Navbar /><Faculty /></>} />
        <Route path="/about/faculty/:id" element={<><Navbar /><FacultyProfile /></>} />
        <Route path="/about/governing-body" element={<UnderConstruction title="Governing Body" />} />
        <Route path="/about/affiliations" element={<UnderConstruction title="Affiliations" />} />
        
        <Route path="/programs" element={<><Navbar /><Programs /></>} />
        <Route path="/programs/ba-llb" element={<><Navbar /><CourseBALLB /></>} />
        <Route path="/programs/bba-llb" element={<><Navbar /><CourseBBALLB /></>} />
        <Route path="/programs/llb" element={<><Navbar /><CourseLLB /></>} />
        <Route path="/programs/judiciary" element={<UnderConstruction title="Judiciary Prep" />} />
        
        <Route path="/campus" element={<UnderConstruction title="Campus Life" />} />
        <Route path="/campus/facilities" element={<><Navbar /><Facilities /></>} />
        <Route path="/campus/facilities/:id" element={<><Navbar /><FacilityDetail /></>} />
        <Route path="/campus/gallery" element={<Gallery />} />
        <Route path="/campus/moot-court" element={<UnderConstruction title="Moot Court Society" />} />
        <Route path="/campus/legal-aid" element={<UnderConstruction title="Legal Aid Clinic" />} />
        <Route path="/campus/library" element={<UnderConstruction title="Library & Infrastructure" />} />
        
        <Route path="/careers" element={<UnderConstruction title="Careers" />} />
        <Route path="/careers/placement" element={<UnderConstruction title="Placement Cell" />} />
        <Route path="/careers/industry" element={<UnderConstruction title="Industry Integration" />} />
        <Route path="/careers/opportunities" element={<UnderConstruction title="Opportunities" />} />

        <Route path="/events" element={<><Navbar /><EventsPage /></>} />

        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/apply" element={<ApplyNow />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="*" element={<UnderConstruction title="Page Not Found" />} />
      </Routes>
      {!isHome && <Footer />}
    </>
  )
}

export default App
