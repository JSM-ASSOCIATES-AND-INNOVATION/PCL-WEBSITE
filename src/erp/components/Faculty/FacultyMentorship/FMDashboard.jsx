import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

const FlipCard = ({ icon, colorClass, title, value, backContent, onClick }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div 
            className="group [perspective:1000px] h-32 w-full cursor-pointer" 
            onClick={() => { setIsFlipped(!isFlipped); if(onClick) onClick(); }}
        >
            <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'}`}>
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col items-start justify-center shadow-sm">
                    <div className="flex justify-between w-full items-start mb-2">
                        <i className={`fa-solid ${icon} ${colorClass} text-xl`}></i>
                    </div>
                    <span className="text-2xl font-black text-themeText">{value}</span>
                    <span className="text-[10px] font-black text-themeTextSec uppercase tracking-widest leading-tight">{title}</span>
                </div>
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-themePanel p-4 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold text-themeTextSec leading-relaxed">{backContent}</p>
                    <div className="mt-3 px-3 py-1 bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded text-[9px] font-black uppercase tracking-widest text-themeText">
                        Tap to flip
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function FMDashboard({ setActiveTab, setPendingCount }) {
    const { userSession } = useERP();
    const [stats, setStats] = useState({
        totalMentees: 0,
        meetingsToday: 0,
        upcomingMeetings: 0,
        pendingLeaves: 0,
        pendingInternships: 0,
        pendingResearch: 0,
        attendanceShortage: 0,
        unreadRequests: 0,
        loading: true
    });

    const [todaysMeetings, setTodaysMeetings] = useState([]);
    const [atRiskMentees, setAtRiskMentees] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [userSession?.db_id]);

    const fetchDashboardData = async () => {
        if (!userSession?.db_id) return;
        
        try {
            setStats(prev => ({ ...prev, loading: true }));

            // 1. Fetch total mentees and their IDs
            const { data: menteesData, error: menteesError } = await supabase
                .from('mentorship')
                .select('student_id, profiles:student_id(name, erp_id)')
                .eq('faculty_id', userSession.db_id);
            
            if (menteesError) throw menteesError;
            
            const menteeIds = menteesData.map(m => m.student_id);
            const menteesCount = menteeIds.length;

            let pendingLeaves = 0;
            let pendingInternships = 0;
            let pendingResearch = 0;

            if (menteesCount > 0) {
                const [leaves, internships, research] = await Promise.all([
                    supabase.from('student_leaves').select('id', { count: 'exact' }).in('student_id', menteeIds).eq('status', 'Pending Mentor Approval'),
                    supabase.from('internship_requests').select('id', { count: 'exact' }).in('student_id', menteeIds).eq('status', 'Submitted'),
                    supabase.from('research_submissions').select('id', { count: 'exact' }).in('student_id', menteeIds).eq('status', 'Submitted')
                ]);

                pendingLeaves = leaves.count || 0;
                pendingInternships = internships.count || 0;
                pendingResearch = research.count || 0;
            }

            const unreadRequests = pendingLeaves + pendingInternships + pendingResearch;
            if (setPendingCount) setPendingCount(unreadRequests);

            // 2. Fetch real attendance for At-Risk Mentees
            let atRisk = [];
            if (menteesCount > 0) {
                const { data: attendanceData } = await supabase
                    .from('attendance')
                    .select('student_id, status')
                    .in('student_id', menteeIds)
                    .in('status', ['Present', 'Absent']);
                
                if (attendanceData) {
                    const attendanceStats = {};
                    menteeIds.forEach(id => attendanceStats[id] = { total: 0, present: 0 });
                    
                    attendanceData.forEach(record => {
                        if (attendanceStats[record.student_id]) {
                            attendanceStats[record.student_id].total++;
                            if (record.status === 'Present') {
                                attendanceStats[record.student_id].present++;
                            }
                        }
                    });

                    menteesData.forEach(m => {
                        const stats = attendanceStats[m.student_id];
                        let percentage = 0;
                        if (stats && stats.total > 0) {
                            percentage = (stats.present / stats.total) * 100;
                        }
                        // Default logic if no attendance recorded yet
                        if (stats && stats.total > 0 && percentage < 75) {
                            atRisk.push({
                                id: m.student_id,
                                name: m.profiles?.name || 'Unknown',
                                erp_id: m.profiles?.erp_id || 'Unknown',
                                subject: 'Multiple Subjects',
                                attendance: Math.round(percentage)
                            });
                        }
                    });
                }
            }
            setAtRiskMentees(atRisk);

            // 3. Fetch meetings
            const today = new Date().toISOString().split('T')[0];
            const { data: meetings, error: meetingsError } = await supabase
                .from('mentorship_meetings')
                .select(`
                    id, date, time, purpose, mode, status, student_id, profiles:student_id (name)
                `)
                .eq('faculty_id', userSession.db_id)
                .in('status', ['Pending Confirmation', 'Confirmed'])
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (meetingsError) throw meetingsError;

            const meetingsToday = meetings.filter(m => m.date === today);
            const upcomingMeetingsList = meetings.filter(m => m.date > today);

            setStats({
                totalMentees: menteesCount,
                meetingsToday: meetingsToday.length,
                upcomingMeetings: upcomingMeetingsList.length,
                pendingLeaves,
                pendingInternships,
                pendingResearch,
                attendanceShortage: mockAtRisk.length,
                unreadRequests,
                loading: false
            });

            setTodaysMeetings(meetingsToday.map(m => ({
                id: m.id,
                studentName: m.profiles?.name || 'Unknown Student',
                time: m.time,
                purpose: m.purpose,
                mode: m.mode,
                status: m.status
            })));

        } catch (error) {
            console.error("Error fetching FM dashboard:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const handleMessage = (student) => {
        window.erpDialog?.alert(`Messaging module opened for ${student.name}`);
    };

    const handleSetMeeting = (student) => {
        window.erpDialog?.alert(`Meeting scheduling form opened for ${student.name}`);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab('mentees')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">View Mentees</span>
                </button>
                <button onClick={() => setActiveTab('inbox')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all group relative overflow-hidden">
                    {stats.unreadRequests > 0 && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white text-[8px] font-black">
                            {stats.unreadRequests}
                        </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-inbox"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">Pending Requests</span>
                </button>
                <button onClick={() => setActiveTab('meetings')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-calendar-plus"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">Schedule Meeting</span>
                </button>
                <button className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-rose-500 hover:shadow-[0_0_15px_rgba(243,24,73,0.15)] transition-all group opacity-50 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 transition-colors">
                        <i className="fa-solid fa-file-pdf"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">Download Reports</span>
                </button>
            </div>

            {/* Main Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Summary Cards */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div>
                        <h3 className={`${theme.text.heading} text-sm tracking-tight text-themeText flex items-center gap-2 mb-3`}>
                            <i className="fa-solid fa-chart-pie text-themeTextSec"></i>
                            Dashboard Summary
                        </h3>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <FlipCard 
                                icon="fa-users" colorClass="text-blue-500" 
                                title="Total Mentees" value={stats.loading ? '-' : stats.totalMentees}
                                backContent={`You are currently mentoring ${stats.totalMentees} students across all semesters.`}
                                onClick={() => setActiveTab('mentees')}
                            />
                            <FlipCard 
                                icon="fa-triangle-exclamation" colorClass="text-rose-500" 
                                title="Low Attendance" value={stats.attendanceShortage}
                                backContent={`${stats.attendanceShortage} students have fallen below the 75% attendance threshold.`}
                                onClick={() => {}}
                            />
                            <FlipCard 
                                icon="fa-calendar-day" colorClass="text-emerald-500" 
                                title="Meetings Today" value={stats.meetingsToday}
                                backContent={`You have ${stats.meetingsToday} scheduled meetings today and ${stats.upcomingMeetings} upcoming.`}
                                onClick={() => setActiveTab('meetings')}
                            />
                            <FlipCard 
                                icon="fa-house-medical" colorClass="text-amber-500" 
                                title="Pending Leaves" value={stats.pendingLeaves}
                                backContent={`There are ${stats.pendingLeaves} leave requests waiting for your approval.`}
                                onClick={() => setActiveTab('inbox')}
                            />
                            <FlipCard 
                                icon="fa-briefcase" colorClass="text-indigo-500" 
                                title="Pending Internships" value={stats.pendingInternships}
                                backContent={`You need to review ${stats.pendingInternships} internship requests.`}
                                onClick={() => setActiveTab('inbox')}
                            />
                            <FlipCard 
                                icon="fa-microscope" colorClass="text-purple-500" 
                                title="Pending Research" value={stats.pendingResearch}
                                backContent={`There are ${stats.pendingResearch} research submissions pending review.`}
                                onClick={() => setActiveTab('inbox')}
                            />
                        </div>
                    </div>

                    {/* At Risk Mentees Section */}
                    {atRiskMentees.length > 0 && (
                        <div>
                            <h3 className={`${theme.text.heading} text-sm tracking-tight text-rose-500 flex items-center gap-2 mb-3`}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                At-Risk Mentees (Attendance &lt; 75%)
                            </h3>
                            <div className="flex flex-col gap-3">
                                {atRiskMentees.map(student => (
                                    <div key={student.id} className="bg-themePanel border-[length:var(--border-width)] border-rose-500/30 rounded-themePanel p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-rose-500 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-black">
                                                {student.attendance}%
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-themeText">{student.name}</span>
                                                <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{student.erp_id} &bull; {student.subject}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <button 
                                                onClick={() => handleMessage(student)}
                                                className="flex-1 md:flex-none px-4 py-2 bg-themeElevated text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong hover:border-themeText rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                            >
                                                <i className="fa-regular fa-comment-dots"></i> Message
                                            </button>
                                            <button 
                                                onClick={() => handleSetMeeting(student)}
                                                className="flex-1 md:flex-none px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-[length:var(--border-width)] border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                            >
                                                <i className="fa-solid fa-calendar-plus"></i> Set Meeting
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (Today's Schedule) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <h3 className={`${theme.text.heading} text-sm tracking-tight text-themeText flex items-center gap-2 mb-2`}>
                        <i className="fa-solid fa-calendar-day text-themeTextSec"></i>
                        Today's Schedule
                    </h3>
                    
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col gap-4 h-full">
                        {stats.loading ? (
                            <div className="flex items-center justify-center py-10 opacity-50">
                                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-themeTextSec"></i>
                            </div>
                        ) : todaysMeetings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
                                <i className="fa-solid fa-mug-hot text-4xl text-themeTextSec mb-3"></i>
                                <span className="text-xs font-black uppercase tracking-widest text-themeText">Clear Schedule</span>
                                <span className="text-[10px] font-bold text-themeTextSec">No meetings planned for today.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-themeBorderStrong">
                                {todaysMeetings.map((mtg, idx) => (
                                    <div key={mtg.id} className="flex gap-4 relative z-10 cursor-pointer group" onClick={() => setActiveTab('meetings')}>
                                        <div className="w-6 h-6 rounded-full bg-themeElevated border-[2px] border-themeBorderStrong flex items-center justify-center mt-1 group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-themeTextSec group-hover:bg-blue-500"></div>
                                        </div>
                                        <div className="flex-1 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg p-3 group-hover:border-blue-500 transition-colors">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1 block">{mtg.time}</span>
                                            <span className="text-sm font-bold text-themeText block">{mtg.studentName}</span>
                                            <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{mtg.purpose} &bull; {mtg.mode}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <button onClick={() => setActiveTab('meetings')} className="mt-auto w-full py-3 border-[length:var(--border-width)] border-dashed border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest text-themeTextSec hover:text-themeText hover:border-themeText transition-colors flex items-center justify-center gap-2">
                            View Full Calendar <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
