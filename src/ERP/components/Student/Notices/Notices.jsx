/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";
import { theme } from "../../../theme";
import FacultyBroadcastForm from "./FacultyBroadcastForm";

export default function Notices({ setActiveTab }) {
    const { userSession } = useERP();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [acknowledged, setAcknowledged] = useState(new Set());
    const [saved, setSaved] = useState(new Set());
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Main Tab State
    const [activeMainTab, setActiveMainTab] = useState('broadcasts'); // broadcasts, events
    const [events, setEvents] = useState([]);

    // PRIORITY CONFIG (Match Supabase enum)
    const PRIORITIES = {
        urgent: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'fa-triangle-exclamation', display: 'CRITICAL' },
        high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'fa-bolt', display: 'IMPORTANT' },
        normal: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'fa-circle-info', display: 'GENERAL' },
    };

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                // Fetch Events
                const { data: eventsData, error: eventsError } = await supabase
                    .from('academic_calendar')
                    .select('*')
                    .order('start_date', { ascending: true })
                    .gte('start_date', new Date().toISOString().split('T')[0]); // Upcoming
                
                if (!eventsError && eventsData) setEvents(eventsData);

                // Fetch Notices
                const { data, error } = await supabase
                    .from('notices')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    const userRole = userSession?.role || 'student';
                    const userBatch = userSession?.academic_batch;
                    const userId = userSession?.id;
                    const userRoleCap = userRole.charAt(0).toUpperCase() + userRole.slice(1);
                    
                    // Filter logic: intersect target array with user properties
                    const applicableNotices = data.filter(n => {
                        if (!n.target_audience || !Array.isArray(n.target_audience) || n.target_audience.length === 0) return true;
                        if (n.target_audience.includes('All')) return true;
                        if (n.target_audience.includes(userRoleCap)) return true;
                        if (userBatch && n.target_audience.includes(userBatch)) return true;
                        if (userId && n.target_audience.includes(userId)) return true;
                        
                        // Always let authors see their own broadcasts
                        if (n.author_id === userId) return true;
                        
                        return false;
                    });

                    // For now, treat all fetched as unread until we link notice_acknowledgements properly
                    setNotices(applicableNotices.map(n => ({ ...n, isUnread: true })));
                    
                    // Fetch acknowledgements for this user
                    if (userSession?.id) {
                        const { data: ackData } = await supabase
                            .from('notice_acknowledgements')
                            .select('notice_id')
                            .eq('user_id', userSession.id);
                            
                        if (ackData) {
                            setAcknowledged(new Set(ackData.map(a => a.notice_id)));
                        }
                    }
                } else {
                    setNotices([]);
                }
            } catch (err) {
                console.error("Failed to fetch notices:", err);
                setNotices([]);
            }
            setLoading(false);
        };
        fetchNotices();
    }, [userSession]);

    const toggleSave = (id, e) => {
        e.stopPropagation();
        const next = new Set(saved);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSaved(next);
    };

    const handleAcknowledge = async (id) => {
        if (!userSession?.id) return;
        
        try {
            await supabase.from('notice_acknowledgements').insert([{
                notice_id: id,
                user_id: userSession.id
            }]);
            
            const next = new Set(acknowledged);
            next.add(id);
            setAcknowledged(next);
            
            // Remove unread dot visually
            setNotices(notices.map(n => n.id === id ? { ...n, isUnread: false } : n));
        } catch (err) {
            console.error("Ack failed", err);
        }
    };

    // Filter Logic
    let filtered = notices.filter(n => {
        if (activeFilter === 'Unread') return n.isUnread;
        if (activeFilter === 'Pinned') return n.is_pinned;
        if (activeFilter === 'Saved') return saved.has(n.id);
        if (activeFilter !== 'All' && n.category !== activeFilter) return false;
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q) || n.category.toLowerCase().includes(q);
        }
        return true;
    });

    const renderFeed = () => (
        <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
                <div className="bg-themePanel border border-themeBorder border-dashed rounded-2xl p-12 flex flex-col items-center justify-center opacity-50">
                    <i className="fa-regular fa-folder-open text-4xl mb-4 text-themeTextSec"></i>
                    <p className="text-sm font-bold text-themeTextSec">No notices found.</p>
                </div>
            ) : filtered.map(notice => {
                const pConf = PRIORITIES[notice.priority] || PRIORITIES.normal;
                
                return (
                    <div 
                        key={notice.id} 
                        onClick={() => {
                            setSelectedNotice(notice);
                            setNotices(notices.map(n => n.id === notice.id ? { ...n, isUnread: false } : n));
                        }}
                        className={`bg-themePanel border ${notice.isUnread ? 'border-themeBorder' : 'border-transparent'} hover:border-themeAccent/50 rounded-2xl p-6 shadow-sm cursor-pointer transition-all flex flex-col group relative overflow-hidden`}
                    >
                        {/* Glow effect for unread/pinned */}
                        {notice.isUnread && <div className={`absolute left-0 top-0 bottom-0 w-1 ${pConf.bg}`}></div>}
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                {notice.is_pinned && <i className="fa-solid fa-thumbtack text-[10px] text-themeAccent rotate-45"></i>}
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${pConf.bg} ${pConf.color} ${pConf.border} border`}>
                                    <i className={`fa-solid ${pConf.icon} mr-1.5`}></i>
                                    {pConf.display}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec bg-themeElevated px-2 py-1 rounded-full">{notice.category}</span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="text-[10px] font-bold text-themeTextSec">{new Date(notice.created_at).toLocaleDateString()}</span>
                                <button onClick={(e) => toggleSave(notice.id, e)} className={`text-sm transition-colors ${saved.has(notice.id) ? 'text-amber-500' : 'text-themeBorderStrong hover:text-themeText'}`}>
                                    <i className={`${saved.has(notice.id) ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                                </button>
                            </div>
                        </div>

                        <h3 className={`text-lg font-black tracking-tight mb-2 ${notice.isUnread ? 'text-themeText' : 'text-themeTextSec'}`}>
                            {notice.title}
                            {notice.isUnread && <span className="inline-block w-2 h-2 rounded-full bg-themeAccent ml-2 mb-1 animate-pulse"></span>}
                        </h3>
                        <p className="text-sm font-bold text-themeTextSec line-clamp-2 leading-relaxed">{notice.summary}</p>

                        {/* Quick Action Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-themeBorderStrong pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest text-themeAccent">Read Full Notice →</span>
                            {(notice.require_acknowledgement && !acknowledged.has(notice.id)) && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded">Action Required</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderEventsFeed = () => (
        <div className="flex flex-col gap-4">
            {events.length === 0 ? (
                <div className="bg-themePanel border border-themeBorder border-dashed rounded-2xl p-12 flex flex-col items-center justify-center opacity-50">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-4 text-themeTextSec"></i>
                    <p className="text-sm font-bold text-themeTextSec">No upcoming events scheduled.</p>
                </div>
            ) : events.map(e => (
                <div key={e.id} className="bg-themePanel border border-themeBorder hover:border-themeAccent/50 rounded-2xl p-6 shadow-sm transition-all flex items-center justify-between group">
                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-themeElevated border border-themeBorderStrong flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs font-black uppercase tracking-widest text-themeAccent">{new Date(e.start_date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-3xl font-black text-themeText leading-none mt-1">{new Date(e.start_date).getDate()}</span>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec bg-themeElevated px-2 py-1 rounded-md border border-themeBorderStrong">
                                    {e.event_type}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-themeText">{e.title}</h3>
                            <p className="text-sm font-bold text-themeTextSec mt-1 line-clamp-2">{e.description}</p>
                            {e.end_date && e.end_date !== e.start_date && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mt-2">
                                    <i className="fa-solid fa-arrow-right-long mr-2"></i>
                                    Ends {new Date(e.end_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderDetailView = () => {
        const pConf = PRIORITIES[selectedNotice.priority] || PRIORITIES.normal;
        const needsAck = selectedNotice.require_acknowledgement && !acknowledged.has(selectedNotice.id);

        return (
            <div className="flex-1 flex flex-col bg-themePanel border border-themeBorder rounded-2xl shadow-xl overflow-hidden animate-fade-in relative">
                
                {/* Header Area */}
                <div className={`p-8 border-b border-themeBorder relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${pConf.bg} to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl opacity-50`}></div>
                    
                    <button onClick={() => setSelectedNotice(null)} className="mb-6 text-[10px] font-black uppercase tracking-widest text-themeTextSec hover:text-themeText transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Back to Board
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${pConf.bg} ${pConf.color} ${pConf.border} border`}>
                            {pConf.display}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-themeTextSec bg-themeElevated px-2 py-1 rounded-full">{selectedNotice.category}</span>
                        <span className="text-[10px] font-bold text-themeTextSec">Published: {new Date(selectedNotice.created_at).toLocaleDateString()}</span>
                    </div>

                    <h1 className="text-3xl font-black text-themeText tracking-tight mb-2 relative z-10">{selectedNotice.title}</h1>
                    <p className="text-sm font-bold text-themeTextSec relative z-10">{selectedNotice.summary}</p>
                </div>

                {/* Content Area */}
                <div className="p-8 flex-1 overflow-y-auto prose prose-invert prose-p:text-themeTextSec prose-p:font-bold prose-headings:font-black prose-a:text-themeAccent max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: selectedNotice.content }}></div>
                </div>

                {/* Footer / Actions Area */}
                <div className="p-8 border-t border-themeBorder bg-themeApp/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    <div className="flex gap-3">
                        {selectedNotice.deep_link_url && (
                            <button onClick={() => setActiveTab(selectedNotice.deep_link_url)} className="bg-themeElevated border border-themeBorderStrong hover:border-themeAccent text-themeText px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                                <i className="fa-solid fa-link"></i> Go to Portal
                            </button>
                        )}
                        <button className="bg-themeElevated border border-themeBorderStrong hover:border-themeText text-themeText px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <i className="fa-solid fa-paperclip"></i> Download Attachments (0)
                        </button>
                    </div>

                    {selectedNotice.require_acknowledgement ? (
                        <button 
                            onClick={() => handleAcknowledge(selectedNotice.id)}
                            disabled={!needsAck}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                                needsAck 
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed'
                            }`}
                        >
                            {needsAck ? (
                                <><i className="fa-regular fa-square-check"></i> I HAVE READ THIS NOTICE</>
                            ) : (
                                <><i className="fa-solid fa-check-double"></i> ACKNOWLEDGED</>
                            )}
                        </button>
                    ) : null}
                    
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in selection:bg-themeElevated">
                
                {/* Header */}
                <div className={`rounded-themePanel p-6 lg:p-8 relative overflow-hidden bg-themeAccent text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-themeElevated`}>
                    <div className="absolute right-0 top-0 w-64 h-64 lg:w-96 lg:h-96 bg-gradient-to-br from-themeAccent/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    <div className="relative z-10 w-full lg:w-auto flex-1">
                        <div className="flex items-center gap-4 mb-3 lg:mb-2">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-themePanel flex items-center justify-center shrink-0">
                                <i className="fa-solid fa-bullhorn text-white text-2xl lg:text-3xl drop-shadow-sm"></i>
                            </div>
                            <div>
                                <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-sm`}>Notices & Events</h1>
                                <p className={`text-white/80 text-xs lg:text-sm font-medium`}>Official communication hub and academic calendar.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 w-full lg:w-auto shrink-0 mt-4 md:mt-0 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20 shrink-0 w-full md:w-auto">
                            <button onClick={() => {setActiveMainTab('broadcasts'); setSelectedNotice(null); setIsBroadcasting(false);}} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMainTab === 'broadcasts' ? 'bg-white text-themeAccent shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Notices</button>
                            <button onClick={() => {setActiveMainTab('events'); setSelectedNotice(null); setIsBroadcasting(false);}} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeMainTab === 'events' ? 'bg-white text-themeAccent shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Events</button>
                        </div>
                        
                        {activeMainTab === 'broadcasts' && (
                            <div className="relative flex-1 md:w-80 w-full">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search notices..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 focus:bg-white focus:text-themeText rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white placeholder:text-white/50 outline-none transition-all shadow-sm"
                                />
                            </div>
                        )}
                        
                        {(userSession?.role === 'faculty' || userSession?.role === 'admin') && !isBroadcasting && activeMainTab === 'broadcasts' && (
                            <button onClick={() => setIsBroadcasting(true)} className="px-6 py-3 bg-white hover:bg-white/90 text-themeAccent rounded-xl text-xs font-black uppercase tracking-widest transition-opacity shadow-sm flex items-center justify-center gap-2 whitespace-nowrap w-full md:w-auto">
                                <i className="fa-solid fa-satellite-dish"></i> Broadcast
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8 h-full items-start">
                    
                    {/* LEFT: Feed or Detail */}
                    <div className="flex-1 w-full flex flex-col gap-6 h-full">
                        {/* Filters Bar (Only show if not in detail view) */}
                        {activeMainTab === 'broadcasts' && !selectedNotice && !isBroadcasting && (
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Unread', 'Pinned', 'Saved', 'Academic', 'Emergency'].map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            activeFilter === f 
                                                ? 'bg-themeAccent text-[#0a0a0a] border-themeAccent shadow-md shadow-themeAccent/20' 
                                                : 'bg-themeElevated text-themeTextSec border-themeBorderStrong hover:border-themeAccent/50'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Dynamic View rendering */}
                        {loading ? (
                            <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full animate-spin"></div></div>
                        ) : activeMainTab === 'events' ? (
                            renderEventsFeed()
                        ) : isBroadcasting ? (
                            <FacultyBroadcastForm 
                                onCancel={() => setIsBroadcasting(false)}
                                onNoticePublished={() => {
                                    setIsBroadcasting(false);
                                    window.location.reload(); // Quick refresh for now to fetch new notices
                                }}
                            />
                        ) : selectedNotice ? (
                            renderDetailView()
                        ) : (
                            renderFeed()
                        )}
                    </div>

                    {/* RIGHT: Sidebar Stats/Info */}
                    {!selectedNotice && !isBroadcasting && (
                        <div className="hidden xl:flex flex-col w-80 shrink-0 gap-6 sticky top-8">
                            
                            {/* Summary Card */}
                            <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-4">Your Summary</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-3xl font-black text-themeText">{notices.filter(n => n.isUnread).length}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Unread</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-3xl font-black text-amber-500">{saved.size}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-themeTextSec">Saved</span>
                                    </div>
                                    <div className="flex flex-col gap-1 col-span-2 mt-2 pt-4 border-t border-themeBorderStrong">
                                        <span className="text-xl font-black text-rose-500">{notices.filter(n => n.require_acknowledgement && !acknowledged.has(n.id)).length}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/70">Action Required</span>
                                    </div>
                                </div>
                            </div>

                            {/* Policies Card */}
                            <div className="bg-themePanel border border-themeBorder rounded-2xl p-6 shadow-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-4">Notice Policies</h3>
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs font-bold text-themeTextSec flex items-start gap-2">
                                        <i className="fa-solid fa-circle-exclamation mt-0.5 text-themeAccent"></i>
                                        Notices marked CRITICAL require mandatory digital acknowledgement.
                                    </p>
                                    <p className="text-xs font-bold text-themeTextSec flex items-start gap-2">
                                        <i className="fa-solid fa-clock-rotate-left mt-0.5 text-themeBorderStrong"></i>
                                        Expired notices remain available via search for 1 academic year.
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
        </div>
    );
}
