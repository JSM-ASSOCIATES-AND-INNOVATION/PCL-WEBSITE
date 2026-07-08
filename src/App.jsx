import { Routes, Route } from 'react-router-dom';
import Navbar from './components/NAVBAR/Navbar';
import Home from './components/HOME/Home';
import About from './components/NAVBAR/ABOUT/About';
import LeadershipProfile from './components/NAVBAR/ABOUT/LeadershipProfile/LeadershipProfile';
import UnderConstruction from './pages/UnderConstruction';
import Gallery from './components/NAVBAR/CAMPUS/Gallery/Gallery';
import Preloader from './components/UI/Preloader/Preloader';

function App() {
  return (
    <>
      <Preloader />
      <Routes>
        <Route path="/" element={<><Navbar /><main><Home /></main></>} />
        
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<UnderConstruction title="Faculty Profiles" />} />
        <Route path="/about/governing-body" element={<UnderConstruction title="Governing Body" />} />
        <Route path="/about/affiliations" element={<UnderConstruction title="Affiliations" />} />
        
        <Route path="/programs" element={<UnderConstruction title="Programs" />} />
        <Route path="/programs/ba-llb" element={<UnderConstruction title="5-Year BA LL.B" />} />
        <Route path="/programs/bba-llb" element={<UnderConstruction title="5-Year BBA LL.B" />} />
        <Route path="/programs/llb" element={<UnderConstruction title="3-Year LL.B" />} />
        <Route path="/programs/judiciary" element={<UnderConstruction title="Judiciary Prep" />} />
        
        <Route path="/campus" element={<UnderConstruction title="Campus Life" />} />
        <Route path="/campus/gallery" element={<Gallery />} />
        <Route path="/campus/moot-court" element={<UnderConstruction title="Moot Court Society" />} />
        <Route path="/campus/legal-aid" element={<UnderConstruction title="Legal Aid Clinic" />} />
        <Route path="/campus/library" element={<UnderConstruction title="Library & Infrastructure" />} />
        
        <Route path="/careers" element={<UnderConstruction title="Careers" />} />
        <Route path="/careers/placement" element={<UnderConstruction title="Placement Cell" />} />
        <Route path="/careers/industry" element={<UnderConstruction title="Industry Integration" />} />
        <Route path="/careers/opportunities" element={<UnderConstruction title="Opportunities" />} />

        <Route path="*" element={<UnderConstruction title="Page Not Found" />} />
      </Routes>
    </>
  )
}

export default App
