/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function AdminHelpdesk({ isHubView = false }) {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [replyText, setReplyText] = useState({});
    const [submittingReply, setSubmittingReply] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('helpdesk_tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (ticketId, isClosing = false) => {
        const text = replyText[ticketId];
        if (!text && !isClosing) return window.erpDialog.alert("Reply text cannot be empty");

        setSubmittingReply(ticketId);
        try {
            const updatePayload = {
                admin_reply: text || 'Closed by Admin',
            };
            if (isClosing) updatePayload.status = 'resolved';

            const { error } = await supabase
                .from('helpdesk_tickets')
                .update(updatePayload)
                .eq('id', ticketId)
                .select(); // We need the user_id to notify them

            if (error) throw error;
            
            // Notify Requester
            const ticketData = error ? null : (await supabase.from('helpdesk_tickets').select('*').eq('id', ticketId).single()).data;
            if (ticketData && ticketData.user_id) {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                await supabase.from('notices').insert([{
                    notice_id: noticeId,
                    title: isClosing ? 'Support Ticket Resolved' : 'Support Ticket Replied',
                    category: 'System Alert',
                    target_audience: 'person',
                    target_id: ticketData.user_id,
                    priority: 'high',
                    content: `Your support ticket (${ticketData.ticket_id}) has been ${isClosing ? 'resolved' : 'replied to'} by the Admin.`,
                    author_name: 'Admin',
                    author_id: null
                }]);
            }

            setReplyText(prev => ({ ...prev, [ticketId]: '' }));
            fetchTickets();
        } catch (error) {
            console.error("Failed to reply:", error);
            window.erpDialog.alert("Failed to submit reply.");
        } finally {
            setSubmittingReply(null);
        }
    };

    const filteredTickets = activeTab === "all" ? tickets : tickets.filter(t => t.category === activeTab);

    return (
        <div className={`w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated ${isHubView ? 'bg-transparent text-themeText font-sans' : ''}`}>
            {/* Header and Tabs */}
            {!isHubView && (
                <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                    
                    <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                            <i className="fa-solid fa-headset text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Admin Helpdesk</h1>
                            <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage and reply to student tickets and public inquiries.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex flex-wrap lg:flex-nowrap p-1.5 bg-themeElevated backdrop-blur-md rounded-2xl border border-themeBorderStrong relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar ${!isHubView ? '-mt-10 lg:-mt-12 ml-6 lg:ml-8' : ''}`}>
                {['all', 'public_inquiry', 'IT Support', 'Finance', 'Academic', 'Administration'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${
                            activeTab === tab 
                                ? 'bg-themeAccent text-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-themeAccent scale-100' 
                                : 'text-themeTextSec hover:text-themeText hover:bg-themePanel border border-transparent scale-95 hover:scale-100'
                        }`}
                    >
                        {tab === 'all' ? 'All Tickets' : tab === 'public_inquiry' ? 'Public Inquiries' : tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin w-8 h-8 border-4 border-themeAccent border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeApp border-theme border-dashed border-themeBorder rounded-themePanel text-center px-4">
                        <i className="fa-solid fa-check-double text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
                        <h3 className="text-sm lg:text-base font-black text-themeText">All Caught Up</h3>
                        <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.muted} mt-1 lg:mt-2`}>No tickets found for this category.</p>
                    </div>
                ) : (
                    filteredTickets.map(ticket => (
                        <div key={ticket.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel border-theme border-themeBorder hover:border-themeBorderStrong transition-all flex flex-col gap-4`}>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {ticket.ticket_id && (
                                            <span className="text-[9px] lg:text-[10px] font-bold text-themeTextSec uppercase tracking-widest bg-themePanel px-2.5 py-1 rounded-md border-theme border-themeBorder">
                                                {ticket.ticket_id}
                                            </span>
                                        )}
                                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme bg-themeElevated text-themeAccent border-themeBorderStrong">
                                            {ticket.category === 'public_inquiry' ? 'Public Inquiry' : ticket.category}
                                        </span>
                                        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme ${ticket.status === 'resolved' ? 'bg-themeElevated text-emerald-400 border-themeBorderStrong' : 'bg-themeElevated text-amber-500 border-themeBorderStrong'}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <h3 className="text-base lg:text-lg font-black text-themeText mb-2">{ticket.subject}</h3>
                                    <div className="text-xs lg:text-sm text-themeTextSec bg-themePanel p-4 rounded-lg border-theme border-themeBorder whitespace-pre-wrap font-medium">
                                        {ticket.description}
                                    </div>
                                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-themeTextSec mt-3">
                                        Received: {new Date(ticket.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="border-t-theme border-themeBorder pt-4 mt-2">
                                {ticket.status === 'resolved' ? (
                                    <div className="bg-themePanel p-4 rounded-lg border-theme border-themeBorder">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Admin Reply</span>
                                        <p className="text-sm font-bold text-themeText">{ticket.admin_reply}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col lg:flex-row gap-3">
                                        <textarea
                                            value={replyText[ticket.id] || ''}
                                            onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                            placeholder="Write your reply here..."
                                            className="flex-1 bg-themePanel border-theme border-themeBorder rounded-lg px-4 py-3 text-sm font-bold text-themeText outline-none focus:border-themeAccent resize-none min-h-[80px]"
                                        />
                                        <div className="flex lg:flex-col gap-2 shrink-0">
                                            <button 
                                                onClick={() => handleReply(ticket.id, false)}
                                                disabled={submittingReply === ticket.id}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-themeAccent hover:bg-themeAccent/80 text-black font-black uppercase tracking-widest text-[10px] rounded-lg transition-colors border-theme border-themeBorder"
                                            >
                                                Send Reply
                                            </button>
                                            <button 
                                                onClick={() => handleReply(ticket.id, true)}
                                                disabled={submittingReply === ticket.id}
                                                className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] rounded-lg transition-colors border-theme border-themeBorder"
                                            >
                                                Resolve & Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
