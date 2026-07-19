/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

// No sub-modules needed in expanded mode

export default function Mentorship() {
    const { userSession } = useERP();

    // --- MENTORSHIP STATE ---
    const [mentorData, setMentorData] = useState(() => {
        const cached = sessionStorage.getItem(`mentorship_mentor_${userSession?.db_id}`);
        return cached ? JSON.parse(cached) : null;
    });
    const [meetingHistory, setMeetingHistory] = useState(() => {
        const cached = sessionStorage.getItem(`mentorship_meetings_${userSession?.db_id}`);
        return cached ? JSON.parse(cached) : [];
    });

    // --- GRIEVANCE AND UI STATE MOVED OUT ---
    // Grievances are handled centrally in StudentApprovals or Helpdesk

    // --- DATA FETCHING ---
    const fetchData = async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;

        setIsLoading(true);
        try {
            // 1. Mentorship Data
            const { data: allocData } = await supabase
                .from('mentorship')
                .select('faculty_id')
                .eq('student_id', studentId)
                .order('allocated_at', { ascending: false })
                .limit(1);

            let mentorId = allocData?.[0]?.faculty_id;
            
            if (mentorId) {
                const { data: mentor } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone, department')
                    .eq('id', mentorId)
                    .single();
                
                if (mentor) {
                    setMentorData(mentor);
                }
            }

            // 2. Meeting History (Logged by Faculty)
            const { data: meetingData } = await supabase
                .from('mentorship_meetings')
                .select('*')
                .eq('student_id', studentId)
                .order('scheduled_at', { ascending: false });
            
            if (meetingData) setMeetingHistory(meetingData);

            // Profiles no longer needed here as grievances are handled separately

            // Cache everything for zero-lag
            sessionStorage.setItem(`mentorship_mentor_${studentId}`, JSON.stringify(mentorDataToCache));
            sessionStorage.setItem(`mentorship_meetings_${studentId}`, JSON.stringify(meetingData || []));

        } catch (error) {
            console.error("Failed to fetch Support Hub data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userSession]);


    // --- HANDLERS ---

    // UI Helpers
    const getStatusBadge = (status, isUrgent) => {
        if (isUrgent && status === 'pending') return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500/30">Urgent Pending</span>;
        switch (status) {
            case 'pending': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30">Pending</span>;
            case 'scheduled': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Accepted</span>;
            case 'declined': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-500 border border-rose-500/30">Declined</span>;
            case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-500 border border-blue-500/30">Completed</span>;
            case 'resolved': return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Resolved</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-neutral-500/20 text-neutral-400 border border-neutral-700">{status}</span>;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in selection:bg-themeElevated">
            
            {/* Header Banner */}
            <div className={`rounded-themePanel p-6 lg:p-8 relative overflow-hidden bg-themeAccent text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-themeElevated`}>
                <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-people-arrows text-white text-2xl lg:text-3xl drop-shadow-sm"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-sm`}>Mentorship Hub</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium">Manage your mentorship profile, leaves, achievements, and grievances.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full lg:w-auto shrink-0 mt-4 lg:mt-0 flex flex-col items-center lg:items-end gap-4">
                    {/* Grievance reporting is now managed centrally in StudentApprovals */}
                </div>
            </div>

            {/* --- MENTORSHIP MODULE --- */}
            <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in relative z-10 mt-2">
                    
                    {/* INFO ALERT: Offline Meetings */}
                    <div className="bg-themeAccent/10 border border-themeAccent/30 rounded-2xl p-4 lg:p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-themeAccent/20 flex items-center justify-center shrink-0 border border-themeAccent/30 text-themeAccent">
                            <i className="fa-solid fa-circle-info"></i>
                        </div>
                        <div>
                            <h4 className="text-themeAccent font-black text-sm uppercase tracking-widest mb-1">Offline Mentorship Protocol</h4>
                            <p className="text-xs lg:text-sm text-themeText font-medium leading-relaxed">
                                All mentorship meetings are conducted offline. You cannot log or request meetings through this portal. Your official faculty mentor is responsible for scheduling, conducting, and logging all mentorship sessions into your ledger.
                            </p>
                        </div>
                    </div>

                    {/* Mentor Banner */}
                    {mentorData ? (
                        <div className="bg-themePanel rounded-2xl p-6 lg:p-8 relative overflow-hidden border border-themeBorder flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 shadow-sm">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-themeAccent/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                            
                            <div className="relative shrink-0 z-10 group">
                                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl flex items-center justify-center border-4 border-themeApp bg-themeElevated text-3xl lg:text-5xl font-black text-themeText shadow-xl group-hover:scale-105 transition-transform duration-500">
                                    {mentorData.full_name.split(' ').map(n => n[0]).join('').replace('.', '').substring(0, 2)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500 rounded-full border-4 border-themeApp flex items-center justify-center shadow-lg shadow-emerald-500/20" title="Assigned & Active">
                                    <i className="fa-solid fa-check text-white text-xs lg:text-sm font-black"></i>
                                </div>
                            </div>

                            <div className="flex-1 text-center lg:text-left relative z-10 w-full">
                                <p className="text-themeAccent font-black text-[10px] uppercase tracking-widest mb-2 flex items-center justify-center lg:justify-start gap-2">
                                    <i className="fa-solid fa-star text-amber-500"></i> Official Faculty Mentor
                                </p>
                                <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-2 text-themeText drop-shadow-md">{mentorData.full_name}</h2>
                                <p className="text-themeTextSec text-xs lg:text-sm font-bold uppercase tracking-widest mb-6">Faculty • {mentorData.department}</p>

                                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-full sm:w-auto">
                                    <a href={`mailto:${mentorData.email}`} className="px-6 py-3 bg-themePanel hover:bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest text-themeText transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-sm">
                                        <i className="fa-solid fa-envelope text-themeAccent group-hover:scale-125 transition-transform"></i> Email Mentor
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full py-20 text-center border-2 border-dashed border-themeBorder rounded-2xl bg-themePanel px-4">
                            <i className="fa-solid fa-user-slash text-5xl text-themeTextSec mb-4 opacity-50"></i>
                            <h3 className="text-xl font-black text-themeText mb-2">No Mentor Assigned</h3>
                            <p className="text-xs text-themeTextSec max-w-sm mx-auto">Please contact the administration office to get your faculty mentor assigned to your profile.</p>
                        </div>
                    )}

                    {/* Meeting History (Full Width) */}
                    <div className={`flex flex-col gap-5 ${!mentorData && 'opacity-50 pointer-events-none'}`}>
                        <h3 className="text-xl font-black text-themeText flex items-center gap-3 pl-1">
                            <div className="w-10 h-10 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <i className="fa-solid fa-clock-rotate-left text-themeAccent"></i>
                            </div>
                            Official Session Ledger
                        </h3>

                        <div className="flex flex-col gap-4">
                            {meetingHistory.length > 0 ? (
                                meetingHistory.map(meeting => (
                                    <div key={meeting.id} className={`bg-themePanel p-5 rounded-2xl border border-themeBorder flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all hover:bg-themeElevated hover:shadow-sm hover:border-themeAccent/50 group`}>
                                        <div className="flex flex-col shrink-0 min-w-[120px] bg-themeApp p-4 rounded-xl border-[length:var(--border-width)] border-themeBorderStrong text-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                                            <span className="text-themeAccent text-[10px] lg:text-xs font-black uppercase tracking-widest mb-1.5">
                                                {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className="text-themeText font-black text-2xl lg:text-3xl leading-none mb-1.5">
                                                {new Date(meeting.scheduled_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-themeTextSec text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
                                                {new Date(meeting.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-themeText font-black text-base lg:text-lg truncate">{meeting.topic}</h4>
                                                {getStatusBadge(meeting.status, meeting.is_urgent)}
                                            </div>
                                            <p className="text-xs font-bold text-themeTextSec leading-relaxed">Logged by {mentorData?.full_name}</p>
                                        </div>

                                        {meeting.notes && (
                                            <button onClick={() => window.erpDialog.alert(meeting.notes, "Meeting Notes")} className="w-full sm:w-auto px-6 py-4 bg-themeApp hover:bg-themeElevated border-[length:var(--border-width)] border-themeBorder rounded-xl text-xs font-black uppercase tracking-widest text-themeText transition-colors shrink-0 active:scale-95 shadow-sm flex items-center justify-center">
                                                <i className="fa-regular fa-file-lines mr-2 text-themeAccent"></i> Read Log
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center bg-themePanel border-2 border-dashed border-themeBorder rounded-2xl">
                                    <i className="fa-solid fa-mug-hot text-5xl text-themeTextSec opacity-50 mb-5"></i>
                                    <p className="text-lg font-black text-themeText">No Sessions Logged</p>
                                    <p className="text-xs font-bold text-themeTextSec mt-2 max-w-sm mx-auto leading-relaxed">Your mentor has not logged any offline meetings with you yet. Sessions will appear here automatically once logged.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            
        </div>
    );
}