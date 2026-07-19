import React from 'react';
import { theme } from '../../../theme';

export default function FacultyRow5() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Recent Activity */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Recent Activity</span>
                    <i className="fa-solid fa-clock-rotate-left text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-0 relative flex-1">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-themeBorder z-0"></div>
                    
                    {[
                        { title: 'Attendance Submitted', desc: 'Jurisprudence (Sem II)', time: '10 mins ago', icon: 'fa-check' },
                        { title: 'Assignment Uploaded', desc: 'Case Study 3 by 12 students', time: '1 hr ago', icon: 'fa-file-arrow-up' },
                        { title: 'Leave Approved', desc: 'Rahul Verma (Medical)', time: '2 hrs ago', icon: 'fa-thumbs-up' },
                        { title: 'Student Question', desc: 'Query in Const. Law forum', time: '3 hrs ago', icon: 'fa-message' }
                    ].map((act, i) => (
                        <div key={i} className="flex gap-4 relative z-10 py-3">
                            <div className="w-5 h-5 rounded-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center shrink-0 mt-0.5">
                                <i className={`fa-solid ${act.icon} text-[8px] text-themeTextSec`}></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-themeText">{act.title}</span>
                                <span className="text-[10px] font-bold text-themeTextSec">{act.desc}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec/50 mt-1">{act.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Calendar */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Meetings & Events</span>
                    <i className="fa-regular fa-calendar text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3 items-start p-3 rounded-lg bg-themeElevated border-l-2 border-indigo-500">
                        <div className="flex flex-col items-center justify-center bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded px-2 py-1 shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Apr</span>
                            <span className="text-sm font-black text-themeText">14</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">Faculty Meeting</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-1">11:30 AM • Conference Room</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 items-start p-3 rounded-lg bg-themeElevated border-l-2 border-emerald-500">
                        <div className="flex flex-col items-center justify-center bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded px-2 py-1 shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Apr</span>
                            <span className="text-sm font-black text-themeText">14</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">Guest Lecture: Hon. Justice Singh</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-1">02:00 PM • Main Auditorium</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Announcements */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Announcements</span>
                    <i className="fa-solid fa-bullhorn text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/10 border-[length:var(--border-width)] border-blue-500/20">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 block mb-1">University Circular</span>
                        <span className="text-xs font-bold text-themeText block">Revised Guidelines for Internal Assessments 2026</span>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder">
                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec block mb-1">Admin Department</span>
                        <span className="text-xs font-bold text-themeText block">Library will remain closed for maintenance on Saturday.</span>
                    </div>
                </div>
                
                <button className="mt-auto w-full py-2 text-[10px] font-black uppercase tracking-widest text-themeAccent hover:text-themeText transition-colors text-right">
                    View All Announcements &rarr;
                </button>
            </div>

        </div>
    );
}
