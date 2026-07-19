import React from "react";
import { theme } from "../../../theme";

export default function SMMeetingsHistory() {
    
    // Mock History
    const meetingHistory = [
        { 
            id: 1, 
            date: "2026-06-25", 
            time: "02:00 PM",
            type: "Research Guidance", 
            mode: "In-Person",
            summary: "Discussed the draft of the Cyber Law paper. Mentor suggested adding more case laws and improving the conclusion.", 
            actionItems: [
                "Find 3 recent Supreme Court judgments on data privacy.",
                "Rewrite conclusion section.",
                "Submit revised draft by July 5th."
            ],
            nextFollowUp: "2026-07-10"
        },
        { 
            id: 2, 
            date: "2026-05-10", 
            time: "11:30 AM",
            type: "General Discussion", 
            mode: "Online",
            summary: "Introductory session. Discussed general academic goals and career aspirations in Corporate Law.", 
            actionItems: [
                "Research top corporate law firms for internships.",
                "Build CV using the ERP CV Builder."
            ],
            nextFollowUp: "None"
        }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8">
                <h2 className={`${theme.text.heading} text-xl tracking-tight text-themeText mb-1`}>Meeting History & Summaries</h2>
                <p className={`${theme.text.secondary} text-xs font-bold`}>Review the discussion points and action items from your past mentorship sessions.</p>
            </div>

            <div className="flex flex-col gap-6">
                {meetingHistory.map(mtg => (
                    <div key={mtg.id} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-themeElevated px-6 py-4 border-b-[length:var(--border-width)] border-themeBorderStrong flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-themePanel border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-indigo-500">
                                    <i className="fa-solid fa-check-double"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-themeText">{mtg.type}</span>
                                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">
                                        {mtg.date} at {mtg.time} • {mtg.mode}
                                    </span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-themePanel hover:bg-themeBorder text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 w-max">
                                <i className="fa-solid fa-comment"></i> Submit Feedback
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Summary Section */}
                            <div className="flex flex-col gap-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                                    <i className="fa-solid fa-file-lines"></i> Discussion Summary
                                </h4>
                                <p className="text-xs text-themeText leading-relaxed p-4 bg-themeElevated rounded-lg border-[length:var(--border-width)] border-themeBorderStrong">
                                    {mtg.summary}
                                </p>
                                {mtg.nextFollowUp !== 'None' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Scheduled Follow-up:</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-themeText bg-themeElevated px-2 py-1 rounded border-[length:var(--border-width)] border-themeBorderStrong">
                                            {mtg.nextFollowUp}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Items Section */}
                            <div className="flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-themeBorderStrong pt-6 lg:pt-0 lg:pl-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-2">
                                    <i className="fa-solid fa-list-check"></i> Mentor's Action Items
                                </h4>
                                <ul className="flex flex-col gap-3">
                                    {mtg.actionItems.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded border-[length:var(--border-width)] border-amber-500/50 bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <i className="fa-solid fa-chevron-right text-[8px] text-amber-500"></i>
                                            </div>
                                            <span className="text-xs font-bold text-themeText leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
