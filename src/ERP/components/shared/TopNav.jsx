/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useMemo } from "react";
import { theme } from "../../theme";
import { useERP } from "../../context/ErpContext";
import pclLogo from "../../../ASSETS/LOGOS/pcl_logo.svg";
import { STUDENT_NAV_MEGA } from "../Student/sidebar/Sidebar";
import { FACULTY_NAV_MEGA } from "../Faculty/FacultySidebar/FacultySidebar";
import { ADMIN_NAV_GROUPS, ADMIN_NAV_EXPANDED } from "../Admin/AdminSidebar/AdminSidebar";
import GlobalSearch from "./GlobalSearch";
import { RoleActionButton } from "./LiveHeaderComponents";

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
    const { notices, sidebarMode, changeNavLayout } = useERP();
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
            rawConfig = FACULTY_NAV_MEGA;
        } else {
            rawConfig = STUDENT_NAV_MEGA;
        }
        return flattenConfig(rawConfig);
    }, [role, sidebarMode]);

    const initials = userSession?.name 
        ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : role.substring(0, 2).toUpperCase();
        
    const displayName = userSession?.name || (role === 'admin' ? "System Admin" : role === 'faculty' ? "Professor" : "Student");
    // Removed duplicate useERP call

    return (
        <div className={`hidden lg:flex fixed top-0 left-0 w-full z-[100] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'pt-2' : 'pt-4'}`}>
            <header className={`mx-auto w-full max-w-7xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled 
                ? 'h-[64px] bg-themePanel/85 backdrop-blur-2xl border-black/5 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-full px-5 border' 
                : 'h-[76px] bg-themePanel/60 backdrop-blur-xl border-black/5 dark:border-white/5/50 shadow-lg rounded-full px-6 border'
            } flex items-center justify-between text-themeText`}>
                
                {/* Left: Brand Logo */}
                <div 
                    className="flex items-center gap-3.5 cursor-pointer shrink-0 group" 
                    onClick={() => setActiveTab('dashboard')}
                >
                    <div className="relative flex items-center justify-center w-10 h-10 bg-black/5 dark:bg-white/5 rounded-full border border-black/10 dark:border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform duration-300 shadow-sm overflow-hidden">
                        <div className="absolute inset-0 bg-themeAccent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src={pclLogo} alt="PCL Logo" className="w-6 h-6 object-contain drop-shadow-sm dark:drop-shadow-md relative z-10 theme-logo" />
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

                {/* Center: Unified ERP Mega Menu */}
                <nav className="flex-1 flex items-center justify-center gap-1 px-8 h-full">
                    <div className="relative group h-full flex items-center px-1">
                        {/* Trigger Button */}
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide text-themeTextSec hover:text-themeText hover:bg-themeElevated/50 transition-all duration-300 outline-none border border-transparent hover:border-black/5 dark:hover:border-white/5">
                            <i className="fa-solid fa-bars mr-1"></i>
                            <span>MENU</span>
                            <i className="fa-solid fa-chevron-down text-[8px] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-300"></i>
                        </button>
                        
                        {/* Unified Mega Menu Dropdown Container */}
                        <div className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-50">
                            <div className="bg-themePanel/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-[24px] p-8 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)] flex gap-8 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none w-max max-w-[90vw] xl:max-w-[1200px]">
                                {navGroups.map((group, idx) => (
                                    <div key={idx} className="flex flex-col gap-4 min-w-[200px]">
                                        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-themeAccent"></div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-themeAccent drop-shadow-sm">{group.category}</h4>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                            {group.links.map((link) => {
                                                const isActive = activeTab === link.id;
                                                const hasNotice = link.id === 'notices' && notices?.length > 0;
                                                
                                                if (link.isSubHeader) {
                                                    return (
                                                        <div key={link.id} className="mt-4 mb-1 px-2">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-themeTextSec/50">{link.label}</span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={link.id}
                                                        onClick={() => {
                                                            if (link.action) link.action();
                                                            else setActiveTab(link.id);
                                                            // Could manually blur here if needed to close menu, 
                                                            // but hover logic handles it when mouse leaves.
                                                        }}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative group/btn ${
                                                            isActive 
                                                                ? 'bg-themeAccent/10 text-themeAccent shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                                                : 'text-themeText hover:bg-black/5 dark:hover:bg-white/5 hover:text-themeAccent'
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-themeAccent rounded-r-full shadow-[0_0_8px_var(--primary-color)]"></div>
                                                        )}
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                            isActive ? 'bg-themeAccent/20 text-themeAccent' : 'bg-black/5 dark:bg-white/5 text-themeTextSec group-hover/btn:text-themeAccent group-hover/btn:bg-themeAccent/10'
                                                        }`}>
                                                            <i className={`${link.icon} text-sm`}></i>
                                                        </div>
                                                        <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                            <span className="text-xs font-bold truncate w-full">{link.label}</span>
                                                        </div>
                                                        {hasNotice && (
                                                            <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black shrink-0">
                                                                {notices.length}
                                                            </div>
                                                        )}
                                                        {!hasNotice && isActive && (
                                                            <i className="fa-solid fa-check text-[10px] text-themeAccent/80"></i>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Right: Profile & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Global Search Inject */}
                    <div className="hidden 2xl:block w-full max-w-[16rem] md:w-64">
                        <GlobalSearch />
                    </div>

                    <RoleActionButton role={userSession?.role} setActiveTab={setActiveTab} />
                    
                    {/* Layout Switcher */}
                    <button onClick={() => changeNavLayout('classic')} className="w-10 h-10 rounded-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated hover:bg-themeBorder border border-black/10 dark:border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec hover:text-themeText transition-all relative group outline-none shadow-sm" title="Switch to Classic Sidebar">
                        <i className="fa-solid fa-bars text-sm group-hover:scale-110 transition-transform"></i>
                    </button>

                    <button onClick={() => setActiveTab('notices')} className="w-10 h-10 rounded-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated hover:bg-themeBorder border border-black/10 dark:border-black/5 dark:border-white/10 flex items-center justify-center text-themeTextSec hover:text-themeText transition-all relative group outline-none shadow-sm">
                        <i className="fa-regular fa-bell text-sm group-hover:scale-110 transition-transform"></i>
                        {notices?.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse border border-themePanel"></span>
                        )}
                    </button>

                    <div className="w-px h-6 bg-themeBorderStrong mx-1 hidden sm:block"></div>

                    <button 
                        onClick={() => setActiveTab('credentials')}
                        className="flex items-center gap-3 hover:bg-themeElevated/80 p-1.5 pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-black/10 dark:border-black/5 dark:border-white/10 group outline-none"
                    >
                        <div className="w-10 h-10 rounded-full bg-themeElevated/90 backdrop-blur-2xl shadow-premiumElevated border border-black/10 dark:border-black/5 dark:border-white/10 flex items-center justify-center font-black text-[11px] text-themeText relative shadow-sm group-hover:border-themeAccent group-hover:text-themeAccent transition-colors duration-300 overflow-hidden">
                            {userSession?.profile_picture_url ? (
                                <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover relative z-10" />
                            ) : (
                                <span className="relative z-10">{initials}</span>
                            )}
                            <div className="absolute inset-0 bg-themeAccent/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themeElevated z-30 shadow-sm"></div>
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
                    
                    <div className="w-px h-6 bg-themeBorderStrong mx-1 hidden sm:block"></div>
                    
                    <button 
                        onClick={() => {
                            onLogout();
                            window.location.href = '/';
                        }}
                        title="Return to Main Website"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-themeElevated/50 hover:bg-themeBorder text-themeTextSec hover:text-themeText text-[10px] font-black uppercase tracking-widest transition-all border border-black/10 dark:border-black/5 dark:border-white/10 outline-none"
                    >
                        <i className="fa-solid fa-earth-americas"></i>
                        <span>Website</span>
                    </button>

                    <div className="w-px h-6 bg-themeBorderStrong mx-1"></div>
                    
                    <button 
                        onClick={onLogout}
                        title="Terminate Session"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-rose-400 hover:text-black dark:text-white bg-transparent hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-transparent transition-all duration-300 outline-none"
                    >
                        <i className="fa-solid fa-power-off text-sm"></i>
                    </button>
                </div>
            </header>
        </div>
    );
}
