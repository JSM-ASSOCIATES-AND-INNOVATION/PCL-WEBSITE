import React, { useState, useEffect, useMemo } from "react";
import { theme } from "../../theme";
import { useERP } from "../../context/ErpContext";
import pclLogo from "../../../ASSETS/LOGOS/pcl_logo.svg";
import { STUDENT_NAV_GROUPS, STUDENT_NAV_EXPANDED } from "../Student/sidebar/Sidebar";
import { FACULTY_NAV_GROUPS, FACULTY_NAV_EXPANDED } from "../Faculty/FacultySidebar/FacultySidebar";
import { ADMIN_NAV_GROUPS, ADMIN_NAV_EXPANDED } from "../Admin/AdminSidebar/AdminSidebar";

// Helper to flatten 3-level configs to 2-level configs for the Mega Menu
const flattenConfig = (config) => {
    return config.map(group => {
        const flatLinks = group.links.reduce((acc, link) => {
            if (link.children) {
                acc.push({ ...link, isSubHeader: true }); // optional marker
                acc.push(...link.children);
            } else {
                acc.push(link);
            }
            return acc;
        }, []);
        return { ...group, links: flatLinks };
    });
};

export default function TopNav({ userSession, activeTab, setActiveTab, onLogout }) {
    const { notices, sidebarMode } = useERP();
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const mainContainer = document.getElementById('jsm-main-scroll-container');
        if (!mainContainer) return;
        
        const handleScroll = () => setIsScrolled(mainContainer.scrollTop > 20);
        mainContainer.addEventListener('scroll', handleScroll);
        return () => mainContainer.removeEventListener('scroll', handleScroll);
    }, []);
    
    const role = userSession?.role || 'student';
    
    const navGroups = useMemo(() => {
        let rawConfig = [];
        if (role === 'admin') {
            rawConfig = sidebarMode === 'expanded' ? ADMIN_NAV_EXPANDED : ADMIN_NAV_GROUPS;
        } else if (role === 'faculty') {
            rawConfig = sidebarMode === 'expanded' ? FACULTY_NAV_EXPANDED : FACULTY_NAV_GROUPS;
        } else {
            rawConfig = sidebarMode === 'expanded' ? STUDENT_NAV_EXPANDED : STUDENT_NAV_GROUPS;
        }
        return flattenConfig(rawConfig);
    }, [role, sidebarMode]);

    const initials = userSession?.name 
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : role.substring(0, 2).toUpperCase();
        
    const displayName = userSession?.name || (role === 'admin' ? "System Admin" : role === 'faculty' ? "Professor" : "Student");

    return (
        <div className={`hidden lg:flex fixed top-0 left-0 w-full z-[100] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'pt-2' : 'pt-4'}`}>
            <header className={`mx-auto w-full max-w-7xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled 
                ? 'h-[64px] bg-themePanel/85 backdrop-blur-2xl border-themeBorder shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-full px-5 border' 
                : 'h-[76px] bg-themePanel/60 backdrop-blur-xl border-themeBorder/50 shadow-lg rounded-full px-6 border'
            } flex items-center justify-between text-themeText`}>
                
                {/* Left: Brand Logo */}
                <div 
                    className="flex items-center gap-3.5 cursor-pointer shrink-0 group" 
                    onClick={() => setActiveTab('dashboard')}
                >
                    <div className="relative flex items-center justify-center w-10 h-10 bg-white/5 rounded-full border border-white/10 group-hover:scale-105 transition-transform duration-300 shadow-sm overflow-hidden">
                        <div className="absolute inset-0 bg-themeAccent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src={pclLogo} alt="PCL Logo" className="w-6 h-6 object-contain drop-shadow-md relative z-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-themeText leading-none drop-shadow-sm group-hover:text-themeAccent transition-colors duration-300">
                            PCL<span className={role === 'faculty' ? 'text-blue-500' : 'text-themeAccent'}>ERP</span>
                        </span>
                        <span className="text-[8px] font-bold text-themeTextSec uppercase tracking-[0.25em] mt-0.5 opacity-80">
                            {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                        </span>
                    </div>
                </div>

                {/* Center: Dynamic Island Mega Menu */}
                <nav className="flex-1 flex items-center justify-center gap-1 px-8 h-full">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="relative group h-full flex items-center px-1">
                            {/* Trigger Button */}
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-wide text-themeTextSec hover:text-themeText hover:bg-themeElevated/50 transition-all duration-300 outline-none">
                                <span>{group.category}</span>
                                <i className="fa-solid fa-chevron-down text-[8px] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-300"></i>
                            </button>
                            
                            {/* Mega Menu Dropdown Container */}
                            <div className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-50">
                                <div className="w-[340px] bg-themePanel/95 backdrop-blur-2xl border border-themeBorderStrong rounded-[24px] p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)] flex flex-col gap-1 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
                                    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-themeAccent drop-shadow-sm">{group.category}</h4>
                                        <div className="w-8 h-px bg-themeAccent/30"></div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                        {group.links.map((link) => {
                                            const isActive = activeTab === link.id;
                                            const hasNotice = link.id === 'notices' && notices?.length > 0;
                                            
                                            // Render category headers for sub-headers (from flattened children)
                                            if (link.isSubHeader) {
                                                return (
                                                    <div key={link.id} className="mt-2 mb-1 px-3">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec/60">{link.label}</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={link.id}
                                                    onClick={() => setActiveTab(link.id)}
                                                    className={`group/item relative flex items-center gap-4 w-full p-3 rounded-2xl transition-all duration-300 text-left overflow-hidden ${isActive 
                                                        ? 'bg-themeElevated border border-themeAccent/20 shadow-sm' 
                                                        : 'hover:bg-themeElevated border border-transparent'
                                                    }`}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-themeAccent rounded-r-full shadow-[0_0_8px_currentColor]"></div>
                                                    )}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? 'bg-themeAccent/10 text-themeAccent' : 'bg-black/20 border border-white/5 text-themeTextSec group-hover/item:text-themeText group-hover/item:bg-white/5 group-hover/item:border-white/10'}`}>
                                                        <i className={`${link.icon} text-sm`}></i>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-sm font-bold truncate ${isActive ? 'text-themeText' : 'text-themeTextSec group-hover/item:text-themeText'}`}>
                                                            {link.label}
                                                        </span>
                                                        <span className="text-[9px] uppercase tracking-widest text-themeTextSec/60 truncate mt-0.5">Access Module</span>
                                                    </div>
                                                    
                                                    {hasNotice && !isActive && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-auto shadow-[0_0_8px_#f59e0b] animate-pulse shrink-0"></span>
                                                    )}
                                                    
                                                    {/* Hover Glow */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/item:animate-[shimmer_1s_ease-out_forwards] pointer-events-none"></div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Right: Profile & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={() => setActiveTab('credentials')}
                        className="flex items-center gap-3 hover:bg-themeElevated/80 p-1.5 pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-themeBorderStrong group outline-none"
                    >
                        <div className="w-10 h-10 rounded-full bg-themeElevated border border-white/10 flex items-center justify-center font-black text-[11px] text-themeText relative shadow-sm group-hover:border-themeAccent group-hover:text-themeAccent transition-colors duration-300 overflow-hidden">
                            <div className="absolute inset-0 bg-themeAccent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themeElevated z-10 shadow-sm"></div>
                            <span className="relative z-10">{initials}</span>
                        </div>
                        <div className="flex flex-col items-start hidden xl:flex">
                            <span className="text-sm font-bold text-themeText group-hover:text-themeAccent transition-colors duration-300 truncate max-w-[120px]">
                                {displayName}
                            </span>
                            <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest mt-0.5">
                                Settings
                            </span>
                        </div>
                    </button>
                    
                    <div className="w-px h-6 bg-themeBorderStrong mx-1"></div>
                    
                    <button 
                        onClick={onLogout}
                        title="Terminate Session"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-rose-400 hover:text-white bg-transparent hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-transparent transition-all duration-300 outline-none"
                    >
                        <i className="fa-solid fa-power-off text-sm"></i>
                    </button>
                </div>
            </header>
        </div>
    );
}
