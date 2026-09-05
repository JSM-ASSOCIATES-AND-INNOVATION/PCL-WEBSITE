/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from "react";
import BirthdayWidget from "../../shared/BirthdayWidget";
import AdminHeroBanner from "./AdminHeroBanner";
import AdminKPIGrid from "./AdminKPIGrid";
import AdminOverview from "./AdminOverview";

import AdminRightSidebar from "./AdminRightSidebar";
// AdminFAB removed to prevent overlap with IntelligentBot

export default function AdminDashboard({ setActiveTab }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="w-full max-w-7xl mx-auto relative selection:bg-themeElevated flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in">
            
            <BirthdayWidget />
            {/* Mobile Utility Toggle */}
            <div className="xl:hidden w-full flex justify-between items-center mb-4 bg-themePanel/85 backdrop-blur-2xl shadow-premium p-3 rounded-themePanel border border-white/5 shadow-sm animate-fade-in">
                <span className="text-xs font-bold text-themeTextSec flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> Utilities & Monitors</span>
                <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated px-3 py-1.5 rounded-lg border border-white/5 text-themeText hover:border-themeAccent transition-colors">
                    <i className="fa-solid fa-bars"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Open Panel</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Main Content Area (9 Columns) */}
                <div className="xl:col-span-9 flex flex-col gap-8 pb-32 xl:pb-12 min-w-0 animate-fade-in">
                    {/* Row 1: Operations Banner */}
                    <AdminHeroBanner />
                    
                    {/* Row 2: 6 KPI Cards */}
                    <AdminKPIGrid setActiveTab={setActiveTab} />

                    {/* Row 3: Graph, Insights, Tasks */}
                    <AdminOverview />




                </div>

                {/* Right Sidebar (Drawer on Mobile, Column on Desktop) */}
                <>
                    {/* Overlay */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm" 
                            onClick={() => setIsSidebarOpen(false)}
                        ></div>
                    )}
                    
                    <div className={`
                        fixed xl:relative top-0 right-0 h-full xl:h-auto w-[320px] sm:w-[380px] xl:w-auto 
                        bg-themeApp xl:bg-transparent z-50 xl:z-auto 
                        p-6 xl:p-0 overflow-y-auto xl:overflow-visible no-scrollbar
                        transition-all duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none xl:pointer-events-auto xl:opacity-100 xl:translate-x-0'}
                        xl:col-span-3 flex flex-col min-w-0 pb-28 xl:pb-0 shadow-2xl xl:shadow-none border-l-[length:var(--border-width)] border-white/5 xl:border-none
                    `}>
                        <div className="xl:hidden flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-themeText tracking-tight flex items-center gap-2"><i className="fa-solid fa-layer-group text-themeTextSec"></i> Utilities</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated flex items-center justify-center text-themeTextSec border border-white/5 hover:text-themeText transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <AdminRightSidebar setActiveTab={setActiveTab} />
                    </div>
                </>

            </div>

            {/* Floating Action Button */}
            {/* FAB Removed */}

        </div>
    );
}
