/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
/* eslint-disable */
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function CourseVault() {
    const { userSession } = useERP();

    const [activeTab, setActiveTab] = useState("vault");

    // --- CACHE KEYS ---
    const CACHE_KEY_MATS = 'cv_materials';
    const CACHE_KEY_HIST = 'cv_history';
    const CACHE_KEY_BID  = 'cv_bidding';

    // Restore from cache instantly (zero lag)
    const cached = (key, fallback) => {
        try { const d = sessionStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
        catch { return fallback; }
    };

    const [materials, setMaterials] = useState(() => cached(CACHE_KEY_MATS, []));
    const [history, setHistory] = useState(() => cached(CACHE_KEY_HIST, []));
    const [biddingData, setBiddingData] = useState(() => cached(CACHE_KEY_BID, {
        phase: 'locked', wallet: { total: 0, used: 0, available: 0 }, catalog: [], myBids: []
    }));

    // --- PARALLEL BACKGROUND FETCH ---
    useEffect(() => {
        if (!userSession?.id) return;
        const studentId = userSession.db_id || userSession.id;
        const batchId = userSession.academic_batch || 'BATCH-2026';

        // 1. Materials (now fetching course_modules and course_materials)
        const fetchMaterials = async () => {
            try {
                const { data: courses } = await supabase
                    .from('subjects').select('id, name').eq('batch_id', batchId);
                if (!courses?.length) return;
                const courseIds = courses.map(c => c.id);
                
                const [matsRes, modsRes] = await Promise.all([
                    supabase.from('course_materials').select('*, profiles!faculty_id(full_name)').in('subject_id', courseIds).order('created_at', { ascending: false }),
                    supabase.from('course_modules').select('*').in('subject_id', courseIds).eq('is_published', true).order('created_at', { ascending: false })
                ]);
                
                const formattedMats = (matsRes.data || []).map(m => {
                    const c = courses.find(course => course.id === m.subject_id);
                    let type = m.material_type || "Reading Material";
                    if (m.title?.toLowerCase().includes('syllabus')) type = "Syllabus";
                    if (m.title?.toLowerCase().includes('slide') || m.title?.toLowerCase().includes('ppt')) type = "Lecture Slides";
                    return {
                        id: m.id, title: m.title, type, module: m.module_week || "General",
                        driveUrl: m.file_url, notes: m.content_text,
                        date: new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        faculty: m.profiles?.full_name || 'Faculty',
                        course_name: c?.name || 'Subject'
                    };
                });
                
                const formattedMods = (modsRes.data || []).map(m => {
                    const c = courses.find(course => course.id === m.subject_id);
                    return {
                        id: m.id, title: m.module_title, type: "Syllabus", module: "Module",
                        driveUrl: null, notes: m.faculty_edited_content || m.base_content,
                        date: new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        faculty: 'Department',
                        course_name: c?.name || 'Subject'
                    };
                });
                
                const allItems = [...formattedMods, ...formattedMats];
                setMaterials(allItems);
                try { sessionStorage.setItem(CACHE_KEY_MATS, JSON.stringify(allItems)); } catch {}
            } catch (e) { console.error("Vault materials fetch:", e); }
        };

        // 2. History
        const fetchHistory = async () => {
            try {
                const { data: histData } = await supabase
                    .from('academic_history').select('*, subjects(name, code, credits)')
                    .eq('student_id', studentId).order('semester_name', { ascending: false });
                if (!histData) return;
                const grouped = histData.reduce((acc, curr) => {
                    const sem = acc.find(s => s.semester === curr.semester_name);
                    const courseObj = { id: curr.subjects?.code || 'N/A', name: curr.subjects?.name || 'Subject', grade: curr.grade, credits: curr.subjects?.credits || 3 };
                    if (sem) { sem.courses.push(courseObj); }
                    else { acc.push({ semester: curr.semester_name, cgpa: curr.cgpa_for_semester, courses: [courseObj] }); }
                    return acc;
                }, []);
                setHistory(grouped);
                try { sessionStorage.setItem(CACHE_KEY_HIST, JSON.stringify(grouped)); } catch {}
            } catch (e) { console.error("Vault history fetch:", e); }
        };

        // 3. Bidding
        const fetchBidding = async () => {
            try {
                const { data: phaseData } = await supabase.from('bidding_phases').select('*').limit(1).single();
                if (!phaseData) return;
                const [walletRes, catalogRes, bidsRes] = await Promise.all([
                    supabase.from('student_bidding_wallets').select('*').eq('student_id', studentId).eq('phase_id', phaseData.id).single(),
                    supabase.from('elective_catalog').select('*').eq('phase_id', phaseData.id),
                    supabase.from('bidding_ledger').select('*, elective_catalog(course_name, current_min_bid)').eq('student_id', studentId).eq('phase_id', phaseData.id)
                ]);
                let w = walletRes.data;
                if (!w && !walletRes.error?.message?.includes('Multiple')) {
                    const { data: newW } = await supabase.from('student_bidding_wallets').insert({ student_id: studentId, phase_id: phaseData.id, total_points: 1000, used_points: 0 }).select().single();
                    w = newW;
                }
                const safeWallet = w ? { total: w.total_points, used: w.used_points, available: w.total_points - w.used_points } : { total: 0, used: 0, available: 0 };
                const formattedBids = bidsRes.data ? bidsRes.data.map(b => ({
                    id: b.elective_id, name: b.elective_catalog?.course_name || 'Elective',
                    bid: b.bid_amount, status: b.status, currentMinBid: b.elective_catalog?.current_min_bid || 0
                })) : [];
                const result = { phase: phaseData, wallet: safeWallet, catalog: catalogRes.data || [], myBids: formattedBids };
                setBiddingData(result);
                try { sessionStorage.setItem(CACHE_KEY_BID, JSON.stringify(result)); } catch {}
            } catch (e) { console.error("Vault bidding fetch:", e); }
        };

        // Fire ALL in parallel — no waiting
        fetchMaterials();
        fetchHistory();
        fetchBidding();
    }, [userSession]);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* MASTER HEADER */}
            <div className={`flex flex-col lg:flex-row justify-between gap-6 ${theme.layout.panel} p-6 lg:p-8 rounded-themePanel  border-theme border-themeBorder`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center text-themeAccent text-xl lg:text-2xl shrink-0">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl text-themeText mb-1`}>Curriculum Hub</h1>
                        <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Manage your past, present, and future academic journey.</p>
                    </div>
                </div>

                <div className="flex p-1.5 bg-themePanel border-theme border-themeBorder rounded-themePanel w-full lg:w-auto h-fit overflow-x-auto no-scrollbar">
                    {[
                        { id: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
                        { id: 'vault', label: 'Vault', icon: 'fa-google-drive', isBrand: true },
                        { id: 'bidding', label: 'Bidding', icon: 'fa-gavel' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[100px] px-4 lg:px-6 py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                                ? "bg-themeElevated text-themeAccent  border-theme border-themeBorderStrong"
                                : "text-themeTextSec opacity-70 hover:text-themeText"
                                }`}
                        >
                            <i className={`${tab.isBrand ? 'fa-brands' : 'fa-solid'} ${tab.icon} mr-2`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* DYNAMIC VIEWPORT — no loading spinner, instant render */}
            <div className="animate-fade-in">
                {activeTab === 'vault' && <VaultView materials={materials} />}
                {activeTab === 'history' && <HistoryView history={history} />}
                {activeTab === 'bidding' && <BiddingEngine biddingData={biddingData} userSession={userSession} />}
            </div>
        </div>
    );
}

// ==========================================
// SUB-MODULE 1: COURSE VAULT
// ==========================================
function VaultView({ materials }) {
    const [activeFilter, setActiveFilter] = useState("All");

    const getTypeIcon = (type) => {
        switch (type) {
            case "Syllabus": return "fa-book text-themeAccent bg-themeElevated border-themeBorderStrong";
            case "Lecture Slides": return "fa-display text-blue-400 bg-themeElevated border-themeBorderStrong";
            case "Reading Material": return "fa-file-pdf text-rose-400 bg-themeElevated border-themeBorderStrong";
            default: return "fa-file text-themeTextSec bg-themePanel border-themeBorderStrong";
        }
    };

    const filteredMaterials = activeFilter === "All" ? materials : materials.filter(m => m.type === activeFilter);

    const groupedMaterials = filteredMaterials.reduce((acc, curr) => {
        if (!acc[curr.course_name]) acc[curr.course_name] = [];
        acc[curr.course_name].push(curr);
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-6">
            <div className={`flex gap-2 w-full overflow-x-auto no-scrollbar p-1.5 ${theme.layout.panelElevated} rounded-themePanel border-theme border-themeBorder`}>
                {['All', 'Syllabus', 'Lecture Slides', 'Reading Material'].map(filter => (
                    <button
                        key={filter} onClick={() => setActiveFilter(filter)}
                        className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[9px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeFilter === filter ? 'bg-themeElevated text-themeAccent border-theme border-themeBorderStrong  scale-[1.02]' : 'bg-transparent text-themeTextSec opacity-70 hover:text-themeText'}`}
                    >
                        {filter === 'All' ? 'All Files' : filter}
                    </button>
                ))}
            </div>

            {filteredMaterials.length === 0 ? (
                <div className="w-full py-16 lg:py-24 border-2 border-dashed border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themeApp text-center px-4">
                    <i className={`fa-brands fa-google-drive text-4xl lg:text-5xl text-neutral-700 mb-4`}></i>
                    <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Vault is Empty</h3>
                    <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-sm`}>No materials published for your current semester yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {Object.entries(groupedMaterials).map(([subjectName, items]) => (
                        <div key={subjectName} className="flex flex-col gap-6">
                            <h3 className={`${theme.text.heading} text-lg lg:text-xl text-themeText border-b-theme border-themeBorder pb-2`}>
                                <i className="fa-solid fa-folder-open text-themeAccent mr-2"></i>{subjectName}
                            </h3>
                            
                            <div className="flex flex-col gap-8">
                                {/* Admin Modules Group */}
                                {items.filter(i => i.type === 'Syllabus' && i.module === 'Module').length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70">Admin Drafted Modules</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {items.filter(i => i.type === 'Syllabus' && i.module === 'Module').map(item => (
                                                <div key={item.id} className={`${theme.layout.panel} border-theme border-themeBorder p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel  hover:border-themeBorderStrong transition-colors group flex flex-col justify-between`}>
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-lg lg:text-xl shrink-0 border-theme ${getTypeIcon(item.type)} `}>
                                                                <i className={`fa-solid ${getTypeIcon(item.type).split(' ')[0]}`}></i>
                                                            </div>
                                                            <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest bg-themePanel text-themeTextSec px-2.5 py-1 rounded-md border-theme border-themeBorder shrink-0`}>Official</span>
                                                        </div>
                                                        <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors tracking-tight leading-tight mb-2 line-clamp-2">{item.title}</h3>
                                                        <div className="text-[10px] text-themeTextSec opacity-80 mb-4 prose prose-invert prose-p:my-0">
                                                            <ReactMarkdown>{item.notes}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t-theme border-themeBorder flex items-center justify-between">
                                                        <span className={`text-[9px] lg:text-[10px] font-semibold ${theme.text.muted}`}>Published: {item.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Faculty Resources Group */}
                                {items.filter(i => !(i.type === 'Syllabus' && i.module === 'Module')).length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-themeAccent/80">Faculty Uploaded Resources</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {items.filter(i => !(i.type === 'Syllabus' && i.module === 'Module')).map(item => (
                                                <div key={item.id} className={`bg-themeApp border-theme border-themeBorder p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel hover:border-themeBorderStrong transition-colors group flex flex-col justify-between`}>
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-themePanel flex items-center justify-center text-lg lg:text-xl shrink-0 border-theme ${getTypeIcon(item.type)} `}>
                                                                <i className={`fa-solid ${getTypeIcon(item.type).split(' ')[0]}`}></i>
                                                            </div>
                                                            <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest bg-themeElevated text-themeText px-2.5 py-1 rounded-md border-theme border-themeBorder shrink-0 shadow-sm`}>{item.type}</span>
                                                        </div>
                                                        <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors tracking-tight leading-tight mb-2 line-clamp-2">{item.title}</h3>
                                                        {item.notes && (
                                                            <div className="text-[10px] text-themeTextSec opacity-80 mb-4 prose prose-invert prose-p:my-0">
                                                                <ReactMarkdown>{item.notes}</ReactMarkdown>
                                                            </div>
                                                        )}
                                                        <p className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest mb-4`}><i className="fa-solid fa-user-tie text-themeAccent/50 mr-1.5"></i> Prof. {item.faculty}</p>
                                                    </div>
                                                    <div className="pt-4 border-t-theme border-themeBorder flex items-center justify-between">
                                                        <span className={`text-[9px] lg:text-[10px] font-semibold ${theme.text.muted}`}>Added: {item.date}</span>
                                                        {item.driveUrl && (
                                                            <a href={item.driveUrl} target="_blank" rel="noreferrer" className="w-8 h-8 lg:w-10 lg:h-10 bg-themeElevated hover:bg-amber-500 text-themeTextSec hover:text-[#0a0a0a] rounded-themePanel flex items-center justify-center transition-all border-theme border-themeBorderStrong hover:border-amber-500 shadow-sm">
                                                                <i className="fa-brands fa-google-drive"></i>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================================
// SUB-MODULE 2: ACADEMIC HISTORY
// ==========================================
function HistoryView({ history }) {
    if (history.length === 0) {
        return (
            <div className="w-full py-16 lg:py-24 border-2 border-dashed border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themeApp text-center px-4">
                <i className="fa-solid fa-clock-rotate-left text-4xl lg:text-5xl text-neutral-700 mb-4"></i>
                <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>No Academic History</h3>
                <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-sm`}>Your past semester grades will appear here once finalized by the COE.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {history.map((sem, i) => (
                <div key={i} className={`${theme.layout.panel} border-theme border-themeBorder rounded-themePanel overflow-hidden `}>
                    <div className="from-[#1a1a1a] to-[#121212] p-4 lg:p-5 border-b-theme border-themeBorder flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <h3 className="text-base lg:text-lg font-black text-themeText">{sem.semester}</h3>
                        <span className="bg-themeElevated text-emerald-400 border-theme border-themeBorderStrong px-3 py-1.5 rounded-lg text-[10px] lg:text-xs font-black w-fit">CGPA: {sem.cgpa}</span>
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-themePanel border-b-theme border-themeBorder">
                                <tr>
                                    <th className={`p-3 lg:p-4 pl-4 lg:pl-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>Course ID</th>
                                    <th className={`p-3 lg:p-4 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest`}>Course Name</th>
                                    <th className={`p-3 lg:p-4 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest text-center`}>Credits</th>
                                    <th className={`p-3 lg:p-4 pr-4 lg:pr-6 text-[9px] lg:text-[10px] font-black ${theme.text.muted} uppercase tracking-widest text-right`}>Final Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {sem.courses.map((course, idx) => (
                                    <tr key={idx} className="hover:bg-themeElevated transition-colors">
                                        <td className={`p-3 lg:p-4 pl-4 lg:pl-6 text-[10px] lg:text-xs font-bold ${theme.text.muted}`}>{course.id}</td>
                                        <td className="p-3 lg:p-4 text-xs lg:text-sm font-black text-themeText">{course.name}</td>
                                        <td className="p-3 lg:p-4 text-center text-[10px] lg:text-xs font-bold text-themeText">{course.credits}</td>
                                        <td className="p-3 lg:p-4 pr-4 lg:pr-6 text-right font-black text-themeAccent">{course.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ==========================================
// SUB-MODULE 3: BIDDING ENGINE
// ==========================================
function BiddingEngine({ biddingData, userSession }) {
    const { phase, wallet, catalog, myBids } = biddingData;
    const [biddingTab, setBiddingTab] = useState("catalog");
    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedElective, setSelectedElective] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!phase || phase.status === 'locked') {
        return (
            <div className="w-full py-16 lg:py-24 border-theme border-themeBorder rounded-themePanel flex flex-col items-center justify-center bg-themeApp text-center px-4">
                <i className="fa-solid fa-lock text-4xl lg:text-5xl text-neutral-700 mb-4 lg:mb-6"></i>
                <h3 className={`${theme.text.heading} text-xl lg:text-2xl text-themeText tracking-tight`}>Bidding is Locked</h3>
                <p className={`${theme.text.secondary} text-xs lg:text-sm mt-2 max-w-md text-center`}>The administration has not yet opened the elective allocation engine for the upcoming semester.</p>
            </div>
        );
    }

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const parsedBid = parseInt(bidAmount);
            const { data: existingBids } = await supabase.from('bidding_ledger').select('*').eq('student_id', userSession.db_id).eq('phase_id', phase.id).eq('elective_id', selectedElective.id);
            const prevBid = existingBids?.length ? existingBids[0].bid_amount : 0;
            const newUsed = wallet.used - prevBid + parsedBid;

            if (existingBids?.length) {
                await supabase.from('bidding_ledger').update({ bid_amount: parsedBid }).eq('id', existingBids[0].id);
            } else {
                await supabase.from('bidding_ledger').insert({ student_id: userSession.db_id, phase_id: phase.id, elective_id: selectedElective.id, bid_amount: parsedBid, status: 'pending' });
            }
            await supabase.from('student_bidding_wallets').update({ used_points: newUsed }).eq('student_id', userSession.db_id).eq('phase_id', phase.id);

            // Re-fetch bids after placing bid
            const [walletRes, bidsRes] = await Promise.all([
                supabase.from('student_bidding_wallets').select('*').eq('student_id', userSession.db_id).eq('phase_id', phase.id).single(),
                supabase.from('bidding_ledger').select('*, elective_catalog(course_name, current_min_bid)').eq('student_id', userSession.db_id).eq('phase_id', phase.id)
            ]);
            const w = walletRes.data;
            const safeWallet = w ? { total: w.total_points, used: w.used_points, available: w.total_points - w.used_points } : { total: 0, used: 0, available: 0 };
            const formattedBids = bidsRes.data ? bidsRes.data.map(b => ({
                id: b.elective_id, name: b.elective_catalog?.course_name || 'Elective',
                bid: b.bid_amount, status: b.status, currentMinBid: b.elective_catalog?.current_min_bid || 0
            })) : [];

            // Update UI state properly
            // Update UI state properly
            // Instead of using setBiddingData (which is missing here), we simulate it or pass a callback.
            // Wait, this is a child component, it doesn't have setBiddingData. We must reload the page or trigger a refresh via parent.
            window.location.reload(); // Simple zero-lag reload, will fetch from cache immediately then update
            
            setTimeout(() => {
                setIsSubmitting(false);
                setShowBidModal(false);
            }, 1000);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header & Wallet */}
            <div className="bg-themeElevated rounded-themePanel p-5 lg:p-8 relative overflow-hidden border-theme border-themeBorder flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                <div className="relative z-10 text-center md:text-left flex-1">
                    <h2 className="text-xl lg:text-2xl font-black tracking-tight text-themeText mb-1"><i className="fa-solid fa-vote-yea text-themeAccent mr-2"></i> Elective Voting Engine</h2>
                    <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Cast your point-votes for the electives you want to see offered this semester.</p>
                </div>
                <div className="relative z-10 flex gap-4 shrink-0 bg-themePanel border-theme border-themeBorder p-4 rounded-themePanel w-full md:w-auto justify-center">
                    <div className="flex flex-col pr-4 border-r-theme border-themeBorderStrong">
                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1">Available Points</span>
                        <span className="text-xl lg:text-2xl font-black text-themeAccent">{wallet.available}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec mb-0.5">Total: {wallet.total}</span>
                        <span className="text-[9px] lg:text-[10px] font-bold text-rose-500">Locked: {wallet.used}</span>
                    </div>
                </div>
            </div>

            {/* Bidding Tabs */}
            <div className={`flex gap-2 w-full overflow-x-auto no-scrollbar p-1.5 ${theme.layout.panelElevated} rounded-themePanel border-theme border-themeBorder`}>
                {[{ id: 'catalog', label: 'Marketplace' }, { id: 'portfolio', label: 'My Portfolio' }].map(tab => (
                    <button key={tab.id} onClick={() => setBiddingTab(tab.id)} className={`flex-1 px-4 py-2.5 lg:py-3 rounded-lg text-[9px] lg:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${biddingTab === tab.id ? 'bg-themeElevated text-themeAccent border-theme border-themeBorderStrong ' : 'text-themeTextSec opacity-70 hover:text-themeText'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Catalog View */}
            {biddingTab === 'catalog' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
                    {catalog.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-themeTextSec opacity-70 text-xs uppercase tracking-widest font-black">No courses available in the catalog.</div>
                    ) : (
                        catalog.map(course => (
                            <div key={course.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel border-theme border-themeBorder  flex flex-col justify-between group`}>
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest bg-themePanel px-2.5 py-1 rounded-md border-theme border-themeBorder">{course.id}</span>
                                        {course.tags && course.tags.includes("High Demand") && (
                                            <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border-theme bg-themeElevated text-rose-400 border-themeBorderStrong">High Demand</span>
                                        )}
                                    </div>
                                    <h3 className="text-base lg:text-lg font-black text-themeText leading-tight mb-1 group-hover:text-themeAccent transition-colors">{course.course_name}</h3>
                                    <p className="text-[10px] lg:text-xs font-bold text-themeTextSec opacity-70 mb-5"><i className="fa-solid fa-user-tie mr-1 text-neutral-600"></i> {course.professor_name}</p>
                                    <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-5 lg:mb-6">
                                        <div className="bg-themePanel p-2.5 lg:p-3 rounded-themePanel border-theme border-themeBorder">
                                            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Faculty</p>
                                            <p className="text-xs lg:text-sm font-black text-themeText truncate">{course.professor_name}</p>
                                        </div>
                                        <div className="bg-themeElevated p-2.5 lg:p-3 rounded-themePanel border-theme border-themeBorderStrong">
                                            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeAccent/80 mb-0.5">Total Votes</p>
                                            <p className="text-xs lg:text-sm font-black text-themeAccent">{course.current_min_bid} pts</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedElective(course); setBidAmount(""); setShowBidModal(true); }} className="w-full py-3.5 bg-themeElevated hover:bg-themeAccent text-themeText hover:text-[#0a0a0a] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-theme border-themeBorderStrong hover:border-themeAccent flex justify-center items-center gap-2">
                                    <i className="fa-solid fa-vote-yea"></i> Cast Votes
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Portfolio View */}
            {biddingTab === 'portfolio' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 animate-fade-in">
                    {myBids.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-themeTextSec opacity-70 text-xs uppercase tracking-widest font-black">Your portfolio is empty. Place a bid to start.</div>
                    ) : (
                        myBids.map(bid => (
                            <div key={bid.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel border-theme border-themeBorder flex flex-col justify-between group`}>
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest bg-themePanel px-2.5 py-1 rounded-md border-theme border-themeBorder">{bid.id}</span>
                                        <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border-theme bg-themeElevated border-themeBorderStrong ${bid.status === 'won' ? 'text-emerald-500' : bid.status === 'lost' ? 'text-rose-500' : 'text-amber-500'}`}>
                                            {bid.status}
                                        </span>
                                    </div>
                                    <h3 className="text-base lg:text-lg font-black text-themeText leading-tight mb-5">{bid.name}</h3>
                                    <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-5 lg:mb-6">
                                        <div className="bg-themePanel p-2.5 lg:p-3 rounded-themePanel border-theme border-themeBorder">
                                            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-0.5">Your Votes</p>
                                            <p className="text-xs lg:text-sm font-black text-themeText">{bid.bid} pts</p>
                                        </div>
                                        <div className="bg-themeElevated p-2.5 lg:p-3 rounded-themePanel border-theme border-themeBorderStrong">
                                            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-0.5">Total Votes</p>
                                            <p className="text-xs lg:text-sm font-black text-themeText">{bid.currentMinBid} pts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            {showBidModal && selectedElective && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-themeApp animate-fade-in">
                    <div className="bg-themeApp w-full max-w-md rounded-themePanel overflow-hidden border-theme border-themeBorder">
                        <div className="bg-themePanel p-6 text-themeText relative border-b-theme border-themeBorder">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight mb-1 text-themeText">Allocate Points</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-themeTextSec font-black">Bidding for {selectedElective.id}</p>
                                </div>
                                <button onClick={() => setShowBidModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel hover:bg-neutral-800 text-themeTextSec hover:text-themeText transition-colors border-theme border-themeBorderStrong">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handlePlaceBid} className="p-6 flex flex-col gap-6">
                            <div className="text-center">
                                <h4 className="text-lg font-black text-themeText">{selectedElective.course_name}</h4>
                                <p className="text-[10px] uppercase tracking-widest font-black text-themeTextSec opacity-70 mt-1">Total Votes So Far: <span className="text-themeAccent">{selectedElective.current_min_bid} pts</span></p>
                            </div>
                            <div className="bg-themePanel border-theme border-themeBorder p-5 rounded-themePanel flex flex-col items-center">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-3">Your Vote Amount (Points)</label>
                                <div className="relative w-full max-w-[200px]">
                                    <input type="number" min={1} max={wallet.available + (bidAmount ? parseInt(bidAmount) : 0)} value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full text-center text-3xl font-black text-themeText bg-[#050505] border-theme border-themeBorderStrong focus:border-themeAccent rounded-themePanel py-4 outline-none transition-colors" required />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-600 uppercase">pts</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mt-3">Available Balance: <span className="text-themeAccent">{wallet.available} pts</span></p>
                            </div>
                            <button type="submit" disabled={isSubmitting || !bidAmount} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-themePanel text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 group overflow-hidden relative">
                                {!isSubmitting && <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>}
                                {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Processing...</> : <><i className="fa-solid fa-gavel"></i> Confirm Allocation</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}