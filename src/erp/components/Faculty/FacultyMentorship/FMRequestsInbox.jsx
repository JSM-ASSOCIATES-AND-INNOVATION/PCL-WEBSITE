import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function FMRequestsInbox({ onViewStudent, setPendingCount }) {
    const { userSession } = useERP();
    const [requests, setRequests] = useState([]);
    const [activeFilter, setActiveFilter] = useState("All");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        if (!userSession?.db_id) return;
        setIsLoading(true);

        try {
            // 1. Fetch mentees
            const { data: mentees } = await supabase
                .from('mentorship')
                .select('student_id')
                .eq('faculty_id', userSession.db_id);
            
            const menteeIds = mentees?.map(m => m.student_id) || [];

            if (menteeIds.length === 0) {
                setRequests([]);
                if (setPendingCount) setPendingCount(0);
                setIsLoading(false);
                return;
            }

            // 2. Fetch requests from different tables
            const [internships, research, achievements] = await Promise.all([
                supabase.from('internship_requests')
                    .select('id, student_id, start_date, company_name, profiles:student_id(name)')
                    .in('student_id', menteeIds)
                    .eq('status', 'Submitted'),
                supabase.from('research_submissions')
                    .select('id, student_id, created_at, title, profiles:student_id(name)')
                    .in('student_id', menteeIds)
                    .eq('status', 'Submitted'),
                supabase.from('achievements')
                    .select('id, student_id, created_at, title, profiles:student_id(name)')
                    .in('student_id', menteeIds)
                    .eq('status', 'Submitted')
            ]);

            const unifiedRequests = [
                ...(internships.data || []).map(r => ({ id: `intern_${r.id}`, db_id: r.id, type: "Internship", studentName: r.profiles?.name || 'Unknown', studentId: r.student_id, date: r.start_date, description: r.company_name, status: "Pending", priority: "Medium", table: 'internship_requests' })),
                ...(research.data || []).map(r => ({ id: `research_${r.id}`, db_id: r.id, type: "Research", studentName: r.profiles?.name || 'Unknown', studentId: r.student_id, date: r.created_at?.split('T')[0], description: r.title, status: "Pending", priority: "Medium", table: 'research_submissions' })),
                ...(achievements.data || []).map(r => ({ id: `achieve_${r.id}`, db_id: r.id, type: "Achievement", studentName: r.profiles?.name || 'Unknown', studentId: r.student_id, date: r.created_at?.split('T')[0], description: r.title, status: "Pending", priority: "Low", table: 'achievements' }))
            ];

            // Sort by date descending
            unifiedRequests.sort((a, b) => new Date(b.date) - new Date(a.date));

            setRequests(unifiedRequests);
            if (setPendingCount) setPendingCount(unifiedRequests.length);

        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (request, action) => {
        setIsProcessing(true);
        try {
            let updateData = {};
            if (action === 'Approve') {
                if (request.table === 'internship_requests') updateData.status = 'Recommended';
                if (request.table === 'research_submissions') updateData.status = 'Approved';
                if (request.table === 'achievements') updateData.status = 'Verified';
            } else if (action === 'Reject') {
                updateData.status = 'Rejected';
            }

            const { error } = await supabase
                .from(request.table)
                .update(updateData)
                .eq('id', request.db_id);
            
            if (error) throw error;

            setRequests(prev => {
                const next = prev.filter(req => req.id !== request.id);
                if (setPendingCount) setPendingCount(next.length);
                return next;
            });
            window.erpDialog?.alert(`Request ${action.toLowerCase()}d successfully.`);
        } catch (error) {
            console.error("Error updating request:", error);
            window.erpDialog?.alert(`Failed to ${action.toLowerCase()} request.`, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const filters = ["All", "Internship", "Meeting", "Research", "Achievement"];

    const filteredRequests = requests.filter(req => activeFilter === "All" || req.type === activeFilter);

    const getIconForType = (type) => {
        switch(type) {
            case 'Internship': return <i className="fa-solid fa-briefcase text-indigo-500"></i>;
            case 'Meeting': return <i className="fa-solid fa-handshake text-blue-500"></i>;
            case 'Research': return <i className="fa-solid fa-microscope text-purple-500"></i>;
            case 'Achievement': return <i className="fa-solid fa-trophy text-emerald-500"></i>;
            default: return <i className="fa-solid fa-file text-themeTextSec"></i>;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10 relative">
            
            {isProcessing && (
                <div className="absolute inset-0 bg-themeApp/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <div className="bg-themeElevated p-6 rounded-xl border-[length:var(--border-width)] border-themeBorderStrong shadow-2xl flex flex-col items-center gap-4">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
                        <span className="text-xs font-black uppercase tracking-widest text-themeText">Processing Request...</span>
                    </div>
                </div>
            )}

            {/* Header & Filters */}
            <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div>
                    <h2 className={`${theme.text.heading} text-lg tracking-tight text-themeText mb-1`}>Unified Inbox</h2>
                    <p className={`${theme.text.secondary} text-[10px] font-bold uppercase tracking-widest`}>{requests.length} Pending Actions</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border-[length:var(--border-width)] ${
                                activeFilter === filter 
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                                : 'bg-themeElevated text-themeTextSec border-themeBorder hover:border-themeBorderStrong hover:text-themeText'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            <div className="flex flex-col gap-4">
                {filteredRequests.length === 0 ? (
                    <div className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-12 flex flex-col items-center justify-center text-center opacity-70">
                        <i className="fa-solid fa-inbox text-5xl text-themeTextSec mb-4"></i>
                        <h3 className="text-sm font-black text-themeText">Inbox Zero!</h3>
                        <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest mt-2">No pending requests in this category.</p>
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req.id} className="bg-themePanel border-[length:var(--border-width)] border-themeBorder rounded-themePanel p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center transition-colors hover:border-blue-500/50 group">
                            
                            {/* Icon & Type */}
                            <div className="flex items-center gap-4 w-full lg:w-48 shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-themeElevated border-[length:var(--border-width)] border-themeBorderStrong flex items-center justify-center text-xl shrink-0">
                                    {getIconForType(req.type)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-themeText">{req.type}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 w-max ${
                                        req.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-[length:var(--border-width)] border-rose-500/20' : 
                                        req.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-[length:var(--border-width)] border-amber-500/20' : 
                                        'bg-themeElevated text-themeTextSec border-[length:var(--border-width)] border-themeBorderStrong'
                                    }`}>
                                        {req.priority} Priority
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col gap-1 w-full border-t lg:border-t-0 lg:border-l border-themeBorderStrong pt-4 lg:pt-0 lg:pl-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-themeText cursor-pointer hover:text-blue-500 transition-colors" onClick={() => onViewStudent(req.studentId)}>
                                        {req.studentName}
                                    </span>
                                    <span className="text-[10px] text-themeTextSec">•</span>
                                    <span className="text-[10px] font-bold text-themeTextSec">{req.date}</span>
                                </div>
                                <p className="text-[11px] font-medium text-themeTextSec mt-1 leading-relaxed">{req.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-themeBorderStrong">
                                <button 
                                    onClick={() => handleAction(req, 'Approve')}
                                    className="flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors border-[length:var(--border-width)] border-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-check"></i> Approve
                                </button>
                                <button 
                                    onClick={() => handleAction(req, 'Reject')}
                                    className="flex-1 lg:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors border-[length:var(--border-width)] border-rose-500/20 flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-xmark"></i> Reject
                                </button>
                                <button 
                                    onClick={() => window.erpDialog?.alert("Please enter remarks to request changes.")}
                                    className="flex-1 lg:flex-none px-4 py-2.5 bg-themeElevated hover:bg-themeBorder text-themeTextSec hover:text-themeText border-[length:var(--border-width)] border-themeBorderStrong rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                                    title="Request Changes or Clarification"
                                >
                                    <i className="fa-solid fa-reply"></i>
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
