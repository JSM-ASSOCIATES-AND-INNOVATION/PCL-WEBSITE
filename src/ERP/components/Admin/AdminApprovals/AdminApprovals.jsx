/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
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
    const [profileUpdates, setProfileUpdates] = useState([]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [
                { data: leavesData },
                { data: grievancesData },
                { data: documentsData },
                { data: profileUpdatesData }
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
                    .order('uploaded_at', { ascending: false }),
                    
                // Fetch profile update requests
                supabase.from('profile_update_requests')
                    .select('*, profiles(full_name, erp_id)')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
            ]);

            const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, role');
            
            const enrichedLeaves = (leavesData || []).map(l => {
                const p = allProfiles?.find(prof => prof.id === l.faculty_id);
                return { ...l, faculty_name: p?.full_name || 'Unknown Faculty' };
            });

            setFacultyLeaves(enrichedLeaves);
            setGrievances(grievancesData || []);
            setPendingDocuments(documentsData || []);
            setProfileUpdates(profileUpdatesData || []);

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
                .eq('id', leaveId)
                .select();
            
            if (error) throw error;

            // Notify Requester
            const leaveData = error ? null : (await supabase.from('faculty_leaves').select('faculty_id, start_date, end_date').eq('id', leaveId).single()).data;
            if (leaveData && leaveData.faculty_id) {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                await supabase.from('notices').insert([{
                    notice_id: noticeId,
                    title: `Leave Request ${newStatus}`,
                    category: 'System Alert',
                    target_audience: 'person',
                    target_id: leaveData.faculty_id,
                    priority: 'high',
                    content: `Your leave request from ${new Date(leaveData.start_date).toLocaleDateString()} to ${new Date(leaveData.end_date).toLocaleDateString()} has been ${newStatus}.`,
                    author_name: 'Admin',
                    author_id: null
                }]);
            }
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

            // Notify Requester
            const grievanceData = error ? null : (await supabase.from('grievances').select('reporter_id, category').eq('id', grievanceId).single()).data;
            if (grievanceData && grievanceData.reporter_id) {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                await supabase.from('notices').insert([{
                    notice_id: noticeId,
                    title: `Grievance Update`,
                    category: 'System Alert',
                    target_audience: 'person',
                    target_id: grievanceData.reporter_id,
                    priority: 'high',
                    content: `Your grievance regarding ${grievanceData.category} has been marked as ${newStatus}.`,
                    author_name: 'Admin',
                    author_id: null
                }]);
            }
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

            // Notify Requester
            const docData = error ? null : (await supabase.from('student_documents').select('student_id, document_type').eq('id', docId).single()).data;
            if (docData && docData.student_id) {
                const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                await supabase.from('notices').insert([{
                    notice_id: noticeId,
                    title: `Document ${newStatus}`,
                    category: 'System Alert',
                    target_audience: 'person',
                    target_id: docData.student_id,
                    priority: 'normal',
                    content: `Your uploaded document (${docData.document_type}) has been ${newStatus}.`,
                    author_name: 'Admin',
                    author_id: null
                }]);
            }
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

    const handleProfileUpdateAction = async (request, newStatus, remarks = "") => {
        setIsProcessing(true);
        try {
            if (newStatus === 'approved') {
                // Apply changes to profiles table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        phone: request.requested_changes?.phone,
                        blood_group: request.requested_changes?.blood_group,
                        dob: request.requested_changes?.dob,
                        avatar_url: request.requested_changes?.avatar_url,
                        questionnaire_data: request.requested_changes?.questionnaire_data
                    })
                    .eq('id', request.student_id);
                
                if (profileError) throw profileError;
            }

            const { error: updateError } = await supabase
                .from('profile_update_requests')
                .update({ status: newStatus, admin_remarks: remarks })
                .eq('id', request.id);
            
            if (updateError) throw updateError;

            // Notify Requester
            const noticeId = `CIR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
            await supabase.from('notices').insert([{
                notice_id: noticeId,
                title: `Profile Update ${newStatus}`,
                category: 'System Alert',
                target_audience: 'person',
                target_id: request.student_id,
                priority: 'normal',
                content: `Your profile update request has been ${newStatus}. ${remarks ? 'Remarks: ' + remarks : ''}`,
                author_name: 'Admin',
                author_id: null
            }]);

            window.erpDialog.alert(`Profile update request marked as ${newStatus}.`);
            fetchData();
        } catch (error) {
            console.error("Error updating profile request:", error);
            window.erpDialog.alert("Failed to process profile update request.");
        } finally {
            setIsProcessing(false);
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
            
            {/* Header and Tabs */}
            <div className={`w-full relative overflow-hidden rounded-[2rem] shadow-2xl p-6 lg:p-8 flex flex-col gap-6 border border-themeBorder bg-gradient-to-r from-themeAccent to-themeAccent/80`}>
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay pointer-events-none"></div>
                
                <div className="flex items-center gap-4 lg:gap-5 relative z-10 mb-2">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[1rem] bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                        <i className="fa-solid fa-scale-balanced text-white text-2xl lg:text-3xl drop-shadow-md"></i>
                    </div>
                    <div>
                        <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-white mb-1 drop-shadow-md`}>Admin Approvals & Investigations</h1>
                        <p className="text-white/80 text-xs lg:text-sm font-medium tracking-wide">Manage faculty leaves, document verifications, and escalated grievances.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap lg:flex-nowrap p-1.5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 relative z-10 gap-1.5 w-fit max-w-full overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('faculty_leaves')}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${activeTab === 'faculty_leaves' ? 'bg-white text-themeAccent shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white scale-100' : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'}`}
                    >
                        Faculty Leaves
                    </button>
                    <button 
                        onClick={() => setActiveTab('escalated_grievances')}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${activeTab === 'escalated_grievances' ? 'bg-rose-500 text-white shadow-[0_4px_15px_rgba(225,29,72,0.3)] border border-rose-500 scale-100' : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'}`}
                    >
                        Escalated Grievances
                    </button>
                    <button 
                        onClick={() => setActiveTab('document_verification')}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${activeTab === 'document_verification' ? 'bg-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] border border-blue-500 scale-100' : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'}`}
                    >
                        Document Verification
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile_updates')}
                        className={`flex-1 lg:flex-none px-5 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap min-w-max ${activeTab === 'profile_updates' ? 'bg-amber-500 text-[#0a0a0a] shadow-[0_4px_15px_rgba(245,158,11,0.3)] border border-amber-500 scale-100' : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent scale-95 hover:scale-100'}`}
                    >
                        Profile Updates
                    </button>
                </div>
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

                    {activeTab === 'profile_updates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {profileUpdates.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No pending profile update requests.</p>
                                </div>
                            ) : (
                                profileUpdates.map(req => (
                                    <div key={req.id} className={`${theme.layout.panel} rounded-themePanel border-amber-500/20 border p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                        
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <p className="text-sm font-black text-themeText mb-0.5">{req.profiles?.full_name}</p>
                                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{req.profiles?.erp_id}</p>
                                            </div>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        
                                        <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-2 border-b border-themeBorderStrong pb-1">Requested Changes</p>
                                            <ul className="text-xs text-themeText flex flex-col gap-1.5">
                                                {req.requested_changes?.phone && <li><span className="text-themeTextSec">Phone:</span> {req.requested_changes.phone}</li>}
                                                {req.requested_changes?.blood_group && <li><span className="text-themeTextSec">Blood:</span> {req.requested_changes.blood_group}</li>}
                                                {req.requested_changes?.dob && <li><span className="text-themeTextSec">DOB:</span> {req.requested_changes.dob}</li>}
                                                {req.requested_changes?.avatar_url && <li><span className="text-themeTextSec">Avatar:</span> <a href={req.requested_changes.avatar_url} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">View New Image</a></li>}
                                                {req.requested_changes?.questionnaire_data?.currentAddress && <li><span className="text-themeTextSec">Address:</span> {req.requested_changes.questionnaire_data.currentAddress}</li>}
                                                {req.requested_changes?.questionnaire_data?.emergencyName && <li><span className="text-themeTextSec">Emergency:</span> {req.requested_changes.questionnaire_data.emergencyName}</li>}
                                            </ul>
                                        </div>

                                        <div className="flex gap-2 mt-auto">
                                            <button onClick={() => handleProfileUpdateAction(req, 'approved', 'Approved by Administration')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Approve</button>
                                            <button onClick={() => {
                                                const remarks = window.prompt("Reason for rejection:");
                                                if(remarks) handleProfileUpdateAction(req, 'rejected', remarks);
                                            }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Reject</button>
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
