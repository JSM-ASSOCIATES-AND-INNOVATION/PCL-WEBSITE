import React from 'react';
import { theme } from '../../../theme';

export default function FacultyRow4() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Student Performance */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Student Performance</span>
                    <i className="fa-solid fa-chart-simple text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder">
                        <span className="text-xs font-bold text-themeTextSec">Average Attendance</span>
                        <span className="text-xs font-black text-themeText">82%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder">
                        <span className="text-xs font-bold text-themeTextSec">Average Internal Marks</span>
                        <span className="text-xs font-black text-themeText">76%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-rose-500/30">
                        <span className="text-xs font-bold text-rose-500">Below 75% Attendance</span>
                        <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">12</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder mt-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Top Performer</span>
                            <span className="text-xs font-bold text-themeText">Aditya Verma</span>
                        </div>
                        <i className="fa-solid fa-medal text-emerald-500"></i>
                    </div>
                </div>
            </div>

            {/* 2. Pending Work */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Action Queue</span>
                    <i className="fa-solid fa-list-check text-themeTextSec"></i>
                </h2>
                
                <div className="flex flex-col gap-0 relative flex-1">
                    <div className="absolute left-3 top-4 bottom-4 w-px bg-themeBorder z-0"></div>
                    
                    {[
                        { title: 'Evaluate Const. Law Assignment', type: 'grading', urgent: true },
                        { title: 'Upload Internal Marks', type: 'admin', urgent: true },
                        { title: 'Approve 2 Leave Requests', type: 'approval', urgent: false },
                        { title: 'Reply to Student Query', type: 'communication', urgent: false },
                        { title: 'Review Internship Reports', type: 'grading', urgent: false }
                    ].map((task, i) => (
                        <div key={i} className="flex gap-4 relative z-10 py-2.5 group cursor-pointer">
                            <div className={`w-6 h-6 rounded-full border-[length:var(--border-width)] flex items-center justify-center shrink-0 bg-themeElevated ${task.urgent ? 'border-amber-500 text-amber-500' : 'border-themeBorderStrong text-themeTextSec'}`}>
                                <i className="fa-solid fa-check text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className={`text-xs font-bold transition-colors ${task.urgent ? 'text-themeText' : 'text-themeTextSec group-hover:text-themeText'}`}>
                                    {task.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Research */}
            <div className="bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm">
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Research & Papers</span>
                    <i className="fa-solid fa-microscope text-themeTextSec"></i>
                </h2>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-themeElevated p-3 rounded-lg border-[length:var(--border-width)] border-themeBorder flex flex-col">
                        <span className="text-xl font-black text-themeText">14</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mt-1">Publications</span>
                    </div>
                    <div className="bg-themeElevated p-3 rounded-lg border-[length:var(--border-width)] border-themeBorder flex flex-col">
                        <span className="text-xl font-black text-themeText">328</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mt-1">Citations</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                    <div className="p-3 rounded-lg bg-indigo-500/10 border-[length:var(--border-width)] border-indigo-500/20">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Upcoming Conference</span>
                            <span className="text-[10px] font-bold text-indigo-500">In 12 Days</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-500 block">International Law Symposium 2026</span>
                    </div>
                    
                    <button className="w-full py-2 bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeBorderStrong text-xs font-bold text-themeTextSec rounded-lg mt-1 transition-all">
                        View Research Portfolio &rarr;
                    </button>
                </div>
            </div>

        </div>
    );
}
