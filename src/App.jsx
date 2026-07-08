import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import LeadershipProfile from './pages/LeadershipProfile';
import DummyPage from './pages/DummyPage';
import Preloader from './components/Preloader';

function App() {
  return (
    <>
      <Preloader />
      <Routes>
        <Route path="/" element={<><Navbar /><main><Home /></main></>} />
        
        {/* About Routes */}
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership" element={<><Navbar /><About /></>} />
        <Route path="/about/leadership/:id" element={<LeadershipProfile />} />
        <Route path="/about/faculty" element={<DummyPage title="Faculty Profiles" />} />
        <Route path="/about/governing-body" element={<DummyPage title="Governing Body" />} />
        <Route path="/about/affiliations" element={<DummyPage title="Affiliations" subtitle="BCI & Osmania University" />} />
        
        {/* Programs Routes */}
        <Route path="/programs" element={<DummyPage title="Programs" />} />
        <Route path="/programs/ba-llb" element={<DummyPage title="5-Year BA LL.B (Integrated)" />} />
        <Route path="/programs/bba-llb" element={<DummyPage title="5-Year BBA LL.B (Corporate)" />} />
        <Route path="/programs/llb" element={<DummyPage title="3-Year LL.B" />} />
        <Route path="/programs/judiciary" element={<DummyPage title="Judiciary & UPSC Prep" />} />
        
        {/* Campus Life Routes */}
        <Route path="/campus" element={<DummyPage title="Campus Life" />} />
        <Route path="/campus/moot-court" element={<DummyPage title="Moot Court Society" />} />
        <Route path="/campus/legal-aid" element={<DummyPage title="Legal Aid & Counselling Clinic" />} />
        <Route path="/campus/library" element={<DummyPage title="Library & Infrastructure" />} />
        
        {/* Careers Routes */}
        <Route path="/careers" element={<DummyPage title="Careers" />} />
        <Route path="/careers/placement" element={<DummyPage title="Placement Cell" />} />
        <Route path="/careers/industry" element={<DummyPage title="Industry Integration & Clerkships" />} />
        <Route path="/careers/opportunities" element={<DummyPage title="Opportunities With Us" />} />
      </Routes>
    </>
  )
}

export default App
