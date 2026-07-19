import React, { useState } from "react";
import { useERP } from "../../../context/ErpContext";
import pclLogo from "../../../../assets/LOGOS/pcl_logo.svg";

// ==========================================
// 1. STRICTLY MATCHED ROUTES (DO NOT CHANGE IDs)
// ==========================================
const FACULTY_NAV_GROUPS = [
    {
        category: "Workspace",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "classes", label: "My Classes", icon: "fa-solid fa-chalkboard-user" },
            { id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
            { id: "students", label: "Students", icon: "fa-solid fa-users" },
        ]
    },
    {
        category: "Academics",
        links: [
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "assignments", label: "Assignments", icon: "fa-solid fa-file-signature" },
            { id: "examinations", label: "Examinations", icon: "fa-solid fa-file-lines" },
        ]
    },
    {
        category: "Co-Curricular",
        links: [
            { id: "research", label: "Research", icon: "fa-solid fa-microscope" },
            { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-gavel" },
            { id: "internships", label: "Internships", icon: "fa-solid fa-briefcase" },
            { id: "legalaid", label: "Legal Aid", icon: "fa-solid fa-scale-balanced" },
        ]
    },
    {
        category: "Resources",
        links: [
            { id: "library", label: "Library", icon: "fa-solid fa-book-open" },
            { id: "documents", label: "Documents", icon: "fa-solid fa-folder-open" },
            { id: "communication", label: "Communication", icon: "fa-solid fa-comments" },
            { id: "calendar", label: "Calendar", icon: "fa-solid fa-calendar-days" },
        ]
    },
    {
        category: "Administration",
        links: [
            { id: "facultyleave", label: "Leave", icon: "fa-solid fa-mug-hot" },
            { id: "settings", label: "Settings", icon: "fa-solid fa-gear" }
        ]
    }
];

// Quick Access for Bottom Nav on Mobile
const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
    { id: "classes", label: "Classes", icon: "fa-solid fa-chalkboard-user" },
    { id: "notifications", label: "Notices", icon: "fa-solid fa-bell" },
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
            <aside className={`hidden lg:flex bg-themeApp text-themeText flex-col shrink-0 h-screen selection:bg-themeElevated border-r border-themeBorder relative overflow-hidden transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.3)] ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>

                <div className="h-24 flex items-center justify-between px-6 border-b border-themeBorder shrink-0 relative z-10 backdrop-blur-md bg-themeApp/80">
                    <div className="flex items-center gap-3">
                        <img src={pclLogo} alt="PCL Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        {!isSidebarCollapsed && (
                            <span className="text-2xl font-black tracking-tight text-themeText">
                                PCL<span className="text-blue-500 drop-shadow-[0_0_8px_#3b82f6]">ERP</span>
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
                                            <p className="text-[10px] font-black text-themeTextSec opacity-70 group-hover:text-blue-500 uppercase tracking-widest transition-colors drop-shadow-sm">
                                                {group.category}
                                            </p>
                                            <i className={`fa-solid fa-chevron-down text-[8px] text-neutral-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500 drop-shadow-[0_0_5px_#3b82f6]' : ''}`}></i>
                                        </button>
                                    ) : (
                                        <div className="w-full border-b border-themeBorder my-2 opacity-50"></div>
                                    )}
                                    
                                    <div className={`flex flex-col gap-1.5 overflow-hidden transition-all duration-500 origin-top ${isExpanded || isSidebarCollapsed ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}>
                                        {group.links.map((link) => {
                                            const isActive = activeTab === link.id;
                                            return (
                                                <button
                                                    key={link.id}
                                                    onClick={() => handleTabSwitch(link.id)}
                                                    className={`w-full flex items-center p-3 rounded-themePanel text-[11px] uppercase tracking-widest font-black transition-all duration-300 group relative ${isActive
                                                        ? "bg-themeElevated/60 text-blue-400 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-sm"
                                                        : "text-themeTextSec hover:text-themeText hover:bg-themeElevated/40 border-l-[3px] border-transparent"
                                                        } ${isSidebarCollapsed ? "justify-center" : "justify-between px-4"}`}
                                                >
                                                    <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full relative" : "gap-4"}`}>
                                                        <div className={`w-6 flex justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                            <i className={`${link.icon} text-lg ${isActive ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "opacity-70 group-hover:opacity-100 group-hover:text-blue-400"}`}></i>
                                                        </div>
                                                        {!isSidebarCollapsed && (
                                                            <span className="truncate group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Notification Dot */}
                                                    {((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && (
                                                        <span className={`w-2 h-2 rounded-full bg-blue-500 ${isSidebarCollapsed ? 'absolute top-2 right-2' : ''}`}></span>
                                                    )}

                                                    {/* Custom Premium Tooltip for Collapsed State */}
                                                    {isSidebarCollapsed && (
                                                        <div className="absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong px-3 py-1.5 rounded-themeBtn shadow-themeElevated opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-[100] whitespace-nowrap text-themeText font-black tracking-widest text-[9px]">
                                                            {link.label}
                                                        </div>
                                                    )}
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