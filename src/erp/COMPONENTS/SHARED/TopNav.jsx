/* eslint-disable */
import React, { useState } from "react";
import { theme } from "../../theme";
import { useERP } from "../../CONTEXT/ErpContext";

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

export default function TopNav({ userSession, activeTab, setActiveTab, onLogout }) {
    const { notices } = useERP();
    
    const role = userSession?.role || 'student';
    let navGroups = STUDENT_NAV_GROUPS;
    let iconClass = "fa-landmark";
    
    if (role === 'admin') {
        navGroups = ADMIN_NAV_GROUPS;
        iconClass = "fa-fingerprint";
    } else if (role === 'faculty') {
        navGroups = FACULTY_NAV_GROUPS;
        iconClass = "fa-landmark text-blue-500";
    }

    const initials = userSession?.name 
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : role.substring(0, 2).toUpperCase();
        
    const displayName = userSession?.name || (role === 'admin' ? "System Admin" : role === 'faculty' ? "Professor" : "Student");

    return (
        <header className="hidden lg:flex items-center justify-between px-6 h-[72px] bg-themeApp border-b border-themeBorder text-themeText z-50 sticky top-0">
            {/* Left: Brand Logo */}
            <div 
                className="flex items-center gap-4 cursor-pointer shrink-0" 
                onClick={() => setActiveTab('dashboard')}
            >
                <div className="w-10 h-10 rounded-themePanel bg-themeElevated border border-themeBorderStrong flex items-center justify-center shadow-themeElevated transition-transform hover:scale-105">
                    <i className={`fa-solid ${iconClass} ${role !== 'faculty' ? 'text-themeAccent' : ''} text-lg`}></i>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter text-themeText leading-none">
                        JSM<span className={role === 'faculty' ? 'text-blue-500' : 'text-themeAccent'}>ERP</span>
                    </span>
                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-[0.2em] mt-0.5 opacity-70">
                        {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                    </span>
                </div>
            </div>

            {/* Center: Mega Menu */}
            <nav className="flex-1 flex items-center justify-center gap-2 px-8 h-full">
                {navGroups.map((group, idx) => (
                    <div key={idx} className="relative group h-full flex items-center">
                        <button className="flex items-center gap-2 px-4 h-full text-[11px] font-black uppercase tracking-widest text-themeTextSec group-hover:text-themeText transition-colors outline-none focus:outline-none">
                            <span>{group.category}</span>
                            <i className="fa-solid fa-chevron-down text-[8px] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300"></i>
                        </button>
                        
                        {/* Dropdown Container */}
                        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 w-64">
                            <div className="bg-themePanel border border-themeBorder rounded-themePanel p-2.5 shadow-xl flex flex-col gap-1 backdrop-blur-md">
                                {group.links.map(link => {
                                    const isActive = activeTab === link.id;
                                    const hasNotice = link.id === 'notices' && notices?.length > 0;
                                    
                                    return (
                                        <button
                                            key={link.id}
                                            onClick={() => setActiveTab(link.id)}
                                            className={`relative flex items-center gap-3.5 w-full p-3.5 rounded-themePanel transition-all duration-200 text-left overflow-hidden ${isActive 
                                                ? 'bg-themeElevated text-themeText border border-themeBorderStrong' 
                                                : 'hover:bg-themeElevated text-themeTextSec hover:text-themeText border border-transparent'
                                            }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-themeAccent rounded-r-full"></div>
                                            )}
                                            <div className="w-5 flex justify-center shrink-0">
                                                <i className={`${link.icon} text-[15px] ${isActive ? (role === 'faculty' ? 'text-blue-500' : 'text-themeAccent') : 'opacity-70'}`}></i>
                                            </div>
                                            <span className="text-[10px] uppercase font-black tracking-widest truncate">
                                                {link.label}
                                            </span>
                                            {hasNotice && !isActive && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 ml-auto shadow-[0_0_8px_#f59e0b]"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </nav>

            {/* Right: Profile & Actions */}
            <div className="flex items-center gap-5 shrink-0">
                <button 
                    onClick={() => setActiveTab('credentials')}
                    className="flex items-center gap-3 hover:bg-themeElevated p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-themeBorder group"
                >
                    <div className="w-9 h-9 rounded-full bg-themePanel border border-themeBorderStrong flex items-center justify-center font-black text-xs text-themeText relative overflow-hidden group-hover:border-themeAccent transition-colors">
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themePanel"></div>
                        {initials}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-themeText group-hover:text-themeAccent transition-colors">
                            {displayName}
                        </span>
                        <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">
                            Settings
                        </span>
                    </div>
                </button>
                
                <div className="w-px h-8 bg-themeBorder"></div>
                
                <button 
                    onClick={onLogout}
                    title="Terminate Session"
                    className="w-10 h-10 rounded-themePanel flex items-center justify-center text-rose-500 hover:text-white bg-transparent hover:bg-rose-600 border border-transparent hover:border-rose-500 transition-all duration-300"
                >
                    <i className="fa-solid fa-power-off"></i>
                </button>
            </div>
        </header>
    );
}
