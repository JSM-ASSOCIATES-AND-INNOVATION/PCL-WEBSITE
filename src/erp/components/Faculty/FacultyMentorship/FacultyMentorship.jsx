import React, { useState } from "react";
import { theme } from "../../../theme";

// Import modular components
import FMDashboard from "./FMDashboard";
import FMMenteesList from "./FMMenteesList";
import FMRequestsInbox from "./FMRequestsInbox";
import FMLeaveApprovals from "./FMLeaveApprovals";
import FMMeetings from "./FMMeetings";
import FMStudentProfile from "./FMStudentProfile";

export default function FacultyMentorship() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedStudent, setSelectedStudent] = useState(null); // When set, opens the profile
    const [pendingCount, setPendingCount] = useState(0);

    const handleViewStudent = (studentId) => {
        setSelectedStudent(studentId);
        setActiveTab("profile");
    };

    const handleCloseProfile = () => {
        setSelectedStudent(null);
        setActiveTab("mentees");
    };

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { id: "mentees", label: "My Mentees", icon: "fa-users" },
        { id: "leaves", label: "Leave Approvals", icon: "fa-house-medical" },
        { id: "inbox", label: "Other Requests", icon: "fa-inbox" },
        { id: "meetings", label: "Meetings & Appointments", icon: "fa-calendar-check" }
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-fade-in pb-32 lg:pb-8">
            
            {/* Header and Tab Navigation */}
            <div className="bg-themeElevated rounded-themePanel p-5 lg:p-6 border-[length:var(--border-width)] border-themeBorder shadow-themeElevated relative overflow-hidden flex flex-col gap-6">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-themePanel border-[length:var(--border-width)] border-themeBorderStrong rounded-themeBtn flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-user-graduate text-blue-500 text-xl"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-xl lg:text-2xl tracking-tight text-themeText`}>Faculty Mentorship</h1>
                        <p className={`${theme.text.secondary} text-xs font-medium mt-0.5`}>Your workspace for guiding and managing your assigned mentees.</p>
                    </div>
                </div>

            {/* Tab Navigation (Hidden when viewing a profile) */}
            {activeTab !== "profile" && (
                <div className="flex flex-wrap items-center gap-1.5 lg:gap-2 relative z-10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[calc(50%-0.5rem)] lg:flex-none lg:min-w-0 flex items-center justify-center gap-1.5 lg:gap-2 px-2 lg:px-4 py-2 rounded-themeBtn text-[9px] lg:text-xs font-black uppercase tracking-widest transition-colors border-[length:var(--border-width)] ${
                                activeTab === tab.id
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                                    : 'bg-themePanel text-themeTextSec border-themeBorder hover:border-themeBorderStrong hover:text-themeText'
                            }`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            <span className="truncate">{tab.label}</span>
                            {tab.id === "inbox" && pendingCount > 0 && (
                                <span className="ml-1 px-1 py-0.5 bg-rose-500 text-white rounded text-[8px]">{pendingCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
            
            {/* Profile Back Button */}
            {activeTab === "profile" && (
                <div className="flex items-center gap-2 relative z-10">
                    <button
                        onClick={handleCloseProfile}
                        className="px-4 py-2 bg-themePanel border-[length:var(--border-width)] border-themeBorder hover:border-themeBorderStrong rounded-themeBtn text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Mentees
                    </button>
                </div>
            )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full relative min-h-[500px]">
            {activeTab === "dashboard" && <FMDashboard setActiveTab={setActiveTab} setPendingCount={setPendingCount} />}
            {activeTab === "mentees" && <FMMenteesList onViewStudent={handleViewStudent} />}
            {activeTab === "leaves" && <FMLeaveApprovals onViewStudent={handleViewStudent} setPendingCount={setPendingCount} />}
            {activeTab === "inbox" && <FMRequestsInbox onViewStudent={handleViewStudent} setPendingCount={setPendingCount} />}
            {activeTab === "meetings" && <FMMeetings />}
            {activeTab === "profile" && selectedStudent && <FMStudentProfile studentId={selectedStudent} />}
        </div>

        </div>
    );
}