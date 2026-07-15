import React, { useEffect, useState } from 'react';
import { supabase } from '../../LIB/supabaseClient';

export default function NoticeBanner() {
    const [notices, setNotices] = useState([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const { data, error } = await supabase
                .from('admin_notices')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(5);
            
            if (!error && data) {
                setNotices(data);
            }
        };

        fetchNotices();

        const channel = supabase.channel('public_notices')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notices' }, () => {
                fetchNotices();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    if (!visible || notices.length === 0) return null;

    return (
        <div className="bg-red-700 text-white overflow-hidden relative z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0 bg-red-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-bullhorn animate-pulse"></i> Announcements
                    </div>
                    <div className="flex-1 overflow-hidden relative h-6">
                        <div className="absolute whitespace-nowrap animate-marquee flex gap-12 items-center h-full">
                            {notices.map((n, i) => (
                                <span key={n.id} className="text-sm font-medium flex items-center gap-4">
                                    <span className="text-red-200">|</span> 
                                    {n.title}
                                    {n.priority === 'urgent' && <span className="bg-white text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ml-2">Urgent</span>}
                                </span>
                            ))}
                            {/* Duplicate for seamless looping */}
                            {notices.map((n, i) => (
                                <span key={n.id + '-dup'} className="text-sm font-medium flex items-center gap-4">
                                    <span className="text-red-200">|</span> 
                                    {n.title}
                                    {n.priority === 'urgent' && <span className="bg-white text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ml-2">Urgent</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => setVisible(false)} className="flex-shrink-0 ml-4 text-white/70 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
