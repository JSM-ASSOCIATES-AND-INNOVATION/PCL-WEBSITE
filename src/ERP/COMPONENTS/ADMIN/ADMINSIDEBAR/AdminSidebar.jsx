/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useState } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";

// ==========================================
// 1. MASTER ADMIN NAVIGATION ARCHITECTURE
// ==========================================
const ADMIN_NAV_GROUPS = [
    {
        category: "Master Control",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
            { id: "notices", label: "Broadcast", icon: "fa-solid fa-satellite-dish" }
        ]
    },
    {
        category: "Identity & Operations",
        links: [
            { id: "users", label: "Users", icon: "fa-solid fa-users-gear" },
            { id: "curriculum", label: "Master Timetable", icon: "fa-solid fa-calendar-days" },
            { id: "allocations", label: "Mentorship", icon: "fa-solid fa-network-wired" },
            { id: "finance", label: "Finance Ledger", icon: "fa-solid fa-indian-rupee-sign" }
        ]
    },
    {
        category: "Assessments",
        links: [
            { id: "adminapprovals", label: "Approvals & Investigations", icon: "fa-solid fa-scale-balanced" },
            { id: "examinations", label: "Exams", icon: "fa-solid fa-file-shield" }
        ]
    },
    {
        category: "Law Specializations",
        links: [
            { id: "mootcourt", label: "Moot Court Society", icon: "fa-solid fa-gavel" },
            { id: "placements", label: "Placements & Drives", icon: "fa-solid fa-briefcase" },
            { id: "legalaid", label: "Legal Aid Clinic", icon: "fa-solid fa-scale-unbalanced" }
        ]
    },
    {
        category: "System",
        links: [
            { id: "credentials", label: "Security", icon: "fa-solid fa-fingerprint" }
        ]
    }
];

export default function AdminSidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { isSidebarCollapsed, toggleSidebar, notices } = useERP();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Default all groups to expanded
    const [expandedGroups, setExpandedGroups] = useState(
        ADMIN_NAV_GROUPS.reduce((acc, group, idx) => {
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

    // Dynamically calculate initials
    const initials = userSession?.name
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : "AD";

    const displayName = userSession?.name || "System Admin";

    // --- MOBILE BOTTOM NAV HELPERS ---
    const bottomNavLinks = [
        { id: "dashboard", icon: "fa-server", label: "Home" },
        { id: "users", icon: "fa-users-gear", label: "Users" },
        { id: "adminapprovals", icon: "fa-scale-balanced", label: "Approvals" },
        { id: "notices", icon: "fa-satellite-dish", label: "Broadcast" },
    ];

    return (
        <>
            {/* =========================================
                DESKTOP SIDEBAR (Hidden on Mobile)
            ========================================= */}
            <aside className={`hidden lg:flex bg-themeApp text-themeText flex-col shrink-0 h-screen selection:bg-themeElevated border-r-theme border-themeBorder relative overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[280px]'}`}>

                {/* Brand Header */}
                <div className="h-24 flex items-center justify-between px-6 border-b-theme border-themeBorder shrink-0 relative z-10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-fingerprint text-themeAccent text-base"></i>
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="text-2xl font-black tracking-tight text-themeText ml-3">
                                JSM<span className="text-themeAccent">ERP</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto py-6 px-3 no-scrollbar relative z-10">
                    <nav className="flex flex-col gap-6">
                        {ADMIN_NAV_GROUPS.map((group, groupIndex) => {
                            const isExpanded = expandedGroups[groupIndex];
                            return (
                                <div key={groupIndex} className="flex flex-col gap-1.5">
                                    {!isSidebarCollapsed ? (
                                        <button 
                                            onClick={() => toggleGroup(groupIndex)}
                                            className="flex items-center justify-between w-full px-3 mb-1 group outline-none"
                                        >
                                            <p className="text-[10px] font-black text-themeTextSec opacity-70 group-hover:text-themeAccent uppercase tracking-widest transition-colors">
                                                {group.category}
                                            </p>
                                            <i className={`fa-solid fa-chevron-down text-[8px] text-neutral-600 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-themeAccent' : ''}`}></i>
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
                                                    onClick={() => setActiveTab(link.id)}
                                                    title={isSidebarCollapsed ? link.label : ""}
                                                    className={`w-full flex items-center justify-between p-3 rounded-themePanel text-[11px] uppercase tracking-widest font-black transition-all duration-300 group ${isActive
                                                        ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong"
                                                        : "text-themeTextSec hover:text-themeText hover:bg-themeElevated border-theme border-transparent"
                                                        } ${isSidebarCollapsed ? "justify-center" : "px-4"}`}
                                                >
                                                    <div className={`flex items-center ${isSidebarCollapsed ? "justify-center w-full" : "gap-4"}`}>
                                                        <div className={`w-6 flex justify-center transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                            <i className={`${link.icon} text-lg ${isActive ? "text-themeAccent" : "opacity-70 group-hover:opacity-100 group-hover:text-themeAccent"}`}></i>
                                                        </div>
                                                        {!isSidebarCollapsed && (
                                                            <span className="truncate group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                                                        )}
                                                    </div>
                                                    {!isSidebarCollapsed && ((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
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

            {/* =========================================
                MOBILE APP LAYOUT (Hidden on Desktop)
            ========================================= */}

            {/* 1. Mobile Top App Bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-themeApp border-b-theme border-themeBorder z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className={`${theme.ui.logoBox} w-8 h-8 rounded-lg bg-themeElevated border-themeBorderStrong `}>
                        <i className="fa-solid fa-fingerprint text-themeAccent text-sm"></i>
                    </div>
                    <span className={`${theme.text.heading} text-lg tracking-tight text-themeText`}>
                        JSM<span className="text-themeAccent font-black">ERP</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-10 h-10 rounded-themePanel bg-themeElevated border-theme border-themeBorder flex items-center justify-center text-themeTextSec hover:text-themeText"
                    >
                        <i className="fa-solid fa-bars-staggered"></i>
                    </button>
                </div>
            </header>

            {/* 2. Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-themeApp border-t-theme border-themeBorder z-40 pb-safe">
                <div className="flex items-center justify-around px-2 py-2">
                    {bottomNavLinks.map((link) => {
                        const isActive = activeTab === link.id;
                        return (
                            <button
                                key={link.id}
                                onClick={() => setActiveTab(link.id)}
                                className="flex flex-col items-center justify-center w-16 h-14 relative group"
                            >
                                <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${isActive ? 'bg-themeElevated text-themeAccent  border-theme border-themeBorderStrong' : 'text-themeTextSec opacity-70'}`}>
                                        <i className={`fa-solid ${link.icon} text-lg`}></i>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-themeAccent' : 'text-themeTextSec opacity-70'}`}>
                                        {link.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-indigo-400"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* 3. Mobile Full-Screen Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-themeApp animate-fade-in">
                    {/* Drawer Header */}
                    <div className="h-16 border-b-theme border-themeBorder flex items-center justify-between px-4 shrink-0 bg-themeApp">
                        <span className={`${theme.text.heading} text-lg tracking-tight text-themeText flex items-center gap-2`}>
                            <i className="fa-solid fa-layer-group text-themeAccent"></i> All Modules
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-10 h-10 rounded-themePanel bg-themeElevated border-theme border-themeBorder flex items-center justify-center text-themeTextSec hover:text-themeText"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        <div className="flex flex-col gap-8">
                            {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
                                <div key={groupIndex} className="flex flex-col gap-2">
                                    <p className="text-[10px] font-black text-themeAccent uppercase tracking-widest px-2 mb-1">
                                        {group.category}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {group.links.map((link) => {
                                            const isActive = activeTab === link.id;
                                            return (
                                                <button
                                                    key={link.id}
                                                    onClick={() => {
                                                        setActiveTab(link.id);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-themePanel text-center border-theme  transition-all ${isActive
                                                        ? 'bg-themeElevated border-themeBorderStrong text-themeText'
                                                        : 'bg-themePanel border-themeBorder text-themeTextSec'
                                                        }`}
                                                >
                                                    <i className={`${link.icon} text-2xl ${isActive ? 'text-themeAccent' : 'opacity-50'}`}></i>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 border-t-theme border-themeBorder bg-themePanel shrink-0 pb-safe">
                        <div className="flex items-center gap-3 p-3 bg-themeApp rounded-themePanel border-theme border-themeBorder mb-4">
                            <div className="w-10 h-10 rounded-themePanel bg-themeElevated text-themeAccent flex items-center justify-center font-black text-sm border-theme border-themeBorderStrong relative overflow-hidden shrink-0">
                                <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#121212]"></div>
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-themeText truncate">{displayName}</p>
                                <p className="text-[9px] font-black text-themeTextSec opacity-70 uppercase tracking-widest truncate">Master Admin</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { setActiveTab('credentials'); setIsMobileMenuOpen(false); }}
                                className="flex-[1] py-3.5 bg-themeElevated text-themeTextSec rounded-themePanel text-[10px] font-black uppercase tracking-widest border-theme border-themeBorder flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-gear"></i> Set
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex-[2] py-3.5 bg-themeElevated text-rose-500 rounded-themePanel text-[10px] font-black uppercase tracking-widest border-theme border-themeBorderStrong flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-power-off"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}