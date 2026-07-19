import React from "react";
import { theme } from "../../../theme";

export default function SMTimeline() {
    
    // Mock Timeline Events
    const events = [
        {
            id: 1,
            date: "2026-07-16",
            title: "Meeting Confirmed",
            description: "Your mentor confirmed the Career Guidance session for Tomorrow at 11:00 AM.",
            type: "info",
            icon: "fa-calendar-check"
        },
        {
            id: 2,
            date: "2026-07-15",
            title: "Internship Recommended",
            description: "Your internship application for Amarchand Mangaldas has been recommended by your mentor and sent to the Placement Office.",
            type: "success",
            icon: "fa-briefcase"
        },
        {
            id: 3,
            date: "2026-06-25",
            title: "Mentorship Meeting Completed",
            description: "Research Guidance session completed. 3 action items assigned.",
            type: "success",
            icon: "fa-check-double"
        },
        {
            id: 4,
            date: "2026-06-10",
            title: "Leave Approved",
            description: "Medical leave for 3 days was approved.",
            type: "success",
            icon: "fa-house-medical"
        },
        {
            id: 5,
            date: "2026-05-10",
            title: "First Mentorship Meeting",
            description: "Introductory session completed.",
            type: "success",
            icon: "fa-handshake"
        },
        {
            id: 6,
            date: "2026-05-01",
            title: "Mentor Assigned",
            description: "You have been assigned to Dr. Alan Turing for the current academic year.",
            type: "info",
            icon: "fa-user-plus"
        }
    ];

    const getColorForType = (type) => {
        if (type === 'success') return 'bg-emerald-500 ring-themePanel text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
        if (type === 'warning') return 'bg-amber-500 ring-themePanel text-amber-500 border-amber-500/20 bg-amber-500/10';
        if (type === 'danger') return 'bg-rose-500 ring-themePanel text-rose-500 border-rose-500/20 bg-rose-500/10';
        return 'bg-indigo-500 ring-themePanel text-indigo-500 border-indigo-500/20 bg-indigo-500/10';
    };

    const getDotColor = (type) => {
        if (type === 'success') return 'bg-emerald-500';
        if (type === 'warning') return 'bg-amber-500';
        if (type === 'danger') return 'bg-rose-500';
        return 'bg-indigo-500';
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-6 lg:p-8">
                <h2 className={`${theme.text.heading} text-xl tracking-tight text-themeText mb-1`}>Mentorship Timeline</h2>
                <p className={`${theme.text.secondary} text-xs font-bold`}>A chronological record of your mentorship journey.</p>
            </div>

            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-8 md:p-12">
                <div className="flex flex-col relative pl-8 md:pl-12 max-w-3xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] md:left-[31px] top-2 bottom-2 w-px bg-themeBorderStrong"></div>

                    {events.map((evt, index) => (
                        <div key={evt.id} className={`relative ${index !== events.length - 1 ? 'pb-10' : ''} group`}>
                            {/* Dot */}
                            <div className={`absolute -left-[37px] md:-left-[21px] top-1 w-4 h-4 rounded-full ${getDotColor(evt.type)} ring-4 ring-themePanel z-10 transition-transform group-hover:scale-125`}></div>
                            
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 block w-max ${evt.type === 'success' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                    {evt.date}
                                </span>
                                
                                <div className={`p-5 rounded-lg border-[length:var(--border-width)] border-themeBorder bg-themeElevated group-hover:border-themeBorderStrong transition-colors flex items-start gap-4`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[length:var(--border-width)] ${getColorForType(evt.type).split(' ').slice(2).join(' ')}`}>
                                        <i className={`fa-solid ${evt.icon}`}></i>
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <h4 className="text-sm font-black text-themeText">{evt.title}</h4>
                                        <p className="text-xs font-medium text-themeTextSec mt-1 leading-relaxed">{evt.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Start marker */}
                    <div className="relative mt-8">
                        <div className="absolute -left-[35px] md:-left-[19px] top-0 w-3 h-3 rounded-full bg-themeBorderStrong ring-4 ring-themePanel z-10"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec ml-2">Journey Started</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
