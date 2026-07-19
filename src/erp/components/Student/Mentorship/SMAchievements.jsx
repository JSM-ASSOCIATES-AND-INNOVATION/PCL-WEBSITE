import React from "react";
import { theme } from "../../../theme";

export default function SMAchievements() {
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-8 text-center opacity-70">
                <i className="fa-solid fa-trophy text-4xl text-emerald-500 mb-4"></i>
                <h2 className={`${theme.text.heading} text-lg text-themeText`}>Achievement Verification</h2>
                <p className="text-xs text-themeTextSec mt-2">This module is under construction.</p>
            </div>
        </div>
    );
}
