import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { useERP } from "../../../context/ErpContext";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function FacultyLeave() {
    const { userSession } = useERP();

    const [leaveHistory, setLeaveHistory] = useState(() => {
        if (!userSession?.db_id) return [];
        const cached = sessionStorage.getItem(`leaveHistory_${userSession.db_id}`);
        return cached ? JSON.parse(cached) : [];
    });
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [leaveType, setLeaveType] = useState("Medical Leave");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");

    // --- DATA SYNC ENGINE ---
    const fetchLeaveHistory = async () => {
        if (!userSession?.db_id) return;
        try {
            const { data, error } = await supabase
                .from('faculty_leaves')
                .select('*')
                .eq('faculty_id', userSession.db_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeaveHistory(data || []);
            sessionStorage.setItem(`leaveHistory_${userSession.db_id}`, JSON.stringify(data || []));
        } catch (error) {
            console.error("Failed to fetch faculty leaves:", error);
        }
    };

    useEffect(() => {
        fetchLeaveHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSession]);

    // --- SUBMIT ENGINE ---
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            if (start > end) throw new Error("End date cannot be before start date.");

            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

            const { error } = await supabase
                .from('faculty_leaves')
                .insert({
                    faculty_id: userSession.db_id,
                    leave_type: leaveType,
                    start_date: fromDate,
                    end_date: toDate,
                    days: diffDays,
                    reason: reason,
                    status: 'pending'
                });

            if (error) throw error;

            fetchLeaveHistory();
            setShowRequestModal(false);
            setFromDate(""); setToDate(""); setReason("");
        } catch (error) {
            window.erpDialog.alert(error.message || "Failed to submit leave request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated">
            {/* Header */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg: -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-themeElevated rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel lg:rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-mug-hot text-blue-400 text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Time Off & Leaves</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Submit requests. Approved leaves trigger substitute allocation.</p>
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowRequestModal(true)} className="relative z-10 w-full lg:w-auto shrink-0 bg-blue-600 hover:bg-blue-500 text-themeText px-6 py-3.5 lg:py-4 rounded-themePanel lg:rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 group overflow-hidden active:scale-[0.98]">
                    <i className="fa-solid fa-calendar-plus text-sm lg:text-base"></i> Request Time Off
                </button>
            </div>

            {/* History Ledger */}
            <div className="flex flex-col gap-4">
                <h2 className={`${theme.text.heading} text-lg lg:text-xl text-themeText tracking-tight ml-2`}>Your Leave History</h2>

                {leaveHistory.length === 0 ? (
                    <div className="w-full py-20 lg:py-24 border-2 border-dashed border-themeBorder rounded-themePanel lg:rounded-themePanel flex flex-col items-center justify-center bg-themeApp px-4 text-center">
                        <i className="fa-solid fa-mug-hot text-4xl lg:text-5xl text-neutral-700 mb-4 lg:mb-6"></i>
                        <p className={`text-xs lg:text-sm font-bold ${theme.text.muted}`}>No leave requests found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 lg:gap-4">
                        {leaveHistory.map((leave) => (
                            <div key={leave.id} className={`${theme.layout.panel} p-5 lg:p-6 rounded-themePanel lg:rounded-themePanel flex flex-col sm:flex-row justify-between gap-4 lg:gap-6 border-theme border-themeBorder hover:border-themeBorderStrong transition-colors`}>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base lg:text-lg font-black text-themeText mb-2 lg:mb-3 truncate">{leave.leave_type}</h3>
                                    <div className={`flex flex-wrap items-center gap-2 lg:gap-4 text-[10px] lg:text-xs font-semibold ${theme.text.secondary} mb-2 lg:mb-3`}>
                                        <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar text-themeTextSec opacity-70"></i> {new Date(leave.start_date).toLocaleDateString('en-GB')} &rarr; {new Date(leave.end_date).toLocaleDateString('en-GB')}</span>
                                        <span className="px-2 lg:px-2.5 py-1 bg-themeElevated rounded-md border-theme border-themeBorderStrong text-themeText">{leave.days} Days</span>
                                    </div>
                                    {leave.substitute_name && (
                                        <div className="bg-themeElevated border-theme border-themeBorderStrong p-2.5 lg:p-3 rounded-lg lg:rounded-themePanel mt-2 flex items-center gap-2.5 lg:gap-3">
                                            <i className="fa-solid fa-user-shield text-blue-400 shrink-0"></i>
                                            <p className="text-[10px] lg:text-xs font-bold text-blue-300 truncate">Substitute Assigned: <span className="text-themeText">{leave.substitute_name}</span></p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center items-start sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t-theme sm:border-none border-themeBorder">
                                    <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 lg:px-3 py-1.5 rounded-lg flex items-center gap-1.5 lg:gap-2 border-theme  ${leave.status === 'approved' ? 'bg-themeElevated text-emerald-400 border-themeBorderStrong' : leave.status === 'rejected' ? 'bg-themeElevated text-rose-400 border-themeBorderStrong' : 'bg-themeElevated text-themeAccent border-themeBorderStrong '}`}>
                                        {leave.status === 'approved' && <i className="fa-solid fa-check"></i>}
                                        {leave.status === 'rejected' && <i className="fa-solid fa-xmark"></i>}
                                        {leave.status === 'pending' && <i className="fa-regular fa-clock"></i>}
                                        {leave.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80 animate-fade-in">
                    <div className="bg-themePanel w-full max-w-lg rounded-themePanel overflow-hidden border-theme border-themeBorder flex flex-col max-h-[90vh] shadow-2xl">
                        <div className="p-5 lg:p-6 text-themeText border-b-theme border-themeBorder flex justify-between items-start shrink-0 bg-themeElevated">
                            <div className="min-w-0 pr-4">
                                <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1 text-themeText truncate">Apply for Time Off</h3>
                                <p className={`text-[10px] lg:text-xs ${theme.text.secondary} font-medium truncate`}>Request will be sent to the Master Admin.</p>
                            </div>
                            <button onClick={() => setShowRequestModal(false)} className="w-8 h-8 rounded-full bg-themeElevated hover:bg-neutral-800 text-themeTextSec transition-colors flex items-center justify-center shrink-0 border-theme border-themeBorderStrong">
                                <i className="fa-solid fa-xmark text-sm"></i>
                            </button>
                        </div>
                        <form onSubmit={handleRequestSubmit} className="p-5 lg:p-6 flex flex-col gap-4 lg:gap-5 overflow-y-auto no-scrollbar bg-themePanel">
                            <div>
                                <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Leave Category</label>
                                <div className="relative">
                                    <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText outline-none appearance-none cursor-pointer">
                                        <option value="Medical Leave">Medical Leave</option>
                                        <option value="Academic Conference">Academic Conference / Seminar</option>
                                        <option value="Personal Leave">Personal Leave</option>
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-themeTextSec opacity-70 pointer-events-none text-xs"></i>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                                <div><label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText outline-none [color-scheme:dark]" required /></div>
                                <div><label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 lg:py-3.5 text-xs lg:text-sm font-bold text-themeText outline-none [color-scheme:dark]" required /></div>
                            </div>
                            <div>
                                <label className={`block text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${theme.text.muted} mb-1.5 ml-1`}>Reason & Class Adjustments</label>
                                <textarea rows="3" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide reason and suggest a substitute if known..." className="w-full bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel px-4 py-3 text-xs lg:text-sm font-bold text-themeText outline-none resize-none" required></textarea>
                            </div>
                            <button type="submit" disabled={isSubmitting || !fromDate || !toDate || !reason} className="w-full py-3.5 lg:py-4 bg-blue-600 hover:bg-blue-500 text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 mt-2 flex justify-center items-center gap-2 active:scale-[0.98]">
                                {isSubmitting ? <><i className="fa-solid fa-circle-notch fa-spin text-base lg:text-lg"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane text-base lg:text-lg"></i> Submit Application</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}