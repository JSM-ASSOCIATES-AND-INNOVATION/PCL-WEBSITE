import React from "react";
import { theme } from "../../../theme";

export default function AdminPlacements() {
    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder flex flex-col md:flex-row justify-between items-start lg:items-center gap-6">
                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 lg:gap-5 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-briefcase text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Placements & Internships</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Manage firm recruitment, tracks, and student placements.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-12 text-center text-themeTextSec bg-themePanel border-theme border-themeBorder rounded">
                <i className="fa-solid fa-building text-4xl mb-4"></i>
                <p>Placements module is ready for live data ingestion.</p>
            </div>
        </div>
    );
}
