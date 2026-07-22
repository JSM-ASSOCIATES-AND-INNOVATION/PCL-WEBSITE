/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { theme } from './theme';
import { useERP } from './context/ErpContext';
import './index.css';
import pclLogo from '../ASSETS/LOGOS/pcl_logo.svg';

// ==========================================
// 1. AUTH & LAYOUT IMPORTS
// ==========================================
import Login from './components/Login/Login';
import TopNav from './components/shared/TopNav';
import MobileNav from './components/shared/MobileNav';
import Sidebar from './components/Student/sidebar/Sidebar';
import FacultySidebar from './components/Faculty/FacultySidebar/FacultySidebar';
import AdminSidebar from './components/Admin/AdminSidebar/AdminSidebar';

// ==========================================
// 2. SHARED PORTAL MODULES
// ==========================================
import Notices from './components/Student/Notices/Notices';
import Helpdesk from './components/Student/Helpdesk/Helpdesk';
import Credentials from './components/Student/Credentials/Credentials';
import QuestionnaireModal from './components/shared/QuestionnaireModal';
import DialogContainer from './components/shared/DialogContainer';
import CredentialVerification from './components/Public/CredentialVerification';
import GlobalSearch from './components/shared/GlobalSearch';

// ==========================================
// 3. STUDENT PORTAL MODULES
// ==========================================
import StudentDashboard from './components/Student/StudentDashboard/StudentDashboard';
import StudentAcademicHub from './components/Student/StudentAcademicHub/StudentAcademicHub';
import StudentCareerHub from './components/Student/StudentCareerHub/StudentCareerHub';
import StudentSupportHub from './components/Student/StudentSupportHub/StudentSupportHub';

// Standalone Student Components for Expanded Mode
import CourseVault from './components/Student/CourseVault/CourseVault';
import Attendance from './components/Student/Attendance/Attendance';
import Assignments from './components/Student/Assignments/Assignments';
import Timetable from './components/Student/Timetable/Timetable';
import Examinations from './components/Student/Examinations/Examinations';
import Mentorship from './components/Student/Mentorship/Mentorship';
import Internships from './components/Student/Internships/Internships';
import MootCourt from './components/Student/MootCourt/MootCourt';
import Fees from './components/Student/Fees/Fees';
import Leave from './components/Student/Leave/Leave';
import StudentApprovals from './components/Student/Approvals/StudentApprovals';
import Achievements from './components/Student/Achievements/Achievements';
import CVBuilder from './components/Student/CVBuilder/CVBuilder';


// ==========================================
// 4. FACULTY PORTAL MODULES
// ==========================================
import FacultyDashboard from './components/Faculty/FacultyDashboard/FacultyDashboard';
import ClassRoster from './components/Faculty/ClassRoster/ClassRoster';
import FacultyTimetable from './components/Faculty/FacultyTimetable/FacultyTimetable';
import FacultyCourses from './components/Faculty/FacultyCourses/FacultyCourses';
import MarksEntry from './components/Faculty/MarksEntry/MarksEntry';
import FacultyMentorship from './components/Faculty/FacultyMentorship/FacultyMentorship';
import FacultyClinicsHub from './components/Faculty/FacultyClinicsHub/FacultyClinicsHub';
import FacultyLeave from './components/Faculty/FacultyLeave/FacultyLeave';
import FacultyAttendance from './components/Faculty/FacultyAttendance/FacultyAttendance';

// ==========================================
// 5. ADMIN PORTAL MODULES
// ==========================================
import AdminDashboard from './components/Admin/AdminDashboard/AdminDashboard';
import UserManagement from './components/Admin/UserManagement/UserManagement';
import AdminTimetableBuilder from './components/Admin/AdminTimetableBuilder/AdminTimetableBuilder';
import AdminMentorship from './components/Admin/AdminMentorship/AdminMentorship';
import AdminApprovals from './components/Admin/AdminApprovals/AdminApprovals';
import AdminLeaveManagement from './components/Admin/LeaveManagement/AdminLeaveManagement';
import AdminExaminations from './components/Admin/Examinations/AdminExaminations';
import AdminNotices from './components/Admin/notices/AdminNotices';
import AdminFees from './components/Admin/AdminFees/AdminFees';
import AdminMootCourt from './components/Admin/AdminMootCourt/AdminMootCourt';
import AdminPlacements from './components/Admin/AdminPlacements/AdminPlacements';
import AdminLegalAid from './components/Admin/AdminLegalAid/AdminLegalAid';
import AdminAdmissions from './components/Admin/AdminAdmissions/AdminAdmissions';
import SQLStudio from './components/Admin/AdminDashboard/SQLStudio';
import AdminFacultyDirectory from './components/Admin/AdminFacultyDirectory/AdminFacultyDirectory';
import AdminHelpdesk from './components/Admin/AdminHelpdesk/AdminHelpdesk';
import AdminSiteEditor from './components/Admin/AdminSiteEditor/AdminSiteEditor';
import EventsBoard from './components/notices/EventsBoard';
import AdminOperationsHub from './components/Admin/AdminOperationsHub/AdminOperationsHub';
import AdminAcademicHub from './components/Admin/AdminAcademicHub/AdminAcademicHub';
import AdminClinicsHub from './components/Admin/AdminClinicsHub/AdminClinicsHub';
import AdminWebsiteHub from './components/Admin/AdminWebsiteHub/AdminWebsiteHub';
import SessionTimeoutGuard from './components/shared/SessionTimeoutGuard';
import { RoleActionButton } from './components/shared/LiveHeaderComponents';
import IntelligentBot from './components/shared/IntelligentBot';

export default function App() {
  const { userSession, isAppLoading, logout, notices, layoutPreference, navLayout } = useERP();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeRole = pathParts[0] || (userSession ? userSession.role : '');
  const activeTab = pathParts[1] || 'dashboard';

  const setActiveTab = (tab) => {
    if (userSession) {
      navigate(`/${userSession.role}/${tab}`);
    }
  };

  // --- DYNAMIC HEADER FORMATTER ---
  const getPageTitle = (tab) => {
    const titles = {
      dashboard: userSession?.role === 'admin' ? "Master Control" : userSession?.role === 'faculty' ? "Faculty Command Center" : "Student Dashboard",
      credentials: "HR, Profile & Settings",
      helpdesk: "Support Helpdesk",
      notices: userSession?.role === 'admin' ? "Broadcast Center" : "Digital Notice Board",

      attendance: "Attendance Tracker",
      coursevault: "Course Vault",
      timetable: userSession?.role === 'faculty' ? "My Teaching Schedule" : "Academic Schedule & Hub",
      materials: userSession?.role === 'faculty' ? "My Courses" : "Course Vault",
      assignments: userSession?.role === 'faculty' ? "Assignment Engine" : "Assignment Portal",
      examinations: "Examinations Hub",
      bidding: "Elective Bidding",
      internships: "Internships & Training",
      mootcourt: "Moot Court Society",
      achievements: "Achievements Hub",
      cvbuilder: "Career & CV Builder",
      fees: "Fee Management",
      leave: "Leave Applications",

      roster: "Class Roster & Attendance",
      marks: "Official Marks Ledger",
      materials: "Course Cloud Hub",
      mentorship: "Mentorship & Advising",
      approvals: "Student Approvals",
      facultyleave: "Time Off & Leaves",

      users: "Identity & Access Management",
      curriculum: "Master Timetable Builder",
      allocations: "Mentor Allocations",
      adminapprovals: "Central Approvals",
      adminexaminations: "Examinations Center",
      finance: "Finance Ledger",
      adminmootcourt: "Moot Court Society",
      placements: "Placements & Internships",
      legalaid: "Legal Aid Clinic",
      admincredentials: "Admin Identity & Security"
    };
    return titles[tab] || tab.replace('-', ' ');
  };

  const getThemeColors = () => {
    if (userSession?.role === 'admin') return { text: 'text-indigo-500', bg: 'bg-indigo-500', border: 'border-indigo-500' };
    if (userSession?.role === 'faculty') return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500' };
    return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500' };
  };
  const roleColors = getThemeColors();

  if (isAppLoading) {
    return (
      <div className="w-full h-screen bg-themeApp flex flex-col items-center justify-center selection:bg-themePanel">
        <div 
          style={{
            width: '64px', 
            height: '64px', 
            backgroundColor: '#262626', /* neutral-800 equivalent */
            WebkitMaskImage: `url(${pclLogo})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            marginBottom: '1.5rem'
          }} 
        />
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-circle-notch fa-spin text-xl text-neutral-500"></i>
          <h1 className="text-xl font-black tracking-widest text-themeText uppercase">Initializing ERP System...</h1>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const renderContent = () => {
    const role = userSession.role;

    // 🟢 STUDENT ROUTES
    if (role === 'student') {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard setActiveTab={setActiveTab} />;
        case 'notices': return <Notices />;
        // Compact Hubs
        case 'academic_center': return <StudentAcademicHub />;
        case 'career_center': return <StudentCareerHub />;
        case 'support_center': return <StudentSupportHub />;
        // Granular (Expanded Mode)
        case 'vault': return <CourseVault />;
        case 'attendance': return <Attendance />;
        case 'assignments': return <Assignments />;
        case 'timetable': return <Timetable />;
        case 'examinations': return <Examinations />;
        case 'mentorship': return <Mentorship />;
        case 'internships': return <Internships />;
        case 'mootcourt': return <MootCourt />;
        case 'fees': return <Fees />;
        case 'leave': return <Leave />;
        case 'approvals': return <StudentApprovals />;
        case 'helpdesk': return <Helpdesk />;
        case 'achievements': return <Achievements />;
        case 'cvbuilder': return <CVBuilder />;
        
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Student" />;
      }
    }

    // 🔵 FACULTY ROUTES
    if (role === 'faculty') {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard setActiveTab={setActiveTab} />;
        case 'notices': return <Notices />;
        case 'timetable': return <FacultyTimetable setActiveTab={setActiveTab} />;
        case 'attendance': return <FacultyAttendance />;
        case 'roster': return <ClassRoster />;
        case 'materials': return <FacultyCourses setActiveTab={setActiveTab} />;
        case 'mentorship': return <FacultyMentorship />;
        case 'clinics': return <FacultyClinicsHub />;
        case 'facultyleave': return <FacultyLeave />;
        case 'helpdesk': return <Helpdesk />;
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Faculty" />;
      }
    }

    // 🟣 ADMIN ROUTES
    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'operations': return <AdminOperationsHub />;
        case 'academic': return <AdminAcademicHub />;
        case 'clinics': return <AdminClinicsHub />;
        case 'website': return <AdminWebsiteHub />;
        case 'notices': return <AdminNotices />;
        case 'users': return <UserManagement />;
        case 'curriculum': return <AdminTimetableBuilder />;
        case 'allocations': return <AdminMentorship />;
        case 'adminapprovals': return <AdminApprovals />;
        case 'leavemanagement': return <AdminLeaveManagement />;
        case 'examinations': return <AdminExaminations />;
        case 'finance': return <AdminFees />;
        case 'mootcourt': return <AdminMootCourt />;
        case 'placements': return <AdminPlacements />;
        case 'legalaid': return <AdminLegalAid />;
        case 'adminadmissions': return <AdminAdmissions />;
        case 'sql': return <SQLStudio />;
        case 'faculty': return <AdminFacultyDirectory />;
        case 'helpdesk': return <AdminHelpdesk />;
        case 'siteeditor': return <AdminSiteEditor />;
        case 'events': return <EventsBoard />;
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Admin" />;
      }
    }

    return <ModuleUnderConstruction tabName={activeTab} role="Unknown" />;
  };

  // --- PROTECTED LAYOUT WRAPPER ---
  const renderLayout = (requiredRole) => {
    // 🛡️ STRICT ROLE-BASED GUARDING
    if (userSession.role !== requiredRole) {
      return <Navigate to={`/${userSession.role}/dashboard`} replace />;
    }

    return (
      <SessionTimeoutGuard>
        <DialogContainer />
        <div className={`flex ${navLayout === 'classic' ? 'flex-row' : 'flex-col'} h-screen w-full bg-themeApp text-themeText font-sans overflow-hidden selection:bg-themeAccent/20`}>
          
          {/* CLASSIC SIDEBAR RENDER (Desktop Only) */}
          {navLayout === 'classic' && (
            <>
              {userSession.role === 'student' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'faculty' && <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'admin' && <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
            </>
          )}

          {/* TOP NAV RENDER (Universal Desktop Layout) */}
          {navLayout === 'topnav' && (
            <TopNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
          )}

          {/* MOBILE NAV (Bottom Bar & Drawer Menu) - Always active on mobile */}
          <MobileNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-themeApp relative min-w-0">
              <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative z-10 scroll-smooth flex flex-col" id="jsm-main-scroll-container">
                {/* Spacer for TopNav if present */}
                {navLayout === 'topnav' && <div className="h-[72px] lg:h-[84px] shrink-0 w-full pointer-events-none transition-all duration-500"></div>}
                
                <header className={`mx-3 lg:mx-8 ${navLayout === 'topnav' ? 'mt-1 lg:mt-2' : 'mt-2 lg:mt-4'} mb-2 lg:mb-4 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-6 bg-themePanel/60 backdrop-blur-2xl border border-themeBorder shadow-lg rounded-2xl lg:rounded-3xl text-themeText sticky ${navLayout === 'topnav' ? 'top-[72px] lg:top-[80px]' : 'top-2 lg:top-4'} z-[90] min-w-0 gap-2 shrink-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:rounded-2xl lg:before:rounded-3xl before:pointer-events-none transition-all duration-500`}>
                  {/* Left: Branding & Page Title */}
                  <div className="flex items-center gap-3 lg:gap-4 shrink-0 min-w-0 relative z-10">
                  <div className="flex lg:hidden w-10 h-10 rounded-xl bg-themeElevated border border-white/10 items-center justify-center shadow-md shrink-0 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-themeAccent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div 
                          className={`w-4 h-4 bg-current ${roleColors.text} relative z-10`}
                          style={{
                              WebkitMaskImage: `url(${pclLogo})`,
                              WebkitMaskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center'
                          }}
                      />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-themeAccent shadow-[0_0_8px_currentColor] animate-pulse shrink-0"></div>
                        <h2 className={`${theme.text.heading} text-lg lg:text-2xl text-themeText capitalize tracking-tight leading-none truncate drop-shadow-sm`}>
                          {getPageTitle(activeTab)}
                        </h2>
                    </div>
                    <p className={`${theme.text.overline} ${theme.text.muted} mt-1 hidden sm:block truncate opacity-60 tracking-[0.2em]`}>
                      Prudentia College of Law • Workspace
                    </p>
                  </div>
                </div>

                {/* Center: Global Search */}
                <div className="hidden xl:flex flex-1 justify-center max-w-md mx-4 min-w-0 relative z-10">
                  <GlobalSearch />
                </div>

                {/* Right: Quick Actions, Notifications, Profile */}
                <div className="flex items-center gap-2 lg:gap-4 shrink-0 relative z-10">
                  <div className="hidden lg:block">
                    <RoleActionButton role={userSession.role} setActiveTab={setActiveTab} />
                  </div>

                  <button onClick={() => setActiveTab('notices')} className={`w-10 h-10 rounded-xl bg-themeElevated/50 hover:bg-themeElevated border border-white/5 hover:border-themeBorderStrong flex items-center justify-center text-themeTextSec hover:${roleColors.text} transition-all duration-300 relative group shadow-sm`}>
                    <i className={`fa-regular fa-bell text-lg group-hover:scale-110 transition-transform`}></i>
                    {notices?.length > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse border-2 border-themePanel"></span>
                    )}
                  </button>

                  <div className={`w-px h-6 bg-themeBorderStrong/50 mx-1 hidden ${navLayout === 'topnav' ? 'sm:hidden' : 'sm:block'}`}></div>

                  {/* Profile Avatar Button */}
                  <button 
                    onClick={() => setActiveTab('credentials')}
                    className={`flex items-center gap-3 hover:bg-themeElevated/80 p-1 lg:pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-themeBorderStrong group outline-none ${navLayout === 'topnav' ? 'lg:hidden' : ''}`}
                  >
                    <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-themeElevated border border-white/10 flex items-center justify-center font-black text-[10px] lg:text-xs text-themeText relative overflow-hidden group-hover:border-themeAccent group-hover:text-themeAccent transition-colors shadow-sm shrink-0`}>
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themeElevated z-10 shadow-sm"></div>
                      <div className="absolute inset-0 bg-themeAccent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <span className="relative z-10">
                      {(() => {
                        const name = userSession?.name || '';
                        const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
                        const parts = cleanName.split(/\s+/).filter(Boolean);
                        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                        return userSession?.role?.substring(0, 2).toUpperCase() || 'US';
                      })()}
                      </span>
                    </div>
                    <div className="hidden lg:flex flex-col items-start min-w-0">
                      <span className="text-xs font-bold text-themeText group-hover:text-themeAccent transition-colors leading-tight truncate max-w-[120px]">
                        {userSession?.name || (userSession?.role === 'admin' ? 'System Admin' : userSession?.role === 'faculty' ? 'Professor' : 'Student')}
                      </span>
                      <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5 opacity-80">
                        Settings
                      </span>
                    </div>
                  </button>
                </div>
              </header>

              <div className="flex-1 p-3 sm:p-8 pb-28 lg:pb-8 flex flex-col">
                {renderContent()}
              </div>

              {/* ERP Footer with Privacy & Terms */}
              <div className="w-full shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-themeBorder bg-themePanel/30 text-xs font-medium text-themeTextSec mt-auto z-10 relative">
                <div className="flex gap-4 mb-2 sm:mb-0">
                  <a href="/privacy" target="_blank" className="hover:text-themeText transition-colors">Privacy Policy</a>
                  <a href="/terms" target="_blank" className="hover:text-themeText transition-colors">Terms of Service</a>
                </div>
                <div>
                  &copy; {new Date().getFullYear()} JSM INNOVATIONS. Data Processor.
                </div>
              </div>
            </div>
          </main>
        </div>
      </SessionTimeoutGuard>
    );
  };

  const handleQuestionnaireComplete = (data) => {
    // Update local session so it dismisses
    const updatedSession = { ...userSession, questionnaire_completed: true };
    localStorage.setItem('jsmerp_master_session', JSON.stringify(updatedSession));
    // Force a reload to cleanly apply state
    window.location.reload();
  };

  return (
    <>
      <Routes>
        <Route path="/verify/:id" element={<CredentialVerification />} />
        <Route path="/student/*" element={renderLayout("student")} />
        <Route path="/faculty/*" element={renderLayout("faculty")} />
        <Route path="/admin/*" element={renderLayout("admin")} />
        <Route path="*" element={<Navigate to={`/${userSession?.role || 'student'}/dashboard`} replace />} />
      </Routes>

      {/* Mandatory Onboarding Lockout for Students */}
      {userSession?.role === 'student' && userSession.questionnaire_completed === false && (
        <QuestionnaireModal onComplete={handleQuestionnaireComplete} />
      )}
      
      {userSession && !isAppLoading && <IntelligentBot />}
    </>
  );
}

function ModuleUnderConstruction({ tabName, role }) {
  return (
    <div className={`${theme.layout.panel} rounded-themePanel p-8 animate-fade-in`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`${theme.ui.logoBox} text-rose-500 text-xl border-[#333333] bg-themePanel`}>
          <i className="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h3 className={`${theme.text.heading} text-xl text-themeText capitalize`}>
            {tabName.replace('-', ' ')} Module
          </h3>
          <p className={theme.text.secondary}>
            Workspace restricted to {role} accounts.
          </p>
        </div>
      </div>
      <div className={`p-6 border-theme border-dashed border-neutral-800 rounded-themePanel bg-themeApp flex flex-col items-center justify-center text-center py-24 `}>
        <i className={`fa-solid fa-code text-5xl ${theme.text.muted} mb-4`}></i>
        <h4 className={`${theme.text.heading} text-xl text-themeText mb-2`}>Module Under Construction</h4>
        <p className={`${theme.text.secondary} text-sm max-w-md leading-relaxed`}>
          The <span className="font-black text-themeText">{tabName}</span> component is currently being developed for the {role} portal. Please select another module from the sidebar.
        </p>
      </div>
    </div>
  );
}