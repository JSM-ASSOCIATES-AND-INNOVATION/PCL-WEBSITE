import React from 'react';
import { theme } from '../../../theme';

export default function FacultyRightSidebar() {
    return (
        <div className="w-full flex flex-col gap-6">
            
            {/* 1. CURRENT CLASS SMART WIDGET (Context Aware) */}
            <div className="bg-themeElevated border-2 border-blue-500 rounded-themePanel p-5 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)] group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Ongoing Class
                    </span>
                    <span className="text-[10px] font-black text-themeTextSec">09:30 - 11:00</span>
                </div>
                
                <h3 className="text-lg font-black text-themeText tracking-tight relative z-10">Constitutional Law</h3>
                <p className="text-xs font-bold text-themeTextSec mt-1 relative z-10"><i className="fa-solid fa-location-dot text-themeTextSec/50 mr-1"></i> Room 301</p>
                
                <button className="w-full mt-4 py-3 bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex justify-center items-center gap-2 relative z-10">
                    <i className="fa-solid fa-clipboard-user"></i> Take Attendance
                </button>
            </div>

            {/* 2. Quick Actions */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <h3 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Quick Actions</span>
                    <i className="fa-solid fa-bolt text-themeTextSec"></i>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-clipboard-user text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Take<br/>Attendance</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-file-arrow-up text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Upload<br/>Assignment</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-bullhorn text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Create<br/>Notice</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-check-double text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Approve<br/>Leave</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-star text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Internal<br/>Marks</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent hover:text-themeAccent transition-colors text-themeText group">
                        <i className="fa-solid fa-folder-open text-lg text-themeTextSec group-hover:text-themeAccent transition-colors"></i>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">Upload<br/>Notes</span>
                    </button>
                </div>
            </div>

            {/* 3. Notifications (Unread Only) */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <h3 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Notifications</span>
                    <span className="text-[9px] font-black text-themePanel bg-rose-500 px-1.5 py-0.5 rounded">2 New</span>
                </h3>
                
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">HOD Meeting Rescheduled</span>
                            <span className="text-[10px] text-themeTextSec mt-0.5">The meeting is now at 3:00 PM.</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">Library Due Date</span>
                            <span className="text-[10px] text-themeTextSec mt-0.5">Return 'Law of Torts' by tomorrow.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Upcoming Deadlines */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5">
                <h3 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Deadlines</span>
                    <i className="fa-solid fa-hourglass-half text-themeTextSec"></i>
                </h3>
                
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-l-2 border-rose-500 group cursor-pointer hover:bg-rose-500/5 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">Internal Marks Upload</span>
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">Due Tomorrow</span>
                        </div>
                        <i className="fa-solid fa-arrow-right text-[10px] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-themeElevated border-l-2 border-amber-500 group cursor-pointer hover:bg-amber-500/5 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-themeText">Research Abstract</span>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">In 3 Days</span>
                        </div>
                        <i className="fa-solid fa-arrow-right text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                </div>
            </div>

            {/* 5. Mini Calendar (Static mock for UI) */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col items-center justify-center min-h-[200px]">
                 <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">Mini Calendar Widget</span>
                 <i className="fa-regular fa-calendar text-3xl text-themeTextSec/30 mt-3"></i>
            </div>

        </div>
    );
}
