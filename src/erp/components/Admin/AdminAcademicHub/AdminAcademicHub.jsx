import React, { useState } from "react";
import { theme } from "../../../theme";
import AdminTimetableBuilder from "../AdminTimetableBuilder/AdminTimetableBuilder";
import AdminAcademicCalendar from "../AdminAcademicCalendar/AdminAcademicCalendar";
import AdminExaminations from "../Examinations/AdminExaminations";
import AdminMentorship from "../AdminMentorship/AdminMentorship";

export default function AdminAcademicHub() {
    const [activeCategory, setActiveCategory] = useState("planning");
    const [activeTab, setActiveTab] = useState("timetable");

    const categories = [
        { id: "planning", label: "Schedules & Planning", icon: "fa-calendar-day" },
        { id: "success", label: "Student Success", icon: "fa-user-graduate" }
    ];

    const tabs = {
        planning: [
            { id: "timetable", label: "Master Timetable", icon: "fa-calendar-days" },
            { id: "academic_calendar", label: "Academic Calendar", icon: "fa-calendar-alt" },
            { id: "examinations", label: "Examinations", icon: "fa-file-shield" }
        ],
        success: [
            { id: "mentorship", label: "Mentorship Hub", icon: "fa-network-wired" }
        ]
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setActiveTab(tabs[categoryId][0].id); // Auto-select first tab of new category
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* ═══ MASTER HUB HEADER ═══ */}
            <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                        <i className="fa-solid fa-graduation-cap text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                    </div>
                    <div>
                        <span className="px-2 lg:px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 inline-block shadow-sm">Academic Operations</span>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Academic Center</h1>
                        <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage schedules, examinations, and student mentorship.</p>
                    </div>
                </div>

                {/* Dual-Line Navigation System */}
                <div className="flex flex-col gap-3 relative z-10">
                    {/* Line 1: Categories */}
                    <div className="flex flex-wrap gap-2 w-fit">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                    activeCategory === cat.id 
                                    ? 'bg-black/40 text-white border border-white/30 shadow-inner' 
                                    : 'bg-black/10 text-white/70 hover:bg-black/20 hover:text-white border border-transparent'
                                }`}
                            >
                                <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Line 2: Sub-Modules */}
                    <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
                        {tabs[activeCategory].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                    activeTab === t.id 
                                    ? 'bg-white text-themeAccent shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white scale-100' 
                                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                                }`}
                            >
                                <i className={`fa-solid ${t.icon} ${activeTab === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ RENDER SUB-MODULE ═══ */}
            <div className="animate-fade-in">
                {activeTab === "timetable" && <AdminTimetableBuilder isHubView={true} />}
                {activeTab === "academic_calendar" && <AdminAcademicCalendar isHubView={true} />}
                {activeTab === "examinations" && <AdminExaminations isHubView={true} />}
                {activeTab === "mentorship" && <AdminMentorship isHubView={true} />}
            </div>
        </div>
    );
}
