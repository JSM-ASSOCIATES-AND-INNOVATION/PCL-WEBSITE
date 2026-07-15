/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";

export default function AdminElectiveResolution() {
    const [catalog, setCatalog] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [offerCount, setOfferCount] = useState("");
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        setIsLoading(true);
        try {
            // First get the active phase
            const { data: phaseData } = await supabase.from('bidding_phases').select('*').limit(1).single();
            if (!phaseData) {
                setIsLoading(false);
                return;
            }

            // Fetch catalog and ledger
            const [catalogRes, ledgerRes] = await Promise.all([
                supabase.from('elective_catalog').select('*').eq('phase_id', phaseData.id),
                supabase.from('bidding_ledger').select('elective_id, bid_amount').eq('phase_id', phaseData.id)
            ]);

            const cat = catalogRes.data || [];
            const bids = ledgerRes.data || [];

            // Aggregate votes (sum of bid_amount per elective)
            const voteMap = {};
            bids.forEach(b => {
                voteMap[b.elective_id] = (voteMap[b.elective_id] || 0) + b.bid_amount;
            });

            const merged = cat.map(c => ({
                ...c,
                totalVotes: voteMap[c.id] || 0
            })).sort((a, b) => b.totalVotes - a.totalVotes); // Sort by highest votes

            setCatalog(merged);
        } catch (error) {
            console.error("Error fetching elective catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        const count = parseInt(offerCount);
        if (!count || count <= 0 || count > catalog.length) {
            window.erpDialog.alert("Please enter a valid number of electives to offer.");
            return;
        }

        setIsResolving(true);
        try {
            const { data: phaseData } = await supabase.from('bidding_phases').select('*').limit(1).single();
            if (!phaseData) throw new Error("No active phase found");

            // The top `count` electives win
            const winners = catalog.slice(0, count).map(c => c.id);
            const losers = catalog.slice(count).map(c => c.id);

            // Update ledger status for winners
            if (winners.length > 0) {
                await supabase.from('bidding_ledger')
                    .update({ status: 'won' })
                    .eq('phase_id', phaseData.id)
                    .in('elective_id', winners);
                    
                // Update catalog min_bid to reflect actual votes just for history
                for (const w of winners) {
                     const voteCount = catalog.find(c => c.id === w)?.totalVotes || 0;
                     await supabase.from('elective_catalog').update({ current_min_bid: voteCount }).eq('id', w);
                }
            }

            // Update ledger status for losers
            if (losers.length > 0) {
                await supabase.from('bidding_ledger')
                    .update({ status: 'lost' })
                    .eq('phase_id', phaseData.id)
                    .in('elective_id', losers);
            }

            window.erpDialog.alert(`Bidding Resolved! Top ${count} electives have been offered.`);
            fetchCatalog();
        } catch (error) {
            console.error("Error resolving electives:", error);
            window.erpDialog.alert("Failed to resolve bidding.");
        } finally {
            setIsResolving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full py-20 flex justify-center items-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent"></i>
            </div>
        );
    }

    return (
        <div className="bg-themePanel p-6 lg:p-8 rounded-themePanel border-theme border-themeBorder flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className={`${theme.text.heading} text-xl lg:text-2xl mb-1`}><i className="fa-solid fa-scale-balanced text-themeAccent mr-2"></i> Demand-Driven Resolution</h2>
                    <p className={`${theme.text.secondary} text-sm`}>Review student point-votes and select the top electives to run this semester.</p>
                </div>
                <div className="flex items-end gap-3 w-full md:w-auto">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec opacity-70 mb-1">Target Offerings</label>
                        <input 
                            type="number" 
                            min={1} max={catalog.length}
                            value={offerCount} 
                            onChange={(e) => setOfferCount(e.target.value)}
                            placeholder={`Max: ${catalog.length}`}
                            className="bg-themeElevated border-theme border-themeBorderStrong text-themeText px-4 py-3 rounded-lg w-32 font-black text-center focus:border-themeAccent outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleResolve} 
                        disabled={isResolving || !offerCount}
                        className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-xs transition-colors ${!offerCount ? 'bg-themeElevated text-themeTextSec border-theme border-themeBorder' : 'bg-themeAccent text-themeText hover:bg-themeAccentMuted'}`}
                    >
                        {isResolving ? "Resolving..." : "Resolve"}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-theme border-themeBorder">
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Rank</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Code</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Course Name</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec">Faculty</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-themeTextSec text-right">Total Votes (Points)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalog.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-themeTextSec font-bold text-sm">No electives in catalog</td></tr>
                        ) : (
                            catalog.map((c, idx) => (
                                <tr key={c.id} className="border-b-theme border-themeBorder/50 hover:bg-themeElevated transition-colors">
                                    <td className="p-4 font-black text-themeText">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${idx < parseInt(offerCount || 0) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-themePanel border-theme border-themeBorder'}`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="p-4 font-black text-sm text-themeText">{c.id}</td>
                                    <td className="p-4 font-bold text-sm text-themeText">{c.course_name}</td>
                                    <td className="p-4 font-bold text-sm text-themeTextSec"><i className="fa-solid fa-user-tie text-themeAccent mr-1"></i> {c.professor_name}</td>
                                    <td className="p-4 font-black text-lg text-themeAccent text-right">{c.totalVotes}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
