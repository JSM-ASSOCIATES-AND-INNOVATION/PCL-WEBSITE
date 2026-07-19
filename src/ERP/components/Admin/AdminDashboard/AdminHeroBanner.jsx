/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { theme } from '../../../theme';
import { useERP } from '../../../context/ErpContext';
import { supabase } from '../../../lib/supabase/supabaseClient';

export default function AdminHeroBanner() {
    const { userSession } = useERP();
    const [snapshot, setSnapshot] = useState({
        loading: true,
        pendingTickets: 0,
        pendingAdmissions: 0,
        pendingLeaves: 0,
        lastLog: "Fetching system status..."
    });

    useEffect(() => {
        let isMounted = true;
        const fetchSnapshotData = async () => {
            try {
                const query = `
                    SELECT json_build_object(
                        'tickets', (SELECT count(*) FROM helpdesk_tickets WHERE status = 'open'),
                        'admissions', (SELECT count(*) FROM admissions_applications WHERE status = 'pending'),
                        'leaves', (SELECT count(*) FROM faculty_leaves WHERE status = 'pending'),
                        'log', (SELECT json_build_object('action', action, 'table_name', table_name) FROM audit_logs ORDER BY created_at DESC LIMIT 1)
                    ) as snapshot
                `;
                
                const { data, error } = await supabase.rpc('admin_exec_sql', { query_text: query });
                if (error) throw error;

                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const snap = data[0].snapshot;
                    let lastAction = "System Initialized";
                    if (snap.log) {
                        lastAction = `${snap.log.action} on ${snap.log.table_name}`;
                    }

                    setSnapshot({
                        loading: false,
                        pendingTickets: snap.tickets || 0,
                        pendingAdmissions: snap.admissions || 0,
                        pendingLeaves: snap.leaves || 0,
                        lastLog: lastAction
                    });
                }
            } catch (error) {
                console.error("Error fetching snapshot data:", error);
                if (isMounted) setSnapshot(prev => ({ ...prev, loading: false }));
            }
        };

        fetchSnapshotData();
        return () => { isMounted = false; };
    }, []);

    const adminName = userSession?.name || "Administrator";

    return (
        <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-overlay pointer-events-none"></div>
            
            {/* Left: Welcome text */}
            <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span> 
                    System Online
                </div>
                <h1 className={`${theme.text.heading} text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-3 leading-none drop-shadow-md`}>
                    Good Morning, <br className="hidden sm:block lg:hidden" /> {adminName}
                </h1>
                <p className={`text-white/80 text-xs lg:text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2`}>
                    <i className="fa-regular fa-calendar-days opacity-70"></i>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Right: Operations Summary Banner */}
            <div className="relative z-10 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full lg:w-auto lg:min-w-[340px] shadow-2xl shrink-0 group hover:bg-black/30 transition-all duration-500">
                <h3 className="text-[10px] lg:text-xs font-black text-white/90 uppercase tracking-widest mb-5 pb-3 flex justify-between items-center relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-gradient-to-r after:from-white/30 after:to-transparent">
                    <span className="flex items-center gap-2"><i className="fa-solid fa-chart-pie opacity-70"></i> Today's Snapshot</span>
                    {snapshot.loading && <i className="fa-solid fa-circle-notch fa-spin text-white/70"></i>}
                </h3>
                
                <ul className="flex flex-col gap-4 text-xs font-bold text-white/90">
                    <li className="flex items-center gap-3 group/item">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${snapshot.pendingLeaves > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover/item:border-amber-500/60' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                            {snapshot.pendingLeaves > 0 ? <i className="fa-solid fa-exclamation"></i> : <i className="fa-solid fa-check"></i>}
                        </span>
                        <span className="group-hover/item:text-white transition-colors">{snapshot.pendingLeaves} Leave requests pending.</span>
                    </li>
                    
                    <li className="flex items-center gap-3 group/item">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${snapshot.pendingTickets > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover/item:border-amber-500/60' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                            <i className="fa-solid fa-headset"></i>
                        </span>
                        <span className="group-hover/item:text-white transition-colors">{snapshot.pendingTickets} Unresolved support tickets.</span>
                    </li>
                    
                    <li className="flex items-center gap-3 group/item">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${snapshot.pendingAdmissions > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover/item:border-amber-500/60' : 'bg-white/10 text-white/80 border-white/20 group-hover/item:border-white/40'}`}>
                            <i className="fa-solid fa-user-plus"></i>
                        </span>
                        <span className="group-hover/item:text-white transition-colors">{snapshot.pendingAdmissions} Pending admissions.</span>
                    </li>
                    
                    <li className="flex items-center gap-3 group/item mt-1">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 bg-white/5 text-white/60">
                            <i className="fa-solid fa-database"></i>
                        </span>
                        <span className="truncate max-w-[220px] text-[10px] text-white/60 font-semibold tracking-wide uppercase" title={snapshot.lastLog}>Last: {snapshot.lastLog}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
