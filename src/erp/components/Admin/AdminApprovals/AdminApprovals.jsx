/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../lib/supabase/supabaseClient";

export default function AdminApprovals() {
    const [activeTab, setActiveTab] = useState("faculty_leaves"); // 'faculty_leaves', 'escalated_grievances'
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Data
    const [facultyLeaves, setFacultyLeaves] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [pendingDocuments, setPendingDocuments] = useState([]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [
                { data: leavesData },
                { data: grievancesData }
            ] = await Promise.all([
                // Fetch faculty leaves

                supabase.from('faculty_leaves').select('*').order('created_at', { ascending: false }),
                
                // Fetch escalated grievances (assigned_to IS NULL)
                supabase.from('grievances')
                    .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name, role), accused:profiles!grievances_accused_id_fkey(full_name, role)')
                    .is('assigned_to', null)
                    .order('created_at', { ascending: false }),

                // Fetch pending student documents
                supabase.from('student_documents')
                    .select('*, profiles(full_name, erp_id)')
                    .eq('status', 'pending')
                    .order('uploaded_at', { ascending: false })
            ]);

            const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, role');
            
            const enrichedLeaves = (leavesData || []).map(l => {
                const p = allProfiles?.find(prof => prof.id === l.faculty_id);
                return { ...l, faculty_name: p?.full_name || 'Unknown Faculty' };
            });

            setFacultyLeaves(enrichedLeaves);
            setGrievances(grievancesData || []);
            setPendingDocuments(arguments[0][2]?.data || []);

        } catch (error) {
            console.error("Error fetching admin approvals data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLeaveAction = async (leaveId, newStatus, remarks = "") => {
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('faculty_leaves')
                .update({ status: newStatus, admin_remarks: remarks })
                .eq('id', leaveId);
            
            if (error) throw error;
            window.erpDialog.alert(`Faculty leave request has been ${newStatus}.`);
            fetchData();
        } catch (error) {
            console.error("Error updating leave:", error);
            window.erpDialog.alert("Failed to process leave request.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGrievanceAction = async (grievanceId, newStatus, notes = "") => {
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('grievances')
                .update({ 
                    status: newStatus, 
                    resolution_notes: notes, 
                    resolved_at: newStatus === 'resolved' || newStatus === 'dismissed' ? new Date().toISOString() : null 
                })
                .eq('id', grievanceId);
            
            if (error) throw error;
            window.erpDialog.alert(`Escalated grievance marked as ${newStatus}.`);
            fetchData();
        } catch (error) {
            console.error("Error updating grievance:", error);
            window.erpDialog.alert("Failed to process grievance.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDocumentAction = async (docId, newStatus) => {
        setIsProcessing(true);
        try {
            const { error } = await supabase
                .from('student_documents')
                .update({ status: newStatus })
                .eq('id', docId);
            
            if (error) throw error;
            window.erpDialog.alert(`Document marked as ${newStatus}.`);
            fetchData();
        } catch (error) {
            console.error("Error updating document:", error);
            window.erpDialog.alert("Failed to process document verification.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDocumentPreview = async (filePath) => {
        try {
            const { data, error } = await supabase.storage.from('digital_locker_vault').createSignedUrl(filePath, 60);
            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, '_blank');
            }
        } catch (e) {
            console.error(e);
            window.erpDialog.alert("Failed to load document preview.");
        }
    };

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case 'approved':
            case 'resolved':
                return <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border-emerald-500/30 border">{status}</span>;
            case 'rejected':
            case 'dismissed':
                return <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest border-rose-500/30 border">{status}</span>;
            case 'investigating':
                return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border-blue-500/30 border">{status}</span>;
            default:
                return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border-amber-500/30 border">{status || 'pending'}</span>;
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated relative">
            
            {/* Header */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4 lg:gap-5">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-scale-balanced text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Admin Approvals & Investigations</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Manage faculty leaves, document verifications, and escalated grievances.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit relative z-10 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setActiveTab('faculty_leaves')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'faculty_leaves' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Faculty Leaves
                </button>
                <button 
                    onClick={() => setActiveTab('escalated_grievances')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'escalated_grievances' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Escalated Grievances
                </button>
                <button 
                    onClick={() => setActiveTab('document_verification')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'document_verification' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Document Verification
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
                    <span className="text-sm font-black uppercase tracking-widest text-themeText">Loading Secure Ledgers...</span>
                </div>
            ) : (
                <div className="relative z-10">
                    
                    {activeTab === 'faculty_leaves' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {facultyLeaves.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No pending leave requests from Faculty.</p>
                                </div>
                            ) : (
                                facultyLeaves.map(req => (
                                    <div key={req.id} className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-themeAccent"></div>
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <p className="text-sm font-black text-themeText mb-0.5">{req.faculty_name}</p>
                                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{req.start_date} to {req.end_date}</p>
                                            </div>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <span className="bg-themePanel border-theme border-themeBorder px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">{req.leave_type}</span>
                                            <span className="bg-themePanel border-theme border-themeBorder px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">{req.total_days} Days</span>
                                        </div>

                                        <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
                                            <p className="text-xs text-themeText italic">"{req.reason}"</p>
                                        </div>

                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2 mt-auto">
                                                <button onClick={() => handleLeaveAction(req.id, 'approved', 'Approved by Administration')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Approve</button>
                                                <button onClick={() => {
                                                    const reason = window.prompt("Reason for rejection:");
                                                    if(reason) handleLeaveAction(req.id, 'rejected', reason);
                                                }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Reject</button>
                                            </div>
                                        ) : (
                                            <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Admin Remarks</p>
                                                <p className="text-xs text-themeText">{req.admin_remarks || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'escalated_grievances' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {grievances.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No escalated grievances require admin attention.</p>
                                </div>
                            ) : (
                                grievances.map(g => (
                                    <div key={g.id} className={`${theme.layout.panel} rounded-themePanel border-rose-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                        
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"><i className="fa-solid fa-triangle-exclamation mr-1"></i> Escalated: {g.category}</span>
                                                </div>
                                                <p className="text-xs font-bold text-themeText mt-2">Reporter: {g.reporter?.full_name} ({g.reporter?.role})</p>
                                                <p className="text-xs font-bold text-rose-400">Against: {g.accused?.full_name} ({g.accused?.role})</p>
                                            </div>
                                            {getStatusBadge(g.status)}
                                        </div>

                                        <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
                                            <p className="text-xs text-themeText">"{g.description}"</p>
                                        </div>

                                        {g.status === 'pending' || g.status === 'investigating' ? (
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {g.status === 'pending' && (
                                                    <button onClick={() => handleGrievanceAction(g.id, 'investigating')} disabled={isProcessing} className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Start Investigation</button>
                                                )}
                                                <button onClick={() => {
                                                    const notes = window.prompt("Resolution details:");
                                                    if(notes) handleGrievanceAction(g.id, 'resolved', notes);
                                                }} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Resolve</button>
                                                <button onClick={() => {
                                                    const notes = window.prompt("Reason for dismissal:");
                                                    if(notes) handleGrievanceAction(g.id, 'dismissed', notes);
                                                }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Dismiss</button>
                                            </div>
                                        ) : (
                                            <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Admin Resolution Notes</p>
                                                <p className="text-xs text-themeText">{g.resolution_notes || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'document_verification' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {pendingDocuments.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No pending documents require verification.</p>
                                </div>
                            ) : (
                                pendingDocuments.map(doc => (
                                    <div key={doc.id} className={`${theme.layout.panel} rounded-themePanel border-blue-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <p className="text-sm font-black text-themeText line-clamp-1" title={doc.document_name}>{doc.document_name}</p>
                                                <p className="text-[10px] font-bold text-themeTextSec mt-0.5">{doc.profiles?.full_name} ({doc.profiles?.erp_id})</p>
                                            </div>
                                            {getStatusBadge(doc.status)}
                                        </div>

                                        <div className="flex gap-2">
                                            <span className="bg-themeElevated border-theme border-themeBorder px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">{doc.document_type}</span>
                                            <span className="bg-themeElevated border-theme border-themeBorder px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest text-themeTextSec">{doc.file_size_kb} KB</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t-theme border-themeBorderStrong">
                                            <button 
                                                onClick={() => handleDocumentPreview(doc.file_path)} 
                                                disabled={isProcessing} 
                                                className="w-full bg-themeElevated text-themeText hover:bg-themePanel border-theme border-themeBorder py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors mb-2"
                                            >
                                                Preview Document
                                            </button>
                                            <div className="flex w-full gap-2">
                                                <button onClick={() => handleDocumentAction(doc.id, 'verified')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Verify</button>
                                                <button onClick={() => handleDocumentAction(doc.id, 'rejected')} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Reject</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
