import React from 'react';
import Preloader from './COMPONENTS/UI/Preloader/Preloader';
/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { Routes, Route, useLocation } from 'react-router-dom';
import SEO from './COMPONENTS/SEO/SEO';
import Navbar from './COMPONENTS/NAVBAR/Navbar';
import PremiumFooter from './COMPONENTS/UI/PremiumFooter/PremiumFooter';
import Home from './COMPONENTS/HOME/Home';
const About = React.lazy(() => import('./COMPONENTS/NAVBAR/ABOUT/About'));
import LeadershipProfile from './COMPONENTS/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';
import UnderConstruction from './PAGES/UnderConstruction';
import NotFound404 from './COMPONENTS/UI/NotFound404';
const GoverningBody = React.lazy(() => import('./COMPONENTS/NAVBAR/ABOUT/GoverningBody'));
const JudiciaryPrep = React.lazy(() => import('./COMPONENTS/NAVBAR/PROGRAMS/JudiciaryPrep'));
const CampusLife = React.lazy(() => import('./COMPONENTS/NAVBAR/CAMPUS/CampusLife'));

import Gallery from './COMPONENTS/NAVBAR/CAMPUS/Gallery/Gallery';
import ScrollToTop from './COMPONENTS/UI/ScrollToTop';
import UnifiedDisclaimer from './COMPONENTS/UI/UnifiedDisclaimer';
import Affiliations from './COMPONENTS/NAVBAR/ABOUT/Affiliations';
const Careers = React.lazy(() => import('./COMPONENTS/NAVBAR/CAREERS/Careers'));
import PlacementCell from './COMPONENTS/NAVBAR/CAREERS/PlacementCell';
const Programs = React.lazy(() => import('./COMPONENTS/NAVBAR/PROGRAMS/Programs'));
const CourseBALLB = React.lazy(() => import('./COMPONENTS/NAVBAR/PROGRAMS/CourseBALLB'));
const CourseBBALLB = React.lazy(() => import('./COMPONENTS/NAVBAR/PROGRAMS/CourseBBALLB'));
const CourseLLB = React.lazy(() => import('./COMPONENTS/NAVBAR/PROGRAMS/CourseLLB'));
const Faculty = React.lazy(() => import('./COMPONENTS/NAVBAR/ABOUT/Faculty'));
import FacultyProfile from './COMPONENTS/NAVBAR/ABOUT/FacultyProfile';
const Facilities = React.lazy(() => import('./COMPONENTS/NAVBAR/CAMPUS/FACILITIES/Facilities'));
import FacilityDetail from './COMPONENTS/NAVBAR/CAMPUS/FACILITIES/FacilityDetail';
import Library from './COMPONENTS/NAVBAR/CAMPUS/LIBRARY/Library';
import MootCourt from './COMPONENTS/NAVBAR/CAMPUS/MOOT_COURT/MootCourt';
import LegalAid from './COMPONENTS/NAVBAR/CAMPUS/LEGAL_AID/LegalAid';
import Contact from "./COMPONENTS/NAVBAR/Contact/Contact";
import EventsPage from "./COMPONENTS/NAVBAR/Events/EventsPage";
import EventDetail from "./COMPONENTS/NAVBAR/Events/EventDetail";
import BlogsPage from './COMPONENTS/NAVBAR/BLOGS/BlogsPage';
import BlogDetail from './COMPONENTS/NAVBAR/BLOGS/BlogDetail';
import SubmitBlog from './COMPONENTS/NAVBAR/BLOGS/SubmitBlog';
import ApplyNow from './COMPONENTS/NAVBAR/APPLY_NOW/ApplyNow';
import TermsAndConditions from './COMPONENTS/LEGAL/TermsAndConditions';
import PrivacyPolicy from './COMPONENTS/LEGAL/PrivacyPolicy';
import WebsiteTracker from './COMPONENTS/UI/WebsiteTracker';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <WebsiteTracker />
            <ScrollToTop />
      <UnifiedDisclaimer />
            <Routes>
        <Route path="/" element={<><SEO title="Home | Prudentia College of Law" description="Premier legal education institution offering BA LLB, BBA LLB, and LLB programs with practical moot court experience." jsonLd={{ "@context": "https://schema.org", "@type": "CollegeOrUniversity", "name": "Prudentia College of Law", "url": "https://prudentiacollegeoflaw.com" }} /><Navbar /><main><Home /></main></>} />
        
        <Route path="/about" element={<><SEO title="About Us" description="Learn about the history, vision, and mission of Prudentia College of Law." /><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<><SEO title="Our Faculty" description="Meet the experienced legal professionals and academic scholars at Prudentia College of Law." /><Navbar /><Faculty /></>} />
        <Route path="/about/faculty/:id" element={<><Navbar /><FacultyProfile /></>} />
        <Route path="/about/governing-body" element={<><Navbar /><GoverningBody /></>} />
        <Route path="/about/affiliations" element={<><Navbar /><Affiliations /></>} />
        
        <Route path="/programs" element={<><SEO title="Programs & Degrees" description="Explore our comprehensive BA LLB, BBA LLB, and LLB degree programs." /><Navbar /><Programs /></>} />
        <Route path="/programs/ba-llb" element={<><SEO title="BA LLB Program" description="5-year integrated Bachelor of Arts and Bachelor of Legislative Law program." /><Navbar /><CourseBALLB /></>} />
        <Route path="/programs/bba-llb" element={<><SEO title="BBA LLB Program" description="5-year integrated Bachelor of Business Administration and Bachelor of Legislative Law program." /><Navbar /><CourseBBALLB /></>} />
        <Route path="/programs/llb" element={<><SEO title="LLB Program" description="3-year intensive Bachelor of Legislative Law program." /><Navbar /><CourseLLB /></>} />
        <Route path="/programs/judiciary" element={<><Navbar /><JudiciaryPrep /></>} />
        
        <Route path="/campus" element={<><Navbar /><CampusLife /></>} />
        <Route path="/campus/facilities" element={<><SEO title="Campus Facilities" description="Explore our modern library, moot courts, and student facilities." /><Navbar /><Facilities /></>} />
        <Route path="/campus/facilities/:id" element={<><Navbar /><FacilityDetail /></>} />
        <Route path="/campus/gallery" element={<Gallery />} />
        <Route path="/campus/moot-court" element={<><Navbar /><MootCourt /></>} />
        <Route path="/campus/legal-aid" element={<><Navbar /><LegalAid /></>} />
        <Route path="/campus/library" element={<><Navbar /><Library /></>} />
        
        <Route path="/careers" element={<><SEO title="Careers" description="Join the faculty or administrative team at Prudentia College of Law." /><Navbar /><Careers /></>} />
        <Route path="/careers/placement" element={<><Navbar /><PlacementCell /></>} />

        <Route path="/events" element={<><Navbar /><EventsPage /></>} />
        <Route path="/events/:id" element={<><Navbar /><EventDetail /></>} />
        <Route path="/blogs" element={<><Navbar /><BlogsPage /></>} />
        <Route path="/blogs/submit" element={<><Navbar /><SubmitBlog /></>} />
        <Route path="/blogs/:id" element={<><Navbar /><BlogDetail /></>} />

        <Route path="/contact" element={<><SEO title="Contact Us" description="Get in touch with Prudentia College of Law for admissions, inquiries, or support." /><Navbar /><Contact /></>} />
        <Route path="/apply" element={<><SEO title="Apply Now" description="Start your application for Prudentia College of Law." /><ApplyNow /></>} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {!isHome && <PremiumFooter />}
    </>
  )
}

export default App
