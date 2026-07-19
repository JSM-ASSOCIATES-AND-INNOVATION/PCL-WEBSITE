import React, { useState } from "react";
import { theme } from "../../../theme";

export default function SMMyRequests() {
    const [activeFilter, setActiveFilter] = useState("All");

    // Mock unified requests data
    const requests = [
        { id: 1, type: "Leave", date: "2026-07-17", description: "Medical Leave (Fever)", status: "Pending Mentor Approval", updatedAt: "2026-07-16 10:00 AM", remarks: "Awaiting physical verification of medical certificate." },
        { id: 2, type: "Internship", date: "2026-07-20", description: "Legal Intern at Amarchand Mangaldas", status: "Recommended", updatedAt: "2026-07-15 04:30 PM", remarks: "Mentor has recommended this to the Placement Office. Awaiting final office approval." },
        { id: 3, type: "Meeting", date: "2026-07-16", description: "Request for Career Guidance Session", status: "Confirmed", updatedAt: "2026-07-14 09:15 AM", remarks: "Mentor confirmed. Please be on time." },
        { id: 4, type: "Research", date: "2026-07-10", description: "Paper: Cyber Law in India", status: "Revision Requested", updatedAt: "2026-07-12 11:45 AM", remarks: "Please add more recent case laws from 2024 onwards." },
        { id: 5, type: "Achievement", date: "2026-06-25", description: "Winner: National Moot Court", status: "Verified", updatedAt: "2026-06-26 02:20 PM", remarks: "Certificate verified successfully." },
    ];

    const filters = ["All", "Leave", "Internship", "Meeting", "Research", "Achievement"];

    const filteredRequests = requests.filter(req => activeFilter === "All" || req.type === activeFilter);

    const getIconForType = (type) => {
        switch(type) {
            case 'Leave': return <i className="fa-solid fa-house-medical text-amber-500"></i>;
            case 'Internship': return <i className="fa-solid fa-briefcase text-indigo-500"></i>;
            case 'Meeting': return <i className="fa-solid fa-handshake text-blue-500"></i>;
            case 'Research': return <i className="fa-solid fa-microscope text-purple-500"></i>;
            case 'Achievement': return <i className="fa-solid fa-trophy text-emerald-500"></i>;
            default: return <i className="fa-solid fa-file text-themeTextSec"></i>;
        }
    };

    const getStatusStyle = (status) => {
        if (status.includes("Pending") || status.includes("Review") || status.includes("Requested")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        if (status.includes("Approved") || status.includes("Confirmed") || status.includes("Verified") || status.includes("Recommended")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (status.includes("Rejected") || status.includes("Cancelled")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
        return "bg-themeElevated text-themeTextSec border-themeBorderStrong";
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-2xl"></div>
                
                <div className="relative z-10">
                    <h2 className={`${theme.text.heading} text-xl tracking-tight text-themeText mb-1`}>Unified Request Tracker</h2>
                    <p className={`${theme.text.secondary} text-xs font-bold`}>Track the status of your leaves, internships, and meetings all in one place.</p>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border-[length:var(--border-width)] ${
                                activeFilter === filter 
                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                                : 'bg-themeElevated text-themeTextSec border-themeBorder hover:border-themeBorderStrong hover:text-themeText'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-16 flex flex-col items-center justify-center text-center opacity-70">
                        <i className="fa-solid fa-list-check text-5xl text-themeTextSec mb-4"></i>
                        <h3 className="text-base font-black text-themeText">No Requests Found</h3>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-2">You haven't submitted any requests in this category.</p>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req.id} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col md:flex-row gap-5 items-start md:items-center transition-colors hover:border-indigo-500/50 group">
                            
                            <div className="flex items-center gap-4 w-full md:w-56 shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-xl shrink-0">
                                    {getIconForType(req.type)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-themeText group-hover:text-indigo-500 transition-colors">{req.type}</span>
                                    <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-0.5">{req.date}</span>
                                </div>
                            </div>

                            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-themeBorderStrong pt-4 md:pt-0 md:pl-6 flex flex-col">
                                <span className="text-xs font-bold text-themeText">{req.description}</span>
                                <div className="mt-2 p-3 bg-themeElevated rounded border-[length:var(--border-width)] border-themeBorderStrong flex flex-col gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Mentor Remarks</span>
                                    <span className="text-[10px] font-medium text-themeText leading-relaxed">{req.remarks}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-themeBorderStrong gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Current Status</span>
                                <span className={`px-3 py-1.5 rounded border-[length:var(--border-width)] text-[9px] font-black uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                                    {req.status}
                                </span>
                                <span className="text-[8px] font-bold text-themeTextSec mt-1">Updated: {req.updatedAt}</span>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
