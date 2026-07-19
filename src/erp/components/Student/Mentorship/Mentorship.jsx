import React, { useState } from "react";
import { theme } from "../../../theme";

// Modular Imports
import SMDashboard from "./SMDashboard";
import SMMentorProfile from "./SMMentorProfile";
import SMLeaveRequests from "./SMLeaveRequests";
import SMInternships from "./SMInternships";
import SMResearch from "./SMResearch";
import SMAchievements from "./SMAchievements";
import SMMessages from "./SMMessages";
import SMMyRequests from "./SMMyRequests";
import SMMeetingsHistory from "./SMMeetingsHistory";
import SMTimeline from "./SMTimeline";

export default function Mentorship() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const mainTabs = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { id: "mentor", label: "My Mentor", icon: "fa-user-tie" },
        { id: "meetings", label: "Meetings", icon: "fa-clock-rotate-left" },
        { id: "leaves", label: "Leave Requests", icon: "fa-house-medical", highlight: true },
        { id: "internships", label: "Internships", icon: "fa-briefcase" },
        { id: "research", label: "Research", icon: "fa-microscope" },
        { id: "achievements", label: "Achievements", icon: "fa-trophy" },
        { id: "messages", label: "Messages", icon: "fa-comments" },
        { id: "requests", label: "My Requests", icon: "fa-list-check" },
        { id: "timeline", label: "Timeline", icon: "fa-timeline" }
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-fade-in pb-20 lg:pb-8">
            
            {/* Header and Tab Navigation */}
            <div className="bg-themeElevated rounded-themePanel p-5 lg:p-6 border-[length:var(--border-width)] border-themeBorder shadow-themeElevated relative overflow-hidden flex flex-col gap-6">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-themePanel border-[length:var(--border-width)] border-themeBorderStrong rounded-themeBtn flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-compass text-indigo-500 text-xl"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-xl lg:text-2xl tracking-tight text-themeText`}>Mentorship Hub</h1>
                        <p className={`${theme.text.secondary} text-xs font-medium mt-0.5`}>Your central hub for academic guidance, approvals, and co-curricular support.</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 relative z-10">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-themeBtn text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 border-[length:var(--border-width)] ${
                                activeTab === tab.id
                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                                    : 'bg-themePanel text-themeTextSec border-themeBorder hover:border-themeBorderStrong hover:text-themeText'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} ${tab.highlight && activeTab !== tab.id ? 'text-amber-500' : ''}`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full relative min-h-[500px]">
                {activeTab === "dashboard" && <SMDashboard setActiveTab={setActiveTab} />}
                {activeTab === "mentor" && <SMMentorProfile />}
                {activeTab === "meetings" && <SMMeetingsHistory />}
                {activeTab === "leaves" && <SMLeaveRequests />}
                {activeTab === "internships" && <SMInternships />}
                {activeTab === "research" && <SMResearch />}
                {activeTab === "achievements" && <SMAchievements />}
                {activeTab === "messages" && <SMMessages />}
                {activeTab === "requests" && <SMMyRequests />}
                {activeTab === "timeline" && <SMTimeline />}
            </div>

        </div>
    );
}