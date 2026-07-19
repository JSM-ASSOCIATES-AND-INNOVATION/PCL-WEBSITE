/* eslint-disable */
import React, { useState } from "react";
import { theme } from "../../theme";
import { useERP } from "../../context/ErpContext";

const STUDENT_NAV_GROUPS = [
    {
        category: "Main",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
            { id: "timetable", label: "My Timetable", icon: "fa-solid fa-calendar-days" }
        ]
    },
    {
        category: "Academics",
        links: [
            { id: "attendance", label: "Attendance", icon: "fa-solid fa-user-check" },
            { id: "coursevault", label: "Course Vault", icon: "fa-solid fa-book-open" },
            { id: "assignments", label: "Assignments", icon: "fa-solid fa-pen-nib" },
            { id: "examinations", label: "Examinations", icon: "fa-solid fa-file-contract" }
        ]
    },
    {
        category: "Beyond Academics",
        links: [
            { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-scale-balanced" },
            { id: "internships", label: "Internships & NOC", icon: "fa-solid fa-briefcase" },
            { id: "achievements", label: "Achievements", icon: "fa-solid fa-trophy" },
            { id: "cvbuilder", label: "CV Builder", icon: "fa-solid fa-file-pdf" }
        ]
    },
    {
        category: "Support & Services",
        links: [
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "leave", label: "Leave Requests", icon: "fa-solid fa-plane-departure" },
            { id: "fees", label: "Fee Ledger", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

const FACULTY_NAV_GROUPS = [
    {
        category: "Overview",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
        ]
    },
    {
        category: "Teaching & Grading",
        links: [
            { id: "timetable", label: "My Schedule", icon: "fa-solid fa-calendar-days" },
            { id: "roster", label: "Class Roster", icon: "fa-solid fa-users" },
            { id: "materials", label: "Course Cloud", icon: "fa-brands fa-google-drive" },
            { id: "assignments", label: "Assignment Engine", icon: "fa-solid fa-file-signature" },
            { id: "marks", label: "Marks Ledger", icon: "fa-solid fa-lock" },
        ]
    },
    {
        category: "Advising & Approvals",
        links: [
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "approvals", label: "Student Approvals", icon: "fa-solid fa-clipboard-check" },
        ]
    },
    {
        category: "Administration",
        links: [
            { id: "facultyleave", label: "Time Off", icon: "fa-solid fa-mug-hot" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

const ADMIN_NAV_GROUPS = [
    {
        category: "Command Center",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
            { id: "users", label: "Users", icon: "fa-solid fa-users-gear" },
            { id: "notices", label: "Notices", icon: "fa-solid fa-satellite-dish" },
        ]
    },
    {
        category: "Academics",
        links: [
            { id: "classes", label: "Classes", icon: "fa-solid fa-chalkboard-user" },
            { id: "schedule", label: "Schedule", icon: "fa-solid fa-calendar-days" },
            { id: "assignments", label: "Assignments", icon: "fa-solid fa-file-signature" },
        ]
    },
    {
        category: "Programs",
        links: [
            { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-scale-balanced" },
            { id: "placements", label: "Placements", icon: "fa-solid fa-briefcase" },
            { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-hand-holding-hand" }
        ]
    },
    {
        category: "Administration",
        links: [
            { id: "fees", label: "Fees", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "leaves", label: "Leaves", icon: "fa-solid fa-mug-hot" },
            { id: "settings", label: "Settings", icon: "fa-solid fa-gear" },
        ]
    }
];

export default function MobileNav({ userSession, activeTab, setActiveTab, onLogout }) {
    const { notices } = useERP();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const role = userSession?.role || 'student';
    let navGroups = STUDENT_NAV_GROUPS;
    let bottomNavLinks = [];
    let accentColor = "text-themeAccent";
    
    if (role === 'admin') {
        navGroups = ADMIN_NAV_GROUPS.map(group => ({
            ...group,
            links: group.links.filter(l => !['dashboard', 'users', 'notices'].includes(l.id))
        })).filter(g => g.links.length > 0);

        bottomNavLinks = [
            { id: "dashboard", icon: "fa-solid fa-server", label: "Home" },
            { id: "users", icon: "fa-solid fa-users-gear", label: "Users" },
            { id: "notices", icon: "fa-solid fa-satellite-dish", label: "Notices" },
        ];
    } else if (role === 'faculty') {
        navGroups = FACULTY_NAV_GROUPS;
        accentColor = "text-blue-500";
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
            { id: "roster", label: "Roster", icon: "fa-solid fa-users" },
            { id: "assignments", label: "Tasks", icon: "fa-solid fa-file-signature" },
            { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
        ];
    } else {
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
            { id: "coursevault", label: "Vault", icon: "fa-solid fa-book-open" },
            { id: "assignments", label: "Tasks", icon: "fa-solid fa-clipboard-list" },
            { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
        ];
    }

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* BOTTOM NAVIGATION BAR - Standard Full Width Glass Dock */}
            <nav className="flex lg:hidden fixed bottom-0 left-0 w-full bg-themeElevated/90 backdrop-blur-2xl border-t border-themeBorderStrong z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <div className="flex w-full justify-around items-center h-[72px] px-2">
                    {bottomNavLinks.map(link => {
                        const isActive = activeTab === link.id && !mobileMenuOpen;
                        return (
                            <button 
                                key={link.id}
                                onClick={() => handleTabSwitch(link.id)}
                                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center rounded-xl mb-0.5 transition-all duration-300 ${isActive ? `${role === 'admin' ? 'text-indigo-500 bg-indigo-500/10' : (role === 'faculty' ? 'text-blue-500 bg-blue-500/10' : 'text-amber-500 bg-amber-500/10')}` : 'text-themeTextSec opacity-70 hover:opacity-100 hover:bg-themePanel'}`}>
                                    <i className={`${link.icon} text-lg`}></i>
                                </div>
                                <span className={`text-[9px] font-bold tracking-tight transition-colors ${isActive ? (role === 'admin' ? 'text-indigo-500' : (role === 'faculty' ? 'text-blue-500' : 'text-amber-500')) : 'text-themeTextSec opacity-70'}`}>
                                    {link.label}
                                </span>
                            </button>
                        )
                    })}
                    
                    {/* Mobile Menu Toggle Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300`}
                    >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-xl mb-0.5 transition-all duration-300 ${mobileMenuOpen ? `${role === 'admin' ? 'text-indigo-500 bg-indigo-500/10' : (role === 'faculty' ? 'text-blue-500 bg-blue-500/10' : 'text-amber-500 bg-amber-500/10')}` : 'text-themeTextSec opacity-70 hover:opacity-100 hover:bg-themePanel'}`}>
                            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                        </div>
                        <span className={`text-[9px] font-bold tracking-tight transition-colors ${mobileMenuOpen ? (role === 'admin' ? 'text-indigo-500' : (role === 'faculty' ? 'text-blue-500' : 'text-amber-500')) : 'text-themeTextSec opacity-70'}`}>
                            Menu
                        </span>
                    </button>
                </div>
            </nav>

            {/* BOTTOM SHEET DRAWER MENU */}
            <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
                
                {/* Sheet */}
                <div className={`relative bg-themeApp w-full rounded-t-[2.5rem] border-t border-x border-themeBorderStrong shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out flex flex-col max-h-[85vh] ${mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="w-full flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-themeBorderStrong rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 pb-24 pt-2 no-scrollbar">
                        <div className="flex flex-col gap-6">
                            {navGroups.map((group, idx) => (
                                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 40}ms` }}>
                                    <p className="text-[10px] font-black text-themeTextSec opacity-70 uppercase tracking-widest mb-3 pl-1">
                                        {group.category}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {group.links.map(link => {
                                            const isActive = activeTab === link.id;
                                            const hasNotice = link.id === 'notices' && notices?.length > 0;
                                            return (
                                                <button
                                                    key={link.id}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    className={`relative flex flex-col items-start gap-3 p-4 rounded-themePanel border transition-all duration-300 ${isActive 
                                                        ? `bg-themeElevated border-themeBorderStrong ${accentColor} shadow-themeElevated` 
                                                        : 'bg-themePanel border-themeBorder text-themeText hover:border-themeBorderStrong hover:bg-themeElevated/50'}`}
                                                >
                                                    <div className="flex justify-between w-full">
                                                        <i className={`${link.icon} text-xl ${isActive ? '' : 'text-themeTextSec opacity-80'}`}></i>
                                                        {hasNotice && !isActive && (
                                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-left leading-snug">{link.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Logout Button in Drawer */}
                        <div className="mt-8 mb-4 animate-slide-up" style={{ animationDelay: `${navGroups.length * 40}ms` }}>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-3 text-rose-500 bg-themePanel p-4 rounded-themePanel text-xs uppercase tracking-widest font-black border border-rose-500/20 hover:border-rose-500 active:bg-rose-950 transition-all shadow-themeElevated"
                            >
                                <i className="fa-solid fa-power-off text-lg"></i> Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
