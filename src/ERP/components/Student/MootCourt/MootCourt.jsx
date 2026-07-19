/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

// --- CACHE HELPERS ---
const CK = { stats: 'mcs_stats', moots: 'mcs_moots', notices: 'mcs_notices', vault: 'mcs_vault', isc: 'mcs_isc' };
const readCache = (key, fallback) => {
    try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
};
const writeCache = (key, data) => {
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export default function MootCourt() {
    const { userSession } = useERP();
    const [activeTab, setActiveTab] = useState("engine"); // Changed from 'overview'

    // --- INSTANT STATE FROM CACHE ---
    const [stats, setStats] = useState(() => readCache(CK.stats, { rank: "--", points: "--", mootsDone: "0", memorials: "0" }));
    const [upcomingMoots, setUpcomingMoots] = useState(() => readCache(CK.moots, []));
    const [announcements, setAnnouncements] = useState(() => readCache(CK.notices, []));
    const [memorialVault, setMemorialVault] = useState(() => readCache(CK.vault, []));
    const [iscBreakdown, setIscBreakdown] = useState(() => readCache(CK.isc, null));

    // --- UI STATES ---
    const [showMemorialModal, setShowMemorialModal] = useState(false);
    const [expandedMoot, setExpandedMoot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // --- FORM STATES ---
    const [applyForm, setApplyForm] = useState({ moot_id: '', research_memo: '' });
    const [memorialForm, setMemorialForm] = useState({ title: '', competition_name: '', year_submitted: new Date().getFullYear(), content_text: '', tags: '' });

    // --- PARALLEL BACKGROUND FETCH ---
    const fetchAll = useCallback(async () => {
        const studentId = userSession?.db_id || userSession?.id;
        if (!studentId) return;

        const [mootsRes, noticesRes, vaultRes, iscRes, mootsCountRes] = await Promise.allSettled([
            supabase.from('moot_competitions').select('*').order('event_date', { ascending: true }).limit(15),
            supabase.from('mcs_notices').select('*').order('posted_at', { ascending: false }).limit(5),
            supabase.from('memorial_vault').select('*').order('year_submitted', { ascending: false }),
            supabase.from('isc_rankings').select('*').eq('student_id', studentId).single(),
            supabase.from('student_achievements').select('*', { count: 'exact', head: true }).eq('student_id', studentId).eq('category', 'Moot Court').eq('is_verified', true)
        ]);

        // Process moots
        if (mootsRes.status === 'fulfilled' && mootsRes.value.data) {
            setUpcomingMoots(mootsRes.value.data);
            writeCache(CK.moots, mootsRes.value.data);
        }

        // Process notices
        if (noticesRes.status === 'fulfilled' && noticesRes.value.data) {
            setAnnouncements(noticesRes.value.data);
            writeCache(CK.notices, noticesRes.value.data);
        }

        // Process vault
        if (vaultRes.status === 'fulfilled' && vaultRes.value.data) {
            setMemorialVault(vaultRes.value.data);
            writeCache(CK.vault, vaultRes.value.data);
        }

        // Build stats
        const iscData = iscRes.status === 'fulfilled' ? iscRes.value.data : null;
        const mootsCount = mootsCountRes.status === 'fulfilled' ? mootsCountRes.value.count : 0;
        const myMemorials = vaultRes.status === 'fulfilled' && vaultRes.value.data
            ? vaultRes.value.data.filter(v => v.author_id === studentId).length : 0;

        const newStats = {
            rank: iscData?.rank ? `#${iscData.rank}` : "N/A",
            points: iscData?.total_points || "0",
            mootsDone: mootsCount || "0",
            memorials: myMemorials.toString()
        };
        setStats(newStats);
        writeCache(CK.stats, newStats);

        // ISC breakdown
        if (iscData) {
            setIscBreakdown(iscData);
            writeCache(CK.isc, iscData);
        }
    }, [userSession]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // --- SUBMISSION HANDLERS ---
    const handleApplySubmit = async (e, mootId) => {
        e.preventDefault();
        if (!applyForm.research_memo) {
            window.erpDialog?.alert("Research memo is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const studentId = userSession?.db_id || userSession?.id;
            const { error } = await supabase.from('moot_bids').insert({
                student_id: studentId,
                moot_id: mootId,
                research_memo: applyForm.research_memo,
                status: 'PENDING'
            });
            if (error) throw error;
            setSubmitSuccess(mootId);
            setTimeout(() => { 
                setSubmitSuccess(null); 
                setApplyForm({ moot_id: '', research_memo: '' }); 
                setExpandedMoot(null);
            }, 2000);
        } catch (err) {
            console.error("Apply failed:", err);
            window.erpDialog?.alert("Bid submission failed. Please try again.");
        } finally { setIsSubmitting(false); }
    };

    const handleMemorialSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const studentId = userSession?.db_id || userSession?.id;
            const tags = memorialForm.tags ? memorialForm.tags.split(',').map(t => t.trim()) : [];
            const { error } = await supabase.from('memorial_vault').insert({
                author_id: studentId,
                title: memorialForm.title,
                competition_name: memorialForm.competition_name,
                year_submitted: memorialForm.year_submitted,
                content_text: memorialForm.content_text,
                tags: JSON.stringify(tags),
                is_verified: false
            });
            if (error) throw error;
            setSubmitSuccess('memorial');
            fetchAll();
            setTimeout(() => { 
                setShowMemorialModal(false); 
                setSubmitSuccess(null); 
                setMemorialForm({ title: '', competition_name: '', year_submitted: new Date().getFullYear(), content_text: '', tags: '' }); 
            }, 2000);
        } catch (err) {
            console.error("Memorial submit failed:", err);
            window.erpDialog?.alert("Failed to submit memorial. Please try again.");
        } finally { setIsSubmitting(false); }
    };

    // --- UI HELPERS ---
    const statCards = [
        { label: "ISC Rank", value: stats.rank, icon: "fa-solid fa-ranking-star", color: "text-amber-400" },
        { label: "Cumulative Pts", value: stats.points, icon: "fa-solid fa-chart-line", color: "text-blue-400" },
        { label: "Verified Moots", value: stats.mootsDone, icon: "fa-solid fa-scale-balanced", color: "text-emerald-400" },
        { label: "My Memorials", value: stats.memorials, icon: "fa-solid fa-vault", color: "text-purple-400" },
    ];

    const getLevelTheme = (level) => {
        if (level === 'International') return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        if (level === 'National') return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        return "bg-themePanel text-themeTextSec border-themeBorder";
    };

    const getStatusTheme = (status) => {
        if (status?.includes("Open") || status?.includes("Ongoing")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (status?.includes("Closed")) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
        return "text-themeAccent bg-themeElevated border-themeBorderStrong";
    };

    const TABS = [
        { id: 'engine', label: 'Bidding Engine', icon: 'fa-gavel' },
        { id: 'isc', label: 'ISC Rankings', icon: 'fa-trophy' },
        { id: 'vault', label: 'Memorial Vault', icon: 'fa-book-bookmark' },
        { id: 'notices', label: 'Notices', icon: 'fa-bullhorn' }
    ];

    const INPUT_CLS = "w-full bg-themeApp border-theme border-themeBorder rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none focus:border-themeAccent transition-colors";
    const LABEL_CLS = "block text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1.5 ml-1";

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* ═══════════════ BRAND HEADER ═══════════════ */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText">
                <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                    <div className="text-center lg:text-left flex-1">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3 lg:mb-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500 rounded-themePanel flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <i className="fa-solid fa-scale-balanced text-[#050505] text-xl lg:text-2xl"></i>
                            </div>
                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-themeAccent">Moot Court Society</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter mb-2 text-themeText drop-shadow-md">Advocacy Engine</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium max-w-lg mx-auto lg:mx-0`}>Access the Internal Selection pipeline, monitor external opportunities, and submit competitive bids.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                        <button className="bg-themeApp hover:bg-neutral-800 border-theme border-themeBorderStrong w-full sm:w-auto px-6 py-3.5 lg:py-4 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all text-themeText flex items-center justify-center gap-2">
                            <i className="fa-solid fa-file-pdf"></i> MCS Rulebook
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════ STATS ═══════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 animate-fade-in">
                {statCards.map((s, i) => (
                    <div key={i} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel flex flex-col gap-2 group hover:border-themeBorderStrong transition-colors cursor-default border-theme border-themeBorder`}>
                        <i className={`${s.icon} ${s.color} text-xl lg:text-2xl mb-1 lg:mb-2 group-hover:scale-110 transition-transform origin-left`}></i>
                        <p className="text-2xl lg:text-3xl font-black text-themeText tracking-tight">{s.value}</p>
                        <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest`}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ═══════════════ TABS ═══════════════ */}
            <div className="flex p-1.5 bg-themePanel rounded-themePanel w-full lg:w-fit border-theme border-themeBorder overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong shadow-sm"
                            : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent hover:bg-themeElevated/50"
                            }`}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════════════ BIDDING ENGINE TAB ═══════════════ */}
            {activeTab === "engine" && (
                <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight pl-2 flex items-center gap-2`}>
                                <i className="fa-solid fa-gavel text-amber-500"></i> Active Opportunities
                            </h3>
                            <p className="text-xs text-themeTextSec pl-2 mt-1">Submit blind research memos to bid for external moots.</p>
                        </div>
                    </div>

                    {upcomingMoots.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                            <i className="fa-solid fa-map-location-dot text-4xl lg:text-5xl text-neutral-600 mb-4"></i>
                            <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No open competitions at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                            {upcomingMoots.map((moot) => (
                                <div key={moot.id} className={`${theme.layout.panel} rounded-themePanel hover:border-themeBorderStrong border-theme border-themeBorder transition-all group overflow-hidden flex flex-col`}>
                                    <div className="p-5 lg:p-6 flex-1 cursor-pointer" onClick={() => setExpandedMoot(expandedMoot === moot.id ? null : moot.id)}>
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded-md text-[8px] lg:text-[9px] font-black uppercase tracking-widest border-theme ${getLevelTheme(moot.level)}`}>
                                                        {moot.level}
                                                    </span>
                                                    <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border-theme ${getStatusTheme(moot.status)}`}>
                                                        {moot.status}
                                                    </span>
                                                </div>
                                                <h4 className="text-base lg:text-lg font-black text-themeText group-hover:text-amber-400 transition-colors leading-tight">{moot.moot_name}</h4>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-themeElevated border-theme border-themeBorder flex items-center justify-center shrink-0">
                                                <i className={`fa-solid fa-chevron-down text-themeTextSec text-[10px] transition-transform ${expandedMoot === moot.id ? 'rotate-180' : ''}`}></i>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="bg-themeApp rounded-lg p-2.5 border-theme border-themeBorder">
                                                <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5"><i className="fa-solid fa-calendar mr-1"></i> Date</p>
                                                <p className="text-[10px] lg:text-xs font-bold text-themeText">{new Date(moot.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <div className="bg-themeApp rounded-lg p-2.5 border-theme border-themeBorder">
                                                <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5"><i className="fa-solid fa-location-dot mr-1"></i> Venue</p>
                                                <p className="text-[10px] lg:text-xs font-bold text-themeText truncate">{moot.venue || "TBA"}</p>
                                            </div>
                                        </div>
                                        
                                        {moot.description && (
                                            <p className="text-[10px] lg:text-xs text-themeTextSec line-clamp-2 mt-3 leading-relaxed">{moot.description}</p>
                                        )}
                                    </div>

                                    {/* Bidding Area (Expanded) */}
                                    {expandedMoot === moot.id && (
                                        <div className="bg-themeElevated p-5 lg:p-6 border-t-theme border-themeBorder animate-fade-in relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                            <h5 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-themeText mb-3 flex items-center gap-2">
                                                <i className="fa-solid fa-feather text-amber-500"></i> Submit Blind Bid
                                            </h5>
                                            
                                            {submitSuccess === moot.id ? (
                                                <div className="w-full py-6 bg-emerald-500/10 border-theme border-emerald-500/20 text-emerald-400 rounded-themePanel text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <i className="fa-solid fa-check-circle text-xl"></i> Bid Successfully Lodged
                                                </div>
                                            ) : (
                                                <form onSubmit={(e) => handleApplySubmit(e, moot.id)} className="flex flex-col gap-3 relative z-10">
                                                    <textarea 
                                                        value={applyForm.research_memo} 
                                                        onChange={e => setApplyForm({ ...applyForm, research_memo: e.target.value })} 
                                                        rows="5" 
                                                        className={`${INPUT_CLS} resize-none bg-themePanel focus:border-amber-500`} 
                                                        placeholder="Paste your research memo here. Ensure all personally identifiable information is removed for blind grading." 
                                                        required
                                                    ></textarea>
                                                    <div className="flex justify-end">
                                                        <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-themePanel text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2">
                                                            {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing</> : <><i className="fa-solid fa-paper-plane"></i> Submit Bid</>}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════ ISC TAB ═══════════════ */}
            {activeTab === "isc" && (
                <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
                    {!iscBreakdown ? (
                        <div className="w-full py-20 lg:py-24 border-2 border-dashed border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themeApp text-center px-6">
                            <i className="fa-solid fa-magnifying-glass-chart text-4xl lg:text-5xl text-neutral-600 mb-5 lg:mb-6"></i>
                            <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Internal Selection Engine</h3>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-md`}>The ISC algorithm is currently processing scores for the upcoming mooting cycle. Your detailed breakdown will appear here once published.</p>
                        </div>
                    ) : (
                        <>
                            {/* ISC Profile Card */}
                            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder">
                                <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                                    <div>
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border-theme border-amber-500/20 rounded-md text-[9px] font-black uppercase tracking-widest mb-3 inline-block">Official ISC Standing</span>
                                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-themeText mb-1 drop-shadow-md">Rank #{stats.rank.replace('#', '')}</h2>
                                        <p className={`${theme.text.muted} text-xs lg:text-sm font-bold uppercase tracking-widest mt-2`}><i className="fa-solid fa-chart-line mr-1"></i> {iscBreakdown.total_points} cumulative points</p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 w-full lg:w-auto">
                                        {[
                                            { label: 'Oral Rounds', value: iscBreakdown.oral_score ?? '--', color: 'text-amber-400' },
                                            { label: 'Memorials', value: iscBreakdown.memorial_score ?? '--', color: 'text-purple-400' },
                                            { label: 'Research', value: iscBreakdown.research_score ?? '--', color: 'text-blue-400' },
                                            { label: 'Viva', value: iscBreakdown.viva_score ?? '--', color: 'text-emerald-400' }
                                        ].map((s, i) => (
                                            <div key={i} className="bg-themeApp p-4 lg:p-5 rounded-themePanel border-theme border-themeBorderStrong text-center hover:bg-themePanel transition-colors">
                                                <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1.5">{s.label}</p>
                                                <p className={`text-xl lg:text-3xl font-black ${s.color} drop-shadow-sm`}>{s.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ISC History Timeline */}
                            <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 lg:p-6`}>
                                <h3 className="text-base lg:text-lg font-black text-themeText mb-5 flex items-center gap-2">
                                    <i className="fa-solid fa-timeline text-amber-500"></i> Assessment History
                                </h3>
                                <div className="space-y-4">
                                    {(iscBreakdown.rounds_participated || []).length === 0 ? (
                                        <p className={`text-xs ${theme.text.muted} py-8 text-center`}>No ISC rounds participated yet. Results will appear here after each round.</p>
                                    ) : (
                                        (iscBreakdown.rounds_participated || []).map((round, i) => (
                                            <div key={i} className="flex items-start gap-4 bg-themePanel p-4 rounded-themePanel border-theme border-themeBorder hover:border-themeBorderStrong transition-colors">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black border-2 ${round.passed ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                                                    <i className={`fa-solid ${round.passed ? 'fa-check' : 'fa-xmark'}`}></i>
                                                </div>
                                                <div className="flex-1 mt-0.5">
                                                    <p className="text-sm lg:text-base font-black text-themeText leading-none mb-1">{round.round_name}</p>
                                                    <p className={`text-[9px] font-bold ${theme.text.muted} uppercase tracking-widest`}>{round.date}</p>
                                                </div>
                                                <span className="text-xs font-black text-themeText bg-themeElevated px-3 py-1.5 rounded-lg border-theme border-themeBorder shrink-0 flex items-center gap-1">
                                                    <i className="fa-solid fa-star text-amber-500 text-[10px]"></i> {round.score ?? '--'} pts
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ═══════════════ MEMORIAL VAULT TAB ═══════════════ */}
            {activeTab === "vault" && (
                <div className="flex flex-col gap-6 lg:gap-8 animate-fade-in">
                    {/* Premium Archive Header */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1128] to-[#110b1a] rounded-themePanel p-6 lg:p-8 border-theme border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-500/20 rounded-themePanel flex items-center justify-center shrink-0 border-theme border-purple-500/40 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <i className="fa-solid fa-vault text-purple-300 text-xl lg:text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-black text-purple-100 tracking-tight mb-1">Memorial Archive</h2>
                                    <p className="text-[10px] lg:text-xs font-medium text-purple-200/70 leading-relaxed max-w-2xl">
                                        Confidential repository of past memorials. These documents are the intellectual property of the University. Unauthorized distribution is a violation of the Honor Code.
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowMemorialModal(true)} className="w-full md:w-auto px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 shadow-[0_0_20px_rgba(147,51,234,0.4)] border-theme border-purple-400/50">
                                <i className="fa-solid fa-cloud-arrow-up"></i> Deposit Memorial
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                        {memorialVault.length === 0 ? (
                            <div className="col-span-full py-16 lg:py-24 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                                <i className="fa-solid fa-book-journal-whills text-4xl lg:text-5xl text-neutral-600 mb-4"></i>
                                <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>The Archive is currently empty.</p>
                            </div>
                        ) : (
                            memorialVault.map((memo) => {
                                let tags = [];
                                try { tags = typeof memo.tags === 'string' ? JSON.parse(memo.tags) : (memo.tags || []); }
                                catch { tags = []; }

                                return (
                                    <div key={memo.id} className="bg-themePanel p-5 lg:p-6 rounded-themePanel border-theme border-themeBorder hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all flex flex-col gap-4 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
                                        
                                        <div className="flex justify-between items-start gap-3 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[8px] lg:text-[9px] font-black text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md border-theme border-purple-500/20 shrink-0 uppercase tracking-widest">{memo.year_submitted}</span>
                                                    {memo.is_verified && <span className="text-[8px] lg:text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border-theme border-emerald-500/20 uppercase tracking-widest flex items-center gap-1"><i className="fa-solid fa-check"></i> Verified</span>}
                                                </div>
                                                <h4 className="text-sm lg:text-base font-black text-themeText group-hover:text-purple-400 transition-colors leading-tight mb-1 truncate">{memo.title}</h4>
                                                <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.secondary} uppercase tracking-widest truncate`}><i className="fa-solid fa-gavel text-neutral-500 mr-1"></i> {memo.competition_name}</p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-auto relative z-10">
                                            {tags.length > 0 ? tags.slice(0, 3).map((tag, j) => (
                                                <span key={j} className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-themeApp rounded-md border-theme border-themeBorder text-themeTextSec opacity-80">{tag}</span>
                                            )) : <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-transparent text-transparent select-none">Empty</span>}
                                            {tags.length > 3 && <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-themeApp rounded-md border-theme border-themeBorder text-themeTextSec opacity-80">+{tags.length - 3}</span>}
                                        </div>

                                        {/* Access */}
                                        <div className="pt-4 border-t-theme border-themeBorder relative z-10">
                                            {memo.file_url ? (
                                                <a href={memo.file_url} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-themeElevated hover:bg-purple-500/10 border-theme border-themeBorderStrong hover:border-purple-500/30 rounded-lg text-[9px] lg:text-[10px] font-black text-themeText hover:text-purple-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                    <i className="fa-solid fa-lock-open"></i> Access Document
                                                </a>
                                            ) : (
                                                <button disabled className="w-full py-2.5 bg-themeApp border-theme border-themeBorder rounded-lg text-[9px] lg:text-[10px] font-black text-themeTextSec opacity-50 uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                                    <i className="fa-solid fa-lock"></i> No File Attached
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════ NOTICES TAB ═══════════════ */}
            {activeTab === "notices" && (
                <div className="flex flex-col gap-5 lg:gap-6 animate-fade-in">
                    <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight pl-2 flex items-center gap-2`}>
                        <i className="fa-solid fa-bullhorn text-themeTextSec opacity-70"></i> Society Announcements
                    </h3>

                    {announcements.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 text-center border-2 border-dashed border-themeBorder rounded-themePanel bg-themeApp px-4">
                            <i className="fa-regular fa-bell-slash text-3xl lg:text-4xl text-neutral-600 mb-3"></i>
                            <p className={`${theme.text.muted} font-bold text-xs lg:text-sm`}>No new notices.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {announcements.map((notice, i) => (
                                <div key={notice.id} className={`bg-themePanel border-theme ${i === 0 ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-themeBorder'} hover:border-themeBorderStrong p-5 lg:p-6 rounded-themePanel text-themeText relative overflow-hidden group transition-all`}>
                                    {i === 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}
                                    <p className={`font-bold text-[9px] lg:text-[10px] uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2 ${i === 0 ? 'text-amber-500' : 'text-themeTextSec opacity-70'}`}>
                                        {i === 0 && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>}
                                        {i === 0 ? "Latest Update" : new Date(notice.posted_at).toLocaleDateString('en-GB')}
                                    </p>
                                    <h4 className="text-sm lg:text-base font-black mb-2 leading-tight text-themeText group-hover:text-amber-400 transition-colors">{notice.title}</h4>
                                    <p className={`text-[10px] lg:text-xs ${theme.text.secondary} font-medium leading-relaxed`}>{notice.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════ SUBMIT MEMORIAL MODAL ═══════════════ */}
            {showMemorialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowMemorialModal(false)}>
                    <div className="bg-themeApp w-full max-w-xl rounded-themePanel overflow-hidden border-theme border-themeBorder max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#1a1128] to-[#110b1a] p-6 border-b-theme border-purple-500/30 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-xl"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black text-purple-50 tracking-tight mb-1 flex items-center gap-2">
                                        <i className="fa-solid fa-cloud-arrow-up text-purple-400"></i> Deposit to Archive
                                    </h3>
                                    <p className="text-[10px] lg:text-xs text-purple-300/80 font-bold uppercase tracking-widest"><i className="fa-solid fa-shield-halved mr-1"></i> Undergoes plagiarism & quality review</p>
                                </div>
                                <button onClick={() => setShowMemorialModal(false)} className="w-8 h-8 rounded-full bg-purple-500/10 border-theme border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/30 flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>
                        <form onSubmit={handleMemorialSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={LABEL_CLS}>Memorial Title</label>
                                    <input type="text" value={memorialForm.title} onChange={e => setMemorialForm({ ...memorialForm, title: e.target.value })} className={INPUT_CLS} placeholder="e.g. Applicant's Memorial" required />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Competition Name</label>
                                    <input type="text" value={memorialForm.competition_name} onChange={e => setMemorialForm({ ...memorialForm, competition_name: e.target.value })} className={INPUT_CLS} placeholder="e.g. Jessup 2025" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={LABEL_CLS}>Year Submitted</label>
                                    <input type="number" value={memorialForm.year_submitted} onChange={e => setMemorialForm({ ...memorialForm, year_submitted: e.target.value })} className={INPUT_CLS} min="2020" max="2030" required />
                                </div>
                                <div>
                                    <label className={LABEL_CLS}>Tags (comma-separated)</label>
                                    <input type="text" value={memorialForm.tags} onChange={e => setMemorialForm({ ...memorialForm, tags: e.target.value })} className={INPUT_CLS} placeholder="e.g. ICL, Human Rights" />
                                </div>
                            </div>
                            <div>
                                <label className={LABEL_CLS}>Memorial Text Content</label>
                                <textarea value={memorialForm.content_text} onChange={e => setMemorialForm({ ...memorialForm, content_text: e.target.value })} rows="6" className={`${INPUT_CLS} resize-none focus:border-purple-500`} placeholder="Paste the core text of your memorial here for search indexing..." required></textarea>
                            </div>
                            {submitSuccess === 'memorial' ? (
                                <div className="w-full py-4 bg-emerald-500/10 border-theme border-emerald-500/20 text-emerald-400 rounded-themePanel text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-check-circle text-lg"></i> Deposited Successfully
                                </div>
                            ) : (
                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 mt-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                                    {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Depositing...</> : "Confirm Deposit"}
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
