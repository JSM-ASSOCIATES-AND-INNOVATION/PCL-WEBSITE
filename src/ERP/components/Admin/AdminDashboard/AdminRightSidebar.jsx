/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../theme';
import { supabase } from '../../../lib/supabase/supabaseClient';

export default function AdminRightSidebar() {
    const navigate = useNavigate();
    const [dbStats, setDbStats] = useState({ 
        size: 'Loading...', 
        users: '...',
        storage_used: '...',
        storage_avail: '...',
        visitors: '...',
        active: '...',
        pending: '...'
    });

    useEffect(() => {
        let isMounted = true;
        const fetchDbStats = async () => {
            try {
                // Fetch Supabase DB & Auth Stats
                const { data: dbData, error: dbError } = await supabase.rpc('admin_exec_sql', {
                    query_text: "SELECT pg_size_pretty(pg_database_size(current_database())) as db_size, (SELECT count(*) FROM auth.users) as auth_users"
                });
                
                // Fetch Storage Stats
                const { data: storageData, error: storageError } = await supabase.rpc('admin_exec_sql', {
                    query_text: "SELECT COALESCE(sum((metadata->>'size')::bigint), 0) as storage_used_bytes FROM storage.objects"
                });

                // Fetch Website Analytics
                const { data: webData, error: webError } = await supabase.rpc('admin_exec_sql', {
                    query_text: "SELECT (SELECT count(*) FROM website_page_views WHERE created_at >= CURRENT_DATE) as visitors_today, (SELECT count(DISTINCT session_id) FROM website_page_views WHERE created_at >= NOW() - INTERVAL '5 minutes') as active_users, (SELECT count(*) FROM blogs WHERE status = 'Draft') as pending_changes"
                });

                if (isMounted) {
                    let s_used = "Unknown";
                    let s_avail = "Unknown";
                    if (!storageError && storageData && storageData.length > 0) {
                        const bytes = parseInt(storageData[0].storage_used_bytes) || 0;
                        const mb = (bytes / (1024 * 1024)).toFixed(2);
                        const avail = (1024 - parseFloat(mb)).toFixed(2);
                        s_used = `${mb} MB`;
                        s_avail = `${avail} MB`;
                    }

                    setDbStats({
                        size: dbData?.[0]?.db_size || 'Unknown',
                        users: dbData?.[0]?.auth_users || '0',
                        storage_used: s_used,
                        storage_avail: s_avail,
                        visitors: webData?.[0]?.visitors_today || '0',
                        active: webData?.[0]?.active_users || '0',
                        pending: webData?.[0]?.pending_changes || '0'
                    });
                }
            } catch (err) {
                console.error("Error fetching live DB stats:", err);
            }
        };
        fetchDbStats();
        return () => { isMounted = false; };
    }, []);


    const quickActions = [
        { label: 'Add Student', icon: 'fa-user-graduate', color: 'text-indigo-500' },
        { label: 'Add Faculty', icon: 'fa-chalkboard-user', color: 'text-blue-500' },
        { label: 'New Notice', icon: 'fa-bullhorn', color: 'text-amber-500' },
        { label: 'Publish Blog', icon: 'fa-newspaper', color: 'text-emerald-500' },
        { label: 'Add Event', icon: 'fa-calendar-plus', color: 'text-rose-500' },
        { label: 'Upload Circular', icon: 'fa-file-pdf', color: 'text-red-500' },
    ];

    return (
        <div className="w-full flex flex-col gap-6">
            
            {/* Card 1: Quick Actions */}
            <div className={`bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm`}>
                <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight mb-4 flex items-center justify-between`}>
                    <span>Quick Actions</span>
                    <i className="fa-solid fa-bolt text-themeAccent"></i>
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                        <button 
                            key={i} 
                            onClick={() => console.log(`Triggering action: ${action.label}`)}
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-themeElevated border-[length:var(--border-width)] border-themeBorder hover:border-themeAccent transition-all group"
                        >
                            <i className={`fa-solid ${action.icon} text-lg text-themeTextSec group-hover:${action.color} group-hover:scale-110 transition-transform`}></i>
                            <span className="text-[9px] font-bold text-themeText uppercase tracking-widest text-center">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>



            {/* Card 3: Website Overview */}
            <div className={`bg-themePanel rounded-themePanel border-[length:var(--border-width)] border-themeBorder p-5 flex flex-col shadow-sm`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`${theme.text.heading} text-sm text-themeText tracking-tight`}>Website CMS</h2>
                    <i className="fa-solid fa-globe text-themeTextSec"></i>
                </div>
                
                <div className="flex flex-col gap-0 divide-y divide-themeBorder">
                    <div className="flex justify-between items-center py-2.5">
                        <span className="text-[10px] font-bold text-themeTextSec">Visitors Today</span>
                        <span className="text-xs font-black text-themeText">{dbStats.visitors}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                        <span className="text-[10px] font-bold text-themeTextSec">Active Users</span>
                        <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> {dbStats.active}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-themeBorder">
                        <span className="text-[10px] font-bold text-themeTextSec">Pending Changes</span>
                        <span className="text-xs font-black text-rose-500">{dbStats.pending}</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/admin/siteeditor')}
                    className="w-full mt-4 py-1.5 text-[9px] font-black text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorder rounded-lg transition-colors uppercase tracking-widest active:scale-[0.98]"
                >
                    Open CMS
                </button>
            </div>

            {/* Card 4: Supabase Monitor */}
            <div className={`bg-[#1c1c1c] rounded-themePanel border-[length:var(--border-width)] border-emerald-500/20 p-5 flex flex-col relative overflow-hidden shadow-sm`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h2 className={`font-sans font-black text-sm text-emerald-400 tracking-tight flex items-center gap-2`}><i className="fa-solid fa-database"></i> Supabase Monitor</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 relative z-10 text-emerald-50">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Database</span>
                        <span className="text-[10px] font-black">{dbStats.size}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Auth Users</span>
                        <span className="text-[10px] font-black">{dbStats.users}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Storage Used</span>
                        <span className="text-[10px] font-black">{dbStats.storage_used}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-widest">Storage Avail</span>
                        <span className="text-[10px] font-black text-emerald-400">{dbStats.storage_avail}</span>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/admin/sql')}
                    className="w-full mt-4 py-1.5 text-[9px] font-black text-emerald-400 hover:text-emerald-300 border-[length:var(--border-width)] border-emerald-500/30 rounded-lg transition-colors uppercase tracking-widest active:scale-[0.98] relative z-10"
                >
                    Console <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </button>
            </div>

        </div>
    );
}
