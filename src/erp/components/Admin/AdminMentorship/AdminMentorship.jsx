import React, { useState } from "react";
import { theme } from "../../../theme";

// Import modular components
import MentorshipDashboard from "./MentorshipDashboard";
import MentorshipAllocations from "./MentorshipAllocations";
import MentorshipTransfers from "./MentorshipTransfers";
import MentorshipReports from "./MentorshipReports";
import MentorshipLogs from "./MentorshipLogs";

export default function AdminMentorship() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { id: "allocations", label: "Mentor Allocation", icon: "fa-network-wired" },
        { id: "transfers", label: "Transfers & Reshuffle", icon: "fa-shuffle" },
        { id: "reports", label: "Reports", icon: "fa-file-csv" },
        { id: "logs", label: "Audit Logs", icon: "fa-list-check" }
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-fade-in pb-20 lg:pb-8">
            
            {/* Header and Tab Navigation */}
            <div className="bg-themeElevated rounded-themePanel p-3 lg:p-6 border-[length:var(--border-width)] border-themeBorder shadow-themeElevated relative overflow-hidden flex flex-col gap-3 lg:gap-6">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                
                <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-themePanel border-[length:var(--border-width)] border-themeBorderStrong rounded-themeBtn flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-users-viewfinder text-indigo-500 text-lg lg:text-xl"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-lg lg:text-2xl tracking-tight text-themeText leading-tight`}>Mentorship Engine</h1>
                        <p className={`${theme.text.secondary} text-[10px] lg:text-xs font-medium mt-0.5 leading-tight hidden sm:block`}>Centralized administration for faculty-student mentor mapping.</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 relative z-10 pt-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[calc(50%-0.5rem)] lg:flex-none lg:min-w-0 flex items-center justify-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 lg:py-2.5 rounded-themeBtn text-[9px] lg:text-xs font-black uppercase tracking-widest transition-all border-[length:var(--border-width)] ${
                                activeTab === tab.id
                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg scale-105'
                                    : 'bg-themePanel text-themeTextSec border-themeBorder hover:border-themeBorderStrong hover:text-themeText'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''} text-sm lg:text-base`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full relative min-h-[500px]">
                {activeTab === "dashboard" && <MentorshipDashboard setActiveTab={setActiveTab} />}
                {activeTab === "allocations" && <MentorshipAllocations />}
                {activeTab === "transfers" && <MentorshipTransfers />}
                {activeTab === "reports" && <MentorshipReports />}
                {activeTab === "logs" && <MentorshipLogs />}
            </div>

        </div>
    );
}