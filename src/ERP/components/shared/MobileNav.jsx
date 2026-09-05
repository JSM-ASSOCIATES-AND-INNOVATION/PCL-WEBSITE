/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { theme } from "../../theme";
import { useERP } from "../../context/ErpContext";

const STUDENT_NAV_GROUPS = [
    {
        category: "Central Hubs",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "academic_center", label: "Academic Center", icon: "fa-solid fa-graduation-cap" },
            { id: "career_center", label: "Career Center", icon: "fa-solid fa-briefcase" },
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "support_center", label: "Support Center", icon: "fa-solid fa-headset" },
            { id: "fees", label: "Fee Management", icon: "fa-solid fa-indian-rupee-sign" }
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

    

    // Smart Nav Hiding Logic
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const navRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: -100, width: 56 });

    // Find index for the active item
    const getActiveIndex = () => {
        if (mobileMenuOpen) return bottomNavLinks.length; // The last button is Menu
        const idx = bottomNavLinks.findIndex(l => l.id === activeTab);
        return idx === -1 ? 0 : idx;
    };

    const activeIndex = getActiveIndex();

    useEffect(() => {
        const updateIndicator = () => {
            if (!navRef.current) return;
            // Get all navigation buttons
            const buttons = Array.from(navRef.current.querySelectorAll('.nav-btn'));
            const activeBtn = buttons[activeIndex];
            if (activeBtn) {
                setIndicatorStyle({
                    left: activeBtn.offsetLeft + (activeBtn.offsetWidth - 56) / 2, // center a 56px indicator inside whatever width the button has
                    width: 56
                });
            }
        };
        // Small delay to ensure DOM has painted layout
        setTimeout(updateIndicator, 50);
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeIndex, bottomNavLinks.length, isVisible]);


    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Allow rubber-banding without hiding at the top
            if (currentScrollY < 50) {
                setIsVisible(true);
                setLastScrollY(currentScrollY);
                return;
            }

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                if (!mobileMenuOpen) setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, mobileMenuOpen]);

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* BOTTOM NAVIGATION BAR */}
            <div className={`flex lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] h-[78px] bg-themePanel border border-black/10 dark:border-black/5 dark:border-white/10 rounded-[24px] shadow-[0_18px_40px_rgba(0,0,0,0.28)] z-40 px-2 flex justify-around items-center transition-all duration-500 ease-out ${isVisible || mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-[150%] opacity-0"}`} ref={navRef}>
                
                {/* The Sliding Indicator */}
                <div 
                    className="absolute bottom-[11px] h-[56px] rounded-[18px] transition-all duration-[0.45s] z-10"
                    style={{
                        left: `${indicatorStyle.left}px`,
                        width: `${indicatorStyle.width}px`,
                        background: role === 'faculty' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 191, 0, 0.15)', // Light accent background
                    }}
                ></div>

                {bottomNavLinks.map((link, idx) => {
                    const isActive = activeTab === link.id && !mobileMenuOpen;
                    return (
                        <button 
                            key={link.id}
                            onClick={() => handleTabSwitch(link.id)}
                            className={`nav-btn ${isActive ? 'active-nav-btn' : ''} flex flex-col items-center justify-center w-[56px] h-[56px] rounded-[18px] relative z-20 transition-all duration-[0.45s] ease-out border-none bg-transparent cursor-pointer ${isActive ? 'text-themeAccent -translate-y-2 scale-110' : 'text-themeTextSec'}`}
                        >
                            <i className={`${link.icon} text-2xl transition-colors ${isActive ? (role === 'faculty' ? 'text-blue-500' : 'text-themeAccent') : 'opacity-70'}`}></i>
                            {/* We can hide the text, or keep it very tiny. The provided design has no text, just icons. Let's keep it clean! */}
                        </button>
                    )
                })}
                
                {/* Mobile Menu Toggle Button */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`nav-btn ${mobileMenuOpen ? 'active-nav-btn' : ''} flex flex-col items-center justify-center w-[56px] h-[56px] rounded-[18px] relative z-20 transition-all duration-[0.45s] ease-out border-none bg-transparent cursor-pointer ${mobileMenuOpen ? 'text-themeAccent -translate-y-2 scale-110' : 'text-themeTextSec'}`}
                >
                    <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-2xl transition-colors ${mobileMenuOpen ? (role === 'faculty' ? 'text-blue-500' : 'text-themeAccent') : 'opacity-70'}`}></i>
                </button>
            </div>

            {/* BOTTOM SHEET DRAWER MENU */}

            {/* BOTTOM SHEET DRAWER MENU */}
            <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
                
                {/* Sheet */}
                <div className={`relative bg-themeApp w-full rounded-t-[2.5rem] border-t border-x border-black/10 dark:border-black/5 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out flex flex-col max-h-[85vh] ${mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
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
                                                        ? `bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border-black/10 dark:border-black/5 dark:border-white/10 ${accentColor} shadow-premiumElevated` 
                                                        : 'bg-themePanel/85 backdrop-blur-2xl shadow-premium border-black/5 dark:border-white/5 text-themeText hover:border-black/10 dark:border-black/5 dark:border-white/10 hover:bg-themeElevated/50'}`}
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

                        
                        {/* Profile/Settings Button in Drawer */}
                        <div className="mt-8 animate-slide-up" style={{ animationDelay: `${navGroups.length * 40}ms` }}>
                            <button
                                onClick={() => handleTabSwitch('credentials')}
                                className="w-full flex items-center justify-center gap-3 text-themeText bg-themePanel/85 backdrop-blur-2xl shadow-premium p-4 rounded-themePanel text-xs uppercase tracking-widest font-black border border-black/10 dark:border-black/5 dark:border-white/10 hover:border-themeAccent active:bg-themeElevated transition-all shadow-premiumElevated mb-4"
                            >
                                <i className="fa-solid fa-user-gear text-lg"></i> Settings & Credentials
                            </button>
                        </div>

                        {/* Logout Button in Drawer */}
                        <div className="mt-8 mb-4 animate-slide-up" style={{ animationDelay: `${navGroups.length * 40}ms` }}>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center justify-center gap-3 text-rose-500 bg-themePanel/85 backdrop-blur-2xl shadow-premium p-4 rounded-themePanel text-xs uppercase tracking-widest font-black border border-rose-500/20 hover:border-rose-500 active:bg-rose-950 transition-all shadow-premiumElevated"
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
