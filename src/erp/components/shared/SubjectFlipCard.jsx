import React from 'react';

const SUBJECT_COLORS = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', solid: 'bg-blue-500', shadow: 'shadow-blue-500/10' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', solid: 'bg-emerald-500', shadow: 'shadow-emerald-500/10' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', solid: 'bg-purple-500', shadow: 'shadow-purple-500/10' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', solid: 'bg-orange-500', shadow: 'shadow-orange-500/10' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', solid: 'bg-rose-500', shadow: 'shadow-rose-500/10' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', solid: 'bg-amber-500', shadow: 'shadow-amber-500/10' },
};

export default function SubjectFlipCard({ subject, nextClass, faculty, color = 'blue' }) {
    const c = SUBJECT_COLORS[color] || SUBJECT_COLORS.blue;

    return (
        <div className={`w-full rounded-2xl border flex flex-col p-4 shadow-sm hover:shadow-md transition-shadow ${c.bg} ${c.border}`}>
            <div className="flex justify-between items-start mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${c.solid} text-[#0a0a0a] shrink-0`}>
                    <i className="fa-solid fa-book-open text-xs"></i>
                </div>
                {nextClass && (
                    <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec block">Next Class</span>
                        <span className={`text-[10px] font-black ${c.text}`}>{nextClass.day}</span>
                    </div>
                )}
            </div>
            
            <h4 className={`text-sm font-black leading-tight ${c.text} mt-2`}>{subject}</h4>
            
            <div className="mt-3 flex flex-col gap-1">
                {faculty && <p className="text-[10px] font-bold text-themeTextSec flex items-center gap-1.5"><i className="fa-regular fa-user"></i> {faculty}</p>}
                {nextClass?.time && <p className="text-[10px] font-bold text-themeTextSec flex items-center gap-1.5"><i className="fa-regular fa-clock"></i> {nextClass.time} - {nextClass.endTime}</p>}
                {nextClass?.room && <p className="text-[10px] font-bold text-themeTextSec flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {nextClass.room}</p>}
            </div>
        </div>
    );
}
