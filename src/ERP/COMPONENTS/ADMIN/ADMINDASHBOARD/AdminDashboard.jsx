/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

const CACHE_KEY = "admin_dash_cache";

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState("overview"); // 'overview', 'directory', 'system'
    const [searchQuery, setSearchQuery] = useState("");

    const [dashboardData, setDashboardData] = useState(() => {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
        return {
            users: [],
            totalUsers: 0,
            pendingTickets: 0,
            systemLogs: [
                { time: "10:42 AM", event: "Semester 4 Results Published by COE", type: "Success" },
                { time: "09:15 AM", event: "Failed login attempt (IP: 192.168.1.42)", type: "Warning" },
                { time: "Yesterday", event: "Automated Database Backup Completed", type: "Info" },
            ]
        };
    });

    useEffect(() => {
        let isMounted = true;
        const fetchDashboardData = async () => {
            try {
                const [profilesResponse, ticketsResponse, logsResponse] = await Promise.all([
                    supabase.from('profiles').select('*'),
                    supabase.from('helpdesk_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
                    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5)
                ]);

                if (isMounted) {
                    const users = profilesResponse.data || [];
                    const totalUsers = users.length;
                    const pendingTickets = ticketsResponse.count || 0;

                    // Map real audit logs to the systemLogs format
                    const systemLogs = (logsResponse.data || []).map(log => {
                        const d = new Date(log.created_at);
                        const isToday = d.toDateString() === new Date().toDateString();
                        const timeStr = isToday ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
                        
                        let type = "Info";
                        if (log.action.toLowerCase().includes('fail') || log.action.toLowerCase().includes('delete')) type = "Warning";
                        if (log.action.toLowerCase().includes('success') || log.action.toLowerCase().includes('publish')) type = "Success";

                        return {
                            time: timeStr,
                            event: `${log.action} on ${log.table_name}`,
                            type: type
                        };
                    });

                    // If no real logs exist yet, provide a fallback
                    if (systemLogs.length === 0) {
                        systemLogs.push({ time: "Just now", event: "System Initialized", type: "Success" });
                    }

                    const newData = {
                        ...dashboardData,
                        users,
                        totalUsers,
                        pendingTickets,
                        systemLogs
                    };

                    setDashboardData(newData);
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- DYNAMIC DATA ---
    const systemStats = [
        { label: "Total Active Users", value: dashboardData.totalUsers.toString(), icon: "fa-solid fa-users", trend: "Live Data" },
        { label: "System Uptime", value: "99.98%", icon: "fa-solid fa-server", trend: "Operational" },
        { label: "Pending Support Tickets", value: dashboardData.pendingTickets.toString(), icon: "fa-solid fa-headset", trend: "Requires Attention" },
        { label: "Storage Used", value: "412 GB", icon: "fa-solid fa-database", trend: "64% Capacity" },
    ];

    const mappedUsers = dashboardData.users.map(u => ({
        id: u.id || u.user_id || "N/A",
        name: u.full_name || u.name || "Unknown User",
        role: u.role || "User",
        department: u.department || "N/A",
        status: u.status || "Active",
        lastLogin: u.last_login || u.lastLogin || "Unknown"
    }));

    // --- HANDLERS ---
    const filteredUsers = mappedUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* 1. MASTER COMMAND BANNER */}
            <div className="w-full bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-purple-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel lg:rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-shield-halved text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <p className="text-themeAccent font-bold text-[9px] lg:text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5 lg:gap-2">
                                <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500"></span> System Online
                            </p>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl xl:text-4xl text-themeText tracking-tight`}>
                                Master Control
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button className={`${theme.action.btnSecondary} w-full sm:w-auto px-5 lg:px-6 py-3.5 flex items-center justify-center gap-2 group`}>
                            <i className="fa-solid fa-bullhorn text-themeAccent group-hover:scale-110 transition-transform"></i> <span className="text-[10px] lg:text-xs">Broadcast</span>
                        </button>
                        <button className="w-full sm:w-auto bg-themeAccent hover:bg-themeAccentMuted text-themeText px-5 lg:px-6 py-3.5 rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group">
                            <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-white/10"></div>
                            <i className="fa-solid fa-user-plus text-sm lg:text-base"></i> Provision
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TAB NAVIGATION */}
            <div className={`flex p-1.5 ${theme.layout.panelElevated} rounded-themePanel w-full overflow-x-auto no-scrollbar border-theme border-themeBorder sticky top-16 lg:static z-30 shrink-0`}>
                {[
                    { id: 'overview', label: 'Overview', icon: 'fa-chart-network' },
                    { id: 'directory', label: 'Directory', icon: 'fa-address-book' },
                    { id: 'system', label: 'Config', icon: 'fa-sliders' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-3 lg:py-3.5 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 min-w-max ${activeView === tab.id
                                ? "bg-themeElevated text-themeAccent scale-[1.02] border-theme border-themeBorderStrong"
                                : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent active:scale-95"
                            }`}
                    >
                        <i className={`fa-solid ${tab.icon} ${activeView === tab.id ? 'text-themeAccent' : 'opacity-70'} text-sm lg:text-base`}></i>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 3. VIEW: OVERVIEW */}
            {activeView === "overview" && (
                <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                        {systemStats.map((stat, index) => (
                            <div key={index} className={`bg-themePanel p-5 lg:p-6 rounded-themePanel hover:scale-[1.02] hover:border-themeBorderStrong transition-all flex flex-col gap-4 group cursor-default border-theme border-themeBorder`}>
                                <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-lg lg:text-xl bg-themeElevated text-themeAccent border-theme border-themeBorderStrong group-hover:scale-110 transition-transform origin-left shrink-0`}>
                                        <i className={stat.icon}></i>
                                    </div>
                                    <span className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest px-2 py-1 bg-themePanel rounded border-theme border-themeBorder shrink-0`}>
                                        Live
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl lg:text-3xl font-black text-themeText tracking-tight mb-1">{stat.value}</p>
                                    <p className={`text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>{stat.label}</p>
                                </div>
                                <div className="pt-3 lg:pt-4 border-t-theme border-themeBorder mt-auto">
                                    <p className="text-[9px] lg:text-[10px] font-bold text-themeAccent uppercase tracking-widest">{stat.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* System Logs */}
                        <div className={`bg-themePanel rounded-themePanel p-5 lg:p-6 flex flex-col gap-4 border-theme border-themeBorder`}>
                            <h2 className={`${theme.text.heading} text-base lg:text-lg text-themeText tracking-tight px-1`}>Security & Audit Logs</h2>
                            <div className="flex flex-col gap-3">
                                {dashboardData.systemLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-themePanel bg-themePanel border-theme border-themeBorder hover:border-themeBorderStrong transition-colors">
                                        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 border-theme ${log.type === 'Success' ? 'bg-themeElevated text-emerald-400 border-themeBorderStrong' :
                                                log.type === 'Warning' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' :
                                                    'bg-themeElevated text-blue-400 border-themeBorderStrong'
                                            }`}>
                                            <i className={`fa-solid ${log.type === 'Success' ? 'fa-check' :
                                                    log.type === 'Warning' ? 'fa-triangle-exclamation' :
                                                        'fa-info'
                                                } text-xs lg:text-sm`}></i>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs lg:text-sm font-bold text-themeText leading-tight mb-1 lg:mb-1.5 truncate">{log.event}</p>
                                            <p className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-2 text-[10px] lg:text-xs font-black text-themeAccent hover:text-indigo-300 uppercase tracking-widest transition-colors text-center w-fit mx-auto active:scale-95">View Full Audit Trail</button>
                        </div>

                        {/* Quick Actions Map */}
                        <div className="from-[#1a1c2c] to-[#121212] border-theme border-themeBorderStrong rounded-themePanel p-5 lg:p-6 text-themeText relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                            <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-themeElevated rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                            <div className="relative z-10 mb-4 lg:mb-0">
                                <h2 className={`${theme.text.heading} text-base lg:text-lg text-themeText tracking-tight mb-1`}>Infrastructure Hub</h2>
                                <p className={`text-[10px] lg:text-xs ${theme.text.muted} font-medium mb-4 lg:mb-6`}>DB: PostgreSQL (Supabase) via Edge</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:gap-4 relative z-10">
                                <button className="bg-themeApp hover:bg-themePanel p-4 lg:p-5 rounded-themePanel border-theme border-themeBorderStrong transition-colors text-left flex flex-col gap-2 lg:gap-3 group active:scale-[0.98]">
                                    <i className="fa-solid fa-server text-themeAccent text-lg lg:text-xl group-hover:scale-110 transition-transform origin-left"></i>
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeText">Restart</span>
                                </button>
                                <button className="bg-themeApp hover:bg-themePanel p-4 lg:p-5 rounded-themePanel border-theme border-themeBorderStrong transition-colors text-left flex flex-col gap-2 lg:gap-3 group active:scale-[0.98]">
                                    <i className="fa-solid fa-cloud-arrow-down text-emerald-400 text-lg lg:text-xl group-hover:scale-110 transition-transform origin-left"></i>
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeText">Backup</span>
                                </button>
                                <button className="bg-themeApp hover:bg-themePanel p-4 lg:p-5 rounded-themePanel border-theme border-themeBorderStrong transition-colors text-left flex flex-col gap-2 lg:gap-3 group active:scale-[0.98]">
                                    <i className="fa-solid fa-broom text-themeAccent text-lg lg:text-xl group-hover:scale-110 transition-transform origin-left"></i>
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeText">Clear Cache</span>
                                </button>
                                <button className="bg-themeElevated hover:bg-themeElevated border-theme border-themeBorderStrong p-4 lg:p-5 rounded-themePanel transition-colors text-left flex flex-col gap-2 lg:gap-3 group active:scale-[0.98]">
                                    <i className="fa-solid fa-lock text-rose-500 text-lg lg:text-xl group-hover:scale-110 transition-transform origin-left"></i>
                                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-rose-400">Lockdown</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. VIEW: USER DIRECTORY */}
            {activeView === "directory" && (
                <div className="flex flex-col gap-4 lg:gap-6 animate-fade-in">

                    <div className={`bg-themePanel p-3 lg:p-4 rounded-themePanel flex flex-col sm:flex-row gap-3 lg:gap-4 border-theme border-themeBorder`}>
                        <div className="relative flex-1 group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-themeTextSec opacity-70 group-focus-within:text-themeAccent transition-colors">
                                <i className="fa-solid fa-magnifying-glass text-sm"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by Name, ID, or Role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-themePanel border-theme border-themeBorder rounded-themePanel pl-10 pr-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold focus:bg-themeElevated focus:border-themeAccent focus:outline-none transition-all text-themeText placeholder:text-neutral-600"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className={`${theme.action.btnSecondary} flex-1 sm:flex-none px-4 lg:px-6 py-3 lg:py-3.5 flex items-center justify-center gap-2`}>
                                <i className="fa-solid fa-filter text-xs lg:text-sm"></i> <span className="text-[10px] lg:text-xs">Filter</span>
                            </button>
                            <button className="flex-1 sm:flex-none px-4 lg:px-6 py-3 lg:py-3.5 bg-themeAccent hover:bg-themeAccentMuted text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-download text-xs lg:text-sm"></i> <span className="text-[10px] lg:text-xs">Export</span>
                            </button>
                        </div>
                    </div>

                    <div className={`bg-themePanel rounded-themePanel overflow-hidden border-theme border-themeBorder`}>
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-themePanel border-b-theme border-themeBorder">
                                        <th className={`p-4 lg:p-5 pl-5 lg:pl-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>User Details</th>
                                        <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>Role & Dept</th>
                                        <th className={`p-4 lg:p-5 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>Status</th>
                                        <th className={`p-4 lg:p-5 pr-5 lg:pr-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest text-right`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/50">
                                    {filteredUsers.map((user, i) => (
                                        <tr key={i} className="hover:bg-themeElevated transition-colors group">
                                            <td className="p-4 lg:p-5 pl-5 lg:pl-6">
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black border-theme shrink-0 ${user.role === 'Admin' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' :
                                                            user.role === 'Faculty' ? 'bg-themeElevated text-blue-400 border-themeBorderStrong' :
                                                                'bg-themeElevated text-themeAccent border-themeBorderStrong'
                                                        }`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs lg:text-sm font-black text-themeText group-hover:text-themeAccent transition-colors truncate">{user.name}</p>
                                                        <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} mt-0.5 truncate`}>{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 lg:p-5">
                                                <p className={`text-[10px] lg:text-xs font-black truncate ${user.role === 'Admin' ? 'text-themeAccent' : user.role === 'Faculty' ? 'text-blue-400' : 'text-themeAccent'}`}>{user.role}</p>
                                                <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} truncate max-w-[150px] lg:max-w-[200px] mt-0.5 lg:mt-1`}>{user.department}</p>
                                            </td>
                                            <td className="p-4 lg:p-5">
                                                <span className={`px-2 lg:px-2.5 py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest border-theme flex w-fit items-center gap-1.5 ${user.status === 'Active' ? 'bg-themeElevated text-emerald-400 border-themeBorderStrong' : 'bg-themeElevated text-rose-500 border-themeBorderStrong'
                                                    }`}>
                                                    {user.status === 'Active' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-ban"></i>} {user.status}
                                                </span>
                                                <p className={`text-[8px] lg:text-[9px] font-bold ${theme.text.muted} mt-1.5 truncate`}>Last Login: {user.lastLogin}</p>
                                            </td>
                                            <td className="p-4 lg:p-5 pr-5 lg:pr-6">
                                                <div className="flex justify-end gap-1.5 lg:gap-2">
                                                    <button className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-themePanel hover:bg-neutral-800 border-theme border-themeBorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors" title="Edit Profile">
                                                        <i className="fa-solid fa-pen text-[10px] lg:text-xs"></i>
                                                    </button>
                                                    <button className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-themePanel hover:bg-neutral-800 border-theme border-themeBorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center transition-colors" title="Reset Password">
                                                        <i className="fa-solid fa-key text-[10px] lg:text-xs"></i>
                                                    </button>
                                                    {user.role !== 'Admin' && (
                                                        <button className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-colors border-theme ${user.status === 'Active'
                                                                ? 'bg-themeElevated hover:bg-themeElevated border-themeBorderStrong text-rose-500'
                                                                : 'bg-themeElevated hover:bg-themeElevated border-themeBorderStrong text-emerald-400'
                                                            }`} title={user.status === 'Active' ? 'Suspend User' : 'Restore User'}>
                                                            <i className={`fa-solid ${user.status === 'Active' ? 'fa-ban' : 'fa-rotate-left'} text-[10px] lg:text-xs`}></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="w-full py-16 flex flex-col items-center justify-center bg-themeApp px-4 text-center">
                                    <p className={`text-xs lg:text-sm font-bold ${theme.text.muted}`}>No users found matching "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. VIEW: SYSTEM CONFIG */}
            {activeView === "system" && (
                <div className="w-full py-20 lg:py-24 border-2 border-dashed border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themeApp animate-fade-in px-4 text-center">
                    <div className={`${theme.ui.logoBox} bg-themeElevated border-themeBorderStrong mb-4 lg:mb-6`}>
                        <i className="fa-solid fa-sliders text-xl lg:text-2xl text-themeTextSec opacity-70"></i>
                    </div>
                    <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Global Configurations</h3>
                    <p className={`text-[10px] lg:text-xs font-semibold ${theme.text.muted} mt-2`}>Semester Rollovers and System Variables will be managed here.</p>
                </div>
            )}

        </div>
    );
}
