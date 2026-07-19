/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const STUDENT_NAV_GROUPS = [
    {
        category: "Central Hubs",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-bullhorn" },
            { id: "academic_center", label: "Academic Center", icon: "fa-solid fa-graduation-cap" },
            { id: "career_center", label: "Career & Clinics", icon: "fa-solid fa-briefcase" },
            { id: "support_center", label: "Support Center", icon: "fa-solid fa-headset" }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
    { id: "career_center", label: "Career", icon: "fa-solid fa-briefcase" },
    { id: "support_center", label: "Support", icon: "fa-solid fa-headset" },
];

export const STUDENT_NAV_EXPANDED = [
    {
        category: "Overview",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-bullhorn" }
        ]
    },
    {
        category: "Academics",
        links: [
            { id: "vault", label: "Course Vault", icon: "fa-solid fa-book" },
            { id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
            { id: "assignments", label: "Assignments", icon: "fa-solid fa-file-pen" },
            { id: "timetable", label: "Timetable", icon: "fa-solid fa-calendar-days" },
            { id: "examinations", label: "Examinations", icon: "fa-solid fa-file-contract" }
        ]
    },
    {
        category: "Career & Clinics",
        links: [
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "internships", label: "Internships", icon: "fa-solid fa-briefcase" },
            { id: "mootcourt", label: "Moot Court", icon: "fa-solid fa-scale-balanced" }
        ]
    },
    {
        category: "Support & Services",
        links: [
            { id: "fees", label: "Fee Management", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "leave", label: "Leave Requests", icon: "fa-solid fa-mug-hot" },
            { id: "approvals", label: "My Approvals", icon: "fa-solid fa-check-to-slot" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

export default function Sidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { sidebarMode } = useERP();

    const currentConfig = sidebarMode === 'expanded' ? STUDENT_NAV_EXPANDED : STUDENT_NAV_GROUPS;

    return (
        <SidebarFramework 
            config={currentConfig}
            bottomLinks={BOTTOM_NAV_LINKS}
            userSession={userSession}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            customBrandContext="Student"
        />
    );
}
