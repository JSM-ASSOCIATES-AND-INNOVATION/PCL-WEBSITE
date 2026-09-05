/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";

export const FACULTY_NAV_MEGA = [
    {
        category: "Faculty Hub",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
            { id: "notices", label: "Notice Board", icon: "fa-solid fa-thumbtack" },
            { 
                id: "teaching_group", label: "Teaching & Academics", icon: "fa-solid fa-graduation-cap", 
                children: [
                    { id: "materials", label: "My Courses", icon: "fa-brands fa-google-drive" },
                    { id: "timetable", label: "My Schedule", icon: "fa-solid fa-calendar-days" },
                    { id: "attendance", label: "Attendance", icon: "fa-solid fa-clipboard-user" },
                    { id: "roster", label: "Class Roster", icon: "fa-solid fa-users-viewfinder" },
                ] 
            },
            {
                id: "advising_group", label: "Advising & Clinics", icon: "fa-solid fa-gavel",
                children: [
                    { id: "mentorship", label: "Mentorship", icon: "fa-solid fa-people-arrows" },
                    { id: "clinics", label: "Clinics & Societies", icon: "fa-solid fa-scale-balanced" },
                ]
            },
            {
                id: "admin_group", label: "Administration", icon: "fa-solid fa-building-columns",
                children: [
                    { id: "facultyleave", label: "Time Off", icon: "fa-solid fa-mug-hot" },
                    { id: "helpdesk", label: "IT Helpdesk", icon: "fa-solid fa-laptop-medical" }
                ]
            }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-house" },
    { id: "faculty_academic_center", label: "Academics", icon: "fa-solid fa-graduation-cap" },
    { id: "faculty_advising_center", label: "Advising", icon: "fa-solid fa-people-arrows" },
    { id: "faculty_admin_center", label: "Admin", icon: "fa-solid fa-building-columns" }
];

export default function FacultySidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    return (
        <SidebarFramework 
            config={FACULTY_NAV_MEGA}
            bottomLinks={BOTTOM_NAV_LINKS}
            userSession={userSession}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            customBrandContext="Faculty"
        />
    );
}
