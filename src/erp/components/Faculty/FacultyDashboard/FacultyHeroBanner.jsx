import React from 'react';
import { theme } from '../../../theme';
import { useERP } from '../../../context/ErpContext';

export default function FacultyHeroBanner() {
    const { userSession } = useERP();
    const facultyName = userSession?.name || "Dr. Priya Sharma";
    const facultyId = "LAW-F-018";
    const department = "Law";
    const todayClasses = 4;
    const totalStudents = 168;

    return (
        <div className={`w-full bg-themeAccent rounded-themePanel p-5 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative overflow-hidden shadow-lg`}>
            
            {/* Left: Welcome text */}
            <div className="relative z-10 flex-1">
                <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span> 
                    Active Session • Academic Year 2026-27
                </p>
                <h1 className={`${theme.text.heading} text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-2 leading-tight`}>
                    Good Morning, {facultyName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/90 mt-4">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-id-badge text-white/70"></i> {facultyId}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <span className="flex items-center gap-2"><i className="fa-solid fa-building-columns text-white/70"></i> {department}</span>
                </div>
            </div>

            {/* Right: Operations Summary Banner */}
            <div className="relative z-10 bg-black/20 backdrop-blur-md rounded-themePanel p-5 lg:p-6 w-full lg:w-auto lg:min-w-[320px] shadow-sm shrink-0 flex gap-8 justify-between border border-white/10">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Today's Classes</span>
                    <span className="text-3xl font-black text-white">{todayClasses}</span>
                </div>
                <div className="w-px bg-white/20"></div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Students</span>
                    <span className="text-3xl font-black text-white">{totalStudents}</span>
                </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
        </div>
    );
}
