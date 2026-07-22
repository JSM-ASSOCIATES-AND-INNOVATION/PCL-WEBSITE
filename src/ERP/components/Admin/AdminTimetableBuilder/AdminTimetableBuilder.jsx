/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

import SemesterManager from "./tabs/SemesterManager";
import SubjectBuilder from "./tabs/SubjectBuilder";
import ScheduleBuilder from "./tabs/ScheduleBuilder";
import ApprovalCenter from "./tabs/ApprovalCenter";
import BarCompliance from "./BarCompliance";
import AutoGenerator from "./AutoGenerator";
import ScheduleManager from "./tabs/ScheduleManager";

export default function AdminTimetableBuilder({ isHubView = false }) {
    const { userSession } = useERP();
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'semesters', 'subjects', 'schedule-builder', 'approvals'

    const [stats, setStats] = useState({
        programmes: 0,
        activeSemesters: 0,
        pendingApprovals: 0,
        timetableRows: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: sems } = await supabase.from('academic_semesters').select('programme, is_active_globally');
                const progs = new Set(sems?.map(s => s.programme));
                const activeSems = sems?.filter(s => s.is_active_globally).length || 0;

                // Safely try fetching from timetable_requests and class_schedule (ignoring errors if tables are empty/missing)
                const { count: approvalsCount, error: err1 } = await supabase.from('timetable_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
                const { count: ttCount, error: err2 } = await supabase.from('class_schedule').select('*', { count: 'exact', head: true });

                setStats({
                    programmes: progs.size || 0,
                    activeSemesters: activeSems || 0,
                    pendingApprovals: err1 ? 0 : (approvalsCount || 0),
                    timetableRows: err2 ? 0 : (ttCount || 0),
                    loading: false
                });
            } catch (err) {
                console.error(err);
                setStats(s => ({ ...s, loading: false }));
            }
        };
        fetchStats();
    }, []);

    const renderDashboard = () => (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                    <span className="text-3xl font-black text-themeText z-10">{stats.loading ? '-' : stats.programmes}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Programmes</span>
                </div>
                <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col gap-1 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('semesters')}>
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <span className="text-3xl font-black text-themeText z-10">{stats.loading ? '-' : stats.activeSemesters}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Active Semesters</span>
                </div>
                <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col gap-1 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('approvals')}>
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
                    <span className="text-3xl font-black text-amber-500 z-10">{stats.loading ? '-' : stats.pendingApprovals}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Requests Queue</span>
                </div>
                <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col gap-1 relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('schedule-builder')}>
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
                    <span className="text-3xl font-black text-rose-500 z-10">{stats.loading ? '-' : stats.timetableRows}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec z-10">Scheduled Classes</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-6">Welcome to the Command Center</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div onClick={() => setActiveTab('semesters')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-toggle-on text-2xl text-emerald-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Semester Manager</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Toggle the global academic state for the entire ERP.</span>
                        </div>
                        <div onClick={() => setActiveTab('subjects')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-palette text-2xl text-blue-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Subject Builder</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Create subjects and assign theme colors and faculties.</span>
                        </div>
                        <div onClick={() => setActiveTab('schedule-manager')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-clock text-2xl text-cyan-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Schedule Manager</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Configure global timings and weekly off days.</span>
                        </div>
                        <div onClick={() => setActiveTab('schedule-builder')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-layer-group text-2xl text-rose-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Timetable Builder</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Manually schedule classes and inject them into grids.</span>
                        </div>
                        <div onClick={() => setActiveTab('approvals')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-inbox text-2xl text-amber-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Approval Center</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Review reschedule requests from your faculties.</span>
                        </div>
                        <div onClick={() => setActiveTab('compliance')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-scale-balanced text-2xl text-indigo-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Bar Compliance</span>
                            <span className="text-[10px] font-bold text-themeTextSec">Check Rule-28 compliance (minimum 36 teaching hours).</span>
                        </div>
                        <div onClick={() => setActiveTab('auto-gen')} className="p-6 border border-themeBorder bg-themeElevated hover:border-themeAccent transition-all cursor-pointer rounded-xl flex flex-col gap-2">
                            <i className="fa-solid fa-wand-magic-sparkles text-2xl text-purple-500"></i>
                            <span className="block text-sm font-black text-themeText mt-2">Auto Generator</span>
                            <span className="text-[10px] font-bold text-themeTextSec">AI-driven clash-free smart schedule builder.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`w-full ${isHubView ? 'bg-transparent text-themeText font-sans' : 'min-h-screen bg-themeApp text-themeText font-sans pb-32'}`}>
            
            {/* Top Navigation Hub */}
            <div className={`${isHubView ? '' : 'max-w-[1400px] mx-auto px-4 lg:px-8 py-6'}`}>
                {!isHubView && (
                    <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80 mb-6 lg:mb-8`}>
                        {/* Background Decorations */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                            <div className="flex items-center gap-4 lg:gap-5">
                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                                    <i className="fa-solid fa-layer-group text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                                </div>
                                <div>
                                    <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Academic Control Center</h1>
                                    <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Global management for semesters, subjects, and timetables.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar mb-6 lg:mb-8">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple' },
                        { id: 'semesters', label: 'Semester Manager', icon: 'fa-toggle-on' },
                        { id: 'schedule-manager', label: 'Schedule Manager', icon: 'fa-clock' },
                        { id: 'subjects', label: 'Subject Builder', icon: 'fa-palette' },
                        { id: 'schedule-builder', label: 'Timetable Builder', icon: 'fa-layer-group' },
                        { id: 'approvals', label: 'Approval Center', icon: 'fa-inbox' },
                        { id: 'compliance', label: 'Bar Compliance', icon: 'fa-scale-balanced' },
                        { id: 'auto-gen', label: 'Auto Generator', icon: 'fa-wand-magic-sparkles' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                activeTab === tab.id 
                                ? 'bg-themeAccent text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-themeAccent scale-100' 
                                : 'text-themeTextSec hover:text-themeText hover:bg-themePanel border border-transparent scale-95 hover:scale-100'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`${isHubView ? 'w-full mt-2' : 'max-w-[1400px] mx-auto p-6 mt-4'}`}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'semesters' && <SemesterManager />}
                {activeTab === 'schedule-manager' && <ScheduleManager />}
                {activeTab === 'subjects' && <SubjectBuilder />}
                {activeTab === 'schedule-builder' && <ScheduleBuilder />}
                {activeTab === 'approvals' && <ApprovalCenter />}
                {activeTab === 'compliance' && <BarCompliance />}
                {activeTab === 'auto-gen' && <AutoGenerator />}
            </div>
            
        </div>
    );
}