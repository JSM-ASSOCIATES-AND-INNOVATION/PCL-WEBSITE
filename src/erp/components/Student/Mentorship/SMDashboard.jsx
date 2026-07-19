import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function SMDashboard({ setActiveTab }) {
    const { userSession } = useERP();
    const [mentor, setMentor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mocking cross-module integration stats for the dashboard presentation
    const stats = {
        pendingRequests: 2,
        attendanceStatus: 'On Track (82%)',
        activeLeaves: 1,
        internshipStatus: 'Recommended',
        researchStatus: 'Draft'
    };

    const upcomingMeeting = {
        date: "Tomorrow",
        time: "11:00 AM",
        mode: "In-Person",
        purpose: "Career Guidance"
    };

    const notifications = [
        { id: 1, type: "Approved", message: "Medical Leave approved by Mentor.", time: "2 hours ago", icon: "fa-house-medical text-emerald-500" },
        { id: 2, type: "Updated", message: "Internship Request marked as Recommended.", time: "1 day ago", icon: "fa-briefcase text-blue-500" },
        { id: 3, type: "Reminder", message: "Meeting scheduled for tomorrow at 11:00 AM.", time: "2 days ago", icon: "fa-clock text-amber-500" }
    ];

    useEffect(() => {
        fetchMentor();
    }, []);

    const fetchMentor = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);
        try {
            // Find who the mentor is
            const { data, error } = await supabase
                .from('mentorship')
                .select(`
                    faculty_id,
                    profiles!mentorship_faculty_id_fkey (
                        id, full_name, department, email
                    )
                `)
                .eq('student_id', userSession.db_id)
                .single();
            
            if (error) {
                if (error.code !== 'PGRST116') console.error(error); // ignore no row
            } else if (data) {
                setMentor(data.profiles);
            }
        } catch (error) {
            console.error("Error fetching mentor:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setActiveTab('meetings')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-calendar-plus"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">Book Meeting</span>
                </button>
                <button onClick={() => setActiveTab('messages')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-message"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">Message Mentor</span>
                </button>
                <button onClick={() => setActiveTab('mentor')} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-4 flex flex-col items-center justify-center gap-3 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-address-card"></i>
                    </div>
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText text-center">View Profile</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Center Column: Upcoming Meeting & Notifications */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* Upcoming Meeting Banner */}
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden">
                        <div className="bg-indigo-500/10 px-6 py-4 border-b-[length:var(--border-width)] border-indigo-500/20 flex justify-between items-center">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                <i className="fa-solid fa-calendar-check"></i> Next Scheduled Meeting
                            </h3>
                            <span className="px-2 py-1 bg-indigo-500 text-white rounded text-[9px] font-black uppercase tracking-widest shadow-md">Confirmed</span>
                        </div>
                        <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex flex-col items-center justify-center bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-2xl w-24 h-24 shrink-0 shadow-inner">
                                <span className="text-sm font-black text-themeText">{upcomingMeeting.date}</span>
                                <span className="text-[10px] font-bold text-themeTextSec uppercase mt-1">{upcomingMeeting.time}</span>
                            </div>
                            <div className="flex-1 text-center md:text-left flex flex-col gap-1">
                                <h4 className="text-lg font-black text-themeText">{upcomingMeeting.purpose}</h4>
                                <p className="text-xs font-bold text-themeTextSec flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <i className={`fa-solid ${upcomingMeeting.mode === 'Online' ? 'fa-video text-emerald-500' : 'fa-handshake text-amber-500'}`}></i> 
                                    {upcomingMeeting.mode} Session
                                </p>
                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-2">Mentor: {mentor ? mentor.full_name : 'Loading...'}</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                                <button className="w-full md:w-auto px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg">
                                    Join/View Details
                                </button>
                                <button className="w-full md:w-auto px-5 py-3 bg-themeElevated text-themeTextSec hover:text-rose-500 border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                                    Reschedule Request
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6">
                        <h3 className={`${theme.text.heading} text-sm tracking-tight text-themeText flex items-center gap-2 mb-4`}>
                            <i className="fa-solid fa-bell text-themeTextSec"></i> Recent Notifications
                        </h3>
                        <div className="flex flex-col gap-3">
                            {notifications.map(notif => (
                                <div key={notif.id} className="flex items-start gap-4 p-4 bg-themeElevated rounded-lg border-[length:var(--border-width)] border-themeBorder hover:border-themeBorderStrong transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-themePanel flex items-center justify-center border-[length:var(--border-width)] border-themeBorderStrong shrink-0">
                                        <i className={`fa-solid ${notif.icon} text-xs`}></i>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-themeText">{notif.message}</span>
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">{notif.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Mentor Info & Integrated Stats */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* My Mentor Card */}
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-themeElevated border-4 border-themePanel shadow-[0_0_0_1px_rgba(var(--theme-border-strong),1)] flex items-center justify-center mb-4">
                            <i className="fa-solid fa-user-tie text-3xl text-themeTextSec"></i>
                        </div>
                        {isLoading ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i>
                        ) : mentor ? (
                            <>
                                <h3 className="text-base font-black text-themeText">{mentor.full_name}</h3>
                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1 mb-4">{mentor.department}</p>
                                <button onClick={() => setActiveTab('mentor')} className="w-full py-3 bg-themeElevated text-themeText hover:text-indigo-500 border-[length:var(--border-width)] border-themeBorder hover:border-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                    View Full Profile <i className="fa-solid fa-arrow-right"></i>
                                </button>
                            </>
                        ) : (
                            <p className="text-xs font-bold text-rose-500">No mentor assigned yet.</p>
                        )}
                    </div>

                    {/* Integrated Tracking Gadget */}
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6">
                        <h3 className={`${theme.text.heading} text-sm tracking-tight text-themeText mb-4 flex items-center gap-2`}>
                            <i className="fa-solid fa-layer-group text-themeTextSec"></i> Current Status
                        </h3>
                        
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center py-3 border-b-[length:var(--border-width)] border-themeBorderStrong cursor-pointer group" onClick={() => setActiveTab('requests')}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-clipboard-list text-themeTextSec group-hover:text-indigo-500 transition-colors w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Pending Requests</span>
                                </div>
                                <span className="text-[10px] font-black bg-themeElevated px-2 py-1 rounded border-[length:var(--border-width)] border-themeBorder text-indigo-500">{stats.pendingRequests}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b-[length:var(--border-width)] border-themeBorderStrong">
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-clipboard-user text-themeTextSec w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Attendance</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{stats.attendanceStatus}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b-[length:var(--border-width)] border-themeBorderStrong cursor-pointer group" onClick={() => setActiveTab('leaves')}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-house-medical text-themeTextSec group-hover:text-amber-500 transition-colors w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Pending Leave Request</span>
                                </div>
                                <span className="text-[10px] font-black bg-themeElevated px-2 py-1 rounded border-[length:var(--border-width)] border-themeBorder text-amber-500">1</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b-[length:var(--border-width)] border-themeBorderStrong cursor-pointer group" onClick={() => setActiveTab('internships')}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-briefcase text-themeTextSec group-hover:text-blue-500 transition-colors w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Pending Internship Request</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">0</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b-[length:var(--border-width)] border-themeBorderStrong cursor-pointer group" onClick={() => setActiveTab('achievements')}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-trophy text-themeTextSec group-hover:text-emerald-500 transition-colors w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Pending Achievement Verification</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">1</span>
                            </div>

                            <div className="flex justify-between items-center py-3 cursor-pointer group" onClick={() => setActiveTab('research')}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-microscope text-themeTextSec group-hover:text-purple-500 transition-colors w-4 text-center"></i>
                                    <span className="text-xs font-bold text-themeText">Pending Research Approval</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">0</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
