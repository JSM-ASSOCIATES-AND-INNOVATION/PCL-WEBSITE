/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from "../../../theme";
import AdminMootCourt from "../../Admin/AdminMootCourt/AdminMootCourt";
import AdminPlacements from "../../Admin/AdminPlacements/AdminPlacements";
import AdminLegalAid from "../../Admin/AdminLegalAid/AdminLegalAid";

export default function FacultyClinicsHub() {
    const [activeTab, setActiveTab] = useState("mootcourt");

    const tabs = [
        { id: "mootcourt", label: "Moot Court Society", icon: "fa-scale-balanced" },
        { id: "placements", label: "Placements & Drives", icon: "fa-briefcase" },
        { id: "legalaid", label: "Legal Aid Clinic (CLE)", icon: "fa-hand-holding-hand" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* ═══ FACULTY CLINICS HEADER ═══ */}
            <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-emerald-600 to-emerald-900`}>
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                        <i className="fa-solid fa-gavel text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                    </div>
                    <div>
                        <span className="px-2 lg:px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 inline-block shadow-sm">Faculty-in-Charge</span>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Clinics & Co-curriculars</h1>
                        <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage moot court activities, oversee placements, and review CLE diaries.</p>
                    </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                activeTab === t.id 
                                ? 'bg-white text-emerald-900 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white scale-100' 
                                : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                            }`}
                        >
                            <i className={`fa-solid ${t.icon} ${activeTab === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ RENDER SUB-MODULE ═══ */}
            <div className="animate-fade-in">
                {activeTab === "mootcourt" && <AdminMootCourt isHubView={true} />}
                {activeTab === "placements" && <AdminPlacements isHubView={true} />}
                {activeTab === "legalaid" && <AdminLegalAid isHubView={true} />}
            </div>
        </div>
    );
}
