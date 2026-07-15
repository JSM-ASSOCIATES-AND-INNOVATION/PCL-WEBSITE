import React, { useState } from "react";

import { useERP } from "../../../context/ErpContext";

// ==========================================
// 1. STRICTLY MATCHED ROUTES (DO NOT CHANGE IDs)
// ==========================================
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
            { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
            { id: "approvals", label: "Approvals & Disciplinary", icon: "fa-solid fa-scale-balanced" },
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

// Quick Access for Bottom Nav on Mobile
const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "roster", label: "Roster", icon: "fa-solid fa-users" },
    { id: "assignments", label: "Tasks", icon: "fa-solid fa-file-signature" },
    { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
];

export default function FacultySidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { isSidebarCollapsed, toggleSidebar, notices } = useERP();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Default all groups to expanded
    const [expandedGroups, setExpandedGroups] = useState(
        FACULTY_NAV_GROUPS.reduce((acc, group, idx) => {
            acc[idx] = true;
            return acc;
        }, {})
    );

    const toggleGroup = (idx) => {
        setExpandedGroups(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const initials = userSession?.name
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : "FC";

    const displayName = userSession?.name || "Professor";

    const handleTabSwitch = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false); // Close menu if open on mobile
    };

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className={`hidden lg:flex bg-themeApp text-themeText flex-col shrink-0 h-screen selection:bg-themeElevated border-r-theme border-themeBorder relative overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>

                <div className="h-24 flex items-center justify-between px-6 border-b-theme border-themeBorder shrink-0 relative z-10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-landmark text-blue-500 text-base"></i>
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="text-2xl font-black tracking-tight text-themeText ml-3">
                                JSM<span className="text-blue-500">ERP</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 no-scrollbar relative z-10">
                    <nav className="flex flex-col gap-6">
                        {FACULTY_NAV_GROUPS.map((group, groupIndex) => {
                            const isExpanded = expandedGroups[groupIndex];
                            return (
                                <div key={groupIndex} className="flex flex-col gap-1.5">
                                    {!isSidebarCollapsed ? (
                                        <button 
                                            onClick={() => toggleGroup(groupIndex)}
                                            className="flex items-center justify-between w-full px-3 mb-1 group outline-none"
                                        >
                                            <p className="text-[10px] font-black text-themeTextSec opacity-70 group-hover:text-blue-500 uppercase tracking-widest transition-colors">
                                                {group.category}
                                            </p>
                                            <i className={`fa-solid fa-chevron-down text-[8px] text-neutral-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`}></i>
                                        </button>
                                    ) : (
                                        <div className="w-full border-b-theme border-themeBorder my-2"></div>
                                    )}
                                    
                                    <div className={`flex flex-col gap-1.5 overflow-hidden transition-all duration-500 origin-top ${isExpanded || isSidebarCollapsed ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>
                                        {group.links.map((link) => {
                                            const isActive = activeTab === link.id;
                                            return (
                                                <button
                                                    key={link.id}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    title={isSidebarCollapsed ? link.label : ""}
                                                    className={`w-full flex items-center justify-between p-3 rounded-themePanel text-[11px] uppercase tracking-widest font-black transition-all duration-300 group ${isActive
                                                        ? "bg-themeElevated text-blue-400 border-theme border-themeBorderStrong"
                                                        : "text-themeTextSec hover:text-themeText hover:bg-themeElevated border-theme border-transparent"
                                                        } ${isSidebarCollapsed ? "justify-center" : "px-4"}`}
                                                >
                                                    <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-4"}`}>
                                                        <div className={`w-6 flex justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                            <i className={`${link.icon} text-lg ${isActive ? "text-blue-500" : "opacity-70 group-hover:opacity-100 group-hover:text-blue-400"}`}></i>
                                                        </div>
                                                        {!isSidebarCollapsed && (
                                                            <span className="truncate group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                                        )}
                                                    </div>
                                                    {!isSidebarCollapsed && ((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Minimalist Footer */}
                <div className={`p-4 bg-themeApp shrink-0 relative z-10 flex ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} items-center justify-between gap-2 mt-auto border-t-theme border-themeBorder`}>
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
                            className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-500 -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-themePanel ${isActive ? 'bg-themeElevated  border-theme border-themeBorderStrong' : 'bg-transparent'}`}>
                                <i className={`${link.icon} text-lg`}></i>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </button>
                    )
                })}
                
                {/* Mobile Menu Toggle Button */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${mobileMenuOpen ? 'text-themeAccent -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-themePanel ${mobileMenuOpen ? 'bg-themeElevated  border-theme border-themeBorderStrong' : 'bg-transparent'}`}>
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
                </button>
            </div>

            {/* FULL SCREEN MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-[#050505] overflow-y-auto pb-24 animate-fade-in">
                    
                    <div className="p-6 pt-10 flex items-center gap-4 border-b-theme border-themeBorder">
                        <div className="w-14 h-14 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center font-black text-xl text-themeText relative overflow-hidden">
                            <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121212]"></div>
                            {initials}
                        </div>
                        <div>
                            <p className="text-xl font-black text-themeText">{displayName}</p>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-0.5">Faculty Privileges</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-8">
                        {FACULTY_NAV_GROUPS.map((group, idx) => (
                            <div key={idx}>
                                <p className="text-[11px] font-black text-neutral-600 uppercase tracking-widest mb-4 pl-2">
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
                                                    ? 'bg-themeElevated border-themeBorderStrong text-blue-400 ' 
                                                    : 'bg-themePanel border-themeBorder text-themeText hover:border-neutral-600'}`}
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
                            className="w-full mt-4 flex items-center justify-center gap-3 text-rose-500 bg-themeElevated p-5 rounded-themePanel text-xs uppercase tracking-widest font-black border-theme border-themeBorderStrong"
                        >
                            <i className="fa-solid fa-power-off text-lg"></i> Terminate Session
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}