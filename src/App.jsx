import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/NAVBAR/Navbar';
import Footer from './components/UI/Footer/Footer';
import Home from './components/HOME/Home';
import About from './components/NAVBAR/ABOUT/About';
import LeadershipProfile from './components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';
import UnderConstruction from './pages/UnderConstruction';
import Gallery from './components/NAVBAR/CAMPUS/Gallery/Gallery';
import Preloader from './components/UI/Preloader/Preloader';
import ScrollToTop from './components/UI/ScrollToTop';
import Programs from './components/NAVBAR/PROGRAMS/Programs';
import CourseBALLB from './components/NAVBAR/PROGRAMS/CourseBALLB';
import CourseBBALLB from './components/NAVBAR/PROGRAMS/CourseBBALLB';
import CourseLLB from './components/NAVBAR/PROGRAMS/CourseLLB';
import Faculty from './components/NAVBAR/ABOUT/Faculty';
import FacultyProfile from './components/NAVBAR/ABOUT/FacultyProfile';
import Facilities from './components/NAVBAR/CAMPUS/Facilities/Facilities';
import FacilityDetail from './components/NAVBAR/CAMPUS/Facilities/FacilityDetail';
import Contact from './components/NAVBAR/Contact/Contact';
import ApplyNow from './components/NAVBAR/ApplyNow/ApplyNow';
import TermsAndConditions from './components/Legal/TermsAndConditions';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';

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
