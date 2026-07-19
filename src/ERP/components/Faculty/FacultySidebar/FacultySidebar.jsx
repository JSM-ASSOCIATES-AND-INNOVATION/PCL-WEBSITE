import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const FACULTY_NAV_GROUPS = [
    {
        category: "Central Hubs",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
            { id: "materials", label: "My Courses", icon: "fa-brands fa-google-drive" },
            { id: "timetable", label: "My Schedule", icon: "fa-solid fa-calendar-days" },
            { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
            { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-gavel" },
            { id: "facultyleave", label: "Time Off", icon: "fa-solid fa-mug-hot" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "materials", label: "Courses", icon: "fa-brands fa-google-drive" },
    { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
    { id: "timetable", label: "Schedule", icon: "fa-solid fa-calendar-days" },
];

export const FACULTY_NAV_EXPANDED = [
    {
        category: "Overview",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" }
        ]
    },
    {
        category: "Teaching & Academics",
        links: [
            { id: "materials", label: "My Courses", icon: "fa-brands fa-google-drive" },
            { id: "timetable", label: "My Schedule", icon: "fa-solid fa-calendar-days" },
        ]
    },
    {
        category: "Advising & Support",
        links: [
            { id: "mentorship", label: "Mentorship Hub", icon: "fa-solid fa-people-arrows" },
            { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-gavel" }
        ]
    },
    {
        category: "Administration",
        links: [
            { id: "facultyleave", label: "Time Off & Leaves", icon: "fa-solid fa-mug-hot" },
            { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-headset" }
        ]
    }
];

export default function FacultySidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { sidebarMode } = useERP();

    const currentConfig = sidebarMode === 'expanded' ? FACULTY_NAV_EXPANDED : FACULTY_NAV_GROUPS;

    return (
        <SidebarFramework 
            config={currentConfig}
            bottomLinks={BOTTOM_NAV_LINKS}
            userSession={userSession}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            customBrandContext="Faculty"
        />
    );
}
