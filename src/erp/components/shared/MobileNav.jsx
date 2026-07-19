/* eslint-disable */
import React, { useState } from "react";
import { theme } from "../../theme";
import { useERP } from "../../context/ErpContext";

const STUDENT_NAV_GROUPS = [
    {
        category: "Central Hubs",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "academic_center", label: "Academic Center", icon: "fa-solid fa-graduation-cap" },
            { id: "career_center", label: "Career Center", icon: "fa-solid fa-briefcase" },
            { id: "support_center", label: "Support Center", icon: "fa-solid fa-headset" }
        ]
    }
];

const FACULTY_NAV_GROUPS = [
    {
        category: "Core Hub",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "materials", label: "My Courses", icon: "fa-brands fa-google-drive" },
            { id: "timetable", label: "My Schedule", icon: "fa-solid fa-calendar-days" },
            { id: "attendance", label: "Attendance Tracker", icon: "fa-solid fa-clipboard-user" },
            { id: "roster", label: "Class Roster", icon: "fa-solid fa-users-viewfinder" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
        ]
    },
    {
        category: "Advising & Discipline",
        links: [
            { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
            { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-gavel" }
        ]
    },
    {
        category: "Administration",
        links: [
            { id: "facultyleave", label: "Time Off & Leaves", icon: "fa-solid fa-mug-hot" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

const ADMIN_NAV_GROUPS = [
    {
        category: "Master Control",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
            { id: "operations", label: "Operations HQ", icon: "fa-solid fa-gears" },
            { id: "academic", label: "Academic Hub", icon: "fa-solid fa-graduation-cap" },
            { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-scale-balanced" },
            { id: "website", label: "Website Hub", icon: "fa-solid fa-globe" }
        ]
    },
    {
        category: "Core Integrations",
        links: [
            { id: "finance", label: "Finance Ledger", icon: "fa-solid fa-indian-rupee-sign" }
        ]
    },
    {
        category: "System",
        links: [
            { id: "sql", label: "SQL Studio", icon: "fa-solid fa-database" },
            { id: "credentials", label: "Security", icon: "fa-solid fa-fingerprint" }
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
        navGroups = ADMIN_NAV_GROUPS;
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
            { id: "operations", label: "Operations", icon: "fa-solid fa-gears" },
            { id: "academic", label: "Academic", icon: "fa-solid fa-graduation-cap" },
            { id: "website", label: "Website", icon: "fa-solid fa-globe" },
        ];
    } else if (role === 'faculty') {
        navGroups = FACULTY_NAV_GROUPS;
        accentColor = "text-blue-500";
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
            { id: "materials", label: "Courses", icon: "fa-brands fa-google-drive" },
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
        ];
    } else {
        bottomNavLinks = [
            { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
            { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
            { id: "career_center", label: "Career", icon: "fa-solid fa-briefcase" },
            { id: "support_center", label: "Support", icon: "fa-solid fa-headset" },
        ];
    }

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* BOTTOM NAVIGATION BAR */}
            <nav className="flex lg:hidden fixed bottom-0 left-0 w-full bg-themeApp/95 backdrop-blur-md border-t border-themeBorder z-40 px-2 py-2 pb-safe items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
                {bottomNavLinks.map(link => {
                    const isActive = activeTab === link.id && !mobileMenuOpen;
                    return (
                        <button 
                            key={link.id}
                            onClick={() => handleTabSwitch(link.id)}
                            className={`flex flex-col items-center justify-center w-16 h-14 relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                        >
                            <div className={`w-9 h-9 flex items-center justify-center rounded-themePanel mb-1 transition-all duration-300 ${isActive ? `bg-themeElevated ${accentColor} border border-themeBorderStrong shadow-themeElevated` : 'text-themeTextSec opacity-70'}`}>
                                <i className={`${link.icon} text-lg`}></i>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? accentColor : 'text-themeTextSec opacity-70'}`}>
                                {link.label}
                            </span>
                            {isActive && (
                                <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${role === 'faculty' ? 'bg-blue-500' : 'bg-themeAccent'}`}></div>
                            )}
                        </button>
                    )
                })}
                
                {/* Mobile Menu Toggle Button */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center w-16 h-14 relative transition-all duration-300 ${mobileMenuOpen ? '-translate-y-1' : ''}`}
                >
                    <div className={`w-9 h-9 flex items-center justify-center rounded-themePanel mb-1 transition-all duration-300 ${mobileMenuOpen ? `bg-themeElevated ${accentColor} border border-themeBorderStrong shadow-themeElevated` : 'text-themeTextSec opacity-70'}`}>
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${mobileMenuOpen ? accentColor : 'text-themeTextSec opacity-70'}`}>
                        Menu
                    </span>
                    {mobileMenuOpen && (
                        <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${role === 'faculty' ? 'bg-blue-500' : 'bg-themeAccent'}`}></div>
                    )}
                </button>
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
