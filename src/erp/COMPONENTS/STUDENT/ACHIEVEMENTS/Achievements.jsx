/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../CONTEXT/ErpContext";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

// --- CACHE HELPERS ---
const CK = { data: 'achievements_data' };
const readCache = (key, fallback) => {
    try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
};
const writeCache = (key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// --- SHARED STYLES ---
const INPUT_CLS = "w-full bg-themePanel border-theme border-themeBorder rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors";
const LABEL_CLS = "block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1.5 ml-1";

export default function Achievements() {
    const { userSession } = useERP();

    // --- STATE ---
    const [activeTab, setActiveTab] = useState("All");
    const [achievements, setAchievements] = useState(() => readCache(CK.data, []));
    const [expandedCard, setExpandedCard] = useState(null);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [shareOnSubmit, setShareOnSubmit] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        category: "Moot Court",
        title: "",
        issuer: "",
        role: "",
        date_achieved: "",
        proof_link: "",
        description: ""
    });

    // --- BACKGROUND FETCH ---
    const fetchAchievements = useCallback(async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;
        try {
            const { data, error } = await supabase
                .from('student_achievements')
                .select('*')
                .eq('student_id', studentId)
                .order('date_achieved', { ascending: false });
            if (error) throw error;
            if (data) {
                setAchievements(data);
                writeCache(CK.data, data);
            }
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        }
    }, [userSession]);

    useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

    // --- SUBMISSION ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const studentId = userSession?.db_id || userSession?.id;
            const { error } = await supabase.from('student_achievements').insert({
                student_id: studentId,
                category: formData.category,
                title: formData.title,
                issuer: formData.issuer,
                role: formData.role,
                date_achieved: formData.date_achieved,
                proof_link: formData.proof_link || null,
                description: formData.description || null,
                is_verified: false
            });
            if (error) throw error;
            setSubmitSuccess(true);
            fetchAchievements();
            
            if (shareOnSubmit) {
                shareToLinkedIn(null, formData);
            }

            setTimeout(() => {
                setShowAddModal(false);
                setSubmitSuccess(false);
                setShareOnSubmit(true);
                setFormData({ category: activeTab === 'All' ? 'Moot Court' : activeTab, title: "", issuer: "", role: "", date_achieved: "", proof_link: "", description: "" });
            }, 2000);
        } catch (error) {
            console.error("Submission failed:", error);
            window.erpDialog?.alert("Failed to log achievement.");
        } finally { setIsSubmitting(false); }
    };

    // --- UI HELPERS ---
    const categories = [
        { id: 'Moot Court', label: 'Moot Courts', icon: 'fa-scale-balanced', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { id: 'Awards', label: 'Awards & Honors', icon: 'fa-medal', color: 'text-themeAccent', bg: 'bg-themeAccent/10', border: 'border-themeAccent/20' },
        { id: 'Publications', label: 'Publications', icon: 'fa-book-open', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { id: 'Certifications', label: 'Certifications', icon: 'fa-certificate', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { id: 'Extracurriculars', label: 'Extracurriculars', icon: 'fa-users', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
    ];

    const activeCategory = categories.find(c => c.id === activeTab);
    const activeData = activeTab === 'All' ? achievements : achievements.filter(a => a.category === activeTab);

    // Stats
    const stats = useMemo(() => {
        const total = achievements.length;
        const verified = achievements.filter(a => a.is_verified).length;
        const pending = total - verified;
        const catCounts = {};
        categories.forEach(c => { catCounts[c.id] = achievements.filter(a => a.category === c.id).length; });
        const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
        return { total, verified, pending, topCategory: topCategory ? topCategory[0] : '--' };
    }, [achievements, categories]);

    const shareToLinkedIn = (e, achievement) => {
        if (e) e.stopPropagation();
        const text = encodeURIComponent(`I am proud to share my recent achievement: ${achievement.title} at JSM ERP Law School!`);
        const urlParam = encodeURIComponent("https://jsm.edu/achievements");
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${urlParam}&summary=${text}`;
        window.open(url, '_blank');
    };

    const getCategoryTheme = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat || categories[0];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    };

    const renderCard = (item, catTheme) => {
        const isExpanded = expandedCard === item.id;
        return (
            <div key={item.id} className={`${theme.layout.panel} rounded-themePanel ${isExpanded ? 'border-themeBorderStrong' : 'border-themeBorder'} hover:border-themeBorderStrong transition-all group flex flex-col border-theme`}>
                {/* Card Header */}
                <div className="p-5 lg:p-6 cursor-pointer" onClick={() => setExpandedCard(isExpanded ? null : item.id)}>
                    {/* Category Icon + Badges Row */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg ${catTheme.bg} border-theme ${catTheme.border} flex items-center justify-center`}>
                                <i className={`fa-solid ${catTheme.icon} ${catTheme.color} text-xs lg:text-sm`}></i>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest bg-themeElevated text-themeTextSec border-theme border-themeBorder`}>
                                {item.role || item.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.is_verified ? (
                                <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border-theme border-emerald-500/20 flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check"></i> Verified
                                </span>
                            ) : (
                                <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border-theme border-amber-500/20 flex items-center gap-1">
                                    <i className="fa-solid fa-clock"></i> Pending
                                </span>
                            )}
                            <i className={`fa-solid fa-chevron-down text-neutral-600 text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                        </div>
                    </div>

                    {/* Title + Issuer */}
                    <h3 className="text-base lg:text-lg font-black text-themeText tracking-tight leading-tight mb-1.5 group-hover:text-themeAccent transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-xs lg:text-sm font-semibold text-themeTextSec flex items-center gap-2">
                        <i className="fa-solid fa-building-columns text-neutral-600 text-[10px]"></i> {item.issuer}
                    </p>

                    {/* Date + Proof Footer */}
                    <div className="mt-4 pt-3 border-t-theme border-themeBorder flex items-center justify-between">
                        <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-70 uppercase tracking-widest flex items-center gap-1.5">
                            <i className="fa-regular fa-calendar text-neutral-600"></i> {formatDate(item.date_achieved)}
                        </span>
                        <div className="flex items-center gap-2">
                            {item.is_verified && (
                                <button 
                                    onClick={(e) => shareToLinkedIn(e, item)}
                                    className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 border-theme border-[#0a66c2]/20 flex items-center justify-center text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-colors shrink-0 tooltip-trigger relative group"
                                    title="Share to LinkedIn"
                                >
                                    <i className="fa-brands fa-linkedin text-[13px]"></i>
                                </button>
                            )}
                            {item.proof_link && (
                                <a href={item.proof_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-lg bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center text-themeTextSec hover:text-themeAccent transition-colors shrink-0">
                                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                    <div className="border-t-theme border-themeBorder animate-fade-in">
                        {/* Description */}
                        {item.description && (
                            <div className="px-5 lg:px-6 py-4">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${theme.text.muted} mb-2`}>Details</p>
                                <p className="text-[11px] lg:text-xs text-themeTextSec leading-relaxed bg-themePanel p-4 rounded-themePanel border-theme border-themeBorder">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* Metadata Grid */}
                        <div className="px-5 lg:px-6 pb-5 lg:pb-6 grid grid-cols-2 gap-3">
                            <div className="bg-themePanel p-3 rounded-themePanel border-theme border-themeBorder">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${theme.text.muted} mb-0.5`}>Category</p>
                                <p className={`text-xs font-bold ${catTheme.color}`}>{item.category}</p>
                            </div>
                            <div className="bg-themePanel p-3 rounded-themePanel border-theme border-themeBorder">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${theme.text.muted} mb-0.5`}>Role</p>
                                <p className="text-xs font-bold text-themeText">{item.role || '--'}</p>
                            </div>
                            <div className="bg-themePanel p-3 rounded-themePanel border-theme border-themeBorder">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${theme.text.muted} mb-0.5`}>Status</p>
                                <p className={`text-xs font-bold ${item.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {item.is_verified ? 'Admin Verified' : 'Awaiting Review'}
                                </p>
                            </div>
                            <div className="bg-themePanel p-3 rounded-themePanel border-theme border-themeBorder">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${theme.text.muted} mb-0.5`}>CV Sync</p>
                                <p className={`text-xs font-bold ${item.is_verified ? 'text-emerald-400' : 'text-neutral-600'}`}>
                                    {item.is_verified ? '✓ Linked' : 'Pending Verification'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themePanel/20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0">
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText tracking-tight mb-1`}>Achievements Hub</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Log your wins. Verified items automatically sync to your CV Builder.</p>
                    </div>
                </div>

                <button
                    onClick={() => { setFormData(prev => ({ ...prev, category: activeTab === 'All' ? 'Moot Court' : activeTab })); setShowAddModal(true); }}
                    className="w-full lg:w-auto px-6 py-4 bg-white hover:bg-neutral-200 text-[#050505] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] relative z-10 shrink-0 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Log New Item
                </button>
            </div>

            {/* ═══════════════ STATS ROW ═══════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className={`${theme.layout.panel} p-4 lg:p-5 rounded-themePanel border-theme border-themeBorder flex flex-col gap-1`}>
                    <i className="fa-solid fa-trophy text-themeAccent text-lg lg:text-xl mb-1"></i>
                    <p className="text-xl lg:text-2xl font-black text-themeText">{stats.total}</p>
                    <p className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>Total Logged</p>
                </div>
                <div className={`${theme.layout.panel} p-4 lg:p-5 rounded-themePanel border-theme border-themeBorder flex flex-col gap-1`}>
                    <i className="fa-solid fa-circle-check text-emerald-400 text-lg lg:text-xl mb-1"></i>
                    <p className="text-xl lg:text-2xl font-black text-emerald-400">{stats.verified}</p>
                    <p className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>Verified</p>
                </div>
                <div className={`${theme.layout.panel} p-4 lg:p-5 rounded-themePanel border-theme border-themeBorder flex flex-col gap-1`}>
                    <i className="fa-solid fa-clock text-amber-400 text-lg lg:text-xl mb-1"></i>
                    <p className="text-xl lg:text-2xl font-black text-amber-400">{stats.pending}</p>
                    <p className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>Pending</p>
                </div>
                <div className={`${theme.layout.panel} p-4 lg:p-5 rounded-themePanel border-theme border-themeBorder flex flex-col gap-1`}>
                    <i className={`fa-solid ${getCategoryTheme(stats.topCategory).icon} ${getCategoryTheme(stats.topCategory).color} text-lg lg:text-xl mb-1`}></i>
                    <p className="text-xl lg:text-2xl font-black text-themeText truncate">{stats.topCategory}</p>
                    <p className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>Top Category</p>
                </div>
            </div>

            {/* ═══════════════ CATEGORY TABS ═══════════════ */}
            <div className="flex p-1.5 bg-themePanel rounded-themePanel w-full overflow-x-auto no-scrollbar min-w-max border-theme border-themeBorder">
                <button
                    onClick={() => setActiveTab('All')}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === 'All'
                        ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong"
                        : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
                        }`}
                >
                    <i className="fa-solid fa-layer-group"></i>
                    <span>All</span>
                    {achievements.length > 0 && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black ${activeTab === 'All' ? 'bg-themeAccent/10 text-themeAccent' : 'bg-themePanel text-themeTextSec'}`}>{achievements.length}</span>
                    )}
                </button>
                {categories.map((tab) => {
                    const count = achievements.filter(a => a.category === tab.id).length;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong"
                                : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black ${activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-themePanel text-themeTextSec'}`}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══════════════ CARDS GRID ═══════════════ */}
            <div className="flex flex-col gap-8 lg:gap-10 animate-fade-in mt-2">
                {activeTab === 'All' ? (
                    <>
                        {categories.map(cat => {
                            const catData = achievements.filter(a => a.category === cat.id);
                            if (catData.length === 0) return null;
                            return (
                                <div key={cat.id} className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 px-1">
                                        <div className={`w-8 h-8 rounded-lg ${cat.bg} border-theme ${cat.border} flex items-center justify-center`}>
                                            <i className={`fa-solid ${cat.icon} ${cat.color} text-xs`}></i>
                                        </div>
                                        <h2 className="text-lg font-black text-themeText tracking-tight">{cat.label}</h2>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${cat.color} bg-themePanel px-2 py-1 rounded-md border-theme border-themeBorder`}>{catData.length} Items</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                                        {catData.map(item => renderCard(item, cat))}
                                    </div>
                                </div>
                            );
                        })}
                        {achievements.length === 0 && (
                            <div className="text-center py-12 bg-themePanel border-theme border-themeBorder rounded-themePanel">
                                <i className="fa-solid fa-trophy text-themeTextSec opacity-20 text-4xl mb-4"></i>
                                <h3 className="text-lg font-black text-themeText">No achievements yet</h3>
                                <p className={`text-xs ${theme.text.muted} mt-1`}>Log your first achievement to start building your profile.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                        {activeData.map((item) => renderCard(item, getCategoryTheme(item.category)))}

                        {/* Add New Card */}
                        <button
                            onClick={() => { setFormData(prev => ({ ...prev, category: activeTab })); setShowAddModal(true); }}
                            className="border-2 border-dashed border-themeBorder hover:border-themeBorderStrong bg-themePanel hover:bg-themeElevated transition-colors rounded-themePanel p-6 lg:p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] lg:min-h-[220px] group"
                        >
                            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-themePanel ${activeCategory?.bg || 'bg-themeElevated'} border-theme ${activeCategory?.border || 'border-themeBorderStrong'} group-hover:scale-110 transition-all mb-3 lg:mb-4 flex items-center justify-center`}>
                                <i className={`fa-solid fa-plus text-lg lg:text-xl ${activeCategory?.color || 'text-themeAccent'}`}></i>
                            </div>
                            <h4 className="text-sm lg:text-base font-black text-themeText mb-1">Log New {activeTab}</h4>
                            <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec opacity-70`}>Submit entry for verification</p>
                        </button>
                    </div>
                )}
            </div>

            {/* ═══════════════ ADD ACHIEVEMENT MODAL ═══════════════ */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
                    <div className="bg-themeApp w-full max-w-lg rounded-t-[2rem] sm:rounded-themePanel overflow-hidden border-theme border-themeBorder flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

                        <div className="bg-themePanel p-5 lg:p-6 border-b-theme border-themeBorder relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black text-themeText tracking-tight mb-1">Log Achievement</h3>
                                    <p className={`text-[10px] lg:text-xs ${theme.text.secondary}`}>Entries will be verified by admin before appearing on your CV.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel border-theme border-themeBorderStrong text-themeTextSec hover:text-themeText transition-colors shrink-0"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-5 lg:p-6 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div>
                                <label className={LABEL_CLS}>Category</label>
                                <div className="relative">
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`${INPUT_CLS} appearance-none cursor-pointer`}>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none text-xs"></i>
                                </div>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>
                                    {formData.category === 'Moot Court' ? 'Competition Name' : formData.category === 'Publications' ? 'Paper/Article Title' : 'Title of Achievement'}
                                </label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={formData.category === 'Moot Court' ? "e.g. 23rd Price Media Law Moot" : "Enter title..."} className={INPUT_CLS} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_CLS}>{formData.category === 'Moot Court' ? 'Result / Rank' : 'Issuing Authority'}</label>
                                    <input type="text" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} placeholder={formData.category === 'Moot Court' ? "e.g. Quarter-Finalists" : "e.g. WIPO Academy"} className={INPUT_CLS} required />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>{formData.category === 'Publications' ? 'Authorship Role' : 'Specific Role'}</label>
                                    <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder={formData.category === 'Moot Court' ? "e.g. Speaker / Researcher" : "e.g. Co-Author"} className={INPUT_CLS} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL_CLS}>Date Achieved</label>
                                    <input type="month" value={formData.date_achieved} onChange={(e) => setFormData({ ...formData, date_achieved: e.target.value })} className={`${INPUT_CLS} [color-scheme:dark]`} required />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Proof Link (Optional)</label>
                                    <input type="url" value={formData.proof_link} onChange={(e) => setFormData({ ...formData, proof_link: e.target.value })} placeholder="https://..." className={INPUT_CLS} />
                                </div>
                            </div>

                            <div>
                                <label className={LABEL_CLS}>Additional Details (Optional)</label>
                                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${INPUT_CLS} resize-none`} placeholder="Describe your achievement, contribution, and impact..."></textarea>
                            </div>

                            <div className="flex items-center gap-3 bg-[#0a66c2]/10 p-4 rounded-themePanel border-theme border-[#0a66c2]/20 cursor-pointer hover:bg-[#0a66c2]/20 transition-colors" onClick={() => setShareOnSubmit(!shareOnSubmit)}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${shareOnSubmit ? 'bg-[#0a66c2] text-white' : 'bg-themeElevated border-theme border-themeBorderStrong'}`}>
                                    {shareOnSubmit && <i className="fa-solid fa-check text-xs"></i>}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#0a66c2] leading-none mb-1.5"><i className="fa-brands fa-linkedin mr-1"></i> Draft LinkedIn Post</p>
                                    <p className={`text-[10px] text-blue-200/60 leading-none font-medium`}>Automatically open LinkedIn to share your success</p>
                                </div>
                            </div>

                            {submitSuccess ? (
                                <div className="w-full py-4 bg-emerald-500/10 border-theme border-emerald-500/20 text-emerald-400 rounded-themePanel text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-check-circle text-lg"></i> Achievement Logged — Pending Review
                                </div>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</> : <><i className="fa-solid fa-cloud-arrow-up"></i> Submit for Verification</>}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}