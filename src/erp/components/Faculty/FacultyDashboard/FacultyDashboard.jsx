import React from "react";
import FacultyHeroBanner from "./FacultyHeroBanner";
import FacultyKPIGrid from "./FacultyKPIGrid";
import FacultyRow3 from "./FacultyRow3";
import FacultyRow4 from "./FacultyRow4";
import FacultyRow5 from "./FacultyRow5";
import FacultyRightSidebar from "./FacultyRightSidebar";

export default function FacultyDashboard({ setActiveTab }) {
    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-6 animate-fade-in selection:bg-themeElevated pb-20 lg:pb-8">
            
            {/* MAIN DASHBOARD CONTENT (Left Side) */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Row 1: Welcome Banner */}
                <FacultyHeroBanner />

                {/* Row 2: KPI Cards */}
                <FacultyKPIGrid />

                {/* Row 3: Today's Schedule, My Classes, Mentorship */}
                <FacultyRow3 />

                {/* Row 4: Student Performance, Pending Work, Research */}
                <FacultyRow4 />

                {/* Row 5: Recent Activity, Calendar, Announcements */}
                <FacultyRow5 />
            </div>

            {/* RIGHT SIDEBAR (Sticky on Desktop, Stacked on Mobile) */}
            <div className="w-full xl:w-[320px] 2xl:w-[360px] shrink-0">
                <div className="sticky top-6">
                    <FacultyRightSidebar />
                </div>
            </div>

            {/* FLOATING ACTION BUTTON (Mobile Only) */}
            <button className="lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-themeAccent text-[#0a0a0a] rounded-full shadow-2xl flex items-center justify-center text-xl z-50 hover:scale-105 active:scale-95 transition-transform">
                <i className="fa-solid fa-plus"></i>
            </button>
            
        </div>
    );
}