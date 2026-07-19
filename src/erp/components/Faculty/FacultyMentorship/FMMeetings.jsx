import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function FMMeetings() {
    const { userSession } = useERP();
    const [view, setView] = useState("upcoming"); // upcoming, history, slots
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [meetingHistory, setMeetingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, [userSession?.db_id]);

    const fetchMeetings = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('mentorship_meetings')
                .select(`
                    id, date, time, mode, purpose, status, summary, action_items, next_follow_up,
                    student_id, profiles:student_id(name)
                `)
                .eq('faculty_id', userSession.db_id)
                .order('date', { ascending: false })
                .order('time', { ascending: false });

            if (error) throw error;

            const upcoming = [];
            const history = [];

            data.forEach(m => {
                const isUpcoming = m.date >= today && ['Pending Confirmation', 'Confirmed'].includes(m.status);
                const displayDate = m.date === today ? "Today" : 
                                    m.date === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? "Tomorrow" : 
                                    m.date;

                const formatted = {
                    id: m.id,
                    db_id: m.id,
                    studentName: m.profiles?.name || 'Unknown',
                    date: displayDate,
                    rawDate: m.date,
                    time: m.time,
                    type: m.purpose,
                    mode: m.mode,
                    status: m.status,
                    summary: m.summary || "No summary provided.",
                    followup: m.next_follow_up || "None"
                };

                if (isUpcoming) upcoming.push(formatted);
                else history.push(formatted);
            });

            // Sort upcoming ascending by date
            upcoming.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

            setUpcomingMeetings(upcoming);
            setMeetingHistory(history);
        } catch (error) {
            console.error("Error fetching meetings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async (meeting) => {
        try {
            const { error } = await supabase
                .from('mentorship_meetings')
                .update({ status: 'Confirmed' })
                .eq('id', meeting.db_id);
            
            if (error) throw error;
            fetchMeetings();
            window.erpDialog?.alert("Meeting Confirmed!");
        } catch (error) {
            console.error("Error confirming meeting:", error);
            window.erpDialog?.alert("Failed to confirm meeting.", "error");
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            
            {/* Premium Segmented Control */}
            <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-full p-1 flex relative w-full md:w-[400px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] overflow-hidden shrink-0">
                {/* Active Slider Background */}
                <div 
                    className="absolute top-1 bottom-1 bg-blue-500 rounded-full transition-all duration-300 ease-out shadow-md"
                    style={{
                        width: 'calc(33.333% - 2.6px)',
                        left: view === 'upcoming' ? '4px' : view === 'history' ? 'calc(33.333% + 1.3px)' : 'calc(66.666% - 1.3px)'
                    }}
                ></div>
                
                <button 
                    onClick={() => setView('upcoming')}
                    className={`flex-1 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors relative z-10 flex items-center justify-center gap-1.5 md:gap-2 ${
                        view === 'upcoming' ? 'text-white' : 'text-themeTextSec hover:text-themeText'
                    }`}
                >
                    <i className="fa-solid fa-calendar-day"></i> Upcoming
                </button>
                <button 
                    onClick={() => setView('history')}
                    className={`flex-1 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors relative z-10 flex items-center justify-center gap-1.5 md:gap-2 ${
                        view === 'history' ? 'text-white' : 'text-themeTextSec hover:text-themeText'
                    }`}
                >
                    <i className="fa-solid fa-clock-rotate-left"></i> History
                </button>
                <button 
                    onClick={() => setView('slots')}
                    className={`flex-1 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors relative z-10 flex items-center justify-center gap-1.5 md:gap-2 ${
                        view === 'slots' ? 'text-white' : 'text-themeTextSec hover:text-themeText'
                    }`}
                >
                    <i className="fa-solid fa-gear"></i> Config
                </button>
            </div>

            {/* UPCOMING VIEW */}
            {view === 'upcoming' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {upcomingMeetings.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-themeElevated/30 border-[length:var(--border-width)] border-themeBorder border-dashed rounded-3xl text-center shadow-inner">
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-5 border-[length:var(--border-width)] border-blue-500/20">
                                <i className="fa-solid fa-calendar-check text-3xl text-blue-500/80"></i>
                            </div>
                            <h3 className="text-xl font-black text-themeText tracking-tight mb-2">No Upcoming Meetings</h3>
                            <p className="text-xs font-bold text-themeTextSec max-w-sm leading-relaxed px-4">Your schedule is completely clear. Any new student bookings will automatically appear here once requested.</p>
                        </div>
                    ) : (
                        upcomingMeetings.map(mtg => (
                            <div key={mtg.id} className="group relative bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center hover:border-blue-500/30 hover:shadow-themeElevated transition-all overflow-hidden">
                                {/* Accent Status Line */}
                                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${mtg.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                
                                <div className="flex items-center gap-4 w-full md:w-64 shrink-0 pl-1">
                                    <div className="flex flex-col items-center justify-center bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-xl w-16 h-16 shrink-0 shadow-sm">
                                        <span className="text-xs font-black text-themeText">{mtg.date}</span>
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase">{mtg.time}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-themeText">{mtg.studentName}</span>
                                        <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">
                                            <i className={`fa-solid ${mtg.mode === 'Online' ? 'fa-video text-emerald-500' : 'fa-handshake text-amber-500'} mr-1.5`}></i> 
                                            {mtg.mode}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-themeBorderStrong pt-4 md:pt-0 md:pl-6 pl-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1 block">Purpose</span>
                                    <span className="text-xs font-bold text-themeText leading-relaxed block">{mtg.type}</span>
                                    
                                    {mtg.status === "Pending Confirmation" && (
                                        <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 text-amber-500 border-[length:var(--border-width)] border-amber-500/20 text-[9px] font-black uppercase tracking-widest rounded-md">
                                            <i className="fa-solid fa-hourglass-half"></i> Needs Confirmation
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-themeBorderStrong pl-1">
                                    {mtg.status === "Confirmed" ? (
                                        <button 
                                            onClick={() => window.erpDialog?.alert("Meeting execution form opened.")}
                                            className="w-full md:w-auto px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-play"></i> Conduct Meeting
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleConfirm(mtg)}
                                            className="flex-1 md:flex-none px-5 py-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-[length:var(--border-width)] border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                        >
                                            <i className="fa-solid fa-check"></i> Confirm
                                        </button>
                                    )}
                                    <button className="flex-1 md:flex-none px-5 py-3 bg-themeElevated text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-clock"></i> Reschedule
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    {meetingHistory.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-themeElevated/30 border-[length:var(--border-width)] border-themeBorder border-dashed rounded-3xl text-center shadow-inner">
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-5 border-[length:var(--border-width)] border-blue-500/20">
                                <i className="fa-solid fa-clock-rotate-left text-3xl text-blue-500/80"></i>
                            </div>
                            <h3 className="text-xl font-black text-themeText tracking-tight mb-2">No Past Meetings</h3>
                            <p className="text-xs font-bold text-themeTextSec max-w-sm leading-relaxed px-4">Your meeting history is currently empty. Completed meetings will be archived here.</p>
                        </div>
                    ) : (
                        meetingHistory.map(mtg => (
                            <div key={mtg.id} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-2xl p-5 hover:border-themeBorderStrong transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-[length:var(--border-width)] border-themeBorderStrong pb-4 mb-4 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border-[length:var(--border-width)] border-emerald-500/20">
                                            <i className="fa-solid fa-check-double text-emerald-500 text-lg"></i>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-themeText">{mtg.studentName}</span>
                                            <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">
                                                {mtg.date} • {mtg.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 self-end md:self-auto bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20">
                                        <i className="fa-solid fa-pen-to-square mr-1.5"></i> Edit Notes
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 flex items-center gap-1.5"><i className="fa-solid fa-align-left"></i> Meeting Summary</span>
                                        <p className="text-xs text-themeText leading-relaxed bg-themeElevated/50 p-3 rounded-xl border border-themeBorder/50">{mtg.summary}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 flex items-center gap-1.5"><i className="fa-solid fa-list-check"></i> Action Items / Follow-up</span>
                                        <p className="text-xs text-themeText leading-relaxed p-3 bg-amber-500/5 rounded-xl border-l-2 border-amber-500 border-y border-r border-themeBorder/50">{mtg.followup}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* SLOTS CONFIG */}
            {view === 'slots' && (
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start animate-fade-in relative overflow-hidden shadow-sm">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="w-24 h-24 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border-[length:var(--border-width)] border-blue-500/20 shadow-inner relative z-10">
                        <i className="fa-solid fa-robot text-4xl text-blue-500 drop-shadow-sm"></i>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-2xl font-black text-themeText tracking-tight mb-2">Automated Slot Generation</h3>
                        <p className="text-xs font-bold text-themeTextSec leading-relaxed max-w-xl mx-auto md:mx-0 mb-6">
                            The ERP automatically cross-references your academic timetable, institutional holidays, and working hours to publish available mentorship slots for your students.
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border-[length:var(--border-width)] border-emerald-500/20 rounded-xl">
                                <i className="fa-solid fa-rotate text-emerald-500 animate-[spin_4s_linear_infinite]"></i>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Timetable Sync Active</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-xl">
                                <i className="fa-solid fa-users text-themeTextSec"></i>
                                <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Max Meetings/Week: 10</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
