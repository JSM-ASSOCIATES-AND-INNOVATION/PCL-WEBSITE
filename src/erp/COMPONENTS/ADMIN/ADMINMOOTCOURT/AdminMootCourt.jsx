import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function AdminMootCourt() {
    const [activeTab, setActiveTab] = useState("moots"); // "moots" | "bids"
    const [moots, setMoots] = useState([]);
    const [bids, setBids] = useState([]);
    
    // Create Moot State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mootForm, setMootForm] = useState({
        moot_name: "",
        level: "National",
        event_date: "",
        venue: "",
        description: ""
    });

    useEffect(() => {
        fetchMoots();
        fetchBids();
    }, []);

    const fetchMoots = async () => {
        try {
            const { data, error } = await supabase.from('moot_competitions').select('*').order('event_date', { ascending: false });
            if (!error && data) {
                setMoots(data);
            }
        } catch (error) {
            console.error("Error fetching moots:", error);
        }
    };

    const fetchBids = async () => {
        try {
            const { data, error } = await supabase
                .from('moot_bids')
                .select(`
                    id, moot_id, student_id, research_memo, status, created_at,
                    profiles!moot_bids_student_id_fkey(full_name, erp_id),
                    moot_competitions!moot_bids_moot_id_fkey(moot_name)
                `)
                .order('created_at', { ascending: false });
            if (!error && data) {
                setBids(data);
            }
        } catch (error) {
            console.error("Error fetching bids:", error);
        }
    };

    const handleCreateMoot = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('moot_competitions').insert({
                ...mootForm,
                status: 'Open Registration'
            });
            if (error) throw error;
            setShowCreateModal(false);
            setMootForm({ moot_name: "", level: "National", event_date: "", venue: "", description: "" });
            fetchMoots();
        } catch (err) {
            console.error("Error creating moot", err);
            window.erpDialog.alert("Failed to create moot.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectTeam = async (bidId) => {
        try {
            const { error } = await supabase.from('moot_bids').update({ status: 'SELECTED' }).eq('id', bidId);
            if (error) throw error;
            fetchBids();
        } catch (err) {
            console.error("Error selecting bid", err);
            window.erpDialog.alert("Failed to select student.");
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder flex flex-col md:flex-row justify-between items-start lg:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 lg:gap-5 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel bg-themeElevated border-theme border-themeBorderStrong flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-gavel text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Moot Court Society Admin</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Create competitions and blindly evaluate research memos.</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full lg:w-auto px-6 py-4 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] relative z-10 shrink-0 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Create Moot
                </button>
            </div>

            <div className="flex p-1.5 bg-themePanel rounded-themePanel w-full lg:w-fit border-theme border-themeBorder overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveTab('moots')} className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'moots' ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong" : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"}`}>
                    <i className="fa-solid fa-list"></i> Competitions
                </button>
                <button onClick={() => setActiveTab('bids')} className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'bids' ? "bg-themeElevated text-emerald-400 border-theme border-emerald-500/30" : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"}`}>
                    <i className="fa-solid fa-user-ninja"></i> Blind Evaluation Bids
                </button>
            </div>

            {activeTab === 'moots' && (
                <div className="flex flex-col gap-4">
                    {moots.length === 0 ? (
                        <div className="p-12 text-center text-themeTextSec bg-themePanel border-theme border-themeBorder rounded-themePanel">
                            <i className="fa-solid fa-gavel text-4xl mb-4 opacity-50"></i>
                            <p>No active moot competitions.</p>
                        </div>
                    ) : (
                        moots.map(moot => (
                            <div key={moot.id} className="bg-themePanel p-5 rounded-themePanel border-theme border-themeBorder flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black text-themeText">{moot.moot_name}</h3>
                                    <p className="text-xs text-themeTextSec mt-1">{moot.level} • {moot.venue} • {moot.event_date}</p>
                                </div>
                                <span className="px-3 py-1 bg-themeElevated border-theme border-themeBorderStrong rounded-md text-[10px] font-black text-themeAccent uppercase">
                                    {moot.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'bids' && (
                <div className="flex flex-col gap-5">
                    {bids.length === 0 ? (
                        <div className="p-12 text-center text-themeTextSec bg-themePanel border-theme border-themeBorder rounded-themePanel">
                            <i className="fa-solid fa-file-contract text-4xl mb-4 opacity-50"></i>
                            <p>No bids received yet.</p>
                        </div>
                    ) : (
                        bids.map(bid => {
                            const mootName = bid.moot_competitions?.moot_name || "Unknown Moot";
                            const isSelected = bid.status === 'SELECTED';
                            return (
                                <div key={bid.id} className={`bg-themePanel p-6 rounded-themePanel border-theme ${isSelected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-themeBorder'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-themeAccent bg-themeElevated px-2 py-1 rounded-md border-theme border-themeBorderStrong">
                                                {mootName}
                                            </span>
                                            <h3 className="text-base font-black text-themeText mt-3 mb-1">
                                                {isSelected ? bid.profiles?.full_name : "Anonymous Candidate"}
                                            </h3>
                                            <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">
                                                {isSelected ? bid.profiles?.erp_id : "ID hidden during blind evaluation"}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-lg border-theme border-emerald-500/30">
                                                <i className="fa-solid fa-check-circle mr-1"></i> Selected
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-themeApp p-4 rounded-lg border-theme border-themeBorder mb-4">
                                        <p className="text-xs font-black text-themeTextSec uppercase tracking-widest mb-2"><i className="fa-solid fa-book-open"></i> Research Memo</p>
                                        <p className="text-sm text-themeText whitespace-pre-wrap">{bid.research_memo}</p>
                                    </div>
                                    {!isSelected && (
                                        <button onClick={() => handleSelectTeam(bid.id)} className="w-full py-3 bg-themeElevated hover:bg-emerald-500/20 text-emerald-400 border-theme border-themeBorderStrong hover:border-emerald-500/50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-check"></i> Select for Team
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* CREATE MOOT MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themeApp w-full max-w-lg rounded-themePanel overflow-hidden border-theme border-themeBorder flex flex-col max-h-[90vh]">
                        <div className="bg-themePanel p-6 border-b-theme border-themeBorder flex justify-between items-center">
                            <h3 className="text-xl font-black text-themeText">Create Moot Competition</h3>
                            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-themeElevated border-theme border-themeBorderStrong text-themeTextSec hover:text-themeText flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        <form onSubmit={handleCreateMoot} className="p-6 flex flex-col gap-4 overflow-y-auto">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 ml-1">Moot Name</label>
                                <input type="text" value={mootForm.moot_name} onChange={e => setMootForm({...mootForm, moot_name: e.target.value})} className="w-full bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none focus:border-themeAccent" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 ml-1">Level</label>
                                    <select value={mootForm.level} onChange={e => setMootForm({...mootForm, level: e.target.value})} className="w-full bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none">
                                        <option value="National">National</option>
                                        <option value="International">International</option>
                                        <option value="Internal">Internal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 ml-1">Event Date</label>
                                    <input type="date" value={mootForm.event_date} onChange={e => setMootForm({...mootForm, event_date: e.target.value})} className="w-full bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 ml-1">Venue</label>
                                <input type="text" value={mootForm.venue} onChange={e => setMootForm({...mootForm, venue: e.target.value})} className="w-full bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 ml-1">Description</label>
                                <textarea rows="3" value={mootForm.description} onChange={e => setMootForm({...mootForm, description: e.target.value})} className="w-full bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-xs font-bold text-themeText outline-none resize-none" required></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-amber-500 hover:bg-amber-400 text-[#050505] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]">
                                {isSubmitting ? "Saving..." : "Create Competition"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
