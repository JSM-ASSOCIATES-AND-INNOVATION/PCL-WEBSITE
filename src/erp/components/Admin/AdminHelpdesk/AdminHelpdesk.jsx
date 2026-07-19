import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";

export default function AdminHelpdesk() {
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
                .eq('id', ticketId);

            if (error) throw error;
            
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
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 text-center lg:text-left flex-1">
                    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel border-theme border-themeBorderStrong bg-themeElevated flex items-center justify-center text-themeAccent text-2xl lg:text-3xl shrink-0">
                            <i className="fa-solid fa-headset"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText`}>Admin Helpdesk</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium mt-1`}>Manage and reply to student tickets and public inquiries.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex p-1.5 bg-themePanel rounded-themePanel w-full lg:w-fit border-theme border-themeBorder overflow-x-auto no-scrollbar">
                {['all', 'public_inquiry', 'IT Support', 'Finance', 'Academic', 'Administration'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                            activeTab === tab 
                            ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong" 
                            : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
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
