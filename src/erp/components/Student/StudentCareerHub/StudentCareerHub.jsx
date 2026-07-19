import React, { useState } from "react";
import { theme } from "../../../theme";
import MootCourt from "../MootCourt/MootCourt";
import Internships from "../Internships/Internships";
import Achievements from "../Achievements/Achievements";
import CVBuilder from "../CVBuilder/CVBuilder";

export default function StudentCareerHub() {
    const [activeCategory, setActiveCategory] = useState("practical");
    const [activeTab, setActiveTab] = useState("mootcourt");

    const categories = [
        { id: "practical", label: "Practical Training", icon: "fa-gavel" },
        { id: "portfolio", label: "Career & Portfolio", icon: "fa-briefcase" }
    ];

    const tabs = {
        practical: [
            { id: "mootcourt", label: "Moot Court Society", icon: "fa-scale-balanced" }
        ],
        portfolio: [
            { id: "internships", label: "Internships & Placements", icon: "fa-building" },
            { id: "achievements", label: "Achievements", icon: "fa-trophy" },
            { id: "cvbuilder", label: "CV Builder", icon: "fa-file-pdf" }
        ]
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setActiveTab(tabs[categoryId][0].id);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* ═══ MASTER HUB HEADER ═══ */}
            <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-amber-600 to-amber-800`}>
                <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>

                <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                        <i className="fa-solid fa-briefcase text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                    </div>
                    <div>
                        <span className="px-2 lg:px-2.5 py-1 bg-white/20 text-white border border-white/30 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 inline-block shadow-sm">Professional Development</span>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Career & Clinics</h1>
                        <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage mooting, internships, and build your professional CV.</p>
                    </div>
                </div>

                {/* Dual-Line Navigation System */}
                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex flex-wrap gap-2 w-fit">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                    activeCategory === cat.id 
                                    ? 'bg-black/40 text-white border border-white/30 shadow-inner' 
                                    : 'bg-black/10 text-white/70 hover:bg-black/20 hover:text-white border border-transparent'
                                }`}
                            >
                                <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
                        {tabs[activeCategory].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 min-w-max ${
                                    activeTab === t.id 
                                    ? 'bg-white text-amber-900 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white scale-100' 
                                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'
                                }`}
                            >
                                <i className={`fa-solid ${t.icon} ${activeTab === t.id ? 'animate-pulse' : ''}`}></i> {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="animate-fade-in">
                {activeTab === "mootcourt" && <MootCourt />}
                {activeTab === "internships" && <Internships />}
                {activeTab === "achievements" && <Achievements />}
                {activeTab === "cvbuilder" && <CVBuilder />}
            </div>
        </div>
    );
}
