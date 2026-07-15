/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function Helpdesk() {
    const { userSession } = useERP();

    // --- MAIN STATE ---
    const [tickets, setTickets] = useState(() => {
        const userId = userSession?.db_id || userSession?.id;
        if (!userId) return [];
        const cached = sessionStorage.getItem(`helpdesk_tickets_${userId}`);
        return cached ? JSON.parse(cached) : [];
    });

    // --- TAB STATE ---
    const [activeTab, setActiveTab] = useState("tickets"); // "tickets" | "grievance"

    // --- MODAL & FORM STATE ---
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    const [ticketForm, setTicketForm] = useState({
        category: "",
        subject: "",
        description: ""
    });

    const [grievanceForm, setGrievanceForm] = useState({
        description: ""
    });
    const [grievanceStatus, setGrievanceStatus] = useState({ type: "", text: "" });

    // --- DATA SYNC ENGINE ---
    const fetchTickets = async () => {
        const userId = userSession?.db_id || userSession?.id;
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('helpdesk_tickets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
            sessionStorage.setItem(`helpdesk_tickets_${userId}`, JSON.stringify(data || []));
        } catch (error) {
            console.error("Failed to sync helpdesk tickets:", error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [userSession]);

    // --- TICKET SUBMISSION ENGINE ---
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const userId = userSession?.db_id || userSession?.id;
            
            // Generate a readable Ticket ID (e.g., TKT-1A2B3C)
            const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
            const ticketId = `TKT-${randomHex}`;

            const { error } = await supabase
                .from('helpdesk_tickets')
                .insert({
                    ticket_id: ticketId,
                    user_id: userId,
                    category: ticketForm.category,
                    subject: ticketForm.subject,
                    description: ticketForm.description,
                    status: 'open',
                    admin_reply: 'Awaiting Support Team Review'
                });

            if (error) throw error;

            setStatusMessage({ type: "success", text: "Ticket routed to the Support Team." });
            fetchTickets(); // Refresh list

            setTimeout(() => {
                setShowTicketModal(false);
                setStatusMessage({ type: "", text: "" });
                setTicketForm({ category: "", subject: "", description: "" });
            }, 2000);

        } catch (error) {
            console.error("Ticket creation failed:", error);
            setStatusMessage({ type: "error", text: "Failed to submit ticket. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- GRIEVANCE SUBMISSION ENGINE ---
    const handleGrievanceSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setGrievanceStatus({ type: "", text: "" });

        try {
            const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
            
            const descLower = grievanceForm.description.toLowerCase();
            const isCritical = ['ragging', 'harassment', 'assault'].some(word => descLower.includes(word));
            const severity = isCritical ? 'CRITICAL' : 'NORMAL';

            const { error } = await supabase
                .from('grievances')
                .insert({
                    tracking_code: randomHex,
                    description: grievanceForm.description,
                    severity: severity,
                    status: 'PENDING'
                });

            if (error) throw error;

            setGrievanceStatus({ type: "success", text: `Submitted anonymously! Tracking Code: ${randomHex}` });
            
            setTimeout(() => {
                setGrievanceStatus({ type: "", text: "" });
                setGrievanceForm({ description: "" });
            }, 5000);

        } catch (error) {
            console.error("Grievance submission failed:", error);
            setGrievanceStatus({ type: "error", text: "Failed to submit grievance. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- UI HELPERS ---
    const getCategoryTheme = (category) => {
        if (category === 'IT Support') return 'text-blue-400 bg-themeElevated border-themeBorderStrong';
        if (category === 'Finance') return 'text-themeAccent bg-themeElevated border-themeBorderStrong';
        if (category === 'Academic') return 'text-emerald-400 bg-themeElevated border-themeBorderStrong';
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-20 lg:pb-12 animate-fade-in selection:bg-themeElevated">

            {/* Header Banner */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-themeElevated rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 text-center lg:text-left flex-1">
                    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mb-2">
                        <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-themePanel lg:rounded-themePanel border-theme border-themeBorderStrong bg-themeElevated flex items-center justify-center text-themeAccent text-2xl lg:text-3xl  shrink-0`}>
                            <i className="fa-solid fa-headset"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText`}>Helpdesk Support</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium mt-1`}>Raise tickets for issues or submit anonymous grievances.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowTicketModal(true)}
                    className="w-full lg:w-auto px-6 py-4 bg-white hover:bg-neutral-200 text-[#050505] rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] relative z-10 shrink-0 flex items-center justify-center gap-2 group overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
                    <i className="fa-solid fa-plus text-[#050505]"></i> Raise New Ticket
                </button>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex p-1.5 bg-themePanel rounded-themePanel w-full lg:w-fit border-theme border-themeBorder overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'tickets'
                        ? "bg-themeElevated text-themeAccent border-theme border-themeBorderStrong"
                        : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
                        }`}
                >
                    <i className="fa-solid fa-ticket"></i> Support Tickets
                </button>
                <button
                    onClick={() => setActiveTab('grievance')}
                    className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'grievance'
                        ? "bg-themeElevated text-rose-400 border-theme border-rose-500/30"
                        : "text-themeTextSec opacity-70 hover:text-themeText border-theme border-transparent"
                        }`}
                >
                    <i className="fa-solid fa-user-secret"></i> Anonymous Grievance
                </button>
            </div>

            {/* TICKETS CONTENT */}
            {activeTab === 'tickets' && (
                <div className="flex flex-col gap-4 lg:gap-5 animate-fade-in">
                    <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}><i className="fa-solid fa-ticket text-themeTextSec opacity-70 mr-2"></i> My Support Tickets</h2>

                    {tickets.length === 0 ? (
                        <div className="w-full py-16 lg:py-20 flex flex-col items-center justify-center bg-themeApp border-theme border-dashed border-themeBorder rounded-themePanel text-center px-4">
                            <i className="fa-solid fa-clipboard-check text-4xl lg:text-5xl text-neutral-700 mb-3 lg:mb-4"></i>
                            <h3 className="text-sm lg:text-base font-black text-themeText">No Active Tickets</h3>
                            <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.muted} mt-1 lg:mt-2`}>You haven't raised any support requests yet.</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div key={ticket.id || ticket.ticket_id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel  hover:border-themeBorderStrong transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-6 group border-theme border-themeBorder`}>

                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-2 lg:mb-3">
                                        <span className={`text-[9px] lg:text-[10px] font-bold ${theme.text.muted} uppercase tracking-widest bg-themePanel px-2.5 py-1 rounded-md border-theme border-themeBorder `}>
                                            {ticket.ticket_id}
                                        </span>
                                        <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme  ${getCategoryTheme(ticket.category)}`}>
                                            {ticket.category}
                                        </span>
                                    </div>
                                    <h3 className="text-base lg:text-lg font-black text-themeText group-hover:text-themeAccent transition-colors mb-2 leading-tight">{ticket.subject}</h3>
                                    <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${theme.text.secondary}`}><span className={theme.text.muted}>Raised on:</span> {new Date(ticket.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>

                                <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 border-t-theme lg:border-t-0 lg:border-l-theme border-themeBorder pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
                                    <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 border-theme  w-full lg:w-auto ${ticket.status === 'resolved' ? 'bg-themeElevated text-emerald-400 border-themeBorderStrong' : 'bg-themeElevated text-themeAccent border-themeBorderStrong  '
                                        }`}>
                                        {ticket.status === 'resolved' ? <i className="fa-solid fa-check-double"></i> : <i className="fa-solid fa-clock"></i>}
                                        {ticket.status === 'open' ? 'In Progress' : 'Resolved'}
                                    </span>
                                    <div className="bg-themePanel p-3 lg:p-4 rounded-themePanel border-theme border-themeBorder text-[10px] lg:text-xs font-medium text-themeTextSec w-full lg:max-w-xs flex items-start gap-2 lg:gap-3">
                                        <i className="fa-solid fa-reply text-themeAccent/70 mt-0.5 shrink-0"></i>
                                        <span className="line-clamp-2" title={ticket.admin_reply}>{ticket.admin_reply}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* GRIEVANCE CONTENT */}
            {activeTab === 'grievance' && (
                <div className="flex flex-col gap-6 animate-fade-in w-full max-w-3xl mx-auto">
                    <div className="bg-rose-500/10 border-theme border-rose-500/30 p-5 rounded-themePanel flex gap-4">
                        <i className="fa-solid fa-user-shield text-rose-400 text-xl shrink-0 mt-1"></i>
                        <div>
                            <h3 className="text-rose-400 font-black text-sm lg:text-base uppercase tracking-widest mb-2">100% Anonymous Cell</h3>
                            <p className="text-themeTextSec text-xs lg:text-sm font-medium leading-relaxed">
                                Use this form to report sensitive issues like ragging, harassment, or assault. 
                                <strong className="text-rose-300 ml-1">No personal identifiers are attached to your submission.</strong>
                                You will receive a 6-character tracking code. Please save it to track your case offline.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleGrievanceSubmit} className="bg-themeElevated p-6 rounded-themePanel border-theme border-themeBorder flex flex-col gap-5">
                        
                        {grievanceStatus.text && (
                            <div className={`p-4 rounded-themePanel text-xs font-black uppercase tracking-widest flex items-center gap-2 border-theme ${grievanceStatus.type === "success" ? "bg-themePanel border-emerald-500/30 text-emerald-400" : "bg-themePanel border-rose-500/30 text-rose-400"}`}>
                                <i className={`fa-solid ${grievanceStatus.type === "success" ? "fa-check-circle" : "fa-triangle-exclamation"}`}></i>
                                {grievanceStatus.text}
                            </div>
                        )}

                        <div>
                            <label className={`block text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Grievance Details</label>
                            <textarea
                                rows="6"
                                value={grievanceForm.description}
                                onChange={(e) => setGrievanceForm({ description: e.target.value })}
                                placeholder="Please describe the incident in detail..."
                                className="w-full bg-themePanel border-theme border-themeBorder rounded-themePanel px-4 py-4 text-xs lg:text-sm font-bold text-themeText focus:border-rose-500 outline-none transition-all resize-none placeholder:text-neutral-600"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 overflow-hidden group shrink-0 ${isSubmitting
                                ? 'bg-themePanel text-neutral-600 cursor-not-allowed border-theme border-themeBorder '
                                : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? (
                                <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting securely...</>
                            ) : (
                                <><i className="fa-solid fa-lock"></i> Submit Anonymously</>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* NEW TICKET MODAL */}
            {showTicketModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-themeApp w-full max-w-lg rounded-t-[2rem] sm:rounded-themePanel overflow-hidden shadow-2xl border-theme border-themeBorder flex flex-col max-h-[90vh]">

                        <div className="bg-themePanel p-5 lg:p-6 text-themeText relative border-b-theme border-themeBorder shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-themeElevated rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText">Create Support Ticket</h3>
                                    <p className={`text-[10px] lg:text-xs ${theme.text.muted} font-medium`}>We usually respond within 24 hours.</p>
                                </div>
                                <button onClick={() => setShowTicketModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-themePanel border-theme border-themeBorderStrong text-themeTextSec hover:text-themeText hover:border-amber-500 transition-colors shrink-0">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto no-scrollbar flex-1">
                            <form onSubmit={handleRequestSubmit} className="p-5 lg:p-6 flex flex-col gap-5 lg:gap-6">

                                {statusMessage.text && (
                                    <div className={`p-4 rounded-themePanel text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2  border-theme animate-fade-in ${statusMessage.type === "success" ? "bg-themeElevated border-themeBorderStrong text-emerald-400" : "bg-themeElevated border-themeBorderStrong text-rose-400"
                                        }`}>
                                        <i className={`fa-solid ${statusMessage.type === "success" ? "fa-check-circle" : "fa-triangle-exclamation"}`}></i>
                                        {statusMessage.text}
                                    </div>
                                )}

                                <div>
                                    <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Department</label>
                                    <div className="relative">
                                        <select
                                            value={ticketForm.category}
                                            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                            className="w-full bg-themePanel border-theme border-themeBorder rounded-themePanel px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Select Department...</option>
                                            <option value="IT Support">IT & Technical Support</option>
                                            <option value="Finance">Finance & Fees</option>
                                            <option value="Academic">Academic & Examination</option>
                                            <option value="Administration">General Administration</option>
                                        </select>
                                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none"></i>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Subject</label>
                                    <input
                                        type="text"
                                        value={ticketForm.subject}
                                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                        placeholder="Brief description of the issue"
                                        className="w-full bg-themePanel border-theme border-themeBorder rounded-themePanel px-4 py-3.5 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition-all placeholder:text-neutral-600"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-2 ml-1`}>Detailed Explanation</label>
                                    <textarea
                                        rows="4"
                                        value={ticketForm.description}
                                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                        placeholder="Please provide as much detail as possible..."
                                        className="w-full bg-themePanel border-theme border-themeBorder rounded-themePanel px-4 py-3 lg:py-4 text-xs lg:text-sm font-bold text-themeText focus:border-themeAccent outline-none transition-all resize-none placeholder:text-neutral-600"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full mt-2 py-4 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 overflow-hidden group shrink-0 ${isSubmitting
                                        ? 'bg-themeElevated text-neutral-600 cursor-not-allowed border-theme border-themeBorder '
                                        : 'bg-amber-500 text-[#050505] hover:bg-amber-400  active:scale-[0.98]'
                                        }`}
                                >
                                    {!isSubmitting && (
                                        <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:"></div>
                                    )}
                                    {isSubmitting ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin text-lg"></i> Submitting...</>
                                    ) : (
                                        <><i className="fa-solid fa-paper-plane"></i> Submit Ticket</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
