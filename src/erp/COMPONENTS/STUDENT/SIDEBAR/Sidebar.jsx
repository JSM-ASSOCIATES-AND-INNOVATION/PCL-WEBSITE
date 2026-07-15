import React, { useState } from "react";

import { useERP } from "../../../CONTEXT/ErpContext";

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
            { id: "mootcourt", label: "Moot Court Society", icon: "fa-solid fa-scale-balanced" },
            { id: "internships", label: "Internships & NOC", icon: "fa-solid fa-briefcase" },
            { id: "achievements", label: "Achievements", icon: "fa-solid fa-trophy" },
            { id: "cvbuilder", label: "CV Builder", icon: "fa-solid fa-file-pdf" }
        ]
    },
    {
        category: "Support & Services",
        links: [
            { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
            { id: "approvals", label: "Approvals & Grievances", icon: "fa-solid fa-stamp" },
            { id: "fees", label: "Fee Ledger", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "coursevault", label: "Vault", icon: "fa-solid fa-book-open" },
    { id: "assignments", label: "Tasks", icon: "fa-solid fa-pen-" },
    { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
];

export default function Sidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { isSidebarCollapsed, toggleSidebar, notices } = useERP();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const [expandedGroups, setExpandedGroups] = useState(() => {
        let initialState = {};
        STUDENT_NAV_GROUPS.forEach((group, idx) => {
            const hasActive = group.links.some(link => link.id === activeTab);
            initialState[idx] = idx === 0 || hasActive;
        });
        return initialState;
    });

    const toggleGroup = (idx) => {
        setExpandedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const initials = userSession?.name ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "ST";
    const displayName = userSession?.name || "Student";
    const displayBatch = userSession?.academic_batch || "Law School Scholar";

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className={`hidden lg:flex bg-themeApp text-themeText flex-col shrink-0 h-screen selection:bg-themeElevated border-r-theme border-themeBorder relative overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-[90px]' : 'w-[300px]'}`}>

                <div className="h-28 flex items-center justify-between px-8 shrink-0 relative z-10 bg-themeApp">
                    <div className="flex items-center group cursor-pointer" onClick={() => handleTabSwitch('dashboard')}>
                        <div className="w-12 h-12 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0 shadow-themeElevated group-hover:scale-105 transition-transform">
                            <i className="fa-solid fa-landmark text-themeAccent text-xl"></i>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col ml-4 overflow-hidden">
                                <span className="text-2xl font-black tracking-tighter text-themeText leading-none">
                                    JSM<span className="text-themeAccent">ERP</span>
                                </span>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-[0.2em] mt-1 opacity-70">
                                    Associates
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 px-5 no-scrollbar relative z-10 flex flex-col gap-6">
                    {STUDENT_NAV_GROUPS.map((group, groupIndex) => {
                        const isExpanded = expandedGroups[groupIndex];
                        return (
                            <div key={groupIndex} className="flex flex-col gap-1.5">
                                {!isSidebarCollapsed ? (
                                    <button 
                                        onClick={() => toggleGroup(groupIndex)}
                                        className="flex items-center justify-between w-full px-2 mb-2 group outline-none"
                                    >
                                        <p className="text-[10px] font-black text-themeTextSec opacity-60 group-hover:opacity-100 uppercase tracking-widest transition-opacity">
                                            {group.category}
                                        </p>
                                        <i className={`fa-solid fa-chevron-down text-[8px] text-themeTextSec opacity-40 transition-transform duration-300 ${isExpanded ? 'rotate-180 opacity-80' : ''}`}></i>
                                    </button>
                                ) : (
                                    <div className="w-full border-b-theme border-themeBorder my-2"></div>
                                )}
                                
                                <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-500 origin-top ${isExpanded || isSidebarCollapsed ? 'max-h-[800px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>
                                    {group.links.map((link) => {
                                        const isActive = activeTab === link.id;
                                        return (
                                            <button
                                                key={link.id}
                                                onClick={() => handleTabSwitch(link.id)}
                                                title={isSidebarCollapsed ? link.label : ""}
                                                className={`relative w-full flex items-center justify-between py-3.5 rounded-themePanel text-[11px] uppercase tracking-[0.1em] font-black transition-all duration-300 group ${isActive
                                                    ? "text-themeText bg-themeElevated/50"
                                                    : "text-themeTextSec hover:text-themeText hover:bg-themeElevated/30"
                                                    } ${isSidebarCollapsed ? "justify-center px-0" : "px-4 hover:translate-x-1"}`}
                                            >
                                                {/* Floating Pill Indicator */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-themeAccent rounded-r-full shadow-[0_0_10px_var(--accent)]"></div>
                                                )}

                                                <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-4"}`}>
                                                    <div className={`w-6 flex justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                        <i className={`${link.icon} text-lg ${isActive ? "text-themeAccent" : "opacity-70 group-hover:opacity-100 group-hover:text-themeAccent"}`}></i>
                                                    </div>
                                                    {!isSidebarCollapsed && (
                                                        <span className="truncate">{link.label}</span>
                                                    )}
                                                </div>
                                                {!isSidebarCollapsed && ((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && (
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Minimalist Footer */}
                <div className={`p-4 bg-themeApp shrink-0 relative z-10 flex ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} items-center justify-between gap-2 mt-auto`}>
                    <button 
                        onClick={toggleSidebar}
                        className={`flex-1 w-full flex items-center justify-center gap-2 p-3 rounded-themeBtn text-themeTextSec hover:text-themeText hover:bg-themeElevated transition-all border-theme border-transparent hover:border-themeBorder`}
                        title="Toggle Sidebar"
                    >
                        <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm`}></i>
                    </button>
                    <button 
                        onClick={onLogout}
                        className={`flex-1 w-full flex items-center justify-center gap-2 p-3 rounded-themeBtn text-rose-500 hover:bg-rose-500/10 transition-all border-theme border-transparent hover:border-rose-500/20`}
                        title="Sign Out"
                    >
                        <i className="fa-solid fa-power-off text-sm"></i>
                    </button>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVIGATION (APK LAYOUT) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-themeApp border-t-theme border-themeBorder z-50 px-2 py-3 pb-safe flex items-center justify-between">
                {BOTTOM_NAV_LINKS.map(link => {
                    const isActive = activeTab === link.id && !mobileMenuOpen;
                    return (
                        <button 
                            key={link.id}
                            onClick={() => handleTabSwitch(link.id)}
                            className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${isActive ? 'text-themeAccent -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-themePanel ${isActive ? 'bg-themeElevated shadow-themeElevated border-theme border-themeBorderStrong' : 'bg-transparent'}`}>
                                <i className={`${link.icon} text-lg`}></i>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </button>
                    )
                })}
                
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${mobileMenuOpen ? 'text-themeAccent -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-themePanel ${mobileMenuOpen ? 'bg-themeElevated shadow-themeElevated border-theme border-themeBorderStrong' : 'bg-transparent'}`}>
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
                </button>
            </div>

            {/* FULL SCREEN MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-themeApp overflow-y-auto pb-24 animate-fade-in">
                    
                    <div className="p-6 pt-10 flex items-center gap-4 border-b-theme border-themeBorder bg-themePanel">
                        <div className="w-14 h-14 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center font-black text-xl text-themeText relative overflow-hidden shadow-themeElevated">
                            <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-themeApp"></div>
                            {initials}
                        </div>
                        <div>
                            <p className="text-xl font-black text-themeText">{displayName}</p>
                            <p className="text-[10px] font-black text-themeAccent uppercase tracking-widest mt-0.5">{displayBatch}</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-8">
                        {STUDENT_NAV_GROUPS.map((group, idx) => (
                            <div key={idx}>
                                <p className="text-[11px] font-black text-themeTextSec opacity-70 uppercase tracking-widest mb-4 pl-2">
                                    {group.category}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {group.links.map(link => {
                                        const isActive = activeTab === link.id;
                                        return (
                                            <button
                                                key={link.id}
                                                onClick={() => handleTabSwitch(link.id)}
                                                className={`flex flex-col items-start gap-3 p-4 rounded-themePanel border-theme transition-all duration-300 ${isActive 
                                                    ? 'bg-themeElevated border-themeBorderStrong text-themeAccent shadow-themeElevated' 
                                                    : 'bg-themePanel border-themeBorder text-themeText hover:border-themeBorderStrong'}`}
                                            >
                                                <i className={`${link.icon} text-2xl ${isActive ? '' : 'text-themeTextSec opacity-70'}`}></i>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-left leading-snug">{link.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={onLogout}
                            className="w-full mt-4 flex items-center justify-center gap-3 text-rose-500 bg-themePanel p-5 rounded-themePanel text-xs uppercase tracking-widest font-black border-theme border-rose-500/20 hover:border-rose-500 hover:bg-rose-950 transition-all shadow-themeElevated"
                        >
                            <i className="fa-solid fa-power-off text-lg"></i> Terminate Session
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}