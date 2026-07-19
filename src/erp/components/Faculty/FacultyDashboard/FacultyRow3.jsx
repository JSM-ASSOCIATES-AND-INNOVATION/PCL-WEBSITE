import React from 'react';
import { theme } from '../../../theme';

export default function FacultyRow3() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Today's Schedule (Timeline) */}
            <div className="col-span-1 lg:col-span-4 bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Today's Schedule</span>
                    <i className="fa-regular fa-clock text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-0 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-themeBorder z-0"></div>
                    
                    {/* Item 1 - Completed */}
                    <div className="flex gap-4 relative z-10 py-3 group">
                        <div className="w-8 h-8 rounded-full bg-themeElevated border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <i className="fa-solid fa-check text-emerald-500 text-xs"></i>
                        </div>
                        <div className="flex flex-col pt-1">
                            <span className="text-[10px] font-black text-themeTextSec uppercase tracking-widest">09:30 AM - 11:00 AM</span>
                            <span className="text-sm font-bold text-themeTextSec line-through">Constitutional Law</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-0.5">Room 301</span>
                        </div>
                    </div>
                    
                    {/* Item 2 - Current */}
                    <div className="flex gap-4 relative z-10 py-3 group">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-themePanel flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <div className="flex flex-col pt-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">11:00 AM - 12:30 PM</span>
                            <span className="text-sm font-bold text-themeText">Jurisprudence</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-0.5">Room 102</span>
                        </div>
                    </div>
                    
                    {/* Item 3 - Upcoming */}
                    <div className="flex gap-4 relative z-10 py-3 group">
                        <div className="w-8 h-8 rounded-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-themeBorderStrong"></div>
                        </div>
                        <div className="flex flex-col pt-1">
                            <span className="text-[10px] font-black text-themeTextSec uppercase tracking-widest">01:30 PM - 02:30 PM</span>
                            <span className="text-sm font-bold text-themeText">Mentoring</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-0.5">Cabin 4B</span>
                        </div>
                    </div>
                    
                    {/* Item 4 - Upcoming */}
                    <div className="flex gap-4 relative z-10 py-3 group">
                        <div className="w-8 h-8 rounded-full bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-themeBorderStrong"></div>
                        </div>
                        <div className="flex flex-col pt-1">
                            <span className="text-[10px] font-black text-themeTextSec uppercase tracking-widest">03:00 PM - 04:30 PM</span>
                            <span className="text-sm font-bold text-themeText">Moot Coaching</span>
                            <span className="text-[10px] font-bold text-themeTextSec mt-0.5">Moot Court Hall</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. My Classes */}
            <div className="col-span-1 lg:col-span-4 bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>My Classes</span>
                    <i className="fa-solid fa-chalkboard-user text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    
                    {/* Class 1 */}
                    <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder p-4 rounded-xl hover:border-themeBorderStrong transition-all flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-bold text-themeText">Constitutional Law</h3>
                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Semester VI • Section A</p>
                            </div>
                            <span className="text-xs font-black text-themeText bg-themePanel px-2 py-1 rounded border border-themeBorder">60</span>
                        </div>
                        <button className="w-full py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
                            Take Attendance <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    {/* Class 2 */}
                    <div className="bg-themeElevated border-[length:var(--border-width)] border-themeBorder p-4 rounded-xl hover:border-themeBorderStrong transition-all flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-bold text-themeText">Jurisprudence</h3>
                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-1">Semester II • Section B</p>
                            </div>
                            <span className="text-xs font-black text-themeText bg-themePanel px-2 py-1 rounded border border-themeBorder">52</span>
                        </div>
                        <button className="w-full py-2 bg-themePanel text-themeTextSec hover:bg-themeBorder hover:text-themeText rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
                            View Roster
                        </button>
                    </div>

                </div>
            </div>

            {/* 3. Mentorship */}
            <div className="col-span-1 lg:col-span-4 bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Mentorship Alerts</span>
                    <i className="fa-solid fa-bell text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-rose-500/50 transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-themeText">Rahul Verma</span>
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Attendance Alert (62%)</span>
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-[10px] text-themeAccent opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-amber-500/50 transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-chart-line-down"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-themeText">Sneha Kapoor</span>
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Low CGPA Alert</span>
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-[10px] text-themeAccent opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </button>

                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-blue-500/50 transition-colors text-left group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-briefcase"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-themeText">Karan Singh</span>
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Internship Pending</span>
                            </div>
                        </div>
                        <i className="fa-solid fa-arrow-right text-[10px] text-themeAccent opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </button>

                </div>
            </div>

        </div>
    );
}
