/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/supabase/supabaseClient";
import { useERP } from "../../../context/ErpContext";

export default function StudentApprovals() {
    const { userSession } = useERP();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [grievances, setGrievances] = useState([]);
    
    // Mentor Data
    const [mentor, setMentor] = useState(null);
    const [allProfiles, setAllProfiles] = useState([]);

    // Grievance Form
    const [grievanceData, setGrievanceData] = useState({
        accusedId: "",
        category: "Academics",
        description: ""
    });

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // 1. Fetch Mentor
            const { data: allocData } = await supabase
                .from('mentorship')
                .select('faculty_id')
                .eq('student_id', userSession.db_id)
                .order('allocated_at', { ascending: false })
                .limit(1);
            
            const alloc = allocData?.[0];
            let mentorId = null;
            if (alloc?.faculty_id) {
                mentorId = alloc.faculty_id;
                // Fetch profile separately
                const { data: mentorProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', mentorId)
                    .single();
                setMentor({ id: mentorId, name: mentorProfile?.full_name || 'Assigned Mentor' });
            }

            // 2. Fetch Grievances and Profiles
            const [
                { data: grievancesData },
                { data: profilesData }
            ] = await Promise.all([
                supabase.from('grievances').select('*, profiles!grievances_accused_id_fkey(full_name)').eq('reporter_id', userSession.db_id).order('created_at', { ascending: false }),
                supabase.from('profiles').select('id, full_name, role').neq('id', userSession.db_id).neq('role', 'admin') // Students shouldn't complain against admins ideally, but let's allow all non-admin for now. Or allow admin too? Let's just allow all non-self.
            ]);

            setGrievances(grievancesData || []);
            setAllProfiles(profilesData || []);

        } catch (error) {
            console.error("Error fetching approvals data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userSession.db_id]);

    const submitGrievance = async (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        try {
            // Routing Logic:
            // If the accused is the mentor, escalate to admin (assigned_to = null)
            // Otherwise, assign to mentor. If no mentor, assign to admin (null).
            
            let assignedTo = null;
            if (mentor && grievanceData.accusedId !== mentor.id) {
                assignedTo = mentor.id;
            } // else it remains null (Admin escalation)

            const payload = {
                reporter_id: userSession.db_id,
                accused_id: grievanceData.accusedId,
                assigned_to: assignedTo,
                category: grievanceData.category,
                description: grievanceData.description,
                status: 'pending'
            };

            const { error } = await supabase.from('grievances').insert([payload]);
            if (error) throw error;

            const escalationMsg = assignedTo === null ? "It has been escalated directly to the Admin." : "It has been routed to your Faculty Mentor.";
            window.erpDialog.alert(`Grievance submitted successfully. ${escalationMsg}`);
            
            setGrievanceData({ accusedId: "", category: "Academics", description: "" });
            fetchData();
        } catch (error) {
            console.error("Error submitting grievance:", error);
            window.erpDialog.alert("Failed to submit grievance.");
        } finally {
            setIsSubmitting(false);
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
                            <i className="fa-solid fa-stamp text-rose-500 text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Student Grievances</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Submit requests and track escalations automatically.</p>
                        </div>
                    </div>
                    
                    <div className="bg-themeApp border-theme border-themeBorderStrong px-5 py-3 rounded-themePanel">
                        <p className="text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1">Assigned Mentor</p>
                        <p className="text-sm font-bold text-themeAccent">{mentor ? mentor.name : "Unassigned"}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-themeAccent mb-4"></i>
                    <span className="text-sm font-black uppercase tracking-widest text-themeText">Loading Data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
                    
                    {/* LEFT PANE: Form */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 lg:p-6 sticky top-6`}>
                            
                            <form onSubmit={submitGrievance} className="flex flex-col gap-4">
                                    <h2 className="text-lg font-black text-rose-500 mb-2"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Report Grievance</h2>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Accused Individual</label>
                                        <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.accusedId} onChange={e => setGrievanceData({...grievanceData, accusedId: e.target.value})}>
                                            <option value="" disabled>Select the individual...</option>
                                            {allProfiles.map(p => (
                                                <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                                            ))}
                                        </select>
                                        {mentor && grievanceData.accusedId === mentor.id && (
                                            <p className="text-[10px] text-rose-500 mt-1.5 font-semibold bg-rose-500/10 p-2 rounded border border-rose-500/20"><i className="fa-solid fa-circle-info mr-1"></i> You are reporting your mentor. This will be escalated directly to the Admin.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Category</label>
                                        <select required className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none" value={grievanceData.category} onChange={e => setGrievanceData({...grievanceData, category: e.target.value})}>
                                            <option>Academics</option>
                                            <option>Harassment</option>
                                            <option>Mentorship Issue</option>
                                            <option>Disciplinary</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-themeTextSec mb-1.5">Description</label>
                                        <textarea required rows="4" className="w-full bg-themeElevated border-theme border-themeBorder rounded-lg px-3 py-2 text-sm text-themeText focus:border-rose-500 outline-none resize-none" placeholder="Provide full details of the incident..." value={grievanceData.description} onChange={e => setGrievanceData({...grievanceData, description: e.target.value})}></textarea>
                                    </div>

                                    <button disabled={isSubmitting} type="submit" className="w-full bg-rose-500 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-lg hover:bg-rose-600 transition-colors mt-2 disabled:opacity-50">
                                        {isSubmitting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Submit Grievance"}
                                    </button>
                                </form>

                        </div>
                    </div>

                    {/* RIGHT PANE: History Ledger */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="flex justify-between items-end mb-1">
                            <h2 className="text-base lg:text-lg font-black text-themeText tracking-tight">Grievance History</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                                {grievances.length === 0 ? (
                                    <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-8 text-center opacity-60`}>
                                        <p className="text-sm font-semibold text-themeTextSec">No grievances reported.</p>
                                    </div>
                                ) : (
                                    grievances.map(grievance => (
                                        <div key={grievance.id} className={`${theme.layout.panel} rounded-themePanel border-rose-500/20 border p-4 flex flex-col gap-3`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">{grievance.category}</p>
                                                    <p className="text-xs font-bold text-themeText">Against: {grievance.profiles?.full_name}</p>
                                                </div>
                                                {getStatusBadge(grievance.status)}
                                            </div>
                                            <p className="text-xs text-themeTextSec font-medium border-l-2 border-rose-500/30 pl-3 py-1">{grievance.description}</p>
                                            {grievance.resolution_notes && (
                                                <div className="bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 mt-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Resolution Notes</p>
                                                    <p className="text-xs text-themeText">{grievance.resolution_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
