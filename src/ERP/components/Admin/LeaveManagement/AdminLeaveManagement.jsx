/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from "../../../theme";

// Sub-components (we'll implement these next)
import LeaveDashboard from "./LeaveDashboard";
import LeaveRequests from "./LeaveRequests";
import LeaveCalendar from "./LeaveCalendar";
import LeaveAnalytics from "./LeaveAnalytics";
import LeavePolicies from "./LeavePolicies";
import LeaveAudit from "./LeaveAudit";
import LeaveReview from "./LeaveReview"; // Detailed view of a request
import ReplacementEngine from "./ReplacementEngine";

export default function AdminLeaveManagement({ isHubView = false }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedRequest, setSelectedRequest] = useState(null); // When set, opens the Review page

    const handleReviewRequest = (request) => {
        setSelectedRequest(request);
        setActiveTab("review");
    };

    const handleCloseReview = () => {
        setSelectedRequest(null);
        setActiveTab("requests");
    };

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { id: "requests", label: "Leave Requests", icon: "fa-inbox" },
        { id: "calendar", label: "Calendar", icon: "fa-calendar-days" },
        { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
        { id: "policies", label: "Policies", icon: "fa-scale-balanced" },
        { id: "audit", label: "Audit Log", icon: "fa-clipboard-list" }
    ];

    return (
        <div className={`w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-fade-in pb-20 lg:pb-8 ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
            
            {/* Header and Tab Navigation */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <i className="fa-solid fa-plane-departure text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Leave Management</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage faculty leaves and ensure academic continuity.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation (Hidden when viewing a review) */}
            {activeTab !== "review" && (
                <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8 w-fit max-w-full' : ''}`}>
                    {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 lg:flex-none px-4 lg:px-6 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 min-w-max ${
                                    activeTab === tab.id
                                        ? 'bg-white text-themeAccent shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white scale-100'
                                        : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                                }`}
                            >
                                <i className={`fa-solid ${tab.icon} ${activeTab === tab.id ? 'animate-pulse' : ''} text-sm lg:text-base`}></i>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Review Back Button */}
                {activeTab === "review" && (
                    <div className="flex items-center gap-2 relative z-10 pt-2">
                        <button
                            onClick={handleCloseReview}
                            className="px-5 py-3 bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/20 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest text-white transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            Back to Requests
                        </button>
                    </div>
                )}

            {/* Main Content Area */}
            <div className="flex-1 w-full relative min-h-[500px]">
                {activeTab === "dashboard" && <LeaveDashboard setActiveTab={setActiveTab} />}
                {activeTab === "requests" && <LeaveRequests onReviewRequest={handleReviewRequest} />}
                {activeTab === "calendar" && <LeaveCalendar />}
                {activeTab === "analytics" && <LeaveAnalytics />}
                {activeTab === "policies" && <LeavePolicies />}
                {activeTab === "audit" && <LeaveAudit />}
                {activeTab === "review" && selectedRequest && (
                    <LeaveReview request={selectedRequest} onClose={handleCloseReview} onAssignReplacement={() => setActiveTab("replacement")} />
                )}
                {activeTab === "replacement" && selectedRequest && (
                    <ReplacementEngine request={selectedRequest} onBack={() => setActiveTab("review")} onComplete={handleCloseReview} />
                )}
            </div>

        </div>
    );
}
