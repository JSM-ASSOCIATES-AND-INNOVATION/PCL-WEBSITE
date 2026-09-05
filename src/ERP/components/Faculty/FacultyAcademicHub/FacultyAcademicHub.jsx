/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { motion } from 'framer-motion';
import React, { useState } from "react";
import { theme } from "../../../theme";
import FacultyCourses from "../FacultyCourses/FacultyCourses";
import FacultyAttendance from "../FacultyAttendance/FacultyAttendance";
import FacultyTimetable from "../FacultyTimetable/FacultyTimetable";
import FacultyAssignments from "../FacultyAssignments/FacultyAssignments";
import FacultyMarks from "../FacultyMarks/FacultyMarks";

export default function FacultyAcademicHub({ isEmbedded = false }) {
    const [activeCategory, setActiveCategory] = useState("teaching");
    const [activeTab, setActiveTab] = useState("courses");

    const categories = [
        { id: "teaching", label: "Teaching & Schedule", icon: "fa-chalkboard-user" },
        { id: "evaluation", label: "Evaluations", icon: "fa-marker" }
    ];

    const tabs = {
        teaching: [
            { id: "courses", label: "My Courses", icon: "fa-book-open" },
            { id: "timetable", label: "Schedule", icon: "fa-calendar-days" },
            { id: "attendance", label: "Attendance", icon: "fa-user-check" }
        ],
        evaluation: [
            { id: "assignments", label: "Assignments", icon: "fa-file-lines" },
            { id: "marks", label: "Internal Marks", icon: "fa-spell-check" }
        ]
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setActiveTab(tabs[categoryId][0].id);
    };

    const Wrapper = isEmbedded ? 'div' : 'div';
    const wrapperClass = isEmbedded 
        ? "flex flex-col gap-6" 
        : "w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated";

    return (
        <Wrapper className={wrapperClass}>
            {/* MASTER HEADER - Only shows if NOT embedded */}
            {!isEmbedded && (
                <div className="w-full relative overflow-hidden rounded-[2.5rem] p-8 lg:p-10 xl:p-12 border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] bg-white/10 backdrop-blur-[80px] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 xl:gap-10 shrink-0">
                    <div className="relative z-10 flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-themeTextSec text-[10px] font-black uppercase tracking-widest mb-4 xl:mb-6 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span> 
                            Faculty Hub
                        </div>
                        <h1 className={`${theme.text.heading} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight mb-3 xl:mb-4 leading-none drop-shadow-sm dark:drop-shadow-md text-white`}>
                            Academic Center
                        </h1>
                        <p className="text-white/80 text-xs lg:text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            Manage your courses, schedule, and evaluations from one unified hub.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10 w-full lg:w-auto shrink-0">
                        {/* Category Segmented Control */}
                        <div className="flex bg-white/10 backdrop-blur-sm p-1.5 rounded-[2rem] border border-white/20 w-fit">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                        activeCategory === cat.id
                                            ? 'bg-white text-black shadow-sm'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <i className={`fa-solid ${cat.icon}`}></i> <span className="hidden sm:inline">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded Hub Navigation (Mobile Sub-Nav) */}
            <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/5 dark:bg-white/10 backdrop-blur-[80px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-2xl border border-black/10 dark:border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
                {tabs[activeCategory].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                activeTab === tab.id 
                                ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-black/10 dark:border-white/40 scale-100' 
                                : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                            }`}
                    >
                        <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'text-themeAccent' : 'opacity-70'}`}></i> {tab.label}
                    </button>
                ))}
            </div>

            {/* Hub Content Area - Passes isEmbedded={true} to children to hide their headers */}
            <div className="w-full flex-1 relative animate-fade-in">
                {activeTab === "courses" && <FacultyCourses isEmbedded={true} />}
                {activeTab === "timetable" && <FacultyTimetable isEmbedded={true} />}
                {activeTab === "attendance" && <FacultyAttendance isEmbedded={true} />}
                {activeTab === "assignments" && <FacultyAssignments isEmbedded={true} />}
                {activeTab === "marks" && <FacultyMarks isEmbedded={true} />}
            </div>
        </Wrapper>
    );
}
