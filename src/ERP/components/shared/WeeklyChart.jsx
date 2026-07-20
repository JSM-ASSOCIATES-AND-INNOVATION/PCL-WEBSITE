/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const START_HOUR = 8; // 8:00 AM
const END_HOUR = 18; // 6:00 PM
const HOUR_HEIGHT = 65; 
const GRID_OFFSET_Y = 20; // Offset everything down so the top label doesn't clip

const SUBJECT_COLORS = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', solid: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', solid: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', solid: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', solid: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', solid: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', solid: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
};

export default function WeeklyChart({ schedule = [], onLectureClick, role = 'student' }) {
    
    // Check which days have classes to dynamically hide fully empty weekends if we want
    // But for admin, it's better to show all working days. 
    // We'll show Monday-Saturday by default. Hide Sunday unless it has classes.
    const hasSundayClass = schedule.some(c => c.day === 'Sunday');
    const displayDays = hasSundayClass ? DAYS : DAYS.slice(0, 6);

    // Generate time labels
    const timeLabels = [];
    for (let i = START_HOUR; i <= END_HOUR; i++) {
        const ampm = i >= 12 ? 'PM' : 'AM';
        const hour = i % 12 || 12;
        timeLabels.push(`${hour}:00 ${ampm}`);
    }

    const getBlockStyle = (startTimeStr, endTimeStr) => {
        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':');
            return parseInt(h, 10) * 60 + parseInt(m, 10);
        };

        const startMins = parseTime(startTimeStr);
        const endMins = parseTime(endTimeStr);
        const gridStartMins = START_HOUR * 60;

        const top = ((startMins - gridStartMins) / 60) * HOUR_HEIGHT + GRID_OFFSET_Y;
        const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

        return {
            top: `${top}px`,
            height: `${height}px`,
        };
    };

    return (
        <div className="bg-themePanel border border-themeBorder rounded-2xl shadow-sm flex flex-col w-full relative overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[900px] flex flex-col">
                    
                    {/* Header: Days */}
                    <div className="flex border-b border-themeBorder bg-themeElevated/80 sticky top-0 z-30 backdrop-blur-md">
                        <div className="w-20 shrink-0 border-r border-themeBorder bg-themeElevated/90 sticky left-0 z-40 backdrop-blur-md"></div>
                        
                        {displayDays.map(day => (
                            <div key={day} className="flex-1 py-4 text-center border-r border-themeBorder/50 last:border-r-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="flex relative bg-themeApp w-full">
                        
                        {/* Y-Axis: Time Labels */}
                        <div className="w-20 shrink-0 border-r border-themeBorder bg-themePanel sticky left-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.05)]" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + GRID_OFFSET_Y * 2}px` }}>
                            {timeLabels.map((time, index) => (
                                <div 
                                    key={time} 
                                    className="absolute right-0 pr-3 w-full text-right flex items-center justify-end"
                                    style={{ top: `${index * HOUR_HEIGHT + GRID_OFFSET_Y - 8}px` }}
                                >
                                    <span className="text-[10px] font-bold text-themeTextSec/80 tracking-tight">{time}</span>
                                </div>
                            ))}
                        </div>

                        {/* X-Axis: Columns Container */}
                        <div className="flex-1 flex relative">
                            
                            {/* Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none z-0">
                                {timeLabels.map((time, index) => (
                                    <div 
                                        key={`line-${index}`} 
                                        className="absolute w-full border-t border-themeBorder/40 border-dashed"
                                        style={{ top: `${index * HOUR_HEIGHT + GRID_OFFSET_Y}px` }}
                                    ></div>
                                ))}
                            </div>

                            {/* Day Columns */}
                            {displayDays.map(day => {
                                const dayClasses = schedule.filter(c => c.day === day);
                                
                                return (
                                    <div key={day} className="flex-1 border-r border-themeBorder/20 last:border-r-0 relative min-w-[120px] z-10">
                                        {dayClasses.map(cls => {
                                            const style = getBlockStyle(cls.time, cls.endTime);
                                            const c = SUBJECT_COLORS[cls.color] || SUBJECT_COLORS.blue;

                                            return (
                                                <div 
                                                    key={cls.id}
                                                    onClick={() => onLectureClick && onLectureClick(cls)}
                                                    className={`absolute inset-x-[3px] p-2 rounded-xl border backdrop-blur-sm transition-all cursor-pointer hover:-translate-y-1 z-10 group overflow-hidden ${c.bg} ${c.border} ${c.shadow}`}
                                                    style={style}
                                                >
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.solid} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                                    
                                                    <div className="pl-2 h-full flex flex-col justify-between">
                                                        <div>
                                                            <h4 className={`text-[11px] font-black leading-tight ${c.text} drop-shadow-sm`}>{cls.subject}</h4>
                                                            <p className="text-[9px] font-bold text-themeText mt-1 truncate opacity-90">{cls.time} - {cls.endTime}</p>
                                                        </div>
                                                        
                                                        {parseInt(style.height) >= 55 && (
                                                            <div className="mt-1 flex flex-col gap-0.5">
                                                                <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-location-dot opacity-70 w-3"></i> {cls.room}</span>
                                                                {(role === 'student' || role === 'admin') && cls.faculty && (
                                                                    <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-user opacity-70 w-3"></i> {cls.faculty}</span>
                                                                )}
                                                                {(role === 'faculty' || role === 'admin') && cls.semester && (
                                                                    <span className="block text-[9px] font-bold text-themeTextSec truncate"><i className="fa-solid fa-graduation-cap opacity-70 w-3"></i> {cls.semester}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
