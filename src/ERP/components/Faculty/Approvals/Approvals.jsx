import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function FacultyApprovals() {
    const { userSession } = useERP();
    const [activeTab, setActiveTab] = useState("mentee_leaves"); // 'mentee_leaves', 'mentee_grievances', 'report_grievance'
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Data
    const [leaves, setLeaves] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);

    // Faculty Grievance Form (Goes to Admin)
    const [grievanceData, setGrievanceData] = useState({
        accusedId: "",
        category: "Academics",
        description: ""
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            const [
                { data: leavesData },
                { data: grievancesData },
                { data: profilesData }
            ] = await Promise.all([
                // Fetch leaves where this faculty is the mentor
                supabase.from('leave_requests')
                    .select('*, profiles!leave_requests_student_id_fkey(full_name, erp_id)')
                    .eq('mentor_id', userSession.db_id)
                    .order('created_at', { ascending: false }),
                
                // Fetch grievances assigned to this faculty
                supabase.from('grievances')
                    .select('*, reporter:profiles!grievances_reporter_id_fkey(full_name, role), accused:profiles!grievances_accused_id_fkey(full_name, role)')
                    .eq('assigned_to', userSession.db_id)
                    .order('created_at', { ascending: false }),
                
                // Fetch profiles for the "Report Grievance" dropdown
                supabase.from('profiles').select('id, full_name, role').neq('id', userSession.db_id).neq('role', 'admin')
            ]);

            setLeaves(leavesData || []);
            setGrievances(grievancesData || []);
            setAllProfiles(profilesData || []);

        } catch (error) {
            console.error("Error fetching faculty approvals data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveAction = async (leaveId, newStatus, remarks = "") => {
        setIsProcessing(true);
        try {
            const leave = leaves.find(l => l.id === leaveId);

            const { error } = await supabase
                .from('leave_requests')
                .update({ status: newStatus, admin_remarks: remarks, reviewed_at: new Date().toISOString() })
                .eq('id', leaveId);
            
            if (error) throw error;

            // Notify the student
            if (leave) {
                await supabase.from('admin_notices').insert({
                    title: `Leave Request ${newStatus.toUpperCase()}`,
                    content: `Your leave request for ${new Date(leave.created_at).toLocaleDateString()} has been ${newStatus}. ${remarks ? `Remarks: ${remarks}` : ''}`,
                    author_id: userSession.db_id,
                    target_audience: 'person',
                    target_id: leave.profiles?.erp_id
                });

                // SYNC TO ATTENDANCE ENGINE IF APPROVED
                if (newStatus === 'approved' && leave.student_id) {
                    const { data: profile } = await supabase.from('profiles').select('academic_batch').eq('id', leave.student_id).single();
                    if (profile?.academic_batch) {
                        const start = new Date(leave.start_date);
                        const end = new Date(leave.end_date);
                        const daysOfWeek = [];
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            daysOfWeek.push(d.toLocaleDateString('en-US', { weekday: 'long' }));
                        }
                        
                        const { data: slots } = await supabase
                            .from('timetable')
                            .select('id')
                            .eq('batch_id', profile.academic_batch)
                            .in('day_of_week', [...new Set(daysOfWeek)]);

                        if (slots && slots.length > 0) {
                            const attendancePayload = slots.map(slot => ({
                                class_id: slot.id,
                                student_id: leave.student_id,
                                status: 'excused'
                            }));
                            
                            // Delete existing to avoid duplicates in timeline
                            await supabase
                                .from('attendance')
                                .delete()
                                .eq('student_id', leave.student_id)
                                .in('class_id', slots.map(s => s.id));

                            await supabase.from('attendance').insert(attendancePayload);
                        }
                    }
                }
            }

            window.erpDialog.alert(`Leave request has been ${newStatus}.`);
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
            window.erpDialog.alert(`Grievance marked as ${newStatus}.`);
            fetchData();
        } catch (error) {
            console.error("Error updating grievance:", error);
            window.erpDialog.alert("Failed to process grievance.");
        } finally {
            setIsProcessing(false);
        }
    };

    const submitFacultyGrievance = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            // Faculty grievances always go to admin (assigned_to = null triggers admin policies)
            const payload = {
                reporter_id: userSession.db_id,
                accused_id: grievanceData.accusedId,
                assigned_to: null, 
                category: grievanceData.category,
                description: grievanceData.description,
                status: 'pending'
            };

            const { error } = await supabase.from('grievances').insert([payload]);
            if (error) throw error;

            window.erpDialog.alert("Grievance submitted successfully. It has been escalated directly to the Admin.");
            setGrievanceData({ accusedId: "", category: "Academics", description: "" });
        } catch (error) {
            console.error("Error submitting faculty grievance:", error);
            window.erpDialog.alert("Failed to submit grievance.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status.toLowerCase()) {
            case 'approved':
            case 'resolved':
                return <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border-emerald-500/30 border">{status}</span>;
            case 'rejected':
            case 'dismissed':
                return <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest border-rose-500/30 border">{status}</span>;
            case 'investigating':
                return <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border-blue-500/30 border">{status}</span>;
            default:
                return <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border-amber-500/30 border">{status}</span>;
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
                            <i className="fa-solid fa-stamp text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Approvals & Disciplinary</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Manage mentee leave requests and investigate grievances.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-themeElevated p-1.5 rounded-xl border-theme border-themeBorder w-fit relative z-10 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setActiveTab('mentee_leaves')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'mentee_leaves' ? 'bg-themeAccent text-themeText shadow-lg' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Mentee Leaves
                </button>
                <button 
                    onClick={() => setActiveTab('mentee_grievances')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'mentee_grievances' ? 'bg-amber-500 text-neutral-900 shadow-lg shadow-amber-500/20' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Mentee Grievances
                </button>
                <button 
                    onClick={() => setActiveTab('report_grievance')}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'report_grievance' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-themeTextSec hover:text-themeText'}`}
                >
                    Report Grievance
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
                    <span className="text-sm font-black uppercase tracking-widest text-themeText">Loading Ledgers...</span>
                </div>
            ) : (
                <div className="relative z-10">
                    
                    {activeTab === 'mentee_leaves' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {leaves.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No leave requests pending from mentees.</p>
                                </div>
                            ) : (
                                leaves.map(req => (
                                    <div key={req.id} className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-themeAccent"></div>
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <p className="text-sm font-black text-themeText mb-0.5">{req.profiles?.full_name}</p>
                                                <p className="text-[10px] font-bold text-themeTextSec uppercase tracking-widest">{req.start_date} to {req.end_date}</p>
                                            </div>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        
                                        <div className="bg-themeElevated p-3 rounded-lg border-theme border-themeBorder">
                                            <p className="text-xs text-themeText italic">"{req.reason}"</p>
                                        </div>

                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2 mt-auto">
                                                <button onClick={() => handleLeaveAction(req.id, 'approved', 'Approved by mentor')} disabled={isProcessing} className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Approve</button>
                                                <button onClick={() => {
                                                    const reason = window.prompt("Reason for rejection:");
                                                    if(reason) handleLeaveAction(req.id, 'rejected', reason);
                                                }} disabled={isProcessing} className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">Reject</button>
                                            </div>
                                        ) : (
                                            <div className="mt-auto border-t-theme border-themeBorderStrong pt-3">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Your Remarks</p>
                                                <p className="text-xs text-themeText">{req.admin_remarks || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'mentee_grievances' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {grievances.length === 0 ? (
                                <div className={`col-span-full ${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                    <p className="text-sm font-semibold text-themeTextSec">No active grievances assigned to you.</p>
                                </div>
                            ) : (
                                grievances.map(g => (
                                    <div key={g.id} className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 flex flex-col gap-4 relative overflow-hidden`}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                        
                                        <div className="flex justify-between items-start pl-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{g.category}</span>
                                                </div>
                                                <p className="text-xs font-bold text-themeText mt-2">Reporter: {g.reporter?.full_name}</p>
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
                                                <p className="text-[9px] font-black uppercase tracking-widest text-themeTextSec mb-1">Resolution Notes</p>
                                                <p className="text-xs text-themeText">{g.resolution_notes || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'report_grievance' && (
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={submitFacultyGrievance} className={`${theme.layout.panel} rounded-themePanel border-rose-500/30 border p-6 lg:p-8 flex flex-col gap-5`}>
                                <div>
                                    <h2 className="text-xl font-black text-rose-500 mb-1"><i className="fa-solid fa-gavel mr-2"></i> Report Misconduct</h2>
                                    <p className="text-xs text-themeTextSec">Grievances filed by Faculty are immediately escalated to the Administration.</p>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Accused Individual (Student or Colleague)</label>
                                    <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.accusedId} onChange={e => setGrievanceData({...grievanceData, accusedId: e.target.value})}>
                                        <option value="" disabled>Select the individual...</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.full_name} ({p.role.toUpperCase()})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Category</label>
                                    <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.category} onChange={e => setGrievanceData({...grievanceData, category: e.target.value})}>
                                        <option>Disciplinary</option>
                                        <option>Academic Misconduct</option>
                                        <option>Harassment</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Description of Incident</label>
                                    <textarea required rows="5" className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-3 text-sm text-themeText focus:border-rose-500 outline-none resize-none" placeholder="Provide full details. The administration will review this confidentially." value={grievanceData.description} onChange={e => setGrievanceData({...grievanceData, description: e.target.value})}></textarea>
                                </div>

                                <button disabled={isProcessing} type="submit" className="w-full bg-rose-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-lg hover:bg-rose-600 transition-colors mt-2 disabled:opacity-50 shadow-lg shadow-rose-500/20">
                                    {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Submit to Administration"}
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}