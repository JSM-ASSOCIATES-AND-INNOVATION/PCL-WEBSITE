/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './COMPONENTS/NAVBAR/Navbar';
import PremiumFooter from './COMPONENTS/UI/PremiumFooter/PremiumFooter';
import Home from './COMPONENTS/HOME/Home';
import About from './COMPONENTS/NAVBAR/ABOUT/About';
import LeadershipProfile from './COMPONENTS/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';
import UnderConstruction from './PAGES/UnderConstruction';
import Gallery from './COMPONENTS/NAVBAR/CAMPUS/Gallery/Gallery';
import Preloader from './COMPONENTS/UI/Preloader/Preloader';
import ScrollToTop from './COMPONENTS/UI/ScrollToTop';
import Affiliations from './COMPONENTS/NAVBAR/ABOUT/Affiliations';
import Careers from './COMPONENTS/NAVBAR/CAREERS/Careers';
import PlacementCell from './COMPONENTS/NAVBAR/CAREERS/PlacementCell';
import Programs from './COMPONENTS/NAVBAR/PROGRAMS/Programs';
import CourseBALLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseBALLB';
import CourseBBALLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseBBALLB';
import CourseLLB from './COMPONENTS/NAVBAR/PROGRAMS/CourseLLB';
import Faculty from './COMPONENTS/NAVBAR/ABOUT/Faculty';
import FacultyProfile from './COMPONENTS/NAVBAR/ABOUT/FacultyProfile';
import Facilities from './COMPONENTS/NAVBAR/CAMPUS/FACILITIES/Facilities';
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
      <Preloader />
      <Routes>
        <Route path="/" element={<><Navbar /><main><Home /></main></>} />
        
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<><Navbar /><Faculty /></>} />
        <Route path="/about/faculty/:id" element={<><Navbar /><FacultyProfile /></>} />
        <Route path="/about/governing-body" element={<UnderConstruction title="Governing Body" />} />
        <Route path="/about/affiliations" element={<><Navbar /><Affiliations /></>} />
        
        <Route path="/programs" element={<><Navbar /><Programs /></>} />
        <Route path="/programs/ba-llb" element={<><Navbar /><CourseBALLB /></>} />
        <Route path="/programs/bba-llb" element={<><Navbar /><CourseBBALLB /></>} />
        <Route path="/programs/llb" element={<><Navbar /><CourseLLB /></>} />
        <Route path="/programs/judiciary" element={<UnderConstruction title="Judiciary Prep" />} />
        
        <Route path="/campus" element={<UnderConstruction title="Campus Life" />} />
        <Route path="/campus/facilities" element={<><Navbar /><Facilities /></>} />
        <Route path="/campus/facilities/:id" element={<><Navbar /><FacilityDetail /></>} />
        <Route path="/campus/gallery" element={<Gallery />} />
        <Route path="/campus/moot-court" element={<><Navbar /><MootCourt /></>} />
        <Route path="/campus/legal-aid" element={<><Navbar /><LegalAid /></>} />
        <Route path="/campus/library" element={<><Navbar /><Library /></>} />
        
        <Route path="/careers" element={<><Navbar /><Careers /></>} />
        <Route path="/careers/placement" element={<><Navbar /><PlacementCell /></>} />

        <Route path="/events" element={<><Navbar /><EventsPage /></>} />
        <Route path="/events/:id" element={<><Navbar /><EventDetail /></>} />
        <Route path="/blogs" element={<><Navbar /><BlogsPage /></>} />
        <Route path="/blogs/submit" element={<><Navbar /><SubmitBlog /></>} />
        <Route path="/blogs/:id" element={<><Navbar /><BlogDetail /></>} />

        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/apply" element={<ApplyNow />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="*" element={<UnderConstruction title="Page Not Found" />} />
      </Routes>
      {!isHome && <PremiumFooter />}
    </>
  )
}

export default App
