import React, { useState, useEffect, useMemo } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { generateCalendarICS } from "../../../lib/calendarGenerator";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const START_HOUR = 8; // 8 AM
const END_HOUR = 18; // 6 PM
const HOUR_HEIGHT = 90; // px per hour

export default function Timetable() {
    const { userSession, getTimetableForBatch } = useERP();
    
    const batchId = userSession?.academic_batch || 'BATCH-2026';
    const timetableObj = getTimetableForBatch(batchId);
    
    // Flatten all classes
    const allClasses = useMemo(() => {
        return Object.values(timetableObj).flatMap(dayObj => Object.values(dayObj));
    }, [timetableObj]);

    const [activeDay, setActiveDay] = useState("Monday");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [viewMode, setViewMode] = useState("week"); // 'week' | 'day'

    useEffect(() => {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        if (days.includes(today)) setActiveDay(today);
        
        // Auto-switch to day view on small screens
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setViewMode("day");
            } else {
                setViewMode("week");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => {
            clearInterval(timer);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // --- TIME & LOGIC HELPERS ---

    const parseDbTime = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(':');
        return parseInt(h, 10) * 60 + parseInt(m, 10);
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        const [hourStr, minuteStr] = timeString.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minuteStr} ${ampm}`;
    };

    const isClassLive = (startTime, endTime, day) => {
        const today = new Date().toLocaleDateString("en-US", { weekday: 'long' });
        if (day !== today) return false;
        const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        return currentTotalMinutes >= parseDbTime(startTime) && currentTotalMinutes <= parseDbTime(endTime);
    };

    const getNextDateForDay = (dayOfWeek, timeStr) => {
        const dmap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetDayIndex = dmap.indexOf(dayOfWeek);
        const today = new Date();
        const todayIndex = today.getDay();
        let daysUntil = targetDayIndex - todayIndex;
        if (daysUntil < 0) daysUntil += 7;
        
        const [hours, minutes] = timeStr.split(':');
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntil);
        targetDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return targetDate;
    };

    const handleExportICS = () => {
        if (allClasses.length === 0) return;
        const events = allClasses.map(cls => ({
            title: cls.subjects?.name || 'Class',
            description: `Faculty: ${cls.faculty?.full_name || 'TBA'} | Type: ${cls.class_type}`,
            location: cls.room || 'TBA',
            startDate: getNextDateForDay(cls.day_of_week, cls.start_time),
            endDate: getNextDateForDay(cls.day_of_week, cls.end_time)
        }));
        generateCalendarICS("My_Timetable", events);
    };

    // Calculate Conflict Detection & Timeline Positions
    const processedClasses = useMemo(() => {
        const classes = JSON.parse(JSON.stringify(allClasses)); // deep copy
        const daysMap = {};
        classes.forEach(c => {
            if (!daysMap[c.day_of_week]) daysMap[c.day_of_week] = [];
            daysMap[c.day_of_week].push(c);
        });

        const processed = [];

        Object.keys(daysMap).forEach(day => {
            let dayClasses = daysMap[day];
            dayClasses.sort((a, b) => parseDbTime(a.start_time) - parseDbTime(b.start_time));
            
            // Overlap clustering
            let clusters = [];
            dayClasses.forEach(cls => {
                const start = parseDbTime(cls.start_time);
                const end = parseDbTime(cls.end_time);
                cls._start = start;
                cls._end = end;
                
                let addedToCluster = false;
                for (let cluster of clusters) {
                    if (start < cluster.maxEnd) {
                        cluster.classes.push(cls);
                        cluster.maxEnd = Math.max(cluster.maxEnd, end);
                        addedToCluster = true;
                        break;
                    }
                }
                if (!addedToCluster) {
                    clusters.push({ classes: [cls], maxEnd: end });
                }
            });

            // Column assignment within clusters
            clusters.forEach(cluster => {
                let columns = [];
                cluster.classes.forEach(cls => {
                    let placed = false;
                    for (let i = 0; i < columns.length; i++) {
                        let col = columns[i];
                        let lastInCol = col[col.length - 1];
                        if (cls._start >= lastInCol._end) {
                            col.push(cls);
                            cls._colIndex = i;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) {
                        columns.push([cls]);
                        cls._colIndex = columns.length - 1;
                    }
                });
                cluster.classes.forEach(cls => {
                    cls._colCount = columns.length;
                    cls.hasConflict = columns.length > 1;
                });
            });
            
            processed.push(...dayClasses);
        });
        
        return processed;
    }, [allClasses]);

    // Premium Color Theme Mapper
    const getCategoryColor = (cat, hasConflict) => {
        if (hasConflict) return "bg-red-500/20 border-red-500/50 text-red-500";
        switch (cat?.toLowerCase()) {
            case "core": return "text-themeAccent border-themeBorderStrong bg-themeElevated";
            case "practical": return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
            case "elective": return "text-blue-500 border-blue-500/30 bg-blue-500/10";
            default: return "text-themeTextSec border-themeBorderStrong bg-themePanel";
        }
    };

    const getClassStyle = (cls) => {
        const top = ((cls._start - START_HOUR * 60) / 60) * HOUR_HEIGHT;
        const height = ((cls._end - cls._start) / 60) * HOUR_HEIGHT;
        const width = 100 / cls._colCount;
        const left = cls._colIndex * width;

        return {
            top: `${Math.max(0, top)}px`,
            height: `${height}px`,
            width: `calc(${width}% - 4px)`,
            left: `calc(${left}% + 2px)`,
            position: 'absolute'
        };
    };

    const hoursList = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* HEADER */}
            <div className={`${theme.layout.panel} p-6 lg:p-8 rounded-themePanel flex flex-col md:flex-row md:items-end justify-between gap-6 border-theme border-themeBorder relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden"></div>

                <div className="relative z-10 flex flex-col gap-2">
                    <h1 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText tracking-tight`}>Class Timetable</h1>
                    <div className="flex items-center gap-3">
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>{batchId} • Current View:</p>
                        <div className="flex bg-themeElevated rounded-lg p-1 border-theme border-themeBorderStrong">
                            <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-themeAccent text-[#050505]' : 'text-themeTextSec hover:text-themeText'}`}>Day</button>
                            <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-themeAccent text-[#050505]' : 'text-themeTextSec hover:text-themeText'}`}>Week</button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto z-10">
                    <button
                        onClick={handleExportICS}
                        className={`print:hidden w-full md:w-auto px-6 py-3.5 bg-themeElevated hover:bg-neutral-800 text-themeAccent border-theme border-themeBorderStrong rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2`}
                    >
                        <i className="fa-solid fa-calendar-plus"></i> Export ICS
                    </button>
                    <button
                        onClick={() => window.print()}
                        className={`print:hidden w-full md:w-auto ${theme.action.btnPrimary} flex items-center justify-center gap-2 px-6 py-3.5 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest active:scale-95`}
                    >
                        <i className="fa-solid fa-file-export text-[#050505]"></i> Print PDF
                    </button>
                </div>
            </div>

            {/* DAY SELECTOR (MOBILE/DAY VIEW ONLY) */}
            {viewMode === 'day' && (
                <div className="w-full overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory print:hidden">
                    <div className={`flex gap-2 p-1.5 ${theme.layout.panelElevated} rounded-themePanel min-w-max border-theme border-themeBorder`}>
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 snap-center shrink-0 ${activeDay === day
                                    ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong scale-[1.02]"
                                    : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ADVANCED TIMETABLE ENGINE GRID (DESKTOP ONLY) */}
            <div className={`hidden lg:block ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder overflow-x-auto bg-themeApp`}>
                <div className="min-w-[800px] w-full flex flex-col p-4 lg:p-6">
                    {/* Header Row */}
                    <div className="flex border-b-theme border-themeBorderStrong pb-4 mb-4">
                        <div className="w-16 lg:w-20 shrink-0"></div> {/* Time Column Spacer */}
                        {(viewMode === 'week' ? days : [activeDay]).map(day => (
                            <div key={day} className="flex-1 text-center">
                                <h3 className={`text-xs lg:text-sm font-black uppercase tracking-widest ${activeDay === day && viewMode === 'week' ? 'text-themeAccent' : 'text-themeTextSec'}`}>{day}</h3>
                            </div>
                        ))}
                    </div>

                    {/* Timeline Body */}
                    <div className="relative flex">
                        {/* Time Column */}
                        <div className="w-16 lg:w-20 shrink-0 flex flex-col relative z-20">
                            {hoursList.map(hour => (
                                <div key={hour} style={{ height: `${HOUR_HEIGHT}px` }} className="relative">
                                    <span className="absolute top-0 -translate-y-1/2 right-4 text-[10px] lg:text-xs font-bold text-themeTextSec opacity-70">
                                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Lines & Classes */}
                        <div className="flex-1 relative flex">
                            {/* Horizontal Grid Lines */}
                            <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                                {hoursList.map(hour => (
                                    <div key={`grid-${hour}`} style={{ height: `${HOUR_HEIGHT}px` }} className="border-t-theme border-themeBorder border-dashed opacity-50 w-full"></div>
                                ))}
                            </div>

                            {/* Current Time Indicator Line */}
                            {currentTime.getHours() >= START_HOUR && currentTime.getHours() <= END_HOUR && (
                                <div 
                                    className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                                    style={{ top: `${((currentTime.getHours() * 60 + currentTime.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT}px` }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-themeAccent -translate-x-1"></div>
                                    <div className="flex-1 border-t-2 border-themeAccent opacity-80"></div>
                                </div>
                            )}

                            {/* Day Columns */}
                            {(viewMode === 'week' ? days : [activeDay]).map((day, idx) => {
                                const dayClasses = processedClasses.filter(c => c.day_of_week === day);
                                return (
                                    <div key={`col-${day}`} className={`flex-1 relative z-10 ${idx !== 0 ? 'border-l-theme border-themeBorder/50' : ''}`}>
                                        {dayClasses.map(cls => {
                                            const isLive = isClassLive(cls.start_time, cls.end_time, cls.day_of_week);
                                            const conflictClasses = cls.hasConflict ? "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] z-20" : "";
                                            
                                            return (
                                                <div 
                                                    key={cls.id} 
                                                    style={getClassStyle(cls)}
                                                    className={`rounded-lg p-2 lg:p-3 overflow-hidden border-theme backdrop-blur-md transition-all hover:scale-[1.02] hover:z-30 group cursor-pointer ${getCategoryColor(cls.class_type, cls.hasConflict)} ${conflictClasses} ${isLive ? 'ring-2 ring-themeAccent shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}`}
                                                    title={`${cls.subjects?.name} | ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}${cls.hasConflict ? '\n⚠️ CONFLICT DETECTED' : ''}`}
                                                >
                                                    <div className="flex flex-col h-full gap-1">
                                                        <h4 className={`text-[10px] lg:text-xs font-black leading-tight ${cls.hasConflict ? 'text-red-100' : 'text-themeText'} line-clamp-2`}>
                                                            {cls.subjects?.name}
                                                        </h4>
                                                        <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest ${cls.hasConflict ? 'text-red-300' : 'text-themeTextSec'}`}>
                                                            {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                                        </span>
                                                        <div className="mt-auto flex justify-between items-end opacity-80">
                                                            <span className="text-[9px] truncate"><i className="fa-solid fa-location-dot mr-1"></i>{cls.room || 'TBA'}</span>
                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/20 uppercase">
                                                                {cls.class_type || 'Core'}
                                                            </span>
                                                        </div>
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

            {/* MOBILE LIST VIEW */}
            <div className="flex lg:hidden w-full flex-col gap-4">
                {processedClasses.filter(c => c.day_of_week === activeDay).length === 0 ? (
                    <div className="p-8 text-center bg-themePanel rounded-themePanel border-theme border-themeBorder border-dashed mt-2">
                        <i className="fa-regular fa-calendar-xmark text-4xl text-themeTextSec opacity-50 mb-3"></i>
                        <h4 className="text-themeText font-bold">No Classes Scheduled</h4>
                        <p className="text-xs text-themeTextSec mt-1">You have a free day today!</p>
                    </div>
                ) : (
                    processedClasses.filter(c => c.day_of_week === activeDay).map(cls => {
                        const isLive = isClassLive(cls.start_time, cls.end_time, cls.day_of_week);
                        const conflictClasses = cls.hasConflict ? "ring-1 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "";
                        return (
                            <div key={`mobile-${cls.id}`} className={`p-5 rounded-themePanel border-theme flex flex-col gap-3 relative overflow-hidden ${getCategoryColor(cls.class_type, cls.hasConflict)} ${conflictClasses} ${isLive ? 'ring-2 ring-themeAccent shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}`}>
                                {isLive && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-themeAccent/20 blur-xl rounded-full pointer-events-none"></div>
                                )}
                                <div className="flex justify-between items-start gap-4 z-10">
                                    <div className="flex-1">
                                        <h4 className={`text-[13px] font-black leading-tight mb-2 uppercase tracking-wide ${cls.hasConflict ? 'text-red-400' : 'text-themeText'}`}>{cls.subjects?.name}</h4>
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${cls.hasConflict ? 'text-red-300' : 'text-themeTextSec'}`}>
                                                <i className="fa-regular fa-clock w-4"></i>
                                                {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                            </span>
                                            <span className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest flex items-center">
                                                <i className="fa-solid fa-location-dot w-4"></i>
                                                {cls.room || 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                    {isLive && (
                                        <span className="bg-themeAccent text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md animate-pulse shrink-0">
                                            Live Now
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 pt-3 border-t border-current/10 flex justify-between items-center z-10">
                                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest"><i className="fa-solid fa-chalkboard-user mr-1.5"></i> {cls.faculty?.full_name || 'TBA'}</span>
                                    <span className="text-[9px] font-bold px-2 py-1 rounded bg-black/20 uppercase tracking-widest">
                                        {cls.class_type || 'Core'}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

        </div>
    );
}