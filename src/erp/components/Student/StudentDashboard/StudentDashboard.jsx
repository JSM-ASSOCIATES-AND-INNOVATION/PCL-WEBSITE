/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { calculateRelativeSemester } from "../../../utils/academicUtils";

export default function StudentDashboard({ setActiveTab }) {
    const { userSession } = useERP();

    // --- STATE ---
    const [profile, setProfile] = useState(null);
    const [mentor, setMentor] = useState(null);
    const [dashboardNotices, setDashboardNotices] = useState([]);
    const [showFabMenu, setShowFabMenu] = useState(false);
    const [academicCycle, setAcademicCycle] = useState('normal'); // 'normal', 'exams', 'moots', 'internships', 'fees', 'results'

    const [stats, setStats] = useState({
        cgpa: 0.00,
        attendance: 0,
        assignmentsPending: 0,
        assignmentsSubmitted: 0,
        libraryIssued: 0,
        libraryDue: 0,
        schedule: [],
        deadlines: [],
        notices: [],
        events: []
    });

    // --- FETCH REAL DATA ---
    useEffect(() => {
        const fetchData = async () => {
            const sid = userSession?.db_id || userSession?.id;
            if (!sid) return;

            const { data: pData } = await supabase.from('profiles').select('*').eq('id', sid).single();
            if (pData) {
                setProfile(pData);
                setStats(prev => ({ ...prev, cgpa: pData.cgpa || 0.00 }));
            }

            const { data: mData } = await supabase.from('mentorship').select('faculty_id, profiles!mentorship_faculty_id_fkey(full_name, erp_id, avatar_url)').eq('student_id', sid).eq('status', 'active').single();
            if (mData?.profiles) setMentor(mData.profiles);

            const { data: nData } = await supabase.from('notices').select('*').eq('status', 'PUBLISHED').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(5);
            if (nData) setDashboardNotices(nData);

            // Fetch Attendance
            const { data: attData } = await supabase.from('attendance_records').select('status').eq('student_id', sid);
            if (attData && attData.length > 0) {
                const present = attData.filter(a => a.status === 'present' || a.status === 'Present').length;
                const total = attData.length;
                setStats(prev => ({ ...prev, attendance: Math.round((present / total) * 100) }));
            }

            // Fetch Assignments
            const { data: asgData } = await supabase.from('assignment_submissions').select('status').eq('student_id', sid);
            if (asgData) {
                const submitted = asgData.filter(a => a.status === 'submitted' || a.status === 'Submitted').length;
                const pending = asgData.filter(a => a.status === 'pending' || a.status === 'Pending').length;
                setStats(prev => ({ ...prev, assignmentsSubmitted: submitted, assignmentsPending: pending }));
            }
        };
        fetchData();
    }, [userSession]);



    return (
        <div className="w-full min-h-screen bg-themeApp text-themeText font-sans pb-32 selection:bg-themeAccent/20 selection:text-themeAccent">
            
            <div className="flex flex-col xl:flex-row max-w-[1600px] mx-auto p-4 lg:p-8 gap-8">
                
                {/* --- MAIN DASHBOARD (Left) --- */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    
                    {/* DYNAMIC ACADEMIC CYCLE BANNER (Optional Override) */}
                    {academicCycle === 'exams' && (
                        <div className="bg-themeElevated border border-themeBorderStrong rounded-2xl p-6 flex justify-between items-center shadow-sm">
                            <div>
                                <h3 className="text-lg font-black text-themeText mb-1">Semester Examinations</h3>
                                <p className="text-sm font-bold text-themeTextSec">Download your Hall Ticket and view seating arrangements.</p>
                            </div>
                            <button className="bg-themeAccent text-[#0a0a0a] px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm">View Exam Portal →</button>
                        </div>
                    )}
                    
                    {/* ROW 1: Signature Welcome */}
                    <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 lg:p-8 shadow-sm relative overflow-hidden flex flex-col items-start gap-6">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                        
                        <div className="relative z-10 flex-1">
                            <h2 className="text-2xl font-black text-themeText tracking-tight mb-1">Good Morning, {profile?.full_name?.split(' ')[0] || "Student"}</h2>
                            <p className="text-sm font-bold text-themeTextSec flex items-center gap-3">
                                <span>{profile?.academic_batch || 'N/A'}</span>
                                <span className="w-1 h-1 rounded-full bg-themeBorderStrong"></span>
                                <span>Semester {calculateRelativeSemester(profile?.academic_batch)}</span>
                                <span className="w-1 h-1 rounded-full bg-themeBorderStrong"></span>
                                <span className="text-themeText">CGPA {stats.cgpa.toFixed(2)}</span>
                            </p>
                        </div>
                    </div>

                    {/* ROW 2: 4 KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* 1. Attendance */}
                        <div className="bg-themePanel border border-themeBorder p-5 rounded-xl shadow-sm flex flex-col justify-between group hover:border-themeAccent/50 transition-colors cursor-pointer" onClick={() => setActiveTab('attendance')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Overall Attendance</p>
                                <p className="text-2xl font-black text-themeText">{stats.attendance}%</p>
                            </div>
                            <div className="mt-4">
                                <div className="flex h-2 w-full rounded-full overflow-hidden bg-themeElevated gap-0.5">
                                    {/* Empty State Bar */}
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] font-bold text-emerald-500">0 Safe</span>
                                    <span className="text-[9px] font-bold text-rose-500">0 Critical</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. CGPA */}
                        <div className="bg-themePanel border border-themeBorder p-5 rounded-xl shadow-sm flex flex-col justify-between group hover:border-themeAccent/50 transition-colors cursor-pointer" onClick={() => setActiveTab('examinations')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">CGPA</p>
                                <p className="text-2xl font-black text-themeText">{stats.cgpa.toFixed(2)}</p>
                            </div>
                            <div className="mt-4 flex flex-col gap-1 border-t border-themeBorderStrong pt-2">
                                <div className="flex justify-between text-[9px] font-bold text-themeTextSec">
                                    <span>Credits Earned</span> <span className="text-themeText">0</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-themeTextSec">
                                    <span>Remaining</span> <span className="text-themeText">0</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Assignments */}
                        <div className="bg-themePanel border border-themeBorder p-5 rounded-xl shadow-sm flex flex-col justify-between group hover:border-themeAccent/50 transition-colors cursor-pointer" onClick={() => setActiveTab('assignments')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Assignments</p>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-themeTextSec">Pending</span>
                                    <span className="text-lg font-black text-amber-500">{stats.assignmentsPending}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-themeTextSec">Submitted</span>
                                    <span className="text-lg font-black text-emerald-500">{stats.assignmentsSubmitted}</span>
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-themeTextSec mt-4 border-t border-themeBorderStrong pt-2 truncate">All Clear</p>
                        </div>

                        {/* 4. Library */}
                        <div className="bg-themePanel border border-themeBorder p-5 rounded-xl shadow-sm flex flex-col justify-between group hover:border-themeAccent/50 transition-colors cursor-pointer" onClick={() => setActiveTab('library')}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2">Library</p>
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-bold text-themeTextSec"><span>Books Issued</span> <span className="text-themeText">{stats.libraryIssued}</span></div>
                                    <div className="flex justify-between text-[10px] font-bold text-themeTextSec"><span>Due Tomorrow</span> <span className="text-amber-500">{stats.libraryDue}</span></div>
                                    <div className="flex justify-between text-[10px] font-bold text-themeTextSec"><span>Fine</span> <span className="text-emerald-500">₹0</span></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ROW 3: Core Dash (Schedule & Deadlines) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                        
                        {/* Today's Schedule */}
                        <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest text-themeText mb-6">Today's Schedule</h3>
                            {stats.schedule.length > 0 ? (
                                <div className="flex flex-col gap-4 relative">
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-themeBorderStrong"></div>
                                    {stats.schedule.map((s, i) => (
                                        <div key={i} className={`relative pl-8 ${s.current ? '' : 'opacity-60'}`}>
                                            <div className={`absolute left-[3px] top-1 w-3 h-3 rounded-full border-2 border-themePanel ${s.current ? 'bg-themeAccent ring-4 ring-themeAccent/20' : 'bg-themeBorderStrong'}`}></div>
                                            <p className={`text-xs font-black tracking-widest ${s.current ? 'text-themeAccent' : 'text-themeTextSec'}`}>{s.time}</p>
                                            <p className="text-sm font-bold text-themeText">{s.title}</p>
                                            <p className="text-[10px] font-bold text-themeTextSec">{s.location}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-50 h-full">
                                    <i className="fa-regular fa-calendar-xmark text-3xl mb-3 text-themeTextSec"></i>
                                    <p className="text-xs font-bold text-themeTextSec">No classes scheduled today.</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-widest text-themeText mb-6">Upcoming Deadlines</h3>
                            {stats.deadlines.length > 0 ? (
                                <div className="flex flex-col gap-4 relative">
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-themeBorderStrong"></div>
                                    {stats.deadlines.map((d, i) => (
                                        <div key={i} className="relative pl-8">
                                            <div className="absolute left-[3px] top-1.5 w-3 h-3 rounded-full border-2 border-themePanel bg-amber-500"></div>
                                            <p className="text-sm font-bold text-themeText mb-0.5">{d.title}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-themeElevated px-2 py-0.5 rounded text-themeTextSec">{d.type}</span>
                                                <span className="text-[10px] font-bold text-rose-500">{d.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-50 h-full">
                                    <i className="fa-solid fa-clipboard-check text-3xl mb-3 text-themeTextSec"></i>
                                    <p className="text-xs font-bold text-themeTextSec">You're all caught up!</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>


                {/* --- RIGHT SIDEBAR --- */}
                <div className="hidden xl:flex flex-col w-80 shrink-0 gap-6">
                    
                    {/* Card 1: Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('leave')} className="bg-themePanel border border-themeBorder p-4 rounded-xl shadow-sm hover:border-themeAccent/50 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                            <i className="fa-solid fa-calendar-minus text-themeTextSec group-hover:text-themeAccent text-xl transition-colors"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Apply Leave</span>
                        </button>
                        <button onClick={() => setActiveTab('fees')} className="bg-themePanel border border-themeBorder p-4 rounded-xl shadow-sm hover:border-themeAccent/50 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                            <i className="fa-solid fa-wallet text-themeTextSec group-hover:text-themeAccent text-xl transition-colors"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Pay Fees</span>
                        </button>
                        <button onClick={() => setActiveTab('library')} className="bg-themePanel border border-themeBorder p-4 rounded-xl shadow-sm hover:border-themeAccent/50 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                            <i className="fa-solid fa-book-open text-themeTextSec group-hover:text-themeAccent text-xl transition-colors"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Library Search</span>
                        </button>
                        <button className="bg-themePanel border border-themeBorder p-4 rounded-xl shadow-sm hover:border-themeAccent/50 transition-all flex flex-col items-center justify-center text-center gap-2 group">
                            <i className="fa-solid fa-headset text-themeTextSec group-hover:text-themeAccent text-xl transition-colors"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Helpdesk</span>
                        </button>
                    </div>

                    {/* Card 2: Shrunken Academic Progress */}
                    <div className="bg-themePanel border border-themeBorder rounded-2xl p-5 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-4">Academic Progress</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Credits', val: 0, color: 'bg-blue-500' },
                                { label: 'Attendance', val: stats.attendance, color: 'bg-emerald-500' },
                                { label: 'Assignments', val: stats.assignmentsSubmitted > 0 ? Math.round((stats.assignmentsSubmitted / (stats.assignmentsSubmitted + stats.assignmentsPending)) * 100) : 0, color: 'bg-amber-500' },
                                { label: 'Internals', val: 0, color: 'bg-purple-500' }
                            ].map((p, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[9px] font-bold text-themeTextSec">{p.label}</span>
                                        <span className="text-[9px] font-black text-themeText">{p.val}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-themeElevated rounded-full overflow-hidden">
                                        <div className={`h-full ${p.color}`} style={{ width: `${p.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 3: Shrunken Notices */}
                    <div className="bg-themePanel border border-themeBorder rounded-2xl p-5 shadow-sm flex flex-col max-h-64">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Campus Notices</h3>
                            <button onClick={() => setActiveTab('notices')} className="text-themeAccent text-[10px] hover:brightness-110"><i className="fa-solid fa-arrow-up-right-from-square"></i></button>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar">
                            {dashboardNotices.length > 0 ? dashboardNotices.map((n, i) => (
                                <div key={i} className="pb-2 border-b border-themeBorderStrong last:border-0 last:pb-0 cursor-pointer group" onClick={() => setActiveTab('notices')}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {n.priority === 'CRITICAL' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></div>}
                                        {n.priority === 'URGENT' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>}
                                        {n.priority === 'IMPORTANT' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>}
                                        <p className="text-xs font-bold text-themeText group-hover:text-themeAccent transition-colors line-clamp-1">{n.title}</p>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec pl-3.5">{n.category}</p>
                                </div>
                            )) : (
                                <div className="py-4 text-center opacity-50">
                                    <i className="fa-regular fa-bell text-xl mb-2 text-themeTextSec"></i>
                                    <p className="text-[10px] font-bold text-themeTextSec">No new notices</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 4: Shrunken My Mentor */}
                    <div className="bg-themePanel border border-themeBorder rounded-2xl p-5 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-4">My Mentor</h3>
                        {mentor ? (
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <img src={mentor.avatar_url || `https://ui-avatars.com/api/?name=${mentor.full_name}&background=random`} className="w-10 h-10 rounded-full bg-themeElevated" alt="mentor" />
                                    <div>
                                        <p className="text-xs font-bold text-themeText">{mentor.full_name}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Faculty Member</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveTab('mentorship')} className="w-8 h-8 rounded-full bg-themeElevated text-themeAccent flex items-center justify-center hover:bg-themeAccent hover:text-[#0a0a0a] transition-colors shrink-0">
                                    <i className="fa-regular fa-envelope"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="py-2 text-center opacity-50">
                                <i className="fa-solid fa-user-xmark text-xl mb-2 text-themeTextSec"></i>
                                <p className="text-[10px] font-bold text-themeTextSec">No mentor assigned</p>
                            </div>
                        )}
                    </div>



                </div>

            </div>

            {/* --- FLOATING ACTION BUTTON (FAB) --- */}
            <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-3">
                {showFabMenu && (
                    <div className="flex flex-col items-end gap-2 animate-fade-in mb-2">
                        {['Apply Leave', 'Upload Assignment', 'Register Moot', 'Raise Query', 'Download Certificate'].map((action, i) => (
                            <button key={i} className="bg-themeElevated border border-themeBorder px-4 py-2 rounded-lg text-xs font-bold text-themeText shadow-md hover:border-themeAccent transition-colors">
                                {action}
                            </button>
                        ))}
                    </div>
                )}
                <button 
                    onClick={() => setShowFabMenu(!showFabMenu)}
                    className="w-14 h-14 bg-themeAccent rounded-full text-[#0a0a0a] shadow-xl shadow-themeAccent/20 flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <i className={`fa-solid fa-plus transition-transform duration-300 ${showFabMenu ? 'rotate-45' : ''}`}></i>
                </button>
            </div>

        </div>
    );
}