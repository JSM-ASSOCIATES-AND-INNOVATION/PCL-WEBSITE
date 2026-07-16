/* eslint-disable */
import React from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { useSyncEngine } from "../../../hooks/useSyncEngine";

export default function StudentDashboard({ setActiveTab }) {
    const { userSession } = useERP();

    // --- ZERO-LATENCY SYNC ENGINE ---
    const { data: dashboardData, isSyncing } = useSyncEngine(
        `student_dashboard_${userSession?.id}`,
        async () => {
            if (!userSession?.id) throw new Error("No session");

            // 1. Fetch Profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', userSession.db_id || userSession.id).single();
            const firstName = profile?.full_name?.split(' ')[0] || "Student";
            const batch = profile?.academic_batch || userSession.academic_batch;

            // 2. Fetch Latest Analytics (Using defaults if missing in profile)
            const cgpa = profile?.cgpa || 0;
            const credits = profile?.total_credits_earned || 0;

            // 3. Fetch Overall Attendance (Dynamic Calculation)
            const { count: attendedCount } = await supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', userSession.db_id || userSession.id).eq('status', 'present');
            const { count: totalClasses } = await supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('student_id', userSession.db_id || userSession.id).neq('status', 'excused');
            const attendancePct = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 0;

            // 4. Fetch Pending Fees
            const { data: fees } = await supabase.from('fee_invoices').select('amount_due').eq('student_id', userSession.db_id || userSession.id).eq('status', 'pending');
            const pendingFeesTotal = fees ? fees.reduce((sum, fee) => sum + Number(fee.amount_due), 0) : 0;

            // 5. Fetch Today's Timetable
            const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const { data: scheduleData } = await supabase.from('timetable')
                .select('*, subjects(name, code)')
                .eq('batch_id', batch)
                .eq('day_of_week', todayDay)
                .order('start_time', { ascending: true });

            const formattedSchedule = (scheduleData || []).map(cls => {
                const now = new Date();
                const currentHour = now.getHours();
                const startHour = parseInt(cls.start_time.split(':')[0]);
                const endHour = parseInt(cls.end_time.split(':')[0]);

                let status = "upcoming";
                if (currentHour >= endHour) status = "completed";
                else if (currentHour >= startHour && currentHour < endHour) status = "active";

                return {
                    id: cls.id,
                    time: `${cls.start_time.substring(0, 5)} - ${cls.end_time.substring(0, 5)}`,
                    subject: cls.subjects?.name || 'Class',
                    code: cls.subjects?.code || 'N/A',
                    room: cls.room,
                    status
                };
            });

            // 6. Fetch Upcoming Deadlines
            const { data: assignments } = await supabase.from('assignments')
                .select('id, title, due_date, subjects(name)')
                .eq('batch_id', batch)
                .gte('due_date', new Date().toISOString())
                .order('due_date', { ascending: true })
                .limit(3);

            // 7. Fetch Recent Notices Count
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: noticesCount } = await supabase.from('admin_notices')
                .select('id', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo)
                .in('target_audience', ['student', 'global']);

            return {
                profile: { name: firstName, batch },
                stats: {
                    cgpa: cgpa.toFixed(2),
                    attendance: `${attendancePct}%`,
                    credits: credits.toString(),
                    pendingFees: pendingFeesTotal
                },
                schedule: formattedSchedule,
                deadlines: assignments || [],
                noticesCount: noticesCount || 0
            };
        },
        [userSession]
    );

    // Helpers
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    const todayStr = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

    // ONLY show loader if we have NO cached data at all. This prevents blocking loaders on refetches.
    if (!dashboardData) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center animate-fade-in">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70">Aggregating Enterprise Data...</p>
            </div>
        );
    }

    const quickStats = [
        { label: "Current CGPA", value: dashboardData.stats.cgpa, icon: "fa-solid fa-chart-line", color: "text-emerald-500" },
        { label: "Overall Attendance", value: dashboardData.stats.attendance, icon: "fa-solid fa-user-check", color: parseInt(dashboardData.stats.attendance) >= 75 ? "text-themeAccent" : "text-rose-500" },
        { label: "Total Credits", value: dashboardData.stats.credits, icon: "fa-solid fa-award", color: "text-blue-500" },
        { label: "Pending Fees", value: formatCurrency(dashboardData.stats.pendingFees), icon: "fa-solid fa-file-invoice-dollar", color: dashboardData.stats.pendingFees > 0 ? "text-rose-400" : "text-themeTextSec" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* Background Sync Indicator */}
            {isSyncing && <div className="fixed top-4 right-4 lg:bottom-4 lg:top-auto z-50 bg-themeElevated border-theme border-themeBorderStrong text-themeAccent px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-fade-in"><i className="fa-solid fa-cloud-arrow-down"></i> Syncing</div>}

            {/* 1. WELCOME BANNER (Mobile Optimized) */}
            <div className="bg-themeElevated border-theme border-themeBorder rounded-themePanel p-6 lg:p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-themeAccent font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-2"><i className="fa-regular fa-calendar mr-1"></i> {todayStr}</p>
                        <h1 className="text-2xl lg:text-4xl font-black text-themeText tracking-tight mb-2 leading-tight">
                            Welcome back,<br className="md:hidden" /> <span className="text-themeText">{dashboardData.profile.name}</span>.
                        </h1>
                        <p className="text-themeTextSec text-xs lg:text-sm font-medium">
                            {dashboardData.schedule.filter(c => c.status !== 'completed').length} classes remaining today. {dashboardData.deadlines.length} upcoming deadlines.
                        </p>
                    </div>

                    <button 
                        onClick={() => setActiveTab && setActiveTab('assignments')}
                        className="w-full md:w-auto px-8 py-4 bg-themeAccent hover:opacity-90 text-[#0a0a0a] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 shrink-0"
                    >
                        <span className="relative flex items-center justify-center">
                            <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Submit Task
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. QUICK STATS GRID (Mobile Optimized 2x2) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {quickStats.map((stat, index) => (
                    <div key={index} className="bg-themeElevated border-theme border-themeBorder p-5 lg:p-6 rounded-themePanel flex flex-col gap-3 lg:gap-4 hover:border-themeBorderStrong hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center bg-themeApp ${stat.color} shrink-0`}>
                            <i className={`${stat.icon} text-lg lg:text-xl`}></i>
                        </div>
                        <div>
                            <p className="text-2xl lg:text-3xl font-black text-themeText tracking-tight leading-none mb-1">{stat.value}</p>
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec leading-tight">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. MAIN DASHBOARD SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left Column: Timetable */}
                <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight`}><i className="fa-solid fa-clock text-themeTextSec opacity-70 mr-2"></i> Today's Schedule</h2>
                    </div>

                    <div className={`bg-themeElevated border-theme border-themeBorder rounded-themePanel p-2 overflow-hidden hover:shadow-xl transition-all duration-300`}>
                        {dashboardData.schedule.length === 0 ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                                <i className="fa-solid fa-mug-hot text-4xl text-neutral-700 mb-3"></i>
                                <h3 className="text-sm font-black text-themeText">No Classes Today</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70 mt-1 max-w-xs px-4">Enjoy your free time or catch up on readings.</p>
                            </div>
                        ) : (
                            dashboardData.schedule.map((cls) => (
                                <div key={cls.id} className={`flex gap-4 lg:gap-6 p-4 lg:p-5 rounded-themePanel transition-colors duration-300 ${cls.status === 'active' ? 'bg-themeApp border-theme border-themeBorderStrong ' : `hover:bg-themeApp border-theme border-transparent ${cls.status === 'completed' ? 'opacity-50 grayscale' : ''}`}`}>
                                    <div className="flex flex-col items-center justify-start gap-1 w-16 lg:w-20 shrink-0 border-r-theme border-themeBorder pr-3 lg:pr-4">
                                        <span className={`text-xs lg:text-sm font-black tracking-tight ${cls.status === 'completed' ? theme.text.muted : 'text-themeText'}`}>{cls.time.split(' - ')[0]}</span>
                                        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted}`}>{cls.time.split(' - ')[1]}</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold ${cls.status === 'completed' ? 'text-themeTextSec line-through' : 'text-themeText'} truncate`}>
                                                    {cls.subject}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] lg:text-xs text-themeTextSec">
                                                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {cls.room || "TBA"}</span>
                                                    <span className="flex items-center gap-1.5 text-themeAccent"><i className="fa-solid fa-hashtag"></i> {cls.code || "CODE"}</span>
                                                </div>
                                            </div>
                                            {cls.status === 'active' && (
                                                <span className="bg-themeAccent text-themePanel px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center w-fit gap-1.5 shadow-sm shrink-0">
                                                    <span className="w-1.5 h-1.5 bg-themePanel rounded-full animate-pulse"></span> Ongoing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Deadlines & Widgets */}
                <div className="flex flex-col gap-4 lg:gap-6">
                    <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight px-2`}><i className="fa-solid fa-thumbtack text-themeTextSec opacity-70 mr-2"></i> Action Items</h2>
                    
                    <div className="flex flex-col gap-3 lg:gap-4">
                        {dashboardData.deadlines.length === 0 ? (
                            <div className="bg-themeElevated border-theme border-themeBorder p-6 rounded-themePanel text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                <p className="text-[10px] lg:text-xs font-bold text-themeTextSec opacity-70 uppercase tracking-widest">No immediate deadlines.</p>
                            </div>
                        ) : (
                            dashboardData.deadlines.map((task) => {
                                const dueDate = new Date(task.due_date);
                                const isUrgent = (dueDate.getTime() - new Date().getTime()) < 172800000;

                                return (
                                    <div key={task.id} className={`bg-themeElevated border-theme border-themeBorder p-5 rounded-themePanel hover:border-themeBorderStrong hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
                                        {isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>}
                                        <h3 className="text-xs lg:text-sm font-black text-themeText mb-1 group-hover:text-themeAccent transition-colors pl-2 leading-tight">{task.title}</h3>
                                        <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.muted} mb-4 pl-2`}>{task.subjects?.name || 'Task'}</p>
                                        <div className="flex items-center justify-between mt-auto pl-2">
                                            <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isUrgent ? 'text-rose-400 bg-themeApp px-2 py-1 rounded border-theme border-themeBorderStrong' : theme.text.muted}`}>
                                                <i className="fa-regular fa-clock"></i> {dueDate.toLocaleDateString('en-GB')}
                                            </span>
                                            <div className={`w-8 h-8 rounded-themePanel bg-themeApp border-theme border-themeBorderStrong flex items-center justify-center group-hover:bg-themeAccent group-hover:text-black group-hover:border-themeAccent transition-colors `}>
                                                <i className="fa-solid fa-arrow-right -rotate-45 text-xs"></i>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Quick Action Card (Announcements) */}
                        <div 
                            onClick={() => setActiveTab && setActiveTab('notices')}
                            className="mt-2 bg-themeElevated p-6 rounded-themePanel border-theme border-themeBorder text-themeText relative group cursor-pointer hover:border-themeBorderStrong hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-themePanel bg-themeApp border-theme border-themeBorderStrong flex items-center justify-center mb-4">
                                <i className="fa-solid fa-bullhorn text-themeAccent text-lg"></i>
                            </div>
                            <h3 className="text-sm font-black mb-1 text-themeText relative z-10">Campus Announcements</h3>
                            <p className="text-[11px] lg:text-xs text-themeTextSec font-medium mb-4 relative z-10">
                                {dashboardData.noticesCount > 0
                                    ? `${dashboardData.noticesCount} new notices posted recently.`
                                    : "Check the board for updates."}
                            </p>
                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent group-hover:text-themeAccent flex items-center gap-2 relative z-10">
                                View Board <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}