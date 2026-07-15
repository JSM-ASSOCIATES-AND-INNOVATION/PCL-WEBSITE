import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

// Import Autonomous Child Modules
import PersonalInfo from "./PersonalInfo";
import AcademicDetails from "./AcademicDetails";
import DigitalLocker from "./DigitalLocker";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";

export default function Credentials() {
    const { userSession } = useERP();
    const [view, setView] = useState("personal");
    
    const [headerData, setHeaderData] = useState(() => {
        const studentId = userSession?.db_id || userSession?.id;
        if (studentId) {
            const cached = sessionStorage.getItem(`credentials_header_${studentId}`);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch (e) {
                    console.error("Failed to parse cached credentials header", e);
                }
            }
        }
        
        return {
            firstName: userSession?.name ? userSession.name.split(" ")[0] : "User",
            lastName: userSession?.name ? userSession.name.split(" ").slice(1).join(" ") : "",
            program: userSession?.academic_batch || "Law Program",
            enrollmentNo: userSession?.id || "N/A",
            phone: "Update in Profile",
            dob: "--",
            bloodGroup: "--",
            email: userSession?.email || "Not Updated",
            linkedIn: null
        };
    });

    useEffect(() => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;

        const fetchIdentityBanner = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('erp_id, full_name, academic_batch, department, phone, dob, blood_group, email, questionnaire_data')
                    .eq('id', studentId) 
                    .single();

                if (error) throw error;

                const nameParts = data.full_name ? data.full_name.split(" ") : ["User", ""];
                const qd = data.questionnaire_data || {};

                const freshData = {
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                    program: data.department || data.academic_batch || "B.B.A. LL.B. (Hons.)",
                    enrollmentNo: data.erp_id || userSession.id,
                    phone: data.phone || qd.emergencyPhone || "Not Updated",
                    dob: data.dob ? new Date(data.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Not Updated",
                    bloodGroup: data.blood_group || qd.bloodGroup || "--",
                    email: data.email || "Not Updated",
                    linkedIn: qd.linkedInProfile || null
                };

                setHeaderData(freshData);
                sessionStorage.setItem(`credentials_header_${studentId}`, JSON.stringify(freshData));

            } catch (err) {
                console.error("Failed to load identity banner:", err);
            }
        };

        fetchIdentityBanner();
    }, [userSession]);

    // Compute proper initials
    const getInitials = () => {
        const fn = (headerData.firstName || '').replace(/[^a-zA-Z\s]/g, '').trim();
        const ln = (headerData.lastName || '').replace(/[^a-zA-Z\s]/g, '').trim();
        const lastParts = ln.split(/\s+/).filter(Boolean);
        const firstInit = fn.charAt(0) || '';
        const lastInit = lastParts.length > 0 ? lastParts[lastParts.length - 1].charAt(0) : '';
        const result = (firstInit + lastInit).toUpperCase();
        return result || (userSession?.role === 'admin' ? 'AD' : userSession?.role === 'faculty' ? 'FC' : 'ST');
    };

    const allTabs = [
        { id: 'personal', label: 'Personal', fullLabel: 'Personal Info', icon: 'fa-user' },
        { id: 'academic', label: 'Academic', fullLabel: 'Academic Details', icon: 'fa-graduation-cap' },
        { id: 'documents', label: 'Locker', fullLabel: 'Digital Locker', icon: 'fa-folder-open' },
        { id: 'security', label: 'Security', fullLabel: 'Security & Login', icon: 'fa-shield-halved' },
        { id: 'appearance', label: 'Theme', fullLabel: 'Appearance', icon: 'fa-palette' }
    ];

    const tabs = userSession?.role === 'admin' 
        ? allTabs.filter(t => ['security', 'appearance'].includes(t.id))
        : allTabs;

    // Use a useEffect to override the initial state if admin (since useState evaluates immediately)
    useEffect(() => {
        if (userSession?.role === 'admin' && view !== 'security' && view !== 'appearance') {
            setView('security');
        }
    }, [userSession?.role, view]);

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* 1. MASTER PROFILE BANNER */}
            <div className="bg-themeElevated rounded-themePanel p-1 relative overflow-hidden border-theme border-themeBorder">
                <div className="absolute top-0 right-0 w-full h-32 lg:h-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-themeElevated rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-row items-center gap-4 lg:gap-8 p-4 lg:p-8 w-full">
                    {/* Avatar */}
                    <div className="relative group shrink-0">
                        <div className="w-16 h-16 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-themePanel border-4 border-[#050505] flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-xl md:text-3xl lg:text-4xl font-black text-[#050505]">
                                {getInitials()}
                            </div>
                            <div className="absolute inset-0 bg-themeApp flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <i className="fa-solid fa-camera text-themeText text-sm md:text-xl"></i>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 md:bottom-1 md:right-1 w-6 h-6 md:w-10 md:h-10 bg-emerald-500 rounded-full border-3 md:border-4 border-[#050505] flex items-center justify-center" title="Identity Verified">
                            <i className="fa-solid fa-check text-[#050505] text-[8px] md:text-xs font-black"></i>
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-3xl lg:text-4xl font-black text-themeText tracking-tight mb-1 md:mb-2 truncate">
                            {headerData.firstName} {headerData.lastName}
                        </h1>
                        
                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
                            <span className="text-themeAccent font-bold text-[8px] md:text-xs tracking-widest uppercase bg-themeElevated px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-theme border-themeBorderStrong truncate max-w-[160px] md:max-w-none">
                                {headerData.program}
                            </span>
                            
                            <span className="hidden sm:flex text-themeTextSec font-semibold text-[10px] md:text-xs tracking-wide bg-themeApp px-3 py-1.5 rounded-lg border-theme border-themeBorder items-center">
                                <i className="fa-solid fa-envelope mr-1.5 opacity-70"></i>
                                {headerData.email}
                            </span>

                            {headerData.linkedIn && (
                                <a 
                                    href={headerData.linkedIn} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-themeApp px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-theme border-themeBorder hover:bg-themeElevated transition-colors flex items-center justify-center"
                                    title="LinkedIn Profile"
                                >
                                    <i className="fa-brands fa-linkedin text-blue-500 text-xs md:text-[14px]"></i>
                                </a>
                            )}
                        </div>

                        {/* Detail Chips - hidden on very small screens */}
                        <div className="hidden sm:flex flex-wrap gap-2 lg:gap-3">
                            <span className="px-3 py-1.5 bg-themeApp border-theme border-themeBorder rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-id-card text-purple-500 mr-1.5"></i> {headerData.enrollmentNo}
                            </span>
                            <span className="px-3 py-1.5 bg-themeApp border-theme border-themeBorder rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-droplet text-rose-500 mr-1.5"></i> {headerData.bloodGroup}
                            </span>
                            <span className="px-3 py-1.5 bg-themeApp border-theme border-themeBorder rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-cake-candles text-blue-500 mr-1.5"></i> {headerData.dob}
                            </span>
                            <span className="px-3 py-1.5 bg-themeApp border-theme border-themeBorder rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-phone text-emerald-500 mr-1.5"></i> {headerData.phone}
                            </span>
                        </div>

                        {/* Mobile-only compact info row */}
                        <div className="flex sm:hidden flex-wrap gap-1.5">
                            <span className="px-2 py-1 bg-themeApp border-theme border-themeBorder rounded-md text-[8px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-id-card text-purple-500 mr-1"></i> {headerData.enrollmentNo}
                            </span>
                            <span className="px-2 py-1 bg-themeApp border-theme border-themeBorder rounded-md text-[8px] font-black uppercase tracking-widest text-themeTextSec">
                                <i className="fa-solid fa-droplet text-rose-500 mr-1"></i> {headerData.bloodGroup}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SUB-NAVIGATION MENU — Compact & Scrollable on Mobile */}
            <div className={`flex p-1 lg:p-1.5 ${theme.layout.panelElevated} rounded-xl lg:rounded-themePanel w-full overflow-x-auto no-scrollbar border-theme border-themeBorder`}>
                <div className="flex w-full min-w-max gap-1 lg:gap-1.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 ${view === tab.id
                                ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong shadow-sm"
                                : "text-themeTextSec opacity-70 hover:text-themeText active:scale-[0.98] border-theme border-transparent"
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon} text-[10px] lg:text-xs ${view === tab.id ? 'text-themeAccent' : 'opacity-70'}`}></i> 
                            <span className="hidden sm:inline">{tab.fullLabel}</span>
                            <span className="sm:hidden">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. DYNAMIC CONTENT AREA */}
            <div className={`${theme.layout.panel} rounded-themePanel lg:rounded-themePanel overflow-hidden p-4 lg:p-8 animate-fade-in border-theme border-themeBorder`}>
                {view === "personal" && <PersonalInfo />}
                {view === "academic" && <AcademicDetails />}
                {view === "documents" && <DigitalLocker />}
                {view === "security" && <SecuritySettings />}
                {view === "appearance" && <AppearanceSettings />}
            </div>
        </div>
    );
}