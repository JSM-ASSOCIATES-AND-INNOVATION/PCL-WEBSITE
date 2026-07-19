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
        <div className={`w-full bg-themeAccent rounded-themePanel p-5 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 relative overflow-hidden shadow-lg`}>
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
            
            {/* Left: Welcome text */}
            <div className="relative z-10 flex-1">
                <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span> 
                    System Online • Academic Year 2026-27
                </p>
                <h1 className={`${theme.text.heading} text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight mb-2 leading-tight`}>
                    Good Morning, {adminName}
                </h1>
                <p className={`text-white/90 text-xs lg:text-sm font-bold uppercase tracking-widest`}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Right: Operations Summary Banner */}
            <div className="relative z-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-themePanel p-5 lg:p-6 w-full lg:w-auto lg:min-w-[320px] shadow-sm shrink-0">
                <h3 className="text-[10px] lg:text-xs font-black text-white/80 uppercase tracking-widest mb-4 border-b border-white/20 pb-3 flex justify-between items-center">
                    <span>Today's Snapshot</span>
                    {snapshot.loading && <i className="fa-solid fa-circle-notch fa-spin text-white/70"></i>}
                </h3>
                
                <ul className="flex flex-col gap-3.5 text-[11px] lg:text-xs font-bold text-white">
                    <li className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border-[length:var(--border-width)] ${snapshot.pendingLeaves > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                            {snapshot.pendingLeaves > 0 ? <i className="fa-solid fa-exclamation"></i> : <i className="fa-solid fa-check"></i>}
                        </span>
                        <span>{snapshot.pendingLeaves} Leave requests pending approval.</span>
                    </li>
                    
                    <li className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border-[length:var(--border-width)] ${snapshot.pendingTickets > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                            <i className="fa-solid fa-headset"></i>
                        </span>
                        <span>{snapshot.pendingTickets} Unresolved support tickets.</span>
                    </li>
                    
                    <li className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border border-white/20 ${snapshot.pendingAdmissions > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/10 text-white border-white/20'}`}>
                            <i className="fa-solid fa-user-plus"></i>
                        </span>
                        <span className="text-white/90">{snapshot.pendingAdmissions} Pending admissions applications.</span>
                    </li>
                    
                    <li className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded flex items-center justify-center shrink-0 border border-white/20 bg-white/10 text-white">
                            <i className="fa-solid fa-database"></i>
                        </span>
                        <span className="truncate max-w-[180px] lg:max-w-[200px] text-white/90" title={snapshot.lastLog}>Last Action: {snapshot.lastLog}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
