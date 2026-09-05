/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";

export const STUDENT_NAV_MEGA = [
    {
        category: "Student Hub",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { 
                id: "academics_group", label: "Academic Center", icon: "fa-solid fa-graduation-cap", 
                children: [
                    { id: "vault", label: "Course Vault", icon: "fa-solid fa-book" },
                    { id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
                    { id: "assignments", label: "Assignments", icon: "fa-solid fa-file-pen" },
                    { id: "timetable", label: "Timetable", icon: "fa-solid fa-calendar-days" },
                    { id: "examinations", label: "Examinations", icon: "fa-solid fa-file-contract" }
                ] 
            },
            {
                id: "career_group", label: "Career & Clinics", icon: "fa-solid fa-briefcase",
                children: [
                    { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
                    { id: "internships", label: "Internships & Career", icon: "fa-solid fa-building" },
                    { id: "mootcourt", label: "Moot Court Society", icon: "fa-solid fa-scale-balanced" },
                    { id: "achievements", label: "Achievements", icon: "fa-solid fa-trophy" },
                    { id: "cvbuilder", label: "CV Builder", icon: "fa-solid fa-file-pdf" }
                ]
            },
            {
                id: "support_group", label: "Support & Services", icon: "fa-solid fa-building-columns",
                children: [
                    { id: "fees", label: "Fee Management", icon: "fa-solid fa-indian-rupee-sign" },
                    { id: "leave", label: "Leave Requests", icon: "fa-solid fa-mug-hot" },
                    { id: "approvals", label: "My Approvals", icon: "fa-solid fa-check-to-slot" },
                    { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }
                ]
            }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
    { id: "career_center", label: "Career", icon: "fa-solid fa-briefcase" },
    { id: "support_center", label: "Support", icon: "fa-solid fa-building-columns" }
];

export default function Sidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    return (
        <SidebarFramework 
            config={STUDENT_NAV_MEGA}
            bottomLinks={BOTTOM_NAV_LINKS}
            userSession={userSession}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            customBrandContext="Student"
        />
    );
}
