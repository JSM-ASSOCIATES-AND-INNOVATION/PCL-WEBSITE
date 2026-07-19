/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from "react";
import SidebarFramework from "../../shared/Navigation/SidebarFramework";
import { useERP } from "../../../context/ErpContext";

export const ADMIN_NAV_GROUPS = [
    {
        category: "Master Control",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
            { id: "notices", label: "Broadcasts", icon: "fa-solid fa-bullhorn" },
            { id: "operations", label: "Operations HQ", icon: "fa-solid fa-gears" },
            { id: "academic", label: "Academic Hub", icon: "fa-solid fa-graduation-cap" },
            { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-scale-balanced" },
            { id: "website", label: "Website Hub", icon: "fa-solid fa-globe" },
            { id: "finance", label: "Finance Ledger", icon: "fa-solid fa-indian-rupee-sign" },
            { id: "sql", label: "SQL Studio", icon: "fa-solid fa-database" },
            { id: "credentials", label: "Security & Settings", icon: "fa-solid fa-shield-halved" }
        ]
    }
];

const BOTTOM_NAV_LINKS = [
    { id: "dashboard", label: "Home", icon: "fa-solid fa-server" },
    { id: "operations", label: "Operations", icon: "fa-solid fa-gears" },
    { id: "academic", label: "Academic", icon: "fa-solid fa-graduation-cap" },
    { id: "website", label: "Website", icon: "fa-solid fa-globe" },
];

export const ADMIN_NAV_EXPANDED = [
    {
        category: "Master Control",
        links: [
            { id: "dashboard", label: "Dashboard", icon: "fa-solid fa-server" },
            { id: "notices", label: "Broadcasts", icon: "fa-solid fa-bullhorn" }
        ]
    },
    {
        category: "Command Hubs",
        links: [
            { id: "operations", label: "Operations HQ", icon: "fa-solid fa-gears" },
            { id: "academic", label: "Academic Hub", icon: "fa-solid fa-graduation-cap" },
            { id: "clinics", label: "Clinics Hub", icon: "fa-solid fa-scale-balanced" },
            { id: "website", label: "Website Hub", icon: "fa-solid fa-globe" }
        ]
    },
    {
        category: "Core Integrations",
        links: [
            { id: "finance", label: "Finance Ledger", icon: "fa-solid fa-indian-rupee-sign" }
        ]
    },
    {
        category: "System",
        links: [
            { id: "sql", label: "SQL Studio", icon: "fa-solid fa-database" },
            { id: "credentials", label: "Security", icon: "fa-solid fa-fingerprint" }
        ]
    }
];

export default function AdminSidebar({ userSession, activeTab, setActiveTab, onLogout }) {
    const { sidebarMode } = useERP();
    
    const currentConfig = sidebarMode === 'expanded' ? ADMIN_NAV_EXPANDED : ADMIN_NAV_GROUPS;

    return (
        <SidebarFramework 
            config={currentConfig}
            bottomLinks={BOTTOM_NAV_LINKS}
            userSession={userSession}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            customBrandContext="Admin"
        />
    );
}
