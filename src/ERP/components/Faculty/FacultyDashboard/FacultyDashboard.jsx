/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function FacultyDashboard({ setActiveTab }) {
    const { userSession } = useERP();
    
    // Zero-Lag Cache Init
    const cacheKey = `faculty_dash_cache_${userSession?.db_id || 'guest'}`;
    const [dashboardData, setDashboardData] = useState(() => {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try { return JSON.parse(cached); } catch (e) { }
        }
        return {
            stats: { classesToday: 0, ungradedSubmissions: 0, pendingApprovals: 0, activeMentees: 0 },
            schedule: [],
            actionItems: [],
            noticesCount: 0
        };
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!userSession?.db_id) return;

        const fetchDashboardTelemetry = async () => {
            try {
                const todayDay = new Date().toLocaleDateString("en-US", { weekday: 'long' });

                // PARALLEL FETCHING: All dashboard data streams fetched simultaneously
                const [
                    scheduleRes,
                    leavesRes,
                    noticesRes,
                    ungradedRes,
                    nocsRes,
                    menteeRes
                ] = await Promise.all([
                    supabase.from('class_schedule').select('*, subjects(name, code)').eq('faculty_id', userSession.db_id).eq('day_of_week', todayDay).order('start_time', { ascending: true }),
                    supabase.from('leave_requests').select('*, student:profiles!leave_requests_student_id_fkey(full_name)').eq('status', 'pending').eq('mentor_id', userSession.db_id),
                    supabase.from('notices').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
                    supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('noc_requests').select('*, student:profiles!student_id(full_name)').eq('status', 'pending_mentor').eq('mentor_id', userSession.db_id),
                    supabase.from('mentorship_meetings').select('*', { count: 'exact', head: true }).eq('faculty_id', userSession.db_id).eq('status', 'scheduled')
                ]);

                const scheduleData = scheduleRes.data || [];
                const leaves = leavesRes.data || [];
                const noticesCount = noticesRes.count || 0;
                const ungradedCount = ungradedRes.count || 0;
                const nocs = nocsRes.data || [];
                const menteeCount = menteeRes.count || 0;

                const totalApprovals = leaves.length + nocs.length;

                const actions = [];

                leaves.slice(0, 2).forEach(l => actions.push({ 
                    title: "Review Leave Application", 
                    subtitle: l.leave_type, 
                    student: l.student?.full_name, 
                    type: "Approval", 
                    urgent: true, 
                    tab: 'approvals' 
                }));

                nocs.slice(0, 2).forEach(n => actions.push({ 
                    title: "Review Internship NOC", 
                    subtitle: n.company_name, 
                    student: n.student?.full_name, 
                    type: "Approval", 
                    urgent: true, 
                    tab: 'approvals' 
                }));

                if (ungradedCount > 0) {
                    actions.push({ 
                        title: "Grade Pending Submissions", 
                        subtitle: "Assignment Engine", 
                        student: `${ungradedCount} Students`, 
                        type: "Grading", 
                        urgent: false, 
                        tab: 'assignments' 
                    });
                }

                const newData = {
                    stats: {
                        classesToday: scheduleData.length,
                        ungradedSubmissions: ungradedCount,
                        pendingApprovals: totalApprovals,
                        activeMentees: menteeCount
                    },
                    schedule: scheduleData,
                    actionItems: actions.slice(0, 4),
                    noticesCount: noticesCount
                };

                setDashboardData(newData);
                sessionStorage.setItem(cacheKey, JSON.stringify(newData));

            } catch (error) {
                console.error("Dashboard Aggregation Failed:", error);
            }
        };

        fetchDashboardTelemetry();
    }, [userSession, cacheKey]);

    // --- TIME PARSERS & LIVE STATUS ---
    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hourStr, minuteStr] = timeString.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour < 10 ? '0' : ''}${formattedHour}:${minuteStr} ${ampm}`;
    };

    const getClassStatus = (startTime, endTime) => {
        const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const parseDbTime = (t) => {
            const [h, m] = t.split(':');
            return parseInt(h, 10) * 60 + parseInt(m, 10);
        };

        const startMins = parseDbTime(startTime);
        const endMins = parseDbTime(endTime);

        if (currentTotalMinutes > endMins) return 'completed';
        if (currentTotalMinutes >= startMins && currentTotalMinutes <= endMins) return 'active';
        return 'upcoming';
    };

    // --- UI CONFIG ---
    const todayStr = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });
    const quickStatsConfig = [
        { label: "Classes Today", value: dashboardData.stats.classesToday, icon: "fa-solid fa-chalkboard-user", color: "text-themeAccent", bg: "bg-themePanel", border: "border-themeBorderStrong" },
        { label: "Ungraded Subs", value: dashboardData.stats.ungradedSubmissions, icon: "fa-solid fa-file-signature", color: dashboardData.stats.ungradedSubmissions > 0 ? "text-themeAccent" : "text-themeTextSec opacity-70", bg: dashboardData.stats.ungradedSubmissions > 0 ? "bg-themePanel" : "bg-themePanel", border: dashboardData.stats.ungradedSubmissions > 0 ? "border-themeBorderStrong" : "border-themeBorder" },
        { label: "Pending Approvals", value: dashboardData.stats.pendingApprovals, icon: "fa-solid fa-clipboard-question", color: dashboardData.stats.pendingApprovals > 0 ? "text-themeAccent" : "text-themeTextSec opacity-70", bg: dashboardData.stats.pendingApprovals > 0 ? "bg-themePanel" : "bg-themePanel", border: dashboardData.stats.pendingApprovals > 0 ? "border-themeBorderStrong" : "border-themeBorder" },
        { label: "Upcoming Sessions", value: dashboardData.stats.activeMentees, icon: "fa-solid fa-people-arrows", color: "text-themeAccent", bg: "bg-themePanel", border: "border-themeBorderStrong" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in selection:bg-themeElevated">

            {/* 1. COMMAND CENTER BANNER */}
            <div className={`rounded-themePanel p-6 lg:p-8 relative overflow-hidden bg-themeAccent text-white border-none shadow-themeElevated transition-all duration-300`}>
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2"><i className="fa-regular fa-calendar mr-1"></i> {todayStr}</p>
                        <h1 className={`${theme.text.heading} text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm`}>
                            Welcome back, {userSession?.name?.split(' ')[0] || "Professor"}.
                        </h1>
                        <p className={`text-white/80 text-sm font-medium`}>
                            You have {dashboardData.stats.classesToday} classes today and {dashboardData.stats.pendingApprovals} pending student requests.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button onClick={() => setActiveTab('notices')} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-themePanel text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 group">
                            <i className="fa-solid fa-satellite-dish group-hover:scale-110 transition-transform"></i> Announcements
                        </button>
                        <button onClick={() => setActiveTab('roster')} className="bg-white text-themeAccent px-8 py-4 rounded-themePanel text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md flex justify-center items-center gap-2 hover:opacity-95 relative overflow-hidden group">
                            <i className="fa-solid fa-clipboard-user group-hover:scale-110 transition-transform"></i> Mark Attendance
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. QUICK STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {quickStatsConfig.map((stat, index) => (
                    <div key={index} className={`bg-themeElevated shadow-2xl border-theme border-themeBorder p-6 rounded-themePanel flex flex-col gap-4 hover:border-themeBorderStrong hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
                        <div className={`w-12 h-12 rounded-themePanel flex items-center justify-center ${stat.bg} ${stat.color} border-theme ${stat.border} group-hover:scale-110 transition-transform shadow-sm`}>
                            <i className={`${stat.icon} text-xl`}></i>
                        </div>
                        <div>
                            <p className={`${theme.text.heading} text-3xl font-black tracking-tight leading-none mb-1 text-themeText`}>{stat.value}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text.muted}`}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. MAIN DASHBOARD SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Today's Schedule */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className={`${theme.text.heading} text-xl text-themeText tracking-tight`}><i className="fa-regular fa-clock text-themeTextSec opacity-70 mr-2"></i> Today's Itinerary</h2>
                        <button onClick={() => setActiveTab('timetable')} className="text-[10px] font-black text-themeAccent hover:text-themeText uppercase tracking-widest transition-colors">
                            Full Timetable &rarr;
                        </button>
                    </div>

                    <div className="bg-themePanel shadow-2xl border-theme border-themeBorder rounded-themePanel p-2 overflow-hidden">
                        {dashboardData.schedule.length === 0 ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                                <i className="fa-solid fa-mug-hot text-4xl text-themeTextSec opacity-50 mb-3"></i>
                                <h3 className="text-sm font-black text-themeText">No Classes Today</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1">You have a clear itinerary.</p>
                            </div>
                        ) : dashboardData.schedule.map((cls) => {
                            const status = getClassStatus(cls.start_time, cls.end_time);
                            return (
                                <div key={cls.id} className={`flex gap-6 p-5 rounded-themePanel transition-all duration-300 ${status === 'active' ? 'bg-themeElevated border-theme border-themeBorderStrong shadow-lg' : `hover:bg-themeElevated border-theme border-transparent ${status === 'completed' ? 'opacity-50 grayscale' : ''}`}`}>
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center justify-start gap-1 w-20 shrink-0 border-r-theme border-themeBorder pr-4">
                                        <span className={`text-sm font-black tracking-tight ${status === 'completed' ? theme.text.muted : 'text-themeText'}`}>
                                            {formatTime(cls.start_time).split(' ')[0]}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text.muted}`}>
                                            {formatTime(cls.start_time).split(' ')[1]}
                                        </span>
                                    </div>

                                    {/* Class Card */}
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold ${status === 'completed' ? 'text-themeTextSec line-through' : 'text-themeText'} truncate`}>
                                                    {cls.subjects?.name || cls.subject_id || "Course Name"}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-themeTextSec">
                                                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-users"></i> {cls.batch_id}</span>
                                                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {cls.room_name || "TBA"}</span>
                                                    <span className="flex items-center gap-1.5 text-themeAccent"><i className="fa-solid fa-hashtag"></i> {cls.subjects?.code || "CODE"}</span>
                                                </div>
                                            </div>
                                            {status === 'active' && (
                                                <span className="bg-themeAccent text-themePanel px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1.5 shadow-sm">
                                                    <span className="w-1.5 h-1.5 bg-themePanel rounded-full animate-pulse"></span> Ongoing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Action Items & Notices */}
                <div className="flex flex-col gap-6">
                    <h2 className={`${theme.text.heading} text-xl text-themeText tracking-tight px-2`}><i className="fa-solid fa-thumbtack text-themeTextSec opacity-70 mr-2"></i> Action Items</h2>

                    <div className="flex flex-col gap-4">
                        {dashboardData.actionItems.length === 0 ? (
                            <div className="bg-themePanel shadow-2xl border-theme border-themeBorder p-6 rounded-themePanel text-center">
                                <p className="text-xs font-bold text-themeTextSec opacity-70 uppercase tracking-widest">Inbox Zero. No pending tasks.</p>
                            </div>
                        ) : dashboardData.actionItems.map((task, index) => (
                            <div key={index} onClick={() => setActiveTab(task.tab)} className={`bg-themePanel shadow-2xl border-theme border-themeBorder p-5 rounded-themePanel hover:bg-themeElevated hover:border-themeBorderStrong transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden`}>
                                {task.urgent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-themeAccent"></div>}

                                <div className="flex justify-between items-start mb-2 pl-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme ${task.type === 'Approval' ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' : 'bg-themeElevated text-themeTextSec border-themeBorder'}`}>
                                        {task.type}
                                    </span>
                                </div>

                                <h3 className="text-sm font-black text-themeText mb-1 group-hover:text-themeAccent transition-colors pl-2 leading-tight">{task.title}</h3>
                                <p className={`text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest mb-4 pl-2`}>{task.subtitle}</p>

                                <div className="flex items-center justify-between pt-3 border-t-theme border-themeBorder pl-2">
                                    <span className={`text-[10px] font-semibold ${theme.text.secondary} flex items-center gap-1.5`}>
                                        <div className="w-5 h-5 rounded-md bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center"><i className="fa-solid fa-user text-[9px] text-themeTextSec"></i></div>
                                        {task.student}
                                    </span>
                                    <div className="w-7 h-7 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center text-themeTextSec opacity-70 group-hover:bg-themeAccent group-hover:text-themePanel group-hover:border-themeAccent transition-all shadow-sm">
                                        <i className="fa-solid fa-arrow-right -rotate-45 text-[10px]"></i>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Quick Action Card (Announcements) */}
                        <div onClick={() => setActiveTab('notices')} className="mt-2 bg-themeElevated shadow-2xl p-6 rounded-themePanel border-theme border-themeBorderStrong text-themeText relative overflow-hidden group cursor-pointer hover:border-themeAccent transition-all hover:-translate-y-1 duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-themePanel rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 opacity-50"></div>
                            <div className="w-10 h-10 rounded-themePanel bg-themePanel border-theme border-themeBorderStrong flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                <i className="fa-solid fa-bullhorn text-themeAccent text-lg"></i>
                            </div>
                            <h3 className="text-sm font-black mb-1 text-themeText">Campus Announcements</h3>
                            <p className={`text-xs ${theme.text.secondary} font-medium mb-4 relative z-10`}>
                                {dashboardData.noticesCount > 0
                                    ? `${dashboardData.noticesCount} new notices broadcasted recently.`
                                    : "No new announcements this week."}
                            </p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeAccent flex items-center gap-2 relative z-10">
                                View Broadcaster <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}