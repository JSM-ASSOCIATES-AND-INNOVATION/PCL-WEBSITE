/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../LIB/supabase/supabaseClient';

const MOCK_BATCHES = [
    'B.B.A., LL.B. (Hons.) 2026',
    'B.A., LL.B. (Hons.) 2026',
    'LL.B. 2026',
    'LL.M. 2025'
];

export default function TargetAudienceSelector({ value, onChange, role = 'admin' }) {
    // If role is faculty, default mode is Batches. Admin defaults to Global.
    const initialMode = role === 'faculty' ? 'Batches' : (value.includes('All') ? 'Global' : 'Batches');
    const [mode, setMode] = useState(initialMode);
    
    // Individual Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (mode === 'Global') {
            onChange(['All']);
        } else if (mode !== 'Global' && value.includes('All')) {
            onChange([]);
        }
    }, [mode]);

    // Live User Search Logic
    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchTerm || searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            
            setIsSearching(true);
            try {
                // Search by full_name OR erp_id
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, erp_id, full_name, role, academic_batch')
                    .or(`full_name.ilike.%${searchTerm}%,erp_id.ilike.%${searchTerm}%`)
                    .limit(5);
                    
                if (!error && data) {
                    setSearchResults(data);
                }
            } catch (err) {
                console.error("User search failed:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const toggleItem = (item) => {
        let next = [...value];
        if (next.includes('All')) next = []; // strip 'All' if we start selecting specific items
        
        if (next.includes(item)) {
            next = next.filter(i => i !== item);
        } else {
            next.push(item);
        }
        onChange(next);
    };

    const handleSelectIndividual = (erpId) => {
        if (!value.includes(erpId)) {
            let next = [...value];
            if (next.includes('All')) next = [];
            next.push(erpId);
            onChange(next);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-themeTextSec flex justify-between items-center">
                <span>Target Audience</span>
                <span className="text-themeAccent">{value.includes('All') ? 'Global' : `${value.length} selected`}</span>
            </label>

            {/* Mode Switcher */}
            <div className="flex bg-themeElevated p-1 rounded-xl border border-themeBorderStrong">
                {role === 'admin' && (
                    <button type="button" onClick={() => setMode('Global')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Global' ? 'bg-themePanel text-themeText shadow-sm border border-themeBorder' : 'text-themeTextSec hover:text-themeText'}`}>Global</button>
                )}
                {role === 'admin' && (
                    <button type="button" onClick={() => setMode('Roles')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Roles' ? 'bg-themePanel text-themeText shadow-sm border border-themeBorder' : 'text-themeTextSec hover:text-themeText'}`}>Roles</button>
                )}
                <button type="button" onClick={() => setMode('Batches')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Batches' ? 'bg-themePanel text-themeText shadow-sm border border-themeBorder' : 'text-themeTextSec hover:text-themeText'}`}>Batches</button>
                <button type="button" onClick={() => setMode('Individual')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'Individual' ? 'bg-themePanel text-themeText shadow-sm border border-themeBorder' : 'text-themeTextSec hover:text-themeText'}`}>Individual</button>
            </div>

            {/* Selection Area */}
            <div className="min-h-[100px] bg-themeElevated border border-themeBorderStrong rounded-xl p-4 flex flex-col gap-2 justify-center relative">
                
                {mode === 'Global' && (
                    <div className="text-center animate-fade-in">
                        <i className="fa-solid fa-earth-americas text-2xl text-themeAccent mb-2"></i>
                        <h4 className="text-sm font-black text-themeText">Global Broadcast</h4>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">Sent to all registered users</p>
                    </div>
                )}

                {mode === 'Roles' && (
                    <div className="flex flex-wrap gap-2 animate-fade-in justify-center">
                        {['Student', 'Faculty', 'Staff', 'Alumni'].map(r => (
                            <button 
                                type="button"
                                key={r} 
                                onClick={() => toggleItem(r)}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all border ${value.includes(r) ? 'bg-themeAccent text-[#0a0a0a] border-themeAccent shadow-lg shadow-themeAccent/20' : 'bg-themePanel text-themeTextSec border-themeBorderStrong hover:border-themeText'}`}
                            >
                                {r}s
                            </button>
                        ))}
                    </div>
                )}

                {mode === 'Batches' && (
                    <div className="flex flex-wrap gap-2 animate-fade-in justify-center">
                        {MOCK_BATCHES.map(b => (
                            <button 
                                type="button"
                                key={b} 
                                onClick={() => toggleItem(b)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${value.includes(b) ? 'bg-themeAccent text-[#0a0a0a] border-themeAccent shadow-lg shadow-themeAccent/20' : 'bg-themePanel text-themeTextSec border-themeBorderStrong hover:border-themeText'}`}
                            >
                                {b}
                            </button>
                        ))}
                    </div>
                )}

                {mode === 'Individual' && (
                    <div className="animate-fade-in flex flex-col items-center w-full max-w-sm mx-auto gap-3">
                        {/* Currently Selected Individuals */}
                        {value.filter(v => v !== 'All' && !MOCK_BATCHES.includes(v) && !['Student','Faculty','Staff','Alumni'].includes(v)).length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center mb-2">
                                {value.filter(v => v !== 'All' && !MOCK_BATCHES.includes(v) && !['Student','Faculty','Staff','Alumni'].includes(v)).map(v => (
                                    <div key={v} className="flex items-center gap-2 bg-themeAccent/10 text-themeAccent px-3 py-1.5 rounded-full border border-themeAccent/20 text-[10px] font-black uppercase tracking-widest">
                                        <span>{v}</span>
                                        <button type="button" onClick={() => toggleItem(v)} className="hover:text-rose-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="relative w-full">
                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-themeTextSec"></i>
                            <input 
                                type="text" 
                                placeholder="Search by Name or ERP ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-themePanel border border-themeBorder focus:border-themeAccent rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-themeText placeholder:text-themeBorderStrong outline-none transition-all"
                            />
                            {isSearching && <i className="fa-solid fa-spinner fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-themeAccent"></i>}
                            
                            {/* Search Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-themePanel border border-themeBorder rounded-xl shadow-xl overflow-hidden z-50 flex flex-col">
                                    {searchResults.map(user => (
                                        <button 
                                            type="button"
                                            key={user.id}
                                            onClick={() => handleSelectIndividual(user.erp_id)}
                                            className="flex flex-col text-left p-3 hover:bg-themeElevated transition-colors border-b border-themeBorder last:border-b-0"
                                        >
                                            <span className="text-sm font-black text-themeText">{user.full_name}</span>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-themeAccent bg-themeAccent/10 px-2 py-0.5 rounded">{user.erp_id}</span>
                                                <span className="text-[9px] font-bold text-themeTextSec uppercase">{user.role}</span>
                                                {user.academic_batch && <span className="text-[9px] font-bold text-themeTextSec truncate max-w-[100px]">• {user.academic_batch}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="text-[9px] font-bold text-themeTextSec uppercase tracking-widest mt-1 text-center">Private Message via Notice Board</p>
                    </div>
                )}

            </div>
        </div>
    );
}
