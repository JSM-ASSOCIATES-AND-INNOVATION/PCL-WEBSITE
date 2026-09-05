import React from 'react';
import { useERP } from "../../context/ErpContext";
import { theme } from "../../theme";

export default function BirthdayWidget() {
    const { todayBirthdays } = useERP();

    if (!todayBirthdays || todayBirthdays.length === 0) return null;

    return (
        <div className="w-full relative overflow-hidden rounded-themePanel shadow-premiumElevated p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 border border-black/5 dark:border-white/10 bg-themePanel/85 backdrop-blur-2xl mb-8 transition-all hover:-translate-y-1">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-full max-w-[16rem] md:w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
            
            {/* Premium Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 p-[1px] shrink-0 shadow-lg animate-pulse shadow-pink-500/20">
                <div className="w-full h-full bg-themePanel/90 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <i className="fa-solid fa-cake-candles text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-amber-500"></i>
                </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center md:text-left z-10">
                <h3 className={`${theme.text.heading} text-xl lg:text-2xl tracking-tight mb-1`}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-amber-500 drop-shadow-sm">
                        Happy Birthday! 🎉
                    </span>
                </h3>
                <p className={`${theme.text.secondary} text-xs lg:text-sm leading-relaxed mb-4 font-medium`}>
                    Join us in wishing a fantastic birthday to our Prudentia family members today:
                </p>
                
                {/* Person Chips */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {todayBirthdays.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-themeElevated/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 shadow-sm hover:border-pink-500/30 transition-colors">
                            <div className="w-7 h-7 rounded-lg bg-themeApp border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {person.avatar_url ? (
                                    <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-user text-[10px] text-themeTextSec"></i>
                                )}
                            </div>
                            <div className="flex flex-col text-left pr-2">
                                <span className="text-xs font-bold text-themeText leading-none mb-0.5">{person.full_name}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-pink-500/80 leading-none">{person.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Action Button */}
            <div className="z-10 shrink-0 mt-4 md:mt-0">
                <button onClick={() => window.erpDialog?.alert('Automated greetings successfully queued for dispatch!')} className="px-6 py-3 bg-themeElevated/80 backdrop-blur-md hover:bg-themeBorder border border-black/5 dark:border-white/10 rounded-themeBtn text-[10px] lg:text-xs font-black uppercase tracking-wider text-themeText transition-all shadow-sm hover:shadow-md hover:border-pink-500/30 group active:scale-95 flex items-center gap-2">
                    <i className="fa-regular fa-paper-plane text-pink-500 group-hover:scale-110 transition-transform"></i> Send Wishes
                </button>
            </div>
        </div>
    );
}
