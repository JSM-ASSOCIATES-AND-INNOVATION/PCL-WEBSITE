/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useERP } from '../../../context/ErpContext';
import { theme } from '../../../theme';
import pclLogo from '../../../../ASSETS/LOGOS/pcl_logo.svg';

// --- Constants & Config ---
const SIDEBAR_MIN_WIDTH = 80; // Compact width
const SIDEBAR_DEFAULT_WIDTH = 280; // Default expanded width
const SIDEBAR_MAX_WIDTH = 400; // Maximum drag width
const STORAGE_KEY_WIDTH = 'jsmerp_sidebar_width';
const STORAGE_KEY_FAVS = 'jsmerp_sidebar_favs';

export default function SidebarFramework({ 
    config = [], 
    bottomLinks = [], 
    userSession, 
    activeTab, 
    setActiveTab, 
    onLogout,
    customBrandContext
}) {
    const { isSidebarCollapsed, toggleSidebar, notices } = useERP();
    
    // --- Refs for Dragging ---
    const sidebarRef = useRef(null);
    const isResizing = useRef(false);

    // --- Core State ---
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        if (isSidebarCollapsed) return SIDEBAR_MIN_WIDTH;
        const saved = localStorage.getItem(STORAGE_KEY_WIDTH);
        return saved ? parseInt(saved, 10) : SIDEBAR_DEFAULT_WIDTH;
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS)) || []; }
        catch { return []; }
    });
    
    // Expanded submenus state
    const [expandedGroups, setExpandedGroups] = useState(() => {
        let initialState = {};
        config.forEach((g, idx) => { initialState[idx] = true; });
        return initialState;
    });

    const [expandedSubmenus, setExpandedSubmenus] = useState({});

    // Floating Submenu / Context Menu states
    const [contextMenu, setContextMenu] = useState(null); // { item, x, y }

    const isCompact = sidebarWidth <= SIDEBAR_MIN_WIDTH + 20 || isSidebarCollapsed;

    // --- Persist State ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favorites));
    }, [favorites]);

    // Listen to Context toggles
    useEffect(() => {
        if (isSidebarCollapsed) {
            setSidebarWidth(SIDEBAR_MIN_WIDTH);
        } else {
            const saved = localStorage.getItem(STORAGE_KEY_WIDTH);
            setSidebarWidth(saved && parseInt(saved, 10) > SIDEBAR_MIN_WIDTH + 20 ? parseInt(saved, 10) : SIDEBAR_DEFAULT_WIDTH);
        }
    }, [isSidebarCollapsed]);

    // --- Resizing Engine ---
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;
        let newWidth = e.clientX;
        if (newWidth < SIDEBAR_MIN_WIDTH) newWidth = SIDEBAR_MIN_WIDTH;
        if (newWidth > SIDEBAR_MAX_WIDTH) newWidth = SIDEBAR_MAX_WIDTH;
        setSidebarWidth(newWidth);
    }, []);

    const handleMouseUp = useCallback(() => {
        if (isResizing.current) {
            isResizing.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            
            // Snap to compact or save width
            if (sidebarWidth < SIDEBAR_MIN_WIDTH + 40) {
                setSidebarWidth(SIDEBAR_MIN_WIDTH);
                if (!isSidebarCollapsed) toggleSidebar();
            } else {
                localStorage.setItem(STORAGE_KEY_WIDTH, sidebarWidth.toString());
                if (isSidebarCollapsed) toggleSidebar();
            }
        }
    }, [sidebarWidth, isSidebarCollapsed, toggleSidebar]);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleDoubleClickResize = () => {
        if (sidebarWidth === SIDEBAR_DEFAULT_WIDTH) {
            setSidebarWidth(SIDEBAR_MIN_WIDTH);
            if (!isSidebarCollapsed) toggleSidebar();
        } else {
            setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
            localStorage.setItem(STORAGE_KEY_WIDTH, SIDEBAR_DEFAULT_WIDTH.toString());
            if (isSidebarCollapsed) toggleSidebar();
        }
    };

    // --- Search & Filter Logic ---
    const filteredConfig = useMemo(() => {
        if (!searchQuery.trim()) return config;
        const q = searchQuery.toLowerCase();
        
        return config.map(group => {
            const filteredLinks = group.links.filter(link => {
                const matchLabel = link.label.toLowerCase().includes(q);
                const matchChildren = link.children && link.children.some(child => child.label.toLowerCase().includes(q));
                return matchLabel || matchChildren;
            });
            return { ...group, links: filteredLinks };
        }).filter(group => group.links.length > 0);
    }, [config, searchQuery]);

    // --- Handlers ---
    const handleTabSwitch = (id) => {
        if (!id) return;
        setActiveTab(id);
        setMobileMenuOpen(false);
    };

    const toggleFavorite = (e, id) => {
        e.stopPropagation();
        setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
        setContextMenu(null);
    };

    const handleContextMenu = (e, link) => {
        e.preventDefault();
        setContextMenu({
            item: link,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Global click to close context menus
    useEffect(() => {
        const closeMenus = () => setContextMenu(null);
        document.addEventListener('click', closeMenus);
        return () => document.removeEventListener('click', closeMenus);
    }, []);

    // --- Renderers ---
    const renderLink = (link, depth = 0) => {
        const isActive = activeTab === link.id;
        const hasChildren = link.children && link.children.length > 0;
        
        const paddingLeft = isCompact ? '0' : `calc(0.75rem + ${depth * 0.75}rem)`;
        
        const isSubmenuExpanded = expandedSubmenus[link.id];

        return (
            <div key={link.id} className="relative group/item outline-none w-full">
                <button
                    onContextMenu={(e) => handleContextMenu(e, link)}
                    onClick={() => {
                        if (hasChildren && !isCompact) {
                            setExpandedSubmenus(prev => ({ ...prev, [link.id]: !prev[link.id] }));
                        } else {
                            handleTabSwitch(link.id);
                        }
                    }}
                    style={{ paddingLeft }}
                    className={`
                        relative w-full flex items-center justify-between py-2.5 my-0.5 rounded-xl
                        text-xs font-bold tracking-wide transition-all duration-200 outline-none
                        ${isActive 
                            ? "bg-themeElevated/80 text-themeText shadow-sm" 
                            : "text-themeTextSec hover:bg-themeElevated/50 hover:text-themeText"
                        }
                        ${isCompact ? "justify-center px-0" : "pr-3"}
                    `}
                    title={isCompact ? link.label : ""}
                >
                    {/* Animated Active Indicator (Sliding Pill style) */}
                    {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-themeAccent rounded-r-full shadow-[0_0_12px_var(--accent)] animate-fade-in"></div>
                    )}

                    <div className={`flex items-center ${isCompact ? "justify-center w-full" : "gap-3"} overflow-hidden`}>
                        {/* Icon Lift Animation */}
                        <div className={`w-6 flex justify-center shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover/item:scale-110 group-hover/item:-translate-y-0.5"}`}>
                            <i className={`${link.icon} text-lg ${isActive ? "text-themeAccent drop-shadow-sm" : "opacity-70 group-hover/item:opacity-100 group-hover/item:text-themeText"}`}></i>
                        </div>
                        
                        {/* Label */}
                        {!isCompact && (
                            <span className="truncate flex-1 text-left select-none">{link.label}</span>
                        )}
                    </div>

                    {/* Badges / Indicators */}
                    {!isCompact && (
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                            {link.badge && (
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${link.badge.color || 'bg-themeAccent/20 text-themeAccent border border-themeAccent/30'}`}>
                                    {link.badge.text}
                                </span>
                            )}
                            {((link.highlight) || (link.id === 'notices' && notices?.length > 0)) && !isActive && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
                            )}
                            {hasChildren && (
                                <i className={`fa-solid fa-chevron-down text-[10px] opacity-40 transition-transform duration-200 ${isSubmenuExpanded ? 'rotate-180' : ''}`}></i>
                            )}
                        </div>
                    )}
                </button>

                {/* Submenu Children */}
                {hasChildren && !isCompact && (
                    <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out pl-2 border-l border-themeBorder ml-4 mt-1 ${isSubmenuExpanded || searchQuery ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {link.children.map(child => renderLink(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    const initials = userSession?.name ? userSession.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "US";
    
    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside 
                ref={sidebarRef}
                style={{ width: `${sidebarWidth}px`, transition: isResizing.current ? 'none' : 'width 0.2s ease-out' }}
                className={`
                    hidden lg:flex flex-col shrink-0 h-screen relative z-40 
                    bg-themePanel border-r border-themeBorder shadow-sm
                `}
            >
                {/* 1. BRAND ZONE */}
                <div className="h-20 flex items-center justify-between px-5 shrink-0 border-b border-themeBorder">
                    <div className="flex items-center gap-3 overflow-hidden group cursor-pointer" onClick={() => handleTabSwitch('dashboard')}>
                        <div className="w-9 h-9 rounded-xl bg-themeApp border border-themeBorderStrong flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-themeElevated group-hover:border-themeAccent/50 transition-all duration-300">
                            <div 
                                style={{
                                    width: '18px', 
                                    height: '18px', 
                                    backgroundColor: 'var(--accent)', 
                                    WebkitMaskImage: `url(${pclLogo})`,
                                    WebkitMaskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center'
                                }} 
                                className="transition-colors duration-300"
                            />
                        </div>
                        {!isCompact && (
                            <div className="flex flex-col min-w-0 animate-fade-in whitespace-nowrap">
                                <span className="text-lg font-black tracking-tight text-themeText leading-none truncate">
                                    JSM<span className="text-themeAccent">ERP</span>
                                </span>
                                <span className="text-[9px] font-bold text-themeTextSec uppercase tracking-[0.2em] mt-1 opacity-70 truncate">
                                    {customBrandContext || "Associates"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. SEARCH ZONE */}
                {!isCompact && (
                    <div className="px-4 pt-4 pb-2 shrink-0 animate-fade-in">
                        <div className="relative group">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-themeTextSec group-focus-within:text-themeAccent transition-colors"></i>
                            <input 
                                type="text"
                                placeholder="Search modules..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-themeApp border border-themeBorder rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-themeText focus:outline-none focus:border-themeBorderStrong transition-colors shadow-inner"
                            />
                            {/* Keyboard shortcut hint */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-themeBorderStrong bg-themeElevated text-[8px] font-black text-themeTextSec opacity-50">
                                ⌘K
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. NAVIGATION ZONE */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar flex flex-col gap-5">
                    
                    {/* Favorites Section */}
                    {favorites.length > 0 && !searchQuery && (
                        <div className="flex flex-col gap-1">
                            {!isCompact && <p className="text-[9px] font-black text-themeTextSec opacity-60 uppercase tracking-widest px-3 mb-1 animate-fade-in">Favorites</p>}
                            {config.flatMap(g => g.links).filter(l => favorites.includes(l.id)).map(link => renderLink(link))}
                        </div>
                    )}

                    {/* Standard Groups */}
                    {filteredConfig.map((group, groupIndex) => {
                        const isExpanded = expandedGroups[groupIndex];
                        return (
                            <div key={groupIndex} className="flex flex-col gap-1">
                                {!isCompact ? (
                                    <button 
                                        onClick={() => setExpandedGroups(p => ({ ...p, [groupIndex]: !p[groupIndex] }))}
                                        className="flex items-center justify-between w-full px-3 py-1 mb-1 group outline-none"
                                    >
                                        <p className="text-[9px] font-black text-themeTextSec opacity-60 group-hover:text-themeText group-hover:opacity-100 uppercase tracking-widest transition-all">
                                            {group.category}
                                        </p>
                                        <i className={`fa-solid fa-chevron-down text-[8px] text-themeTextSec opacity-30 transition-transform duration-300 ${isExpanded ? 'rotate-180 opacity-60' : ''}`}></i>
                                    </button>
                                ) : (
                                    <div className="w-full border-t border-themeBorder my-2"></div>
                                )}
                                
                                <div className={`flex flex-col gap-0.5 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isExpanded || isCompact || searchQuery ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {group.links.map(link => renderLink(link))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 4. UTILITY & USER CARD ZONE */}
                <div className="p-3 shrink-0 border-t border-themeBorder flex flex-col gap-2">
                    <button 
                        onClick={onLogout}
                        className={`w-full flex items-center justify-center gap-3 p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 group`}
                        title="Sign Out"
                    >
                        <i className="fa-solid fa-power-off text-sm group-hover:scale-110 transition-transform"></i>
                        {!isCompact && <span className="text-xs font-bold whitespace-nowrap">Sign Out</span>}
                    </button>
                    
                    {!isCompact && (
                        <div onClick={() => handleTabSwitch('credentials')} className="flex items-center gap-3 p-3 rounded-xl bg-themeApp border border-themeBorder mt-1 cursor-pointer hover:border-themeBorderStrong transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-themeElevated border border-themeBorderStrong flex items-center justify-center font-black text-xs text-themeText relative shrink-0 overflow-hidden">
                                {userSession?.profile_picture_url ? (
                                    <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-themeApp z-10"></div>
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-themeText truncate leading-tight">{userSession?.name || 'User'}</span>
                                <span className="text-[9px] font-black text-themeTextSec uppercase tracking-widest truncate">{userSession?.role || 'Guest'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resizing Handle */}
                <div 
                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-themeAccent/20 active:bg-themeAccent/40 transition-colors z-50 flex items-center justify-center group"
                    onMouseDown={handleMouseDown}
                    onDoubleClick={handleDoubleClickResize}
                >
                    <div className="w-0.5 h-8 bg-themeBorderStrong rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </aside>

            {/* CONTEXT MENU (Right Click) */}
            {contextMenu && (
                <div 
                    className="fixed z-[100] w-48 bg-themePanel border border-themeBorder shadow-2xl rounded-xl py-1 animate-fade-in scale-in custom-blur"
                    style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: contextMenu.x }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-themeBorder mb-1">
                        <p className="text-xs font-black text-themeText truncate">{contextMenu.item.label}</p>
                        <p className="text-[9px] text-themeTextSec uppercase tracking-widest mt-0.5">Context Options</p>
                    </div>
                    <button onClick={(e) => toggleFavorite(e, contextMenu.item.id)} className="w-full text-left px-4 py-2 hover:bg-themeElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className={`fa-solid fa-star ${favorites.includes(contextMenu.item.id) ? 'text-amber-500' : 'text-themeTextSec'}`}></i>
                        {favorites.includes(contextMenu.item.id) ? 'Remove Favorite' : 'Pin to Favorites'}
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-themeElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className="fa-solid fa-arrow-up-right-from-square text-themeTextSec"></i> Open in New Tab
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-themeElevated text-xs font-bold text-themeText flex items-center gap-3 transition-colors">
                        <i className="fa-solid fa-link text-themeTextSec"></i> Copy Link
                    </button>
                </div>
            )}

            {/* MOBILE BOTTOM NAVIGATION */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-themeApp border-t border-themeBorder z-50 px-2 py-3 pb-safe flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                {bottomLinks.map(link => {
                    const isActive = activeTab === link.id && !mobileMenuOpen;
                    return (
                        <button 
                            key={link.id}
                            onClick={() => handleTabSwitch(link.id)}
                            className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${isActive ? 'text-themeAccent -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-themeElevated shadow-sm border border-themeBorderStrong' : 'bg-transparent'}`}>
                                <i className={`${link.icon} text-lg`}></i>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.label}</span>
                        </button>
                    )
                })}
                
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-all duration-300 ${mobileMenuOpen ? 'text-themeAccent -translate-y-1' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}
                >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${mobileMenuOpen ? 'bg-themeElevated shadow-sm border border-themeBorderStrong' : 'bg-transparent'}`}>
                        <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
                </button>
            </div>

            {/* FULL SCREEN MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-themeApp overflow-y-auto pb-24 animate-fade-in backdrop-blur-xl">
                    <div className="p-6 pt-10 flex items-center gap-4 border-b border-themeBorder bg-themePanel/80 sticky top-0 backdrop-blur-lg z-10">
                        <div className="w-14 h-14 rounded-2xl bg-themeApp border border-themeBorderStrong flex items-center justify-center font-black text-xl text-themeText relative shadow-sm overflow-hidden">
                            {userSession?.profile_picture_url ? (
                                <img src={userSession.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                            <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-themeApp z-10"></div>
                        </div>
                        <div>
                            <p className="text-xl font-black text-themeText tracking-tight">{userSession?.name || "User"}</p>
                            <p className="text-[10px] font-black text-themeAccent uppercase tracking-widest mt-0.5">{userSession?.role}</p>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col gap-8">
                        {config.map((group, idx) => (
                            <div key={idx}>
                                <p className="text-[11px] font-black text-themeTextSec opacity-70 uppercase tracking-widest mb-4 pl-2">
                                    {group.category}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {group.links.map(link => {
                                        const isActive = activeTab === link.id;
                                        return (
                                            <button
                                                key={link.id}
                                                onClick={() => handleTabSwitch(link.id)}
                                                className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${isActive 
                                                    ? 'bg-themeElevated border-themeAccent/50 text-themeAccent shadow-sm' 
                                                    : 'bg-themePanel border-themeBorder text-themeText hover:border-themeBorderStrong'}`}
                                            >
                                                <i className={`${link.icon} text-2xl ${isActive ? '' : 'text-themeTextSec opacity-70'}`}></i>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-left leading-snug">{link.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
