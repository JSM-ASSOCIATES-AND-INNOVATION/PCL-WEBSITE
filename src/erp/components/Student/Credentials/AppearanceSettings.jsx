import React from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";

export default function AppearanceSettings() {
    const { activeTheme, changeTheme, navLayout, changeNavLayout } = useERP();

    const themes = [
        { id: 'lex-light', name: 'Lex Light', desc: 'Apple × Linear aesthetics (Default)', icon: 'fa-sun', previewBg: 'bg-[#F8FAFC]', previewAccent: 'bg-[#4F46E5]' },
        { id: 'ivory-light', name: 'Ivory Light', desc: 'Warm academic feel', icon: 'fa-book', previewBg: 'bg-[#F8F5F0]', previewAccent: 'bg-[#5B4636]' },
        { id: 'midnight-dark', name: 'Midnight Dark', desc: 'Default Dark Mode', icon: 'fa-moon', previewBg: 'bg-[#0F172A]', previewAccent: 'bg-[#6366F1]' },
        { id: 'carbon-dark', name: 'Carbon Dark', desc: 'Developer minimal monochromatic', icon: 'fa-code', previewBg: 'bg-[#09090B]', previewAccent: 'bg-[#10B981]' },
        { id: 'royal-dark', name: 'Royal Dark', desc: 'Luxury executive aesthetics', icon: 'fa-crown', previewBg: 'bg-[#1B0B16]', previewAccent: 'bg-[#D4AF37]' },
        { id: 'neo-brutalism-light', name: 'Neo Brutalism Light', desc: 'High Contrast, Harsh Red, Pure Whites', icon: 'fa-cube', previewBg: 'bg-[#FFFFFF]', previewAccent: 'bg-[#FF3B30]', specialBorder: 'border-[4px] border-black rounded-none' },
        { id: 'neo-brutalism-dark', name: 'Neo Brutalism Dark', desc: 'High Contrast, Harsh Red, Pure Blacks', icon: 'fa-cubes', previewBg: 'bg-[#000000]', previewAccent: 'bg-[#FF3B30]', specialBorder: 'border-[4px] border-white rounded-none' },
    ];

    return (
        <div className="flex flex-col gap-5 lg:gap-8 animate-fade-in">
            <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-themeElevated border-theme border-themeBorderStrong rounded-xl lg:rounded-themeBtn flex items-center justify-center text-themeAccent shrink-0">
                    <i className="fa-solid fa-palette text-xs lg:text-sm"></i>
                </div>
                <div>
                    <h2 className={`${theme.text.heading} text-base lg:text-xl capitalize`}>Appearance &amp; Themes</h2>
                    <p className={`${theme.text.secondary} text-[10px] lg:text-xs`}>Customize your ERP workspace aesthetic</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {themes.map(t => {
                    const isActive = activeTheme === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => changeTheme(t.id)}
                            className={`flex flex-col text-left p-4 lg:p-6 rounded-xl lg:rounded-themePanel border-theme transition-all duration-300 ${
                                isActive
                                    ? 'bg-themeElevated border-themeAccent shadow-themeElevated ring-1 ring-themeAccent'
                                    : 'bg-themePanel border-themeBorder hover:border-themeBorderStrong hover:bg-themeElevated'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3 lg:mb-6 w-full">
                                <div className="flex items-center gap-2 lg:gap-3">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-themeBtn flex items-center justify-center bg-themeApp border-theme border-themeBorder">
                                        <i className={`fa-solid ${t.icon} ${isActive ? 'text-themeAccent' : 'text-themeTextSec'}`}></i>
                                    </div>
                                    <h3 className={`font-semibold text-sm lg:text-base ${isActive ? 'text-themeAccent' : 'text-themeText'}`}>{t.name}</h3>
                                </div>
                                {isActive && (
                                    <div className="w-6 h-6 rounded-full bg-themeAccent/20 flex items-center justify-center text-themeAccent">
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </div>
                                )}
                            </div>

                            {/* Theme Preview */}
                            <div className={`w-full h-20 lg:h-28 rounded-lg lg:rounded-themeBtn overflow-hidden flex border-theme border-themeBorder ${t.specialBorder || ''} relative mb-3 lg:mb-4 shadow-sm`}>
                                <div className={`flex-1 ${t.previewBg} flex flex-col relative`}>
                                    <div className="h-4 border-b border-white/10 flex items-center justify-between px-2 w-full shrink-0">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-sm bg-white/20"></div>
                                            <div className="w-4 h-1.5 rounded bg-white/10 mt-0.5"></div>
                                        </div>
                                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                    </div>
                                    <div className="flex-1 p-2 flex gap-2">
                                        <div className="w-8 h-full bg-black/20 rounded border border-white/5 flex flex-col gap-1 p-1">
                                            <div className="w-full h-2 bg-white/10 rounded-sm"></div>
                                            <div className="w-full h-2 bg-white/10 rounded-sm"></div>
                                            <div className="w-full h-2 bg-white/10 rounded-sm"></div>
                                        </div>
                                        <div className="flex-1 h-full bg-black/10 rounded border border-white/5 p-1.5 flex flex-col gap-1.5">
                                            <div className="w-1/2 h-2 bg-white/20 rounded-sm"></div>
                                            <div className="flex gap-1">
                                                <div className="flex-1 h-6 bg-white/5 rounded-sm border border-white/5"></div>
                                                <div className="flex-1 h-6 bg-white/5 rounded-sm border border-white/5"></div>
                                            </div>
                                            <div className={`absolute bottom-3 right-3 w-8 h-3 rounded-sm ${t.previewAccent} shadow-[0_0_8px_currentColor] opacity-80`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className={`text-[10px] lg:text-xs ${theme.text.muted} mt-auto`}>{t.desc}</p>
                        </button>
                    );
                })}
            </div>
            
            <div className="hidden lg:flex flex-col gap-5 mt-4 border-t border-themeBorder pt-6 lg:pt-8">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-themeElevated border-theme border-themeBorderStrong rounded-xl lg:rounded-themeBtn flex items-center justify-center text-themeAccent shrink-0">
                        <i className="fa-solid fa-layer-group text-xs lg:text-sm"></i>
                    </div>
                    <div>
                        <h2 className={`${theme.text.heading} text-base lg:text-xl capitalize`}>Desktop Navigation</h2>
                        <p className={`${theme.text.secondary} text-[10px] lg:text-xs`}>Choose your preferred layout for large screens</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <button
                        onClick={() => changeNavLayout('classic')}
                        className={`flex flex-col text-left p-4 lg:p-6 rounded-xl lg:rounded-themePanel border-theme transition-all duration-300 ${
                            navLayout === 'classic'
                                ? 'bg-themeElevated border-themeAccent shadow-themeElevated ring-1 ring-themeAccent'
                                : 'bg-themePanel border-themeBorder hover:border-themeBorderStrong hover:bg-themeElevated'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3 w-full">
                            <h3 className={`font-semibold text-sm lg:text-base ${navLayout === 'classic' ? 'text-themeAccent' : 'text-themeText'}`}>Classic Sidebar</h3>
                            {navLayout === 'classic' && <i className="fa-solid fa-check text-themeAccent"></i>}
                        </div>
                        <p className={`text-[10px] lg:text-xs ${theme.text.muted}`}>Traditional left-aligned vertical sidebar</p>
                    </button>

                    <button
                        onClick={() => changeNavLayout('topnav')}
                        className={`flex flex-col text-left p-4 lg:p-6 rounded-xl lg:rounded-themePanel border-theme transition-all duration-300 ${
                            navLayout === 'topnav'
                                ? 'bg-themeElevated border-themeAccent shadow-themeElevated ring-1 ring-themeAccent'
                                : 'bg-themePanel border-themeBorder hover:border-themeBorderStrong hover:bg-themeElevated'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3 w-full">
                            <h3 className={`font-semibold text-sm lg:text-base ${navLayout === 'topnav' ? 'text-themeAccent' : 'text-themeText'}`}>Top Navigation Mega-Menu</h3>
                            {navLayout === 'topnav' && <i className="fa-solid fa-check text-themeAccent"></i>}
                        </div>
                        <p className={`text-[10px] lg:text-xs ${theme.text.muted}`}>Modern horizontal top bar with dropdowns</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
