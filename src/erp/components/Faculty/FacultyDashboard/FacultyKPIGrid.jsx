import React from 'react';
import { theme } from '../../../theme';

export default function FacultyKPIGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* 1. Today's Classes */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-themeBorder flex flex-col gap-2 hover:border-themeAccent transition-colors shadow-sm cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-chalkboard-user"></i>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-themeText tracking-tight">4</p>
                    <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Today's Classes</p>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder">
                    <p className="text-[9px] font-black text-themeTextSec uppercase tracking-widest">Next Class</p>
                    <p className="text-[10px] font-bold text-themeText truncate">09:30 AM - Const. Law</p>
                </div>
            </div>

            {/* 2. Attendance Pending */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-amber-500/30 flex flex-col gap-2 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-clipboard-user"></i>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-amber-500 tracking-tight">2</p>
                    <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Attendance</p>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder">
                    <p className="text-[10px] font-bold text-amber-500 truncate">Remaining</p>
                </div>
            </div>

            {/* 3. Assignments */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-themeBorder flex flex-col gap-2 hover:border-themeAccent transition-colors shadow-sm cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-file-signature"></i>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-themeText tracking-tight">12</p>
                    <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Assignments</p>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder">
                    <p className="text-[10px] font-bold text-indigo-500 truncate">Pending Evaluation</p>
                </div>
            </div>

            {/* 4. Mentorship */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-themeBorder flex flex-col gap-2 hover:border-themeAccent transition-colors shadow-sm cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-people-arrows"></i>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-themeText tracking-tight">34</p>
                    <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Mentorship</p>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder flex justify-between">
                    <p className="text-[10px] font-bold text-themeTextSec truncate">Students</p>
                    <p className="text-[10px] font-bold text-rose-500 truncate">3 Alerts</p>
                </div>
            </div>

            {/* 5. Leave Balance */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-themeBorder flex flex-col gap-2 hover:border-themeAccent transition-colors shadow-sm cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-mug-hot"></i>
                    </div>
                </div>
                <div className="mt-auto flex justify-between items-end">
                    <div>
                        <p className="text-xl font-black text-themeText tracking-tight">8</p>
                        <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Casual</p>
                    </div>
                    <div>
                        <p className="text-xl font-black text-themeText tracking-tight">10</p>
                        <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Medical</p>
                    </div>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder">
                    <p className="text-[10px] font-bold text-themeTextSec truncate">Leave Balance</p>
                </div>
            </div>

            {/* 6. Research */}
            <div className="bg-themePanel p-4 rounded-themePanel border-[length:var(--border-width)] border-themeBorder flex flex-col gap-2 hover:border-themeAccent transition-colors shadow-sm cursor-pointer group">
                <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-microscope"></i>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="text-2xl font-black text-themeText tracking-tight">2</p>
                    <p className={`text-[9px] font-black ${theme.text.muted} uppercase tracking-widest mt-0.5 truncate`}>Research</p>
                </div>
                <div className="mt-2 pt-2 border-t-[length:var(--border-width)] border-themeBorder">
                    <p className="text-[10px] font-bold text-purple-500 truncate">1 Deadline</p>
                </div>
            </div>

        </div>
    );
}
