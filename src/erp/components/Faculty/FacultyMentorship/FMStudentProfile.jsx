import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";

export default function FMStudentProfile({ studentId }) {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [attendancePercentage, setAttendancePercentage] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails(studentId);
        }
    }, [studentId]);

    const fetchStudentDetails = async (id) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setStudent(data);

            // Fetch attendance
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('status')
                .eq('student_id', id)
                .in('status', ['Present', 'Absent']);
                
            if (attendanceData && attendanceData.length > 0) {
                const total = attendanceData.length;
                const present = attendanceData.filter(r => r.status === 'Present').length;
                setAttendancePercentage(Math.round((present / total) * 100));
            } else {
                setAttendancePercentage(0); // Default if no data
            }

        } catch (error) {
            console.error("Error fetching student profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="w-full py-32 flex justify-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500"></i></div>;
    }

    if (!student) {
        return <div className="w-full py-32 text-center text-themeTextSec">Student not found.</div>;
    }

    const isAttendanceLow = attendancePercentage !== null && attendancePercentage < 75;

    const handleSendMessage = () => {
        window.erpDialog?.alert(`Messaging opened for ${student.name || student.full_name}`);
    };

    const handleSetMeeting = () => {
        window.erpDialog?.alert(`Meeting scheduling form opened for ${student.name || student.full_name}`);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in relative pb-10">
            
            {/* Header / Identity Banner */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-user text-3xl text-themeTextSec"></i>
                    </div>
                    <div className="flex flex-col">
                        <h2 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText mb-1`}>{student.full_name}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500">{student.erp_id || student.id.substring(0,8)}</span>
                            <span className="text-xs font-bold text-themeTextSec">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">{student.programme || 'BA.LLB'}</span>
                            <span className="text-xs font-bold text-themeTextSec">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Semester {student.semester || '6'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto relative z-10 shrink-0">
                    <button onClick={handleSetMeeting} className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2">
                        <i className="fa-solid fa-calendar-plus"></i> Book Meeting
                    </button>
                    {isAttendanceLow ? (
                        <button onClick={handleSendMessage} className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2">
                            <i className="fa-solid fa-paper-plane"></i> Message Mentee
                        </button>
                    ) : (
                        <button onClick={handleSendMessage} className="px-5 py-3 bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <i className="fa-solid fa-envelope"></i> Message
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Navigation */}
            <div className="flex border-b-[length:var(--border-width)] border-themeBorderStrong gap-8 px-2">
                <button 
                    onClick={() => setProfileTab("overview")}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${profileTab === 'overview' ? 'text-blue-500' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-layer-group mr-2"></i> Comprehensive Overview
                    {profileTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setProfileTab("timeline")}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${profileTab === 'timeline' ? 'text-blue-500' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-timeline mr-2"></i> Activity Timeline
                    {profileTab === 'timeline' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setProfileTab("notes")}
                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${profileTab === 'notes' ? 'text-amber-500' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    <i className="fa-solid fa-lock mr-2"></i> Private Mentor Notes
                    {profileTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 rounded-t-full"></div>}
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {profileTab === 'overview' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
                    
                    {/* Left Column */}
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        
                        {/* Attendance Gadget */}
                        <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-themeText">Overall Attendance</h4>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest bg-themeElevated px-2 py-1 rounded">Read-only</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`text-4xl font-black ${isAttendanceLow ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {attendancePercentage !== null ? attendancePercentage : '--'}%
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="w-full h-2 bg-themeElevated rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${isAttendanceLow ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${attendancePercentage || 0}%` }}></div>
                                    </div>
                                    <span className="text-[9px] font-bold text-themeTextSec">Threshold: 75%</span>
                                </div>
                            </div>
                            {isAttendanceLow && (
                                <div className="mt-4 p-3 bg-rose-500/10 border-[length:var(--border-width)] border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-500">
                                    <i className="fa-solid fa-triangle-exclamation mt-0.5 text-xs"></i>
                                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Student has fallen below the 75% attendance threshold. Please intervene immediately.</p>
                                </div>
                            )}
                        </div>

                        {/* Academics Gadget */}
                        <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-themeText">Academic Standing</h4>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest bg-themeElevated px-2 py-1 rounded">Read-only</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Current CGPA</span>
                                    <span className="text-xl font-black text-themeText">7.84</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Last Sem SGPA</span>
                                    <span className="text-xl font-black text-emerald-500 flex items-center gap-2">8.10 <i className="fa-solid fa-arrow-trend-up text-[10px]"></i></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Active Backlogs</span>
                                    <span className="text-xl font-black text-themeText">0</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Credits</span>
                                    <span className="text-xl font-black text-themeText">120 <span className="text-[10px] text-themeTextSec">/ 140</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-themeText mb-4">Contact Details</h4>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-themeTextSec">
                                    <i className="fa-solid fa-envelope w-4"></i> {student.email || 'student@domain.edu'}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-themeTextSec">
                                    <i className="fa-solid fa-phone w-4"></i> +91 98765 43210
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-themeTextSec mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorderStrong">
                                    <i className="fa-solid fa-user-shield w-4 text-amber-500"></i> Parent: +91 99887 76655
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Records & Requests) */}
                    <div className="xl:col-span-8 flex flex-col gap-6">
                        
                        {/* Leave History */}
                        <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden">
                            <div className="bg-themeElevated px-5 py-4 border-b-[length:var(--border-width)] border-themeBorderStrong flex justify-between items-center">
                                <h4 className="text-xs font-black uppercase tracking-widest text-themeText flex items-center gap-2">
                                    <i className="fa-solid fa-house-medical text-amber-500"></i> Leave Record
                                </h4>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest">3 Previous</span>
                            </div>
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex justify-between items-center p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorder">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Medical Leave (3 Days)</span>
                                        <span className="text-[9px] font-bold text-themeTextSec mt-0.5">14 Feb - 16 Feb 2026</span>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border-[length:var(--border-width)] border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">Approved</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorder">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeText">Out of Station (1 Day)</span>
                                        <span className="text-[9px] font-bold text-themeTextSec mt-0.5">10 Jan 2026</span>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border-[length:var(--border-width)] border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">Approved</span>
                                </div>
                            </div>
                        </div>

                        {/* Co-Curricular (Internships & Research) */}
                        <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden">
                            <div className="bg-themeElevated px-5 py-4 border-b-[length:var(--border-width)] border-themeBorderStrong flex justify-between items-center">
                                <h4 className="text-xs font-black uppercase tracking-widest text-themeText flex items-center gap-2">
                                    <i className="fa-solid fa-briefcase text-indigo-500"></i> Verified Co-Curriculars
                                </h4>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex items-start gap-4 p-4 bg-themeElevated rounded-lg border-l-2 border-indigo-500">
                                    <i className="fa-solid fa-building text-indigo-500 mt-0.5"></i>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-themeText">Legal Intern @ Amarchand Mangaldas</span>
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Dec 2025 - Jan 2026 (4 Weeks)</span>
                                        <span className="mt-2 text-[10px] font-bold text-themeTextSec bg-themeApp px-2 py-1 w-max rounded">Approved by Mentor</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-themeElevated rounded-lg border-l-2 border-purple-500">
                                    <i className="fa-solid fa-microscope text-purple-500 mt-0.5"></i>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-themeText">Paper Publication: Cyber Law in India</span>
                                        <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1">National Law Journal • Vol 14</span>
                                        <span className="mt-2 text-[10px] font-bold text-themeTextSec bg-themeApp px-2 py-1 w-max rounded">Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {/* TIMELINE TAB */}
            {profileTab === 'timeline' && (
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-8 max-w-4xl animate-fade-in">
                    <h3 className="text-sm font-black uppercase tracking-widest text-themeText mb-8">Chronological History</h3>
                    
                    <div className="flex flex-col relative pl-6">
                        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-themeBorderStrong"></div>

                        <div className="relative pb-8">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-themePanel"></div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">15 Jul 2026</span>
                            <h4 className="text-sm font-black text-themeText">Mentorship Meeting Conducted</h4>
                            <p className="text-[11px] font-medium text-themeTextSec mt-1 bg-themeElevated p-3 rounded mt-2 border-[length:var(--border-width)] border-themeBorder">Discussed upcoming internship opportunities. Student is well prepared.</p>
                        </div>

                        <div className="relative pb-8">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-themePanel"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">22 Jun 2026</span>
                            <h4 className="text-sm font-black text-themeText">Achievement Verified</h4>
                            <p className="text-[11px] font-medium text-themeTextSec mt-1">Winner - National Moot Court Competition.</p>
                        </div>
                        
                        <div className="relative pb-8">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-themePanel"></div>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 block">10 May 2026</span>
                            <h4 className="text-sm font-black text-themeText">Attendance Warning Issued</h4>
                            <p className="text-[11px] font-medium text-themeTextSec mt-1">System auto-flagged attendance dropping below 75%.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTES TAB */}
            {profileTab === 'notes' && (
                <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-8 max-w-4xl animate-fade-in">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-themeText flex items-center gap-2">
                                <i className="fa-solid fa-lock text-amber-500"></i> Private Mentor Notes
                            </h3>
                            <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Visible only to you. Not shared with the student.</p>
                        </div>
                        <button className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border-[length:var(--border-width)] border-amber-500/20">
                            Save Notes
                        </button>
                    </div>

                    <textarea 
                        className="w-full h-96 bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong rounded-lg p-5 text-sm text-themeText font-medium resize-none focus:border-amber-500 outline-none leading-relaxed"
                        placeholder="Write your private observations, academic concerns, or career guidance notes here..."
                        defaultValue={`Student is highly motivated towards Corporate Law. Needs to improve attendance in the morning sessions. Parents are supportive but concerned about the recent attendance dip. Will monitor for the next 2 weeks.`}
                    ></textarea>
                </div>
            )}

        </div>
    );
}
