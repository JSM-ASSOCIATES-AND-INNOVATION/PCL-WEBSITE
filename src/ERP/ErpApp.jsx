/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { theme } from './theme';
import { useERP } from './CONTEXT/ErpContext';

// ==========================================
// 1. AUTH & LAYOUT IMPORTS
// ==========================================
import Login from './COMPONENTS/LOGIN/Login';
import TopNav from './COMPONENTS/SHARED/TopNav';
import MobileNav from './COMPONENTS/SHARED/MobileNav';
import Sidebar from './COMPONENTS/STUDENT/SIDEBAR/Sidebar';
import FacultySidebar from './COMPONENTS/FACULTY/FACULTYSIDEBAR/FacultySidebar';
import AdminSidebar from './COMPONENTS/ADMIN/ADMINSIDEBAR/AdminSidebar';

// ==========================================
// 2. SHARED PORTAL MODULES
// ==========================================
import NoticeBoard from './COMPONENTS/NOTICES/NoticeBoard';
import Helpdesk from './COMPONENTS/STUDENT/HELPDESK/Helpdesk';
import Credentials from './COMPONENTS/STUDENT/CREDENTIALS/Credentials';
import QuestionnaireModal from './COMPONENTS/SHARED/QuestionnaireModal';
import DialogContainer from './COMPONENTS/SHARED/DialogContainer';
import CredentialVerification from './COMPONENTS/PUBLIC/CredentialVerification';

// ==========================================
// 3. STUDENT PORTAL MODULES
// ==========================================
import StudentDashboard from './COMPONENTS/STUDENT/STUDENTDASHBOARD/StudentDashboard';
import Attendance from './COMPONENTS/STUDENT/ATTENDANCE/Attendance';
import CourseVault from './COMPONENTS/STUDENT/COURSEVAULT/CourseVault';
import Timetable from './COMPONENTS/STUDENT/TIMETABLE/Timetable';
import Assignments from './COMPONENTS/STUDENT/ASSIGNMENTS/Assignments';
import Examinations from './COMPONENTS/STUDENT/EXAMINATIONS/Examinations';
import Internships from './COMPONENTS/STUDENT/INTERNSHIPS/Internships';
import MootCourt from './COMPONENTS/STUDENT/MOOTCOURT/MootCourt';
import Achievements from './COMPONENTS/STUDENT/ACHIEVEMENTS/Achievements';
import CVBuilder from './COMPONENTS/STUDENT/CVBUILDER/CVBuilder';
import Fees from './COMPONENTS/STUDENT/FEES/Fees';
import Leave from './COMPONENTS/STUDENT/LEAVE/Leave';
import Mentorship from './COMPONENTS/STUDENT/MENTORSHIP/Mentorship';
import ElectiveBidding from './COMPONENTS/STUDENT/ELECTIVEBIDDING/ElectiveBidding';
import StudentApprovals from './COMPONENTS/STUDENT/APPROVALS/StudentApprovals';


// ==========================================
// 4. FACULTY PORTAL MODULES
// ==========================================
import FacultyDashboard from './COMPONENTS/FACULTY/FACULTYDASHBOARD/FacultyDashboard';
import ClassRoster from './COMPONENTS/FACULTY/CLASSROSTER/ClassRoster';
import FacultyTimetable from './COMPONENTS/FACULTY/FACULTYTIMETABLE/FacultyTimetable';
import CourseMaterials from './COMPONENTS/FACULTY/COURSEMATERIALS/CourseMaterials';
import FacultyAssignments from './COMPONENTS/FACULTY/FACULTYASSIGNMENTS/FacultyAssignments';
import MarksEntry from './COMPONENTS/FACULTY/MARKSENTRY/MarksEntry';
import FacultyMentorship from './COMPONENTS/FACULTY/FACULTYMENTORSHIP/FacultyMentorship';
import Approvals from './COMPONENTS/FACULTY/APPROVALS/Approvals';
import FacultyLeave from './COMPONENTS/FACULTY/FACULTYLEAVE/FacultyLeave';

// ==========================================
// 5. ADMIN PORTAL MODULES
// ==========================================
import AdminDashboard from './COMPONENTS/ADMIN/ADMINDASHBOARD/AdminDashboard';
import UserManagement from './COMPONENTS/ADMIN/USERMANAGEMENT/UserManagement';
import AdminTimetableBuilder from './COMPONENTS/ADMIN/ADMINTIMETABLEBUILDER/AdminTimetableBuilder';
import AdminMentorship from './COMPONENTS/ADMIN/ADMINMENTORSHIP/AdminMentorship';
import AdminApprovals from './COMPONENTS/ADMIN/ADMINAPPROVALS/AdminApprovals';
import AdminExaminations from './COMPONENTS/ADMIN/EXAMINATIONS/AdminExaminations';
import AdminNotices from './COMPONENTS/ADMIN/NOTICES/AdminNotices';
import AdminFees from './COMPONENTS/ADMIN/ADMINFEES/AdminFees';
import AdminMootCourt from './COMPONENTS/ADMIN/ADMINMOOTCOURT/AdminMootCourt';
import AdminPlacements from './COMPONENTS/ADMIN/ADMINPLACEMENTS/AdminPlacements';
import AdminLegalAid from './COMPONENTS/ADMIN/ADMINLEGALAID/AdminLegalAid';
import SessionTimeoutGuard from './COMPONENTS/SHARED/SessionTimeoutGuard';
import { LiveClock, GlobalSearch, RoleActionButton } from './COMPONENTS/SHARED/LiveHeaderComponents';
import IntelligentBot from './COMPONENTS/SHARED/IntelligentBot';

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
      timetable: userSession?.role === 'faculty' ? "My Teaching Schedule" : "Schedule & Timetable",
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
        <i className="fa-solid fa-landmark text-5xl text-neutral-800 mb-6"></i>
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
        case 'notices': return <NoticeBoard />;
        case 'attendance': return <Attendance />;
        case 'coursevault': return <CourseVault />;
        case 'timetable': return <Timetable />;
        case 'assignments': return <Assignments />;
        case 'examinations': return <Examinations />;
        case 'internships': return <Internships />;
        case 'mootcourt': return <MootCourt />;
        case 'achievements': return <Achievements />;
        case 'cvbuilder': return <CVBuilder />;
        case 'fees': return <Fees />;
        case 'leave': return <StudentApprovals />;
        case 'approvals': return <StudentApprovals />;
        case 'mentorship': return <Mentorship />;
        case 'bidding': return <ElectiveBidding />;
        case 'helpdesk': return <Helpdesk />;
        case 'credentials': return <Credentials />;
        default: return <ModuleUnderConstruction tabName={activeTab} role="Student" />;
      }
    }

    // 🔵 FACULTY ROUTES
    if (role === 'faculty') {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard setActiveTab={setActiveTab} />;
        case 'notices': return <NoticeBoard />;
        case 'timetable': return <FacultyTimetable setActiveTab={setActiveTab} />;
        case 'roster': return <ClassRoster />;
        case 'materials': return <CourseMaterials />;
        case 'assignments': return <FacultyAssignments />;
        case 'marks': return <MarksEntry />;
        case 'mentorship': return <FacultyMentorship />;
        case 'approvals': return <Approvals />;
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
        case 'notices': return <AdminNotices />;
        case 'users': return <UserManagement />;
        case 'curriculum': return <AdminTimetableBuilder />;
        case 'allocations': return <AdminMentorship />;
        case 'adminapprovals': return <AdminApprovals />;
        case 'examinations': return <AdminExaminations />;
        case 'finance': return <AdminFees />;
        case 'mootcourt': return <AdminMootCourt />;
        case 'placements': return <AdminPlacements />;
        case 'legalaid': return <AdminLegalAid />;
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
            <div className="hidden lg:block h-screen shrink-0 border-r border-themeBorder bg-themePanel shadow-themeElevated z-30">
              {userSession.role === 'student' && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'faculty' && <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
              {userSession.role === 'admin' && <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} userSession={userSession} />}
            </div>
          )}

          {/* TOP NAV RENDER (Universal Desktop Layout) */}
          {navLayout === 'topnav' && (
            <TopNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
          )}

          {/* MOBILE NAV (Bottom Bar & Drawer Menu) - Always active on mobile */}
          <MobileNav userSession={userSession} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />

          <main className="flex-1 flex flex-col h-screen overflow-hidden bg-themeApp relative min-w-0">
            <header className={`flex h-20 lg:h-24 items-center justify-between px-4 lg:px-8 border-b border-themeBorder bg-themeApp shrink-0 relative z-20 min-w-0 gap-2`}>
              {/* Left: Branding & Page Title */}
              <div className="flex items-center gap-3 lg:gap-4 shrink-0 mr-2 lg:mr-4 min-w-0">
                <div className="flex lg:hidden w-8 h-8 rounded-themePanel bg-themeElevated border border-themeBorderStrong items-center justify-center shadow-themeElevated shrink-0">
                    <i className={`fa-solid ${userSession.role === 'admin' ? 'fa-fingerprint' : 'fa-landmark'} ${roleColors.text} text-xs`}></i>
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className={`${theme.text.heading} text-lg lg:text-2xl text-themeText capitalize tracking-tight leading-none lg:leading-tight truncate`}>
                    {getPageTitle(activeTab)}
                  </h2>
                  <p className={`${theme.text.overline} ${theme.text.muted} mt-0.5 lg:mt-1 hidden sm:block truncate`}>
                    JSM Associates & Innovations • Academic ERP
                  </p>
                </div>
              </div>

              {/* Center: Global Search */}
              <div className="hidden xl:flex flex-1 justify-center max-w-md mx-2 min-w-0">
                <GlobalSearch />
              </div>

              {/* Right: Quick Actions, Clock, Notifications, Profile */}
              <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                <div className="hidden lg:block">
                  <RoleActionButton role={userSession.role} setActiveTab={setActiveTab} />
                </div>
                
                <div className="hidden lg:block">
                    <LiveClock />
                </div>

                <button onClick={() => setActiveTab('notices')} className={`${theme.action.iconBtn} relative group bg-themePanel shadow-sm scale-90 lg:scale-100`}>
                  <i className={`fa-regular fa-bell group-hover:${roleColors.text} transition-colors text-lg`}></i>
                  {notices?.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
                  )}
                </button>

                <div className={`w-px h-6 bg-themeBorder hidden ${navLayout === 'topnav' ? 'sm:hidden' : 'sm:block'}`}></div>

                {/* Profile Avatar Button */}
                <button 
                  onClick={() => setActiveTab('credentials')}
                  className={`flex items-center gap-2.5 hover:bg-themeElevated p-1.5 lg:pr-4 rounded-full transition-all border border-transparent hover:border-themeBorder group ${navLayout === 'topnav' ? 'lg:hidden' : ''}`}
                >
                  <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-themePanel border border-themeBorderStrong flex items-center justify-center font-black text-[10px] lg:text-xs text-themeText relative overflow-hidden group-hover:border-themeAccent transition-colors`}>
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themePanel"></div>
                    {(() => {
                      const name = userSession?.name || '';
                      const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
                      const parts = cleanName.split(/\s+/).filter(Boolean);
                      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                      return userSession?.role?.substring(0, 2).toUpperCase() || 'US';
                    })()}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-bold text-themeText group-hover:text-themeAccent transition-colors leading-tight truncate max-w-[120px]">
                      {userSession?.name || (userSession?.role === 'admin' ? 'System Admin' : userSession?.role === 'faculty' ? 'Professor' : 'Student')}
                    </span>
                    <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">
                      Profile & Settings
                    </span>
                  </div>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-28 lg:pb-8 no-scrollbar relative z-10 scroll-smooth" id="jsm-main-scroll-container">     {renderContent()}
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