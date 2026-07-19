import React, { useState } from "react";
import { theme } from "../../../theme";

// Import modular components
import MentorshipDashboard from "./MentorshipDashboard";
import MentorshipAllocations from "./MentorshipAllocations";
import MentorshipTransfers from "./MentorshipTransfers";
import MentorshipReports from "./MentorshipReports";
import MentorshipLogs from "./MentorshipLogs";

export default function AdminMentorship({ isHubView = false }) {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { id: "allocations", label: "Mentor Allocation", icon: "fa-network-wired" },
        { id: "transfers", label: "Transfers & Reshuffle", icon: "fa-shuffle" },
        { id: "reports", label: "Reports", icon: "fa-file-csv" },
        { id: "logs", label: "Audit Logs", icon: "fa-list-check" }
    ];

    return (
        <div className={`w-full ${isHubView ? 'bg-transparent text-themeText font-sans' : 'max-w-7xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in selection:bg-themeElevated'}`}>
            
            {/* Header and Tabs */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <i className="fa-solid fa-server text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Mentorship Engine</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Centralized administration for faculty-student mentor mapping.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8' : 'mb-6 lg:mb-8'}`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                            activeTab === tab.id
                                ? 'bg-themeAccent text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-themeAccent scale-100'
                                : 'text-themeTextSec hover:text-themeText hover:bg-themePanel border border-transparent scale-95 hover:scale-100'
                        }`}
                    >
                        <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''}`}></i>
                        {tab.label}
                    </button>
                ))}
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