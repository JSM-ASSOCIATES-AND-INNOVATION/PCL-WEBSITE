import React, { useState } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import pclLogo from "../../../../assets/LOGOS/pcl_logo.svg";

const STUDENT_NAV_GROUPS = [
    {
        category: "Main",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
            { id: "events", label: "College Events", icon: "fa-solid fa-calendar-star" },
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
            <aside className={`hidden lg:flex bg-themeApp text-themeText flex-col shrink-0 h-screen selection:bg-themeElevated border-r border-themeBorder relative overflow-hidden transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.3)] ${isSidebarCollapsed ? 'w-[90px]' : 'w-[300px]'}`}>

                <div className="h-28 flex items-center justify-between px-8 shrink-0 relative z-10 backdrop-blur-md bg-themeApp/80">
                    <div className="flex items-center group cursor-pointer" onClick={() => handleTabSwitch('dashboard')}>
                        <img src={pclLogo} alt="PCL Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col ml-4 overflow-hidden">
                                <span className="text-2xl font-black tracking-tighter text-themeText leading-none">
                                    PCL<span className="text-themeAccent drop-shadow-[0_0_8px_var(--theme-accent)]">ERP</span>
                                </span>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-[0.2em] mt-1 opacity-70">
                                    Prudentia
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
                                        <p className="text-[10px] font-black text-themeTextSec opacity-60 group-hover:opacity-100 group-hover:text-themeAccent uppercase tracking-widest transition-all drop-shadow-sm">
                                            {group.category}
                                        </p>
                                        <i className={`fa-solid fa-chevron-down text-[8px] text-themeTextSec opacity-40 transition-transform duration-300 ${isExpanded ? 'rotate-180 opacity-80 text-themeAccent drop-shadow-[0_0_5px_var(--theme-accent)]' : ''}`}></i>
                                    </button>
                                ) : (
                                    <div className="w-full border-b border-themeBorder my-2 opacity-50"></div>
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
                                                    ? "text-themeAccent bg-themeElevated/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_15px_rgba(var(--theme-accent),0.15)] backdrop-blur-sm"
                                                    : "text-themeTextSec hover:text-themeText hover:bg-themeElevated/30"
                                                    } ${isSidebarCollapsed ? "justify-center px-0" : "px-4"}`}
                                            >
                                                {/* Floating Pill Indicator */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-themeAccent rounded-r-full shadow-[0_0_10px_var(--theme-accent)]"></div>
                                                )}

                                                <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-4"}`}>
                                                    <div className={`w-6 flex justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                        <i className={`${link.icon} text-lg ${isActive ? "text-themeAccent drop-shadow-[0_0_8px_var(--theme-accent)]" : "opacity-70 group-hover:opacity-100 group-hover:text-themeAccent"}`}></i>
                                                    </div>
                                                    {!isSidebarCollapsed && (
                                                        <span className="truncate group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
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

                <div className={`p-4 bg-themeApp/30 backdrop-blur-md shrink-0 relative z-10 flex ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} items-center justify-between gap-2 mt-auto border-t border-themeBorder/50 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]`}>
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


        </>
    );
}