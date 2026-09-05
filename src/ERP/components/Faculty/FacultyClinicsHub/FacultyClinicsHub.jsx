/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import { theme } from "../../../theme";
import AdminMootCourt from "../../Admin/AdminMootCourt/AdminMootCourt";
import AdminPlacements from "../../Admin/AdminPlacements/AdminPlacements";
import AdminLegalAid from "../../Admin/AdminLegalAid/AdminLegalAid";

export default function FacultyClinicsHub({ isEmbedded = false }) {
    const [activeTab, setActiveTab] = useState("mootcourt");

    const tabs = [
        { id: "mootcourt", label: "Moot Court Society", icon: "fa-scale-balanced" },
        { id: "placements", label: "Placements & Drives", icon: "fa-briefcase" },
        { id: "legalaid", label: "Legal Aid Clinic (CLE)", icon: "fa-hand-holding-hand" },
    ];

    return (
        <div className={isEmbedded ? "flex flex-col gap-6" : "w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated"}>
            {/* ═══ FACULTY CLINICS HEADER ═══ */}
            {!isEmbedded && (
                <div 
                    className="w-full relative overflow-hidden rounded-[2.5rem] p-8 lg:p-10 xl:p-12 border border-black/10 dark:border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] bg-black/5 dark:bg-white/10 backdrop-blur-[80px] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 xl:gap-10 shrink-0 mb-6 lg:mb-8"
                >
                    <div className="relative z-10 flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-themeTextSec text-[10px] font-black uppercase tracking-widest mb-4 xl:mb-6 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span> 
                            Faculty Hub
                        </div>
                        <h1 className={`${theme.text.heading} text-3xl sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight mb-3 xl:mb-4 leading-none drop-shadow-sm dark:drop-shadow-md text-white`}>
                            Clinics & Societies
                        </h1>
                        <p className="text-white/80 text-xs lg:text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            Manage moot court activities, oversee placements, and review CLE diaries.
                        </p>
                    </div>
                </div>
            )}
            
            <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated/90 backdrop-blur-md rounded-2xl border border-white/5 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar shadow-premiumElevated">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                activeTab === t.id 
                                ? 'bg-white dark:bg-white/20 backdrop-blur-[80px] text-black dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-black/10 dark:border-white/40 scale-100' 
                                : 'text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                            }`}
                        >
                            <i className={`fa-solid ${t.icon} ${activeTab === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
                        </button>
                    ))}
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
